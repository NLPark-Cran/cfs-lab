/**
 * KVL 实战：在名词术语电路上完整走一遍电压定律。
 * 流程：选回路 → 选顺时针/逆时针绕行 → 逐项判断电压升/降（gradeKvl）
 * → 列出 Σu=0 符号方程判分 → 讲解网孔与回路的关系。
 */
import { useState } from 'react'
import { Lightbulb, Sigma, RotateCcw } from 'lucide-react'
import { CircuitBoard, makePlusNodeLookup } from '../circuit/CircuitBoard'
import { termsCircuit } from '../circuit/circuits'
import { gradeKvl, kvlExpected, type RiseDrop, type TraverseDirection } from '../circuit/grading'
import { PageShell, Feedback, PrimaryButton, PillGroup, StepBadge } from '../components/ui'
import { useProgress } from '../store/progress'

const plusNodeOf = makePlusNodeLookup(termsCircuit)
const voltageLabel = (elementId: string) =>
  termsCircuit.elements.find((e) => e.id === elementId)?.voltage?.label ?? elementId

type Phase = 'loop' | 'direction' | 'judge' | 'equation' | 'done'

const PHASE_NO: Record<Phase, number> = { loop: 1, direction: 2, judge: 3, equation: 4, done: 5 }

/** 把符号数组渲染成 Σu=0 方程文本 */
function kvlEquationText(elementIds: string[], signs: (1 | -1 | undefined)[]): string {
  const terms = elementIds.map((id, k) => {
    const s = signs[k]
    if (s === undefined) return `?${voltageLabel(id)}`
    return s === -1 ? `−${voltageLabel(id)}` : voltageLabel(id)
  })
  return `${terms.join(' ')} = 0`
}

