/**
 * KCL 实战：例 1 电路互动版。
 * 流程：依次对节点①②③，先判断各电流是流入还是流出（gradeKclFlow），
 * 再为每条电流选 +/− 号列节点方程（gradeKclEquation）；
 * 三节点全过后进入广义节点挑战（红色虚线闭合面，同一套判分）。
 */
import { useState } from 'react'
import { Lightbulb, Sigma } from 'lucide-react'
import { CircuitBoard } from '../circuit/CircuitBoard'
import { kclExample } from '../circuit/circuits'
import {
  kclCurrents, kclNodes, kclGeneralized,
  gradeKclFlow, gradeKclEquation,
  type KclNodeDef,
} from '../circuit/grading'
import { PageShell, Feedback, PrimaryButton, PillGroup, StepBadge } from '../components/ui'
import { useProgress } from '../store/progress'

// 广义节点与三个节点共用 KclNodeDef 判分接口，多出的 polygon 供闭合面渲染
const TARGETS: KclNodeDef[] = [...kclNodes, kclGeneralized as KclNodeDef]

const NODE_NAME: Record<string, string> = { n1: '节点①', n2: '节点②', n3: '节点③' }
const currentOf = (id: string) => kclCurrents.find((c) => c.id === id)

function refText(id: string): string {
  const cur = currentOf(id)
  if (!cur) return id
  return `${NODE_NAME[cur.from] ?? cur.from} → ${NODE_NAME[cur.to] ?? cur.to}`
}

/** 把符号选择渲染成方程文本，如 −i₁+i₃−i₅=0；未选中的项显示为 ? */
function equationText(ids: string[], signs: Record<string, 1 | -1>): string {
  const terms = ids.map((id) => {
    const cur = currentOf(id)
    const label = cur?.label ?? id
    const s = signs[id]
    if (s === undefined) return `?${label}`
    return s === -1 ? `−${label}` : label
  })
  // 首项为正时省略 + 号
  return `${terms.join(' ').replace(/^\+ /, '')} = 0`
}

type Phase = 'flow' | 'equation' | 'done'

