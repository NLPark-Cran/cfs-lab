/**
 * 判分逻辑单测：KCL 方程判分、KVL 判分、数结构判分。
 * KVL 标准答案依据（termsCircuit 左下网孔 L2，顺时针）：
 * L2 elements=[e2,e6,e5]、entries=[n1,n2,n5]，v₂ plus=n1、v₆ plus=n5、v₅ plus=n1，
 * 顺时针进入端依次是 n1、n2、n5：
 *   e2：n1 进 = '+' 端 → 电压降；e6：n2 进 ≠ n5 → 电压升；e5：n5 进 ≠ n1 → 电压升
 * 所以标准判断为 [drop, rise, rise]，符号 [−1, +1, +1]，方程 −v₂+v₆+v₅=0。
 */
import { describe, it, expect } from 'vitest'
import { termsCircuit } from '../circuit/circuits'
import { makePlusNodeLookup } from '../circuit/CircuitBoard'
import {
  kclNodes, kclCurrents, gradeKclFlow, gradeKclEquation,
  gradeKvl, gradeCounting, countingAnswers,
} from '../circuit/grading'

const plusNodeOf = makePlusNodeLookup(termsCircuit)
const L2 = termsCircuit.loops!.find((l) => l.id === 'L2')!

describe('gradeKclEquation', () => {
  const n1 = kclNodes[0] // −i₁−i₂−i₃=0

  it('标准答案判对', () => {
    expect(gradeKclEquation(n1, { i1: -1, i2: -1, i3: -1 })).toBe(true)
  })

  it('整体翻转（两边同乘 −1）等价，也判对', () => {
    expect(gradeKclEquation(n1, { i1: 1, i2: 1, i3: 1 })).toBe(true)
  })

  it('漏项判错', () => {
    expect(gradeKclEquation(n1, { i1: -1, i2: -1 })).toBe(false)
  })

  it('个别符号写反判错', () => {
    expect(gradeKclEquation(n1, { i1: -1, i2: 1, i3: -1 })).toBe(false)
  })

  it('节点②的标准方程 i₃−i₄−i₅=0 判对', () => {
    expect(gradeKclEquation(kclNodes[1], { i3: 1, i4: -1, i5: -1 })).toBe(true)
    expect(gradeKclEquation(kclNodes[1], { i3: -1, i4: 1, i5: 1 })).toBe(true)
  })
})

describe('gradeKclFlow', () => {
  const n2 = kclNodes[1] // 只有 i3 流入

  it('正确的流入集合返回空数组', () => {
    expect(gradeKclFlow(kclCurrents, n2, new Set(['i3']))).toEqual([])
  })

  it('把流出当流入会报出不一致的电流', () => {
    const wrong = gradeKclFlow(kclCurrents, n2, new Set(['i3', 'i4']))
    expect(wrong).toEqual(['i4'])
  })
})

describe('gradeKvl', () => {
  it('L2 顺时针：正确判断与方程全过', () => {
    const result = gradeKvl(
      L2, 'cw', plusNodeOf,
      ['drop', 'rise', 'rise'],
      [-1, 1, 1],
    )
    expect(result.wrongElements).toEqual([])
    expect(result.equationCorrect).toBe(true)
  })

  it('L2 顺时针：方程整体翻转也判对', () => {
    const result = gradeKvl(
      L2, 'cw', plusNodeOf,
      ['drop', 'rise', 'rise'],
      [1, -1, -1],
    )
    expect(result.equationCorrect).toBe(true)
  })

  it('L2 顺时针：v₂ 升降判断错被点名', () => {
    const result = gradeKvl(
      L2, 'cw', plusNodeOf,
      ['rise', 'rise', 'rise'],
      [1, 1, 1],
    )
    expect(result.wrongElements).toEqual(['e2'])
  })

  it('L2 逆时针：进入端循环移位，v₂ 变升、v₅ 变降', () => {
    // 逆时针时进入端取顺时针链条的下一项：e2 从 n2 进（≠n1）为升，e6 从 n5 进（=n5）为降，e5 从 n1 进（=n1）为降
    const result = gradeKvl(
      L2, 'ccw', plusNodeOf,
      ['rise', 'drop', 'drop'],
      [1, -1, -1],
    )
    expect(result.wrongElements).toEqual([])
    expect(result.equationCorrect).toBe(true)
  })

  it('方程符号与升降不一致判错', () => {
    const result = gradeKvl(
      L2, 'cw', plusNodeOf,
      ['drop', 'rise', 'rise'],
      [1, 1, 1],
    )
    expect(result.equationCorrect).toBe(false)
  })
})

describe('gradeCounting', () => {
  it(`节点：${countingAnswers.nodes.expected} 对，边界 4 和 6 判错`, () => {
    expect(gradeCounting('nodes', 5)).toBe(true)
    expect(gradeCounting('nodes', 4)).toBe(false)
    expect(gradeCounting('nodes', 6)).toBe(false)
  })

  it('支路：6 和 7 课堂都接受，5 和 8 判错', () => {
    expect(gradeCounting('branches', 6)).toBe(true)
    expect(gradeCounting('branches', 7)).toBe(true)
    expect(gradeCounting('branches', 5)).toBe(false)
    expect(gradeCounting('branches', 8)).toBe(false)
  })

  it(`网孔：${countingAnswers.meshes.expected} 对，边界 2 和 4 判错`, () => {
    expect(gradeCounting('meshes', 3)).toBe(true)
    expect(gradeCounting('meshes', 2)).toBe(false)
    expect(gradeCounting('meshes', 4)).toBe(false)
  })
})
