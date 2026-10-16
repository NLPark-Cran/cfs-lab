/**
 * CircuitBoard：自研数据驱动 SVG 电路渲染层。
 * 职责：把 CircuitDef 数据画成可交互的 SVG（导线、节点、元件、参考方向箭头、
 * 电压极性、电流流动动画），并提供元件/节点/网孔三种点选模式。
 * 高亮与点选状态由父组件传入，本组件不持有业务状态，保证可复用、可测试。
 */
import type { CSSProperties } from 'react'
import type { CircuitDef, CircuitElement } from './types'

export interface HighlightSpec {
  elements?: string[]
  nodes?: string[]
  loops?: string[]
  meshes?: string[]
}

export type PickMode = 'none' | 'element' | 'node' | 'mesh'

export interface CircuitBoardProps {
  circuit: CircuitDef
  highlight?: HighlightSpec
  pickMode?: PickMode
  /** 已点选的 id 集合（元件 / 节点 / 网孔，取决于 pickMode） */
  picked?: ReadonlySet<string>
  onPick?: (id: string) => void
  /** 各元件电流（A，正值 = 与参考方向相同），提供后显示数值与流动动画 */
  currents?: Record<string, number>
  /** 是否显示电压参考极性（+ / −） */
  showVoltage?: boolean
  /** 广义节点闭合面（红色虚线多边形） */
  surface?: { polygon: { x: number; y: number }[]; show: boolean }
  className?: string
}

/** 元件方框尺寸 */
const BOX = { h: { w: 46, h: 38 }, v: { w: 38, h: 46 } } as const

/** 高亮配色：高亮 = 讲解引导色（emerald），点选 = 作答色（indigo），电流反转警示 = orange */
const C = {
  wire: '#334155',
  highlight: '#059669',
  picked: '#4f46e5',
  loop: '#0284c7',
  mesh: '#0284c7',
  flow: '#2563eb',
  reversed: '#ea580c',
  surface: '#dc2626',
} as const

