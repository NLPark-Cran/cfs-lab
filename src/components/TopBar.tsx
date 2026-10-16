/**
 * 顶栏：站点标识、返回首页、总进度。所有页面共用。
 */
import { Link } from './router'
import { FlaskConical, House } from 'lucide-react'
import { useCompletion } from '../store/progress'

export function TopBar() {
  const completion = useCompletion()
  const percent = Math.round(completion * 100)
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-slate-900">
          <FlaskConical className="h-5 w-5 text-indigo-600" aria-hidden />
          <span className="text-base font-bold">CFS Lab</span>
        </Link>
        <span className="hidden text-xs text-slate-500 sm:inline">电路基础与系统 · 2.1 基尔霍夫定律</span>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2" aria-label={`学习进度 ${percent}%`}>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 sm:w-36">
              <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-xs font-medium text-slate-600">{percent}%</span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            <House className="h-4 w-4" aria-hidden />
            首页
          </Link>
        </div>
      </div>
    </header>
  )
}
