/**
 * 自由 playground：两网孔电路实时求解。
 * 滑杆调电压源和三个电阻，solveTwoMesh 解网孔电流方程组，
 * 电流流动动画与数值实时更新；某支路电流为负时用橙色高亮提示实际方向与参考方向相反。
 * 改动任意参数一次即标记本模块完成。
 */
import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { CircuitBoard } from '../circuit/CircuitBoard'
import { playgroundCircuit } from '../circuit/circuits'
import { solveTwoMesh } from '../circuit/solver'
import { PageShell, Feedback } from '../components/ui'
import { useProgress } from '../store/progress'

interface ParamDef {
  key: 'V' | 'R1' | 'R2' | 'R3'
  label: string
  min: number
  max: number
  unit: string
}

const PARAMS: ParamDef[] = [
  { key: 'V', label: '电压源 V', min: 1, max: 24, unit: 'V' },
  { key: 'R1', label: '电阻 R1', min: 1, max: 100, unit: 'Ω' },
  { key: 'R2', label: '电阻 R2', min: 1, max: 100, unit: 'Ω' },
  { key: 'R3', label: '电阻 R3', min: 1, max: 100, unit: 'Ω' },
]

const INITIAL = { V: 12, R1: 4, R2: 4, R3: 4 }

const BRANCH_NAMES: Record<string, string> = {
  src: '电压源支路 iᵥ',
  r1: 'R1 支路 i₁',
  r2: 'R2 支路 i₂',
  r3: 'R3 支路 i₃',
}

function ParamSlider({
  def,
  value,
  onChange,
}: {
  def: ParamDef
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-slate-700">{def.label}</span>
        <span className="font-mono text-sm font-semibold text-indigo-700">
          {value} {def.unit}
        </span>
      </span>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={1}
        value={value}
        aria-label={def.label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-indigo-600"
      />
    </label>
  )
}

export function LabPage() {
  const [params, setParams] = useState(INITIAL)
  const markDone = useProgress((s) => s.markDone)
  const done = useProgress((s) => s.done.playground)

  const setParam = (key: keyof typeof INITIAL, v: number) => {
    setParams((p) => ({ ...p, [key]: v }))
    markDone('playground')
  }

  const { V, R1, R2, R3 } = params
  const solution = solveTwoMesh(V, R1, R2, R3)
  const currents: Record<string, number> = {
    src: solution.branches.iv,
    r1: solution.branches.i1,
    r2: solution.branches.i2,
    r3: solution.branches.i3,
  }
  const reversedBranches = Object.keys(currents).filter((id) => currents[id] < 0)
  const [ia, ib] = solution.mesh

  return (
    <PageShell
      title="自由 playground"
      intro="拖动滑杆改变电压和电阻，方程立即重新求解，电流箭头和数值跟着变。试试把 R2 调得很大，观察中间支路的电流方向什么时候反过来。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
            <div className="space-y-4">
              {PARAMS.map((def) => (
                <ParamSlider
                  key={def.key}
                  def={def}
                  value={params[def.key]}
                  onChange={(v) => setParam(def.key, v)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="text-base font-semibold text-slate-900">网孔电流方程（顺时针为正）</h2>
            <p className="mt-2 font-mono text-sm text-slate-800">
              ({R1}+{R3})·I<sub>a</sub> − {R3}·I<sub>b</sub> = {V}
            </p>
            <p className="mt-1 font-mono text-sm text-slate-800">
              −{R3}·I<sub>a</sub> + ({R2}+{R3})·I<sub>b</sub> = 0
            </p>
            <p className="mt-3 text-sm text-slate-700">
              解得：I<sub>a</sub> = <span className="font-mono font-semibold">{ia.toFixed(2)} A</span>，
              I<sub>b</sub> = <span className="font-mono font-semibold">{ib.toFixed(2)} A</span>
            </p>
            <p className="mt-2 text-sm text-slate-700">
              中间支路电流 i₃ = I<sub>a</sub> − I<sub>b</sub> ={' '}
              <span className={`font-mono font-semibold ${solution.branches.i3 < 0 ? 'text-orange-600' : ''}`}>
                {solution.branches.i3.toFixed(2)} A
              </span>
            </p>
            {done && (
              <p className="mt-3 text-xs font-medium text-emerald-700">你已经调过参数，本模块已完成。</p>
            )}
          </div>

          {reversedBranches.length > 0 && (
            <Feedback kind="error">
              <span className="flex items-start gap-1.5">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {reversedBranches.map((id) => BRANCH_NAMES[id]).join('、')}的实际方向与参考方向相反，
                所以算出来是负值。图上已经用橙色标出：负号不是错误，它在告诉你真实方向朝哪。
              </span>
            </Feedback>
          )}
        </div>

        <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200 lg:sticky lg:top-20 lg:self-start">
          <CircuitBoard circuit={playgroundCircuit} currents={currents} showVoltage className="w-full" />
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            蓝线是电流流动动画，数值为当前解。调大 R2 试试：右网孔电流 I_b 会变小，
            当 I_b 超过 I_a 时，中间支路 i₃ 就变负，方向反转。
          </p>
        </div>
      </div>
    </PageShell>
  )
}
