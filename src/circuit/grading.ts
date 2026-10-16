/**
 * 判分逻辑：KCL 进出判断与方程判分、KVL 升降判断与 Σu=0 判分、数结构练习答案。
 * 所有「标准答案」都来自课堂 PPT：例 1 三节点方程、v₁…v₇ 参考极性。
 */
import type { LoopDef } from './types'

/** 例 1 电路的 5 条电流及其参考方向（相对节点而言的流入/流出） */
export interface KclCurrent {
  id: string
  label: string
  /** 参考方向起点节点 */
  from: string
  /** 参考方向终点节点 */
  to: string
}

export const kclCurrents: KclCurrent[] = [
  { id: 'i1', label: 'i₁', from: 'n1', to: 'n3' },
  { id: 'i2', label: 'i₂', from: 'n1', to: 'n3' },
  { id: 'i3', label: 'i₃', from: 'n1', to: 'n2' },
  { id: 'i4', label: 'i₄', from: 'n2', to: 'n3' },
  { id: 'i5', label: 'i₅', from: 'n2', to: 'n3' },
]

export interface KclNodeDef {
  id: string
  label: string
  /** 与该节点相连的电流 id 列表 */
  currents: string[]
  /** 课堂标准方程（流入为正），如 −i₁−i₂−i₃=0 记作 { i1:-1, i2:-1, i3:-1 } */
  equation: Record<string, number>
  /** 讲解文案 */
  explain: string
}

/** 三个节点的标准 KCL 方程（流入为正），与 PPT 例 1 完全一致 */
export const kclNodes: KclNodeDef[] = [
  {
    id: 'n1', label: '节点①', currents: ['i1', 'i2', 'i3'],
    equation: { i1: -1, i2: -1, i3: -1 },
    explain: 'i₁、i₂、i₃ 的参考方向全部背离节点①（都是流出），所以三项全取负：−i₁−i₂−i₃=0。',
  },
  {
    id: 'n2', label: '节点②', currents: ['i3', 'i4', 'i5'],
    equation: { i3: 1, i4: -1, i5: -1 },
    explain: '只有 i₃ 参考方向流入节点②，i₄、i₅ 流出：i₃−i₄−i₅=0。',
  },
  {
    id: 'n3', label: '节点③', currents: ['i1', 'i2', 'i4', 'i5'],
    equation: { i1: 1, i2: 1, i4: 1, i5: 1 },
    explain: '底导线整体是一个节点，i₁、i₂、i₄、i₅ 全部流入③：i₁+i₂+i₄+i₅=0。三个方程相加恒等于 0，所以独立方程只有 2 个。',
  },
]

/** 广义节点（红色虚线闭合面）挑战：闭合面套住元件 2 和 4 */
export const kclGeneralized = {
  id: 'surface',
  label: '广义节点',
  /** 闭合面穿过的电流 */
  currents: ['i1', 'i3', 'i5'],
  /** 标准方程（流入为正）：i₃ 流入面内，i₁、i₅ 流出 */
  equation: { i1: -1, i3: 1, i5: -1 } as Record<string, number>,
  /** 闭合面多边形（viewBox 坐标），覆盖 e2、e4 及两者之间的底导线 */
  polygon: [
    { x: 110, y: 105 }, { x: 440, y: 105 }, { x: 440, y: 320 }, { x: 110, y: 320 },
  ],
  explain: '把元件 2、4 和中间那段底导线整体包进一个闭合面。面上只有 i₁、i₃、i₅ 三条电流穿过：i₃ 流入，i₁、i₅ 流出，所以 −i₁+i₃−i₅=0。KCL 对任意闭合面都成立。',
}

/**
 * 判分：用户选出的「流入」集合是否与标准答案一致。
 * 返回不一致的电流 id（空数组表示全对）。
 */
export function gradeKclFlow(currents: KclCurrent[], node: KclNodeDef, userIn: ReadonlySet<string>): string[] {
  const wrong: string[] = []
  for (const cur of currents) {
    if (!node.currents.includes(cur.id)) continue
    const expectedIn = node.equation[cur.id] > 0
    if (userIn.has(cur.id) !== expectedIn) {
      wrong.push(cur.id)
    }
  }
  return wrong
}

