/**
 * 学习进度：Zustand v5 + persist 中间件，持久化到 localStorage。
 * 只记录「完成/未完成」这种粗粒度状态，不涉及答题细节，刷新后进度不丢。
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ModuleId = 'tour' | 'count' | 'kcl' | 'kvl' | 'playground'

export const MODULE_IDS: ModuleId[] = ['tour', 'count', 'kcl', 'kvl', 'playground']

interface ProgressState {
  done: Partial<Record<ModuleId, boolean>>
  markDone: (id: ModuleId) => void
  resetAll: () => void
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      done: {},
      markDone: (id) => set((state) => (state.done[id] ? state : { done: { ...state.done, [id]: true } })),
      resetAll: () => set({ done: {} }),
    }),
    { name: 'cfs-lab-progress' },
  ),
)

/** 完成度（0 到 1），首页进度条用 */
export function useCompletion(): number {
  const done = useProgress((s) => s.done)
  const finished = MODULE_IDS.filter((id) => done[id]).length
  return finished / MODULE_IDS.length
}