function pointsAttr(points: { x: number; y: number }[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(' ')
}

/** 电流箭头的默认位置：水平元件画在方框上方，垂直元件画在方框右侧 */
function defaultMarker(el: CircuitElement): { x: number; y: number; dx: number; dy: number } {
  const dirSign = el.current?.dir === 'ba' ? -1 : 1
  if (el.orientation === 'h') {
    return { x: el.body.x, y: el.body.y - 30, dx: dirSign, dy: 0 }
  }
  return { x: el.body.x + 30, y: el.body.y, dx: 0, dy: dirSign }
}

/** 画一个实心小三角箭头，中心在 (x,y)，指向单位向量 (dx,dy) */
function Arrow({ x, y, dx, dy, color }: { x: number; y: number; dx: number; dy: number; color: string }) {
  // 三角形三个顶点：尖端朝前，底边在后
  const tip = { x: x + dx * 8, y: y + dy * 8 }
  const base1 = { x: x - dx * 6 - dy * 6, y: y - dy * 6 + dx * 6 }
  const base2 = { x: x - dx * 6 + dy * 6, y: y - dy * 6 - dx * 6 }
  return <polygon points={`${tip.x},${tip.y} ${base1.x},${base1.y} ${base2.x},${base2.y}`} fill={color} />
}

/** 元件的电流值显示：数值 + 参考方向是否反转的配色 */
function FlowOverlay({ el, value }: { el: CircuitElement; value: number }) {
  const reversed = value < 0
  const color = reversed ? C.reversed : C.flow
  // 流动线段穿过元件方框中心，方向随电流符号翻转
  const len = 46
  const unit = el.orientation === 'h' ? { dx: 1, dy: 0 } : { dx: 0, dy: 1 }
  const sign = reversed ? -1 : 1
  const x1 = el.body.x - unit.dx * len * sign
  const y1 = el.body.y - unit.dy * len * sign
  const x2 = el.body.x + unit.dx * len * sign
  const y2 = el.body.y + unit.dy * len * sign
  const labelPos = {
    x: el.body.x + (el.orientation === 'h' ? 0 : 44),
    y: el.body.y + (el.orientation === 'h' ? 40 : -34),
  }
  return (
    <g aria-label={`电流 ${el.current?.label ?? el.id} ${value.toFixed(3)} A`}>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth={3} strokeLinecap="round"
        strokeDasharray="7 7" className="cfs-current-flow"
      />
      <text x={labelPos.x} y={labelPos.y} textAnchor="middle" fontSize={14} fontWeight={600} fill={color}>
        {`${el.current?.label ?? ''} = ${Math.abs(value).toFixed(2)} A`}
      </text>
      {reversed && (
        <text x={labelPos.x} y={labelPos.y + 15} textAnchor="middle" fontSize={11} fill={color}>
          实际方向与参考方向相反
        </text>
      )}
    </g>
  )
}

export function CircuitBoard({
  circuit,
  highlight = {},
  pickMode = 'none',
  picked,
  onPick,
  currents,
  showVoltage = false,
  surface,
  className,
}: CircuitBoardProps) {
  const highlightElements = new Set(highlight.elements ?? [])
  const highlightNodes = new Set(highlight.nodes ?? [])
  const highlightLoops = new Set(highlight.loops ?? [])
  const highlightMeshes = new Set(highlight.meshes ?? [])
  const pickedSet = picked ?? new Set<string>()

  const nodePos = new Map<string, { x: number; y: number }>()
  for (const n of circuit.nodes) nodePos.set(n.id, { x: n.x, y: n.y })
  for (const d of circuit.extraDots ?? []) nodePos.set(d.nodeId, nodePos.get(d.nodeId) ?? { x: d.x, y: d.y })

  const handlePick = (id: string) => {
    if (pickMode !== 'none' && onPick) onPick(id)
  }

  const svgStyle: CSSProperties = { touchAction: 'manipulation' }

  return (
    <svg
      viewBox={`0 0 ${circuit.width} ${circuit.height}`}
      className={className}
      style={svgStyle}
      role="img"
      aria-label="电路图"
    >
      {/* 1. 导线层 */}
      {circuit.wires.map((w) => (
        <polyline
          key={w.id}
          points={pointsAttr(w.points)}
          fill="none"
          stroke={C.wire}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      ))}

      {/* 2. 网孔高亮（引导课） */}
      {circuit.meshes?.filter((m) => highlightMeshes.has(m.id)).map((m) => (
        <g key={`hl-mesh-${m.id}`}>
          <polygon points={pointsAttr(m.polygon)} fill={C.mesh} opacity={0.12} />
          <polyline points={pointsAttr(m.outline)} fill="none" stroke={C.mesh} strokeWidth={3} strokeDasharray="8 5" />
        </g>
      ))}

      {/* 3. 回路高亮（KVL / 引导课） */}
      {circuit.loops?.filter((l) => highlightLoops.has(l.id)).map((l) => (
        <polyline
          key={`hl-loop-${l.id}`}
          points={pointsAttr(l.path)}
          fill="none"
          stroke={C.loop}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.75}
        />
      ))}

      {/* 4. 广义节点闭合面（红色虚线） */}
      {surface?.show && (
        <g>
          <polygon
            points={pointsAttr(surface.polygon)}
            fill={C.surface}
            opacity={0.06}
            stroke={C.surface}
            strokeWidth={2.5}
            strokeDasharray="10 7"
          />
        </g>
      )}

      {/* 5. 节点圆点与标注（extraDots 只是视觉上的多个黑点，点击归属同一逻辑节点） */}
      {circuit.nodes.map((n) => (
        <g key={`node-${n.id}`}>
          {highlightNodes.has(n.id) && (
            <circle cx={n.x} cy={n.y} r={16} fill="none" stroke={C.highlight} strokeWidth={3} />
          )}
          {pickMode === 'node' && (
            <circle
              cx={n.x} cy={n.y} r={22} fill="transparent" style={{ cursor: 'pointer' }}
              onClick={() => handlePick(n.id)}
            >
              <title>{`节点${n.label}`}</title>
            </circle>
          )}
          <circle
            cx={n.x} cy={n.y} r={5.5}
            fill={highlightNodes.has(n.id) || pickedSet.has(n.id) ? C.picked : C.wire}
          />
          <text x={n.x + (n.labelDx ?? 0)} y={n.y + (n.labelDy ?? 0)} textAnchor="middle" fontSize={17} fill="#0f172a">
            {n.label}
          </text>
        </g>
      ))}
      {circuit.extraDots?.map((d, i) => (
        <circle key={`dot-${i}`} cx={d.x} cy={d.y} r={5} fill={C.wire} />
      ))}

      {/* extraDots 的点击热区：整条底导线都是同一节点，任一黑点都可点 */}
      {pickMode === 'node' &&
        (circuit.extraDots ?? []).map((d, i) => (
          <circle
            key={`dot-hit-${i}`}
            cx={d.x} cy={d.y} r={20} fill="transparent" style={{ cursor: 'pointer' }}
            onClick={() => handlePick(d.nodeId)}
          />
        ))}

      {/* 6. 元件层：方框 + 编号，source 画电池符号 */}
      {circuit.elements.map((el) => {
        const size = BOX[el.orientation]
        const isHl = highlightElements.has(el.id)
        const isPicked = pickedSet.has(el.id)
        const stroke = isHl ? C.highlight : isPicked ? C.picked : C.wire
        return (
          <g key={`el-${el.id}`}>
            {el.kind === 'source' ? (
              <g>
                {/* 电池符号：长短线 */}
                <line x1={el.body.x - 14} y1={el.body.y - 8} x2={el.body.x + 14} y2={el.body.y - 8} stroke={stroke} strokeWidth={3} />
                <line x1={el.body.x - 7} y1={el.body.y + 8} x2={el.body.x + 7} y2={el.body.y + 8} stroke={stroke} strokeWidth={3} />
                <text x={el.body.x} y={el.body.y + 30} textAnchor="middle" fontSize={14} fontWeight={600} fill="#0f172a">
                  {el.label}
                </text>
              </g>
            ) : (
              <rect
                x={el.body.x - size.w / 2} y={el.body.y - size.h / 2}
                width={size.w} height={size.h}
                fill={isHl ? '#ecfdf5' : isPicked ? '#eef2ff' : '#ffffff'}
                stroke={stroke}
                strokeWidth={isHl || isPicked ? 3.5 : 2.5}
                rx={2}
              />
            )}
            {el.kind !== 'source' && (
              <text x={el.body.x} y={el.body.y + 5.5} textAnchor="middle" fontSize={16} fontWeight={600} fill="#0f172a">
                {el.label}
              </text>
            )}

            {/* 电压参考极性：'+' 端画在 plusNode 一侧 */}
            {showVoltage && el.voltage && (() => {
              const plusAtA = el.voltage.plusNode === el.nodes[0]
              const [plus, minus] = el.orientation === 'h'
                ? [plusAtA ? { x: el.body.x - 36, y: el.body.y } : { x: el.body.x + 36, y: el.body.y },
                   plusAtA ? { x: el.body.x + 36, y: el.body.y } : { x: el.body.x - 36, y: el.body.y }]
                : [plusAtA ? { x: el.body.x, y: el.body.y - 34 } : { x: el.body.x, y: el.body.y + 34 },
                   plusAtA ? { x: el.body.x, y: el.body.y + 34 } : { x: el.body.x, y: el.body.y - 34 }]
              const labelPos = { x: el.body.x + (el.orientation === 'h' ? 0 : 52), y: el.body.y + (el.orientation === 'h' ? -32 : 5) }
              return (
                <g>
                  <text x={plus.x} y={plus.y + 5} textAnchor="middle" fontSize={17} fontWeight={700} fill="#b91c1c">+</text>
                  <text x={minus.x} y={minus.y + 5} textAnchor="middle" fontSize={17} fontWeight={700} fill="#1d4ed8">−</text>
                  <text x={labelPos.x} y={labelPos.y} textAnchor="middle" fontSize={13} fontStyle="italic" fill="#334155">
                    {el.voltage.label}
                  </text>
                </g>
              )
            })()}

            {/* 电流参考方向箭头 + 标注 */}
            {el.current && (() => {
              const m = el.current.marker ?? defaultMarker(el)
              const color = C.wire
              return (
                <g>
                  <Arrow x={m.x} y={m.y} dx={m.dx} dy={m.dy} color={color} />
                  <text
                    x={m.x - m.dy * 18 - m.dx * 2}
                    y={m.y + m.dx * 18 - m.dy * 4 + 5}
                    textAnchor="middle" fontSize={15} fontStyle="italic" fill="#0f172a"
                  >
                    {el.current.label}
                  </text>
                </g>
              )
            })()}

            {/* 电流流动动画与数值（playground） */}
            {currents && el.id in currents && <FlowOverlay el={el} value={currents[el.id]} />}

            {/* 元件点选热区 */}
            {pickMode === 'element' && (
              <rect
                x={el.body.x - 34} y={el.body.y - 30}
                width={68} height={60}
                fill="transparent" style={{ cursor: 'pointer' }}
                onClick={() => handlePick(el.id)}
              >
                <title>{`元件 ${el.label}`}</title>
              </rect>
            )}
          </g>
        )
      })}

      {/* 7. 网孔点选热区（画在最上层保证可点） */}
      {pickMode === 'mesh' &&
        circuit.meshes?.map((m) => (
          <polygon
            key={`mesh-hit-${m.id}`}
            points={pointsAttr(m.polygon)}
            fill="transparent" style={{ cursor: 'pointer' }}
            onClick={() => handlePick(m.id)}
          >
            <title>{m.name}</title>
          </polygon>
        ))}
    </svg>
  )
}

/** 供判分模块使用：从电路定义取元件 '+' 端节点的工具 */
export function makePlusNodeLookup(circuit: CircuitDef) {
  return (elementId: string) => circuit.elements.find((e) => e.id === elementId)?.voltage?.plusNode
}