/**
 * 判分：用户列的方程系数是否与标准方程一致（允许整体乘以 −1，两种写法等价）。
 * userSigns 只包含参与该节点的电流；缺项视为 0（即不允许漏项）。
 */
export function gradeKclEquation(node: KclNodeDef, userSigns: Record<string, 1 | -1>): boolean {
  const ids = Object.keys(node.equation)
  if (ids.some((id) => !(id in userSigns))) return false
  // 以第一个用户符号为基准对齐整体符号
  const flip = userSigns[ids[0]] === node.equation[ids[0]] ? 1 : -1
  return ids.every((id) => userSigns[id] * flip === node.equation[id])
}

/** KVL：绕行方向 */
export type TraverseDirection = 'cw' | 'ccw'

/** 电压升/降判断：沿绕行方向从 '+' 进 '−' 出为降（drop），反之为升（rise） */
export type RiseDrop = 'rise' | 'drop'

/**
 * 计算某回路在给定绕行方向下、每个元件的升降与方程符号标准答案。
 * 顺时针时按 entries[k] 进入元件；逆时针时进入端是顺时针链条上前一元件的进入端（循环）。
 * plusNodeOf 提供每个元件电压参考极性的 '+' 端节点。
 */
export function kvlExpected(
  loop: LoopDef,
  direction: TraverseDirection,
  plusNodeOf: (elementId: string) => string | undefined,
): { judgments: RiseDrop[]; signs: (1 | -1)[] } {
  const judgments: RiseDrop[] = []
  const signs: (1 | -1)[] = []
  for (let k = 0; k < loop.elements.length; k++) {
    const plusNode = plusNodeOf(loop.elements[k])
    if (!plusNode) {
      // 元件缺极性标注属于内容配置错误，按降处理并继续，避免交互页白屏
      judgments.push('drop')
      signs.push(-1)
      continue
    }
    const entryNode = direction === 'cw' ? loop.entries[k] : loop.entries[(k + 1) % loop.elements.length]
    const isDrop = entryNode === plusNode
    judgments.push(isDrop ? 'drop' : 'rise')
    signs.push(isDrop ? -1 : 1)
  }
  return { judgments, signs }
}

/**
 * 判分 KVL：逐项判断 + 方程符号。
 * elementPolarity 提供每个元件的 '+' 端节点（来自 CircuitElement.voltage.plusNode）。
 * userJudgments 与 userSigns 按 loop.elements 顺序给出。
 * 约定：电压降取负、电压升取正，Σu=0；允许整体符号翻转。
 */
export function gradeKvl(
  loop: LoopDef,
  direction: TraverseDirection,
  plusNodeOf: (elementId: string) => string | undefined,
  userJudgments: RiseDrop[],
  userSigns: (1 | -1)[],
): { wrongElements: string[]; equationCorrect: boolean } {
  const { judgments, signs } = kvlExpected(loop, direction, plusNodeOf)
  const wrongElements = loop.elements.filter((_, k) => userJudgments[k] !== judgments[k])
  // 方程判分：符号向量与标准一致（允许整体翻转，方程两边同乘 −1 等价）
  let equationCorrect = userSigns.length === signs.length
  if (equationCorrect) {
    const flip = userSigns[0] === signs[0] ? 1 : -1
    equationCorrect = userSigns.every((s, k) => s * flip === signs[k])
  }
  return { wrongElements, equationCorrect }
}

/** 数结构练习标准答案（名词术语电路） */
export const countingAnswers = {
  /** 节点：①②③④⑤，底导线 ⑤ 是一个节点 */
  nodes: { expected: 5 },
  /**
   * 支路：逐元件数是 7；元件 3、4 串联（中间节点③只连两条支路），
   * 合并后算 6。两种答案课堂都接受（PPT 原文：7 个或 6 个）。
   */
  branches: { expectedAccepted: [6, 7] as number[] },
  /** 网孔：上网孔、左下网孔、右下网孔，共 3 个 */
  meshes: { expected: 3 },
}

/** 数结构判分：count 是否被接受 */
export function gradeCounting(kind: keyof typeof countingAnswers, count: number): boolean {
  const ans = countingAnswers[kind]
  if ('expected' in ans) return count === ans.expected
  return ans.expectedAccepted.includes(count)
}
