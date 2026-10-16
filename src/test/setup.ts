import '@testing-library/jest-dom/vitest'

// jsdom 不支持 matchMedia，部分交互组件会用到，这里补一个最小桩实现
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// jsdom 没有 IntersectionObserver，引导课滚动高亮在测试环境补一个永不触发的桩
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {
      return undefined
    }
    unobserve() {
      return undefined
    }
    disconnect() {
      return undefined
    }
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
}
