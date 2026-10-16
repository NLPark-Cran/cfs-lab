/**
 * 概念引导课：scrollytelling 分步讲解。
 * 左侧 sticky 电路图随滚动步骤切换高亮，右侧是各步骤文案。
 * 用 IntersectionObserver 判断当前进入视口中心的步骤，不引第三方滚动库。
 */
import { useEffect, useRef, useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { CircuitBoard } from '../circuit/CircuitBoard'
import { kclExample, termsCircuit } from '../circuit/circuits'
import { tourSteps } from '../content/lessons'
import { StepBadge } from '../components/ui'
import { useProgress } from '../store/progress'

export function TourPage() {
  const [active, setActive] = useState(0)
  const stepRefs = useRef<(HTMLElement | null)[]>([])
  const markDone = useProgress((s) => s.markDone)
  const done = useProgress((s) => s.done.tour)

  useEffect(() => {
    // rootMargin 把判定带收窄到视口中段，步骤标题越过中线才触发高亮切换
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index)
            if (!Number.isNaN(index)) setActive(index)
          }
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 },
    )
    for (const el of stepRefs.current) {
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  const isLast = active === tourSteps.length - 1
  useEffect(() => {
    if (isLast) markDone('tour')
  }, [isLast, markDone])

  const step = tourSteps[active]
  const circuit = step.circuit === 'kcl' ? kclExample : termsCircuit

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">概念引导课</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        慢慢往下滚，左边电路图会跟着每一步亮起对应的部分。六步走完，核心概念就齐了。
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 左：sticky 电路图，移动端在上，始终可见 */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <StepBadge index={active + 1} total={tourSteps.length} />
              {done && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CircleCheck className="h-4 w-4" aria-hidden />
                  本课已完成
                </span>
              )}
            </div>
            <CircuitBoard
              circuit={circuit}
              highlight={step.highlight}
              showVoltage={step.showVoltage}
              className="mt-3 w-full"
            />
          </div>
        </div>

        {/* 右：步骤文案，滚动驱动 */}
        <div className="space-y-8">
          {tourSteps.map((s, i) => (
            <section
              key={s.id}
              data-index={i}
              ref={(el) => {
                stepRefs.current[i] = el
              }}
              className={`rounded-xl bg-white p-5 ring-1 transition-shadow ${
                i === active ? 'ring-indigo-300 shadow-md' : 'ring-slate-200'
              }`}
            >
              <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
              {s.paragraphs.map((p, k) => (
                <p key={k} className="mt-2 text-sm leading-relaxed text-slate-700">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <p className="pb-8 text-center text-sm text-slate-500">
            引导课到此结束，去「数结构练习」自己动手数一数。
          </p>
        </div>
      </div>
    </main>
  )
}
