/**
 * 通用小组件：页面外壳、判分反馈条、选项胶囊按钮组。
 * 全部用 Tailwind 响应式类实现，移动端 375px 可用，不引重型 UI 库。
 */
import type { ReactNode } from 'react'

/** 页面外壳：标题 + 引导语 + 内容区 */
export function PageShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{intro}</p>
      <div className="mt-6">{children}</div>
    </main>
  )
}

type FeedbackKind = 'success' | 'error' | 'info'

/** 判分反馈条 */
export function Feedback({ kind, children }: { kind: FeedbackKind; children: ReactNode }) {
  const styles: Record<FeedbackKind, string> = {
    success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    error: 'bg-rose-50 text-rose-800 ring-rose-200',
    info: 'bg-sky-50 text-sky-800 ring-sky-200',
  }
  return (
    <div className={`rounded-lg px-4 py-3 text-sm leading-relaxed ring-1 ${styles[kind]}`} role="status">
      {children}
    </div>
  )
}

/** 胶囊选项按钮组（流入/流出、升/降、+ / − 等二选一） */
export function PillGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[]
  value: T | null
  onChange: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg ring-1 ring-slate-300" role="group" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/** 主按钮 */
export function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {children}
    </button>
  )
}

/** 步骤指示点（第 x / y 步） */
export function StepBadge({ index, total }: { index: number; total: number }) {
  return (
    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
      第 {index} / {total} 步
    </span>
  )
}
