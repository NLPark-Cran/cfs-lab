/**
 * 电路图数据：三张电路全部来自课堂 PPT（2.1 基尔霍夫定律）。
 * - kclExample：例 1 电路（5 条支路 i₁…i₅，节点 ①②③），拓扑与 PPT 完全一致
 * - termsCircuit：名词术语电路（元件 1-7、节点 ①-⑤、v₁…v₇ 参考极性），用于数结构练习与 KVL 实战
 * - playgroundCircuit：自由 playground 的两网孔电路（1 个电压源 + 3 个电阻）
 */
import type { CircuitDef } from './types'

/** 例 1 电路：节点①顶部左、②顶部右、③整条底导线 */
export const kclExample: CircuitDef = {
  id: 'kcl-example',
  width: 560,
  height: 380,
  nodes: [
    { id: 'n1', x: 150, y: 70, label: '①', labelDx: 0, labelDy: -18 },
    { id: 'n2', x: 390, y: 70, label: '②', labelDx: 0, labelDy: -18 },
    { id: 'n3', x: 270, y: 300, label: '③', labelDx: 0, labelDy: 30 },
  ],
  elements: [
    // 支路 1：①→③ 左侧，i₁ 参考方向流出①向左下（箭头画在左上水平导线上指向左）
    {
      id: 'e1', label: '1', kind: 'box', nodes: ['n1', 'n3'],
      body: { x: 60, y: 185 }, orientation: 'v',
      current: { label: 'i₁', dir: 'ab', marker: { x: 105, y: 70, dx: -1, dy: 0 } },
    },
    // 支路 2：①→③，i₂ 向下流出①
    {
      id: 'e2', label: '2', kind: 'box', nodes: ['n1', 'n3'],
      body: { x: 150, y: 185 }, orientation: 'v',
      current: { label: 'i₂', dir: 'ab', marker: { x: 150, y: 125, dx: 0, dy: 1 } },
    },
    // 支路 3：①→②，i₃ 向右流入②
    {
      id: 'e3', label: '3', kind: 'box', nodes: ['n1', 'n2'],
      body: { x: 270, y: 70 }, orientation: 'h',
      current: { label: 'i₃', dir: 'ab', marker: { x: 222, y: 70, dx: 1, dy: 0 } },
    },
    // 支路 4：②→③，i₄ 向下流出②
    {
      id: 'e4', label: '4', kind: 'box', nodes: ['n2', 'n3'],
      body: { x: 390, y: 185 }, orientation: 'v',
      current: { label: 'i₄', dir: 'ab', marker: { x: 390, y: 125, dx: 0, dy: 1 } },
    },
    // 支路 5：②→③ 右侧，i₅ 向下流出②
    {
      id: 'e5', label: '5', kind: 'box', nodes: ['n2', 'n3'],
      body: { x: 480, y: 185 }, orientation: 'v',
      current: { label: 'i₅', dir: 'ab', marker: { x: 480, y: 125, dx: 0, dy: 1 } },
    },
  ],
  wires: [
    { id: 'w-left', points: [{ x: 150, y: 70 }, { x: 60, y: 70 }, { x: 60, y: 300 }] },
    { id: 'w-e2', points: [{ x: 150, y: 70 }, { x: 150, y: 300 }] },
    { id: 'w-top', points: [{ x: 150, y: 70 }, { x: 390, y: 70 }] },
    { id: 'w-e4', points: [{ x: 390, y: 70 }, { x: 390, y: 300 }] },
    { id: 'w-right', points: [{ x: 390, y: 70 }, { x: 480, y: 70 }, { x: 480, y: 300 }] },
    { id: 'w-bottom', points: [{ x: 60, y: 300 }, { x: 480, y: 300 }] },
  ],
  extraDots: [
    { nodeId: 'n3', x: 60, y: 300 },
    { nodeId: 'n3', x: 150, y: 300 },
    { nodeId: 'n3', x: 390, y: 300 },
    { nodeId: 'n3', x: 480, y: 300 },
  ],
}

