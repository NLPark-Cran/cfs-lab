/**
 * solver 单测：三组数值手算比对 + 奇异矩阵边界。
 * 手算依据（网孔电流均顺时针为正）：
 *   (R1+R3)·Ia − R3·Ib = V
 *   −R3·Ia + (R2+R3)·Ib = 0
 * 组 1：V=12, R1=R2=R3=4 → 8Ia−4Ib=12 且 Ia=2Ib → Ib=1, Ia=2
 * 组 2：V=10, R1=2, R2=3, R3=5 → 7Ia−5Ib=10 且 5Ia=8Ib → Ia=80/31, Ib=50/31
 * 组 3：V=24, R1=R2=R3=12 → 24Ia−12Ib=24 且 Ia=2Ib → 48Ib−12Ib=36Ib=24 → Ib=2/3, Ia=4/3
 */
import { describe, it, expect } from 'vitest'
import { solveLinear, solveTwoMesh } from '../circuit/solver'

describe('solveLinear', () => {
  it('求解简单的 2x2 方程组', () => {
    const { x, ok } = solveLinear(
      [
        [2, 1],
        [1, -1],
      ],
      [5, 1],
    )
    expect(ok).toBe(true)
    expect(x[0]).toBeCloseTo(2)
    expect(x[1]).toBeCloseTo(1)
  })

  it('奇异矩阵返回 ok=false 而不是抛错', () => {
    const { x, ok } = solveLinear(
      [
        [1, 2],
        [2, 4],
      ],
      [3, 6],
    )
    expect(ok).toBe(false)
    expect(x).toEqual([])
  })
})

describe('solveTwoMesh', () => {
  it('V=12, R1=R2=R3=4Ω：Ia=2A, Ib=1A, i3=1A', () => {
    const s = solveTwoMesh(12, 4, 4, 4)
    expect(s.ok).toBe(true)
    expect(s.mesh[0]).toBeCloseTo(2)
    expect(s.mesh[1]).toBeCloseTo(1)
    expect(s.branches.i1).toBeCloseTo(2)
    expect(s.branches.i2).toBeCloseTo(1)
    expect(s.branches.i3).toBeCloseTo(1)
    expect(s.branches.iv).toBeCloseTo(2)
  })

  it('V=10, R1=2, R2=3, R3=5：Ia=80/31, Ib=50/31', () => {
    const s = solveTwoMesh(10, 2, 3, 5)
    expect(s.ok).toBe(true)
    expect(s.mesh[0]).toBeCloseTo(80 / 31)
    expect(s.mesh[1]).toBeCloseTo(50 / 31)
    expect(s.branches.i3).toBeCloseTo(30 / 31)
  })

  it('V=24, R1=R2=R3=12Ω：Ia=4/3A, Ib=2/3A', () => {
    const s = solveTwoMesh(24, 12, 12, 12)
    expect(s.ok).toBe(true)
    expect(s.mesh[0]).toBeCloseTo(4 / 3)
    expect(s.mesh[1]).toBeCloseTo(2 / 3)
    expect(s.branches.i3).toBeCloseTo(2 / 3)
  })

  it('全部电阻为 0（短路退化）返回 ok=false', () => {
    const s = solveTwoMesh(12, 0, 0, 0)
    expect(s.ok).toBe(false)
  })
})