export function KclPage() {
  const [targetIndex, setTargetIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('flow')
  const [flowSel, setFlowSel] = useState<Record<string, 'in' | 'out'>>({})
  const [flowWrong, setFlowWrong] = useState<string[] | null>(null)
  const [signs, setSigns] = useState<Record<string, 1 | -1>>({})
  const [eqWrong, setEqWrong] = useState(false)
  const markDone = useProgress((s) => s.markDone)
  const done = useProgress((s) => s.done.kcl)

  const target = TARGETS[targetIndex]
  const isSurface = target.id === 'surface'
  const lastTarget = targetIndex === TARGETS.length - 1
  const allDone = lastTarget && phase === 'done'
  const stepNo = targetIndex * 2 + (phase === 'equation' || phase === 'done' ? 2 : 1)

  const highlightNodes = isSurface ? [] : [target.id]
  const highlightElements = target.currents.map((id) => `e${id.slice(1)}`)

  const submitFlow = () => {
    const userIn = new Set(Object.keys(flowSel).filter((id) => flowSel[id] === 'in'))
    const wrong = gradeKclFlow(kclCurrents, target, userIn)
    setFlowWrong(wrong)
    if (wrong.length === 0) setPhase('equation')
  }

  const submitEquation = () => {
    const ok = gradeKclEquation(target, signs)
    setEqWrong(!ok)
    if (ok) {
      setPhase('done')
      if (lastTarget) markDone('kcl')
    }
  }

  const nextTarget = () => {
    setTargetIndex((i) => Math.min(i + 1, TARGETS.length - 1))
    setPhase('flow')
    setFlowSel({})
    setFlowWrong(null)
    setSigns({})
    setEqWrong(false)
  }

  return (
    <PageShell
      title="KCL 实战 · 例 1"
      intro="基尔霍夫电流定律：任一时刻流入节点的电流之和等于流出之和。逐个节点判断进出、列方程，最后挑战广义节点闭合面。"
    >
      <div className="flex flex-wrap items-center gap-2">
        <StepBadge index={Math.min(stepNo, TARGETS.length * 2)} total={TARGETS.length * 2} />
        <span className="text-xs text-slate-500">
          {isSurface ? '广义节点挑战' : `目标：${target.label}`} · {phase === 'flow' ? '判断进出' : '列方程'}
        </span>
        {done && <span className="text-xs font-medium text-emerald-700">本模块已完成</span>}
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <CircuitBoard
            circuit={kclExample}
            highlight={{ nodes: highlightNodes, elements: highlightElements }}
            surface={{ polygon: kclGeneralized.polygon, show: isSurface }}
            className="w-full"
          />
          {isSurface && (
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              红色虚线是广义节点的闭合面：它把元件 2、4 和中间那段底导线整个包进面内。
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {phase === 'flow' && (
            <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                {isSurface ? '哪些电流穿过闭合面并流入面内？' : `${target.label}：哪些电流流入、哪些流出？`}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                对照图上每条电流的参考方向箭头，逐条判断它相对
                {isSurface ? '闭合面' : target.label}是流入还是流出。
              </p>
              <ul className="mt-4 space-y-3">
                {target.currents.map((id) => {
                  const cur = currentOf(id)
                  return (
                    <li key={id} className="flex flex-wrap items-center gap-3">
                      <span className="w-24 text-sm font-semibold text-slate-800">
                        {cur?.label ?? id}
                        <span className="ml-1 text-xs font-normal text-slate-500">（{refText(id)}）</span>
                      </span>
                      <PillGroup
                        ariaLabel={`${cur?.label ?? id} 方向`}
                        options={[{ value: 'in', label: '流入' }, { value: 'out', label: '流出' }]}
                        value={flowSel[id] ?? null}
                        onChange={(v) => {
                          setFlowSel((s) => ({ ...s, [id]: v }))
                          setFlowWrong(null)
                        }}
                      />
                    </li>
                  )
                })}
              </ul>
              <div className="mt-4">
                <PrimaryButton
                  onClick={submitFlow}
                  disabled={target.currents.some((id) => !flowSel[id])}
                >
                  提交判断
                </PrimaryButton>
              </div>
            </div>
          )}

          {phase !== 'flow' && (
            <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Sigma className="h-5 w-5 text-indigo-600" aria-hidden />
                列方程：取流入为正，写出各电流的代数和
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                每条电流选一个符号。流入取 +、流出取 −（整体反过来也等价，判分允许）。
              </p>
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800 ring-1 ring-slate-200">
                {equationText(target.currents, signs)}
              </p>
              <ul className="mt-4 space-y-3">
                {target.currents.map((id) => {
                  const cur = currentOf(id)
                  return (
                    <li key={id} className="flex flex-wrap items-center gap-3">
                      <span className="w-16 text-sm font-semibold text-slate-800">{cur?.label ?? id}</span>
                      <PillGroup
                        ariaLabel={`${cur?.label ?? id} 符号`}
                        options={[{ value: '1', label: '+ 流入' }, { value: '-1', label: '− 流出' }]}
                        value={signs[id] === undefined ? null : String(signs[id])}
                        onChange={(v) => {
                          setSigns((s) => ({ ...s, [id]: v === '1' ? 1 : -1 }))
                          setEqWrong(false)
                        }}
                      />
                    </li>
                  )
                })}
              </ul>
              {phase === 'equation' && (
                <div className="mt-4">
                  <PrimaryButton
                    onClick={submitEquation}
                    disabled={target.currents.some((id) => signs[id] === undefined)}
                  >
                    提交方程
                  </PrimaryButton>
                </div>
              )}
            </div>
          )}

          {flowWrong && flowWrong.length > 0 && (
            <Feedback kind="error">
              {flowWrong.map((id) => currentOf(id)?.label ?? id).join('、')} 的判断不对。
              参考方向 {flowWrong.map((id) => `${currentOf(id)?.label ?? id}（${refText(id)}）`).join('，')}，
              再对照图上箭头看看它到底指向{isSurface ? '面内' : '节点'}还是背离。
            </Feedback>
          )}
          {flowWrong && flowWrong.length === 0 && phase === 'flow' && null}
          {phase !== 'flow' && flowWrong && flowWrong.length === 0 && (
            <Feedback kind="success">
              进出判断全对。讲解：{target.explain}
            </Feedback>
          )}
          {eqWrong && (
            <Feedback kind="error">
              方程不对。检查两条：每条电流的符号跟它的进出判断一致；一条都不能漏。再试一次。
            </Feedback>
          )}
          {phase === 'done' && (
            <Feedback kind="success">
              方程正确：{equationText(target.currents, target.equation as Record<string, 1 | -1>)}。讲解：
              {target.explain}
            </Feedback>
          )}

          {phase === 'done' && !allDone && (
            <div>
              <PrimaryButton onClick={nextTarget}>
                {targetIndex === TARGETS.length - 2 ? '进入广义节点挑战' : '下一个节点'}
              </PrimaryButton>
            </div>
          )}
          {allDone && (
            <Feedback kind="info">
              <span className="flex items-start gap-1.5">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                KCL 全部通过。记住两件事：底导线整体是一个节点；KCL 对任意闭合面都成立。
                现在去 KVL 实战把电压方程也列一遍。
              </span>
            </Feedback>
          )}
        </div>
      </div>
    </PageShell>
  )
}