/** 名词术语电路：元件 1-7、节点 ①-⑤，极性按 PPT 标注 */
export const termsCircuit: CircuitDef = {
  id: 'terms-circuit',
  width: 660,
  height: 380,
  nodes: [
    { id: 'n1', x: 140, y: 170, label: '①', labelDx: -18, labelDy: 0 },
    { id: 'n2', x: 300, y: 170, label: '②', labelDx: 0, labelDy: -18 },
    { id: 'n3', x: 420, y: 170, label: '③', labelDx: 0, labelDy: -18 },
    { id: 'n4', x: 520, y: 170, label: '④', labelDx: 18, labelDy: 0 },
    { id: 'n5', x: 330, y: 290, label: '⑤', labelDx: 0, labelDy: 32 },
  ],
  elements: [
    // 顶部支路：v₁ 右正左负，i₁ 向右
    {
      id: 'e1', label: '1', kind: 'box', nodes: ['n1', 'n4'],
      body: { x: 330, y: 50 }, orientation: 'h',
      current: { label: 'i₁', dir: 'ab', marker: { x: 235, y: 50, dx: 1, dy: 0 } },
      voltage: { label: 'v₁', plusNode: 'n4' },
    },
    // 中排左：v₂ 左正右负
    {
      id: 'e2', label: '2', kind: 'box', nodes: ['n1', 'n2'],
      body: { x: 220, y: 170 }, orientation: 'h',
      current: { label: 'i₂', dir: 'ab', marker: { x: 182, y: 170, dx: 1, dy: 0 } },
      voltage: { label: 'v₂', plusNode: 'n1' },
    },
    // 中排中：v₃ 右正左负
    {
      id: 'e3', label: '3', kind: 'box', nodes: ['n2', 'n3'],
      body: { x: 360, y: 170 }, orientation: 'h',
      current: { label: 'i₃', dir: 'ab', marker: { x: 322, y: 170, dx: 1, dy: 0 } },
      voltage: { label: 'v₃', plusNode: 'n3' },
    },
    // 中排右：v₄ 左正右负
    {
      id: 'e4', label: '4', kind: 'box', nodes: ['n3', 'n4'],
      body: { x: 470, y: 170 }, orientation: 'h',
      current: { label: 'i₄', dir: 'ab', marker: { x: 432, y: 170, dx: 1, dy: 0 } },
      voltage: { label: 'v₄', plusNode: 'n3' },
    },
    // 左竖：v₅ 上正下负，i₅ 向上
    {
      id: 'e5', label: '5', kind: 'box', nodes: ['n1', 'n5'],
      body: { x: 140, y: 230 }, orientation: 'v',
      current: { label: 'i₅', dir: 'ba', marker: { x: 140, y: 230, dx: 0, dy: -1 } },
      voltage: { label: 'v₅', plusNode: 'n1' },
    },
    // 中竖：v₆ 下正上负，i₆ 向上
    {
      id: 'e6', label: '6', kind: 'box', nodes: ['n2', 'n5'],
      body: { x: 300, y: 230 }, orientation: 'v',
      current: { label: 'i₆', dir: 'ba', marker: { x: 300, y: 230, dx: 0, dy: -1 } },
      voltage: { label: 'v₆', plusNode: 'n5' },
    },
    // 右竖：v₇ 上正下负，i₇ 向下
    {
      id: 'e7', label: '7', kind: 'box', nodes: ['n4', 'n5'],
      body: { x: 520, y: 230 }, orientation: 'v',
      current: { label: 'i₇', dir: 'ab', marker: { x: 520, y: 230, dx: 0, dy: 1 } },
      voltage: { label: 'v₇', plusNode: 'n4' },
    },
  ],
  wires: [
    { id: 'w-tl', points: [{ x: 140, y: 170 }, { x: 140, y: 50 }] },
    { id: 'w-top', points: [{ x: 140, y: 50 }, { x: 520, y: 50 }] },
    { id: 'w-tr', points: [{ x: 520, y: 50 }, { x: 520, y: 170 }] },
    { id: 'w-mid', points: [{ x: 140, y: 170 }, { x: 520, y: 170 }] },
    { id: 'w-e5', points: [{ x: 140, y: 170 }, { x: 140, y: 290 }] },
    { id: 'w-e6', points: [{ x: 300, y: 170 }, { x: 300, y: 290 }] },
    { id: 'w-e7', points: [{ x: 520, y: 170 }, { x: 520, y: 290 }] },
    { id: 'w-bottom', points: [{ x: 140, y: 290 }, { x: 520, y: 290 }] },
  ],
  extraDots: [
    { nodeId: 'n5', x: 140, y: 290 },
    { nodeId: 'n5', x: 300, y: 290 },
    { nodeId: 'n5', x: 520, y: 290 },
  ],
  loops: [
    {
      id: 'L1', name: '上网孔', elements: ['e1', 'e4', 'e3', 'e2'], entries: ['n1', 'n4', 'n3', 'n2'],
      path: [
        { x: 140, y: 170 }, { x: 140, y: 50 }, { x: 520, y: 50 },
        { x: 520, y: 170 }, { x: 140, y: 170 },
      ],
    },
    {
      id: 'L2', name: '左下网孔', elements: ['e2', 'e6', 'e5'], entries: ['n1', 'n2', 'n5'],
      path: [
        { x: 140, y: 170 }, { x: 300, y: 170 }, { x: 300, y: 290 },
        { x: 140, y: 290 }, { x: 140, y: 170 },
      ],
    },
    {
      id: 'L3', name: '右下网孔', elements: ['e3', 'e4', 'e7', 'e6'], entries: ['n2', 'n3', 'n4', 'n5'],
      path: [
        { x: 300, y: 170 }, { x: 520, y: 170 }, { x: 520, y: 290 },
        { x: 300, y: 290 }, { x: 300, y: 170 },
      ],
    },
    {
      id: 'L4', name: '外侧大回路', elements: ['e1', 'e7', 'e5'], entries: ['n1', 'n4', 'n5'],
      path: [
        { x: 140, y: 170 }, { x: 140, y: 50 }, { x: 520, y: 50 },
        { x: 520, y: 290 }, { x: 140, y: 290 }, { x: 140, y: 170 },
      ],
    },
    {
      id: 'L5', name: '中缝大回路', elements: ['e1', 'e7', 'e6', 'e2'], entries: ['n1', 'n4', 'n5', 'n2'],
      path: [
        { x: 140, y: 170 }, { x: 140, y: 50 }, { x: 520, y: 50 }, { x: 520, y: 290 },
        { x: 300, y: 290 }, { x: 300, y: 170 }, { x: 140, y: 170 },
      ],
    },
  ],
  meshes: [
    {
      id: 'M1', name: '上网孔', elements: ['e1', 'e2', 'e3', 'e4'],
      polygon: [{ x: 140, y: 50 }, { x: 520, y: 50 }, { x: 520, y: 170 }, { x: 140, y: 170 }],
      outline: [{ x: 140, y: 50 }, { x: 520, y: 50 }, { x: 520, y: 170 }, { x: 140, y: 170 }, { x: 140, y: 50 }],
    },
    {
      id: 'M2', name: '左下网孔', elements: ['e2', 'e5', 'e6'],
      polygon: [{ x: 140, y: 170 }, { x: 300, y: 170 }, { x: 300, y: 290 }, { x: 140, y: 290 }],
      outline: [{ x: 140, y: 170 }, { x: 300, y: 170 }, { x: 300, y: 290 }, { x: 140, y: 290 }, { x: 140, y: 170 }],
    },
    {
      id: 'M3', name: '右下网孔', elements: ['e3', 'e4', 'e6', 'e7'],
      polygon: [{ x: 300, y: 170 }, { x: 520, y: 170 }, { x: 520, y: 290 }, { x: 300, y: 290 }],
      outline: [{ x: 300, y: 170 }, { x: 520, y: 170 }, { x: 520, y: 290 }, { x: 300, y: 290 }, { x: 300, y: 170 }],
    },
  ],
}

