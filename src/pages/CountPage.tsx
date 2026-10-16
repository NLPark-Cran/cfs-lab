/**
 * 数结构练习：数节点 / 数支路 / 数网孔三个子关卡。
 * 在图上点选（node / element / mesh 三种 pickMode 依次切换）或直接用 +/- 报数，
 * 提交后由 gradeCounting 判分，答对给出讲解再进入下一关。
 */
import { useState } from 'react'
import { Minus, Plus, RotateCcw, MousePointerClick } from 'lucide-react'
import { CircuitBoard, type PickMode } from '../circuit/CircuitBoard'
import { termsCircuit } from '../circuit/circuits'
import { gradeCounting, countingAnswers } from '../circuit/grading'
import { PageShell, Feedback, PrimaryButton, StepBadge } from '../components/ui'
import { useProgress } from '../store/progress'

type CountKind = 'nodes' | 'branches' | 'meshes'
type LevelStatus = 'idle' | 'wrong' | 'correct'

interface LevelDef {
  kind: CountKind
  pickMode: PickMode
  title: string
  hint: string
  explain: string
}

const LEVELS: LevelDef[] = [
  {
    kind: 'nodes',
    pickMode: 'node',
    title: '第一关：图中有几个节点？',
    hint: '点击图中的节点圆点（①到⑤），或直接用下面按钮报数。',
    explain:
      `共 ${countingAnswers.nodes.expected} 个节点：①②③④⑤。底部整条导线中间没有元件，电势处处相等，` +
      '只算一个节点⑤。数节点时这是最容易多数的地方。',
  },
  {
    kind: 'branches',
    pickMode: 'element',
    title: '第二关：图中有几条支路？',
    hint: '点击图中的元件方框数一数，或直接用下面按钮报数。',
    explain:
      '逐个元件数是 7 条支路。但元件 3、4 串联（中间的节点③只连着这两条支路），按串联合并算 6 条。' +
      '课堂 PPT 两种答案都接受，所以 6 和 7 都算对。',
  },
  {
    kind: 'meshes',
    pickMode: 'mesh',
    title: '第三关：图中有几个网孔？',
    hint: '点击图中的网孔区域（三块虚线框），或直接用下面按钮报数。',
    explain:
      `共 ${countingAnswers.meshes.expected} 个网孔：上网孔、左下网孔、右下网孔。` +
      '外侧大回路是回路但不是网孔，网孔要求内部不含任何支路。',
  },
]

export function CountPage() {
  const [levelIndex, setLevelIndex] = useState(0)
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set())
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState<LevelStatus>('idle')
  const markDone = useProgress((s) => s.markDone)
  const done = useProgress((s) => s.done.count)

  const level = LEVELS[levelIndex]
  const lastLevel = levelIndex === LEVELS.length - 1

  const togglePick = (id: string) => {
    setStatus('idle')
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      setCount(next.size)
      return next
    })
  }

  const adjust = (delta: number) => {
    setStatus('idle')
    setCount((c) => Math.max(0, c + delta))
  }

  const resetLevel = () => {
    setPicked(new Set())
    setCount(0)
    setStatus('idle')
  }

  const submit = () => {
    if (gradeCounting(level.kind, count)) {
      setStatus('correct')
      if (lastLevel) markDone('count')
    } else {
      setStatus('wrong')
    }
  }

  const nextLevel = () => {
    setLevelIndex((i) => Math.min(i + 1, LEVELS.length - 1))
    resetLevel()
  }

  return (
    <PageShell
      title="数结构练习"
      intro="支路、节点、网孔是后面列方程的地基，先在这张名词术语电路上数一数。点图或按按钮报数都可以。"
    >
      <div className="flex items-center gap-2">
        <StepBadge index={levelIndex + 1} total={LEVELS.length} />
        {done && <span className="text-xs font-medium text-emerald-700">三关全过，本模块已完成</span>}
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <CircuitBoard
            circuit={termsCircuit}
            pickMode={level.pickMode}
            picked={picked}
            onPick={togglePick}
            highlight={level.pickMode === 'mesh' ? { meshes: [...picked] } : {}}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">{level.title}</h2>
            <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-600">
              <MousePointerClick className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {level.hint}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjust(-1)}
                aria-label="减一"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white ring-1 ring-slate-300 transition-colors hover:bg-slate-100"
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <div className="min-w-16 rounded-lg bg-slate-50 px-4 py-2 text-center ring-1 ring-slate-200">
                <span className="text-xl font-bold text-slate-900">{count}</span>
                <span className="ml-1 text-xs text-slate-500">个</span>
              </div>
              <button
                type="button"
                onClick={() => adjust(1)}
                aria-label="加一"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white ring-1 ring-slate-300 transition-colors hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={resetLevel}
                className="ml-auto flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-300 transition-colors hover:bg-slate-100"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                重数
              </button>
            </div>

            <div className="mt-4">
              <PrimaryButton onClick={submit} disabled={status === 'correct'}>
                提交答案
              </PrimaryButton>
            </div>
          </div>

          {status === 'wrong' && (
            <Feedback kind="error">
              不对。提示：数过的{level.kind === 'nodes' ? '节点' : level.kind === 'branches' ? '支路' : '网孔'}
              会标成蓝色，可以用「重数」清零再来，也可以回想引导课里那张图高亮过哪些部分。
            </Feedback>
          )}
          {status === 'correct' && (
            <>
              <Feedback kind="success">
                答对了。{level.explain}
              </Feedback>
              <div>
                <PrimaryButton onClick={lastLevel ? () => undefined : nextLevel}>
                  {lastLevel ? '三关全部完成' : '下一关'}
                </PrimaryButton>
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  )
}
