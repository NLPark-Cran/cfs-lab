/**
 * 极简 hash 路由：静态站点无服务端路由，用 location.hash 做页面切换，
 * 刷新、前进后退都能用，部署到 Caddy 纯静态目录也不需要 fallback 配置。
 */
import { useEffect, useState, type ReactNode, type MouseEvent } from 'react'

export type Route = '/' | '/tour' | '/count' | '/kcl' | '/kvl' | '/lab'

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '')
  if (path === '/tour' || path === '/count' || path === '/kcl' || path === '/kvl' || path === '/lab') {
    return path
  }
  return '/'
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function navigate(to: Route) {
  window.location.hash = to
}

export function Link({
  to,
  className,
  children,
  onClick,
}: {
  to: Route
  className?: string
  children: ReactNode
  onClick?: () => void
}) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    // 让浏览器默认的 hash 跳转生效（触发 hashchange），只补充回调
    if (onClick) onClick()
    void e
  }
  return (
    <a href={`#${to}`} className={className} onClick={handle}>
      {children}
    </a>
  )
}