/** 自由 playground：两网孔电路（电压源 + R1/R2/R3） */
export const playgroundCircuit: CircuitDef = {
  id: 'playground',
  width: 560,
  height: 340,
  nodes: [
    { id: 'nA', x: 80, y: 70, label: 'a', labelDx: -16, labelDy: 0 },
    { id: 'nB', x: 280, y: 70, label: 'b', labelDx: 0, labelDy: -16 },
    { id: 'nC', x: 270, y: 270, label: 'c', labelDx: 0, labelDy: 30 },
  ],
  elements: [
    // 电压源：左竖支路，上正下负，参考电流向上（ba）
    {
      id: 'src', label: 'V', kind: 'source', nodes: ['nA', 'nC'],
      body: { x: 80, y: 170 }, orientation: 'v',
      current: { label: 'iᵥ', dir: 'ba', marker: { x: 80, y: 120, dx: 0, dy: -1 } },
      voltage: { label: 'V', plusNode: 'nA' },
    },
    {
      id: 'r1', label: 'R1', kind: 'box', nodes: ['nA', 'nB'],
      body: { x: 180, y: 70 }, orientation: 'h',
      current: { label: 'i₁', dir: 'ab', marker: { x: 180, y: 50, dx: 1, dy: 0 } },
    },
    {
      id: 'r2', label: 'R2', kind: 'box', nodes: ['nB', 'nD'],
      body: { x: 370, y: 70 }, orientation: 'h',
      current: { label: 'i₂', dir: 'ab', marker: { x: 370, y: 50, dx: 1, dy: 0 } },
    },
    {
      id: 'r3', label: 'R3', kind: 'box', nodes: ['nB', 'nC'],
      body: { x: 280, y: 170 }, orientation: 'v',
      current: { label: 'i₃', dir: 'ab', marker: { x: 280, y: 120, dx: 0, dy: 1 } },
    },
  ],
  wires: [
    { id: 'w-top', points: [{ x: 80, y: 70 }, { x: 460, y: 70 }] },
    { id: 'w-left', points: [{ x: 80, y: 70 }, { x: 80, y: 270 }] },
    { id: 'w-mid', points: [{ x: 280, y: 70 }, { x: 280, y: 270 }] },
    { id: 'w-right', points: [{ x: 460, y: 70 }, { x: 460, y: 270 }] },
    { id: 'w-bottom', points: [{ x: 80, y: 270 }, { x: 460, y: 270 }] },
  ],
  extraDots: [
    { nodeId: 'nC', x: 80, y: 270 },
    { nodeId: 'nC', x: 280, y: 270 },
    { nodeId: 'nC', x: 460, y: 270 },
    { nodeId: 'nD', x: 460, y: 70 },
  ],
}
