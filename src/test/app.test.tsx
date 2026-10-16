/**
 * 应用渲染冒烟测试：首页五个模块卡片齐全，hash 路由能切到各模块页面。
 * 不深入交互细节（交互由判分单测覆盖），只保证整棵组件树能挂载、无运行时错误。
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App 冒烟', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('首页渲染五个模块卡片与总进度', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    for (const title of ['概念引导课', '数结构练习', 'KCL 实战', 'KVL 实战', '自由 playground']) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    }
  })

  it.each([
    ['#/tour', '概念引导课'],
    ['#/count', '数结构练习'],
    ['#/kcl', /^KCL 实战/],
    ['#/kvl', 'KVL 实战'],
    ['#/lab', '自由 playground'],
  ])('hash 为 %s 时渲染对应页面', (hash, title) => {
    window.location.hash = hash
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
  })
})