export function KvlPage() {
  const [phase, setPhase] = useState<Phase>('loop')
  const [loopId, setLoopId] = useState<string | null>(null)
  const [direction, setDirection] = useState<TraverseDirection | null>(null)
  const [judgments, setJudgments] = useState<Record<string, RiseDrop>>({})
  const [judgeWrong, setJudgeWrong] = useState<string[] | null>(null)
  const [signs, setSigns] = useState<Record<string, 1 | -1>>({})
  const [eqWrong, setEqWrong] = useState(false)
  const markDone = useProgress((s) => s.markDone)
  const done = useProgress((s) => s.done.kvl)

  const loop = termsCircuit.loops?.find((l) => l.id === loopId) ?? null

  const pickLoop = (id: string) => {
    setLoopId(id)
    setDirection(null)
    setJudgments({})
    setSigns({})
    setJudgeWrong(null)
    setEqWrong(false)
    setPhase('direction')
  }

  const restart = () => {
    setPhase('loop')
    setLoopId(null)
    setDirection(null)
    setJudgments({})
    setSigns({})
    setJudgeWrong(null)
    setEqWrong(false)
  }

  const submitJudgments = () => {
    if (!loop || !direction) return
    const userJudgments = loop.elements.map((id) => judgments[id])
    // 方程阶段单独判，这里用约定换算的符号只取逐项判断结果
    const derivedSigns = userJudgments.map((j) => (j === 'drop' ? -1 : 1)) as (1 | -1)[]
    const { wrongElements } = gradeKvl(loop, direction, plusNodeOf, userJudgments, derivedSigns)
    setJudgeWrong(wrongElements)
    if (wrongElements.length === 0) setPhase('equation')
  }

  const submitEquation = () => {
    if (!loop || !direction) return
    const userJudgments = loop.elements.map((id) => judgments[id])
    const userSigns = loop.elements.map((id) => signs[id]) as (1 | -1)[]
    const { equationCorrect } = gradeKvl(loop, direction, plusNodeOf, userJudgments, userSigns)
    setEqWrong(!equationCorrect)
    if (equationCorrect) {
      setPhase('done')
      markDone('kvl')
    }
  }

  // 完成后展示标准方程（与用户的写法允许整体差一个负号）
  const expected = loop && direction ? kvlExpected(loop, direction, plusNodeOf) : null

  return (
    <PageShell
      title="KVL 实战"
      intro="基尔霍夫电压定律：沿任一闭合回路绕行一周，所有电压的代数和为零。挑一条回路，完整走一遍判升降、列方程的流程。"
    >
      <div className="flex flex-wrap items-center gap-2">
        <StepBadge index={PHASE_NO[phase]} total={5} />
        <span className="text-xs text-slate-500">
          {phase === 'loop' && '第 1 步：选回路'}
          {phase === 'direction' && '第 2 步：选绕行方向'}
          {phase === 'judge' && '第 3 步：判电压升/降'}
          {phase === 'equation' && '第 4 步：列 Σu=0 方程'}
          {phase === 'done' && '全部完成'}
        </span>
        {done && <span className="text-xs font-medium text-emerald-700">本模块已完成</span>}
        {phase !== 'loop' && phase !== 'done' && (
          <button
            type="button"
            onClick={restart}
            className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-300 hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            重选回路
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <CircuitBoard
            circuit={termsCircuit}
            showVoltage
            highlight={{ loops: loopId ? [loopId] : [] }}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-4">
          {phase === 'loop' && (
            <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">第一步：选一条回路</h2>
              <p className="mt-1 text-sm text-slate-600">
                这张图有 3 个网孔和更多回路，随便挑一条开始。外侧大回路是最长的一条，网孔是最小的闭合路径。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {termsCircuit.loops?.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => pickLoop(l.id)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ring-1 transition-colors ${
                      loopId === l.id
                        ? 'bg-indigo-600 text-white ring-indigo-600'
                        : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase !== 'loop' && loop && (
            <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">已选回路：{loop.name}</h2>

              {phase === 'direction' && (
                <>
                  <p className="mt-1 text-sm text-slate-600">
                    定一个绕行方向。沿着这个方向走，从 '+' 端进 '−' 端出记电压降，反过来记电压升。
                  </p>
                  <div className="mt-4">
                    <PillGroup
                      ariaLabel="绕行方向"
                      options={[{ value: 'cw', label: '顺时针' }, { value: 'ccw', label: '逆时针' }]}
                      value={direction}
                      onChange={(v) => {
                        setDirection(v)
                        setJudgments({})
                        setSigns({})
                        setJudgeWrong(null)
                        setPhase('judge')
                      }}
                    />
                  </div>
                </>
              )}

              {(phase === 'judge' || phase === 'equation' || phase === 'done') && direction && (
                <>
                  <p className="mt-1 text-sm text-slate-600">
                    绕行方向：
                    <span className="font-semibold text-slate-800">{direction === 'cw' ? '顺时针' : '逆时针'}</span>
                    。沿绕行方向经过 {loop.elements.map(voltageLabel).join(' → ')}。
                  </p>

                  {phase === 'judge' && (
                    <>
                      <ul className="mt-4 space-y-3">
                        {loop.elements.map((id) => (
                          <li key={id} className="flex flex-wrap items-center gap-3">
                            <span className="w-16 text-sm font-semibold text-slate-800">{voltageLabel(id)}</span>
                            <PillGroup
                              ariaLabel={`${voltageLabel(id)} 升降`}
                              options={[{ value: 'drop', label: '电压降（−）' }, { value: 'rise', label: '电压升（+）' }]}
                              value={judgments[id] ?? null}
                              onChange={(v) => {
                                setJudgments((s) => ({ ...s, [id]: v }))
                                setJudgeWrong(null)
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4">
                        <PrimaryButton
                          onClick={submitJudgments}
                          disabled={loop.elements.some((id) => !judgments[id])}
                        >
                          提交判断
                        </PrimaryButton>
                      </div>
                    </>
                  )}

                  {phase !== 'judge' && (
                    <>
                      <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                        <Sigma className="h-4 w-4" aria-hidden />
                        升降判断全对，列出 Σu=0：电压降取负、电压升取正
                      </p>
                      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800 ring-1 ring-slate-200">
                        {kvlEquationText(loop.elements, loop.elements.map((id) => signs[id]))}
                      </p>
                      {phase === 'equation' && (
                        <>
                          <ul className="mt-4 space-y-3">
                            {loop.elements.map((id) => (
                              <li key={id} className="flex flex-wrap items-center gap-3">
                                <span className="w-16 text-sm font-semibold text-slate-800">{voltageLabel(id)}</span>
                                <PillGroup
                                  ariaLabel={`${voltageLabel(id)} 符号`}
                                  options={[{ value: '1', label: '+ 升' }, { value: '-1', label: '− 降' }]}
                                  value={signs[id] === undefined ? null : String(signs[id])}
                                  onChange={(v) => {
                                    setSigns((s) => ({ ...s, [id]: v === '1' ? 1 : -1 }))
                                    setEqWrong(false)
                                  }}
                                />
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4">
                            <PrimaryButton
                              onClick={submitEquation}
                              disabled={loop.elements.some((id) => signs[id] === undefined)}
                            >
                              提交方程
                            </PrimaryButton>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {judgeWrong && judgeWrong.length > 0 && (
            <Feedback kind="error">
              {judgeWrong.map(voltageLabel).join('、')} 的升降判断不对。
              对照图中每个元件的 '+' / '−' 参考极性：沿绕行方向从 '+' 进 '−' 出是电压降，反过来是电压升。
            </Feedback>
          )}
          {eqWrong && (
            <Feedback kind="error">
              方程符号不对。记住约定：电压降取负、电压升取正（整体同乘 −1 也等价）。再对照上一步的升降判断检查一遍。
            </Feedback>
          )}
          {phase === 'done' && loop && expected && (
            <>
              <Feedback kind="success">
                方程正确：{kvlEquationText(loop.elements, expected.signs)}。
                你选的{loop.name}
                {loop.id.startsWith('L') && Number(loop.id.slice(1)) <= 3 ? '正好是一个网孔' : '是一条回路，不是网孔'}
                。网孔一定是回路，回路不一定是网孔。
              </Feedback>
              <Feedback kind="info">
                <span className="flex items-start gap-1.5">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  这张图 b=7 条支路、n=5 个节点，独立 KVL 方程有 b−n+1=3 个，恰好等于网孔数。
                  所以实际解题时，对 3 个网孔各列一条 Σu=0 最省事。想换一条回路再练一次，点上面「重选回路」。
                </span>
              </Feedback>
            </>
          )}
        </div>
      </div>
    </PageShell>
  )
}
