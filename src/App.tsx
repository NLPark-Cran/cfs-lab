/**
 * 应用入口：顶栏 + hash 路由渲染五个模块页面。
 * 首页展示五个模块的进度卡片，数据全部来自进度 store。
 */
import { BookOpen, Shapes, Waypoints, Repeat, SlidersHorizontal, type LucideIcon } from 'lucide-react'
import { useRoute, Link, type Route } from './components/router'
import { TopBar } from './components/TopBar'
import { useCompletion, useProgress, type ModuleId } from './store/progress'
import { TourPage } from './pages/TourPage'
import { CountPage } from './pages/CountPage'
import { KclPage } from './pages/KclPage'
import { KvlPage } from './pages/KvlPage'
import { LabPage } from './pages/LabPage'

interface ModuleMeta {
  id: ModuleId
  route: Route
  title: string
  desc: string
  icon: LucideIcon
}

const MODULES: ModuleMeta[] = [
  { id: 'tour', route: '/tour', title: '概念引导课', desc: '参考方向、支路、节点、回路、网孔，滚动看图逐步理解。', icon: BookOpen },
  { id: 'count', route: '/count', title: '数结构练习', desc: '亲手点选图中的节点、支路、网孔，数数你学的结构。', icon: Shapes },
  { id: 'kcl', route: '/kcl', title: 'KCL 实战', desc: '例 1 互动版：判断电流进出、列节点方程，挑战广义节点。', icon: Waypoints },
  { id: 'kvl', route: '/kvl', title: 'KVL 实战', desc: '选回路、定绕行方向、判电压升降，亲手列 Σu=0。', icon: Repeat },
  { id: 'playground', route: '/lab', title: '自由 playground', desc: '拖动滑杆调电压和电阻，实时看电流怎么流。', icon: SlidersHorizontal },
]

function HomePage() {
  const done = useProgress((s) => s.done)
  const completion = useCompletion()
  const percent = Math.round(completion * 100)
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">把课堂例题变成能动手试的实验</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
        这门课的 2.1 节概念抽象、PPT 翻页快。这里把例题做成了可以点、可以选、即时判分的互动练习，
        跟着五个模块走一遍，基尔霍夫定律就上手了。
      </p>

      <div className="mt-4 flex items-center gap-3" aria-label={`总进度 ${percent}%`}>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-sm font-semibold text-slate-700">{percent}%</span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map(({ id, route, title, desc, icon: Icon }) => {
          const finished = Boolean(done[id])
          return (
            <Link
              key={id}
              to={route}
              className="group flex flex-col rounded-xl bg-white p-5 ring-1 ring-slate-200 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                  <Icon className="h-5 w-5 text-indigo-600" aria-hidden />
                </span>
                {finished ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                    已完成
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                    未完成
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-base font-semibold text-slate-900 group-hover:text-indigo-700">{title}</h2>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600">{desc}</p>
              <div className="mt-4">
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${finished ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    style={{ width: finished ? '100%' : '0%' }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">{finished ? '进度 100%' : '进度 0%'}</p>
              </div>
            </Link>
          )
        })}
        <div className="hidden rounded-xl border-2 border-dashed border-slate-200 p-5 sm:flex lg:flex-col">
          <p className="text-sm leading-relaxed text-slate-400">
            完成全部五个模块，这节内容就算过关。进度自动保存在本机浏览器里。
          </p>
        </div>
      </div>
    </main>
  )
}

export default function App() {
  const route = useRoute()
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <div className="flex-1">
        {route === '/' && <HomePage />}
        {route === '/tour' && <TourPage />}
        {route === '/count' && <CountPage />}
        {route === '/kcl' && <KclPage />}
        {route === '/kvl' && <KvlPage />}
        {route === '/lab' && <LabPage />}
      </div>
    </div>
  )
}
