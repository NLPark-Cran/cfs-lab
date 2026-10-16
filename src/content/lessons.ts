/**
 * 概念引导课内容：scrollytelling 分步讲解数据。
 * 每一步绑定一张电路图 + 一组高亮，滚动到该步时图中对应元素亮起。
 */
import type { HighlightSpec } from '../circuit/CircuitBoard'

export interface TourStep {
  id: string
  title: string
  paragraphs: string[]
  /** 本步展示的电路：kcl = 例 1 电路，terms = 名词术语电路 */
  circuit: 'kcl' | 'terms'
  highlight?: HighlightSpec
  showVoltage?: boolean
}

export const tourSteps: TourStep[] = [
  {
    id: 'reference-direction',
    title: '第一步 · 参考方向（reference direction）',
    circuit: 'kcl',
    highlight: { elements: ['e1', 'e2', 'e3', 'e4', 'e5'] },
    paragraphs: [
      '电流看不见摸不着，计算之前必须先假定一个参考方向：箭头朝哪，就先按哪算。图上标的 i₁…i₅ 就是这 5 条支路的参考方向。',
      '算出来是正值，说明真实方向和参考方向一致；算出来是负值，说明真实方向与参考方向相反。参考方向可以任意假设，但一旦定下就不要中途改。',
    ],
  },
  {
    id: 'branch',
    title: '第二步 · 支路（branch）',
    circuit: 'kcl',
    highlight: { elements: ['e2'] },
    paragraphs: [
      '支路：一个或几个串联元件构成的电路分支，同一条支路上电流处处相等。',
      '看例 1 这张图：元件 1 独占一条支路，元件 2 独占一条支路……一共 5 条支路，每条支路上标了一个电流。',
    ],
  },
  {
    id: 'node',
    title: '第三步 · 节点（node）',
    circuit: 'kcl',
    highlight: { nodes: ['n1', 'n2', 'n3'] },
    paragraphs: [
      '节点：两条或两条以上支路的连接点。例 1 里节点①在左上，节点②在右上。',
      '注意底部：从左下角到右下角整条底导线中间没有元件，电势处处相等，所以整条底导线只算一个节点③。数节点时最容易在这里多数。',
    ],
  },
  {
    id: 'loop-mesh',
    title: '第四步 · 回路（loop）与网孔（mesh）',
    circuit: 'terms',
    highlight: { loops: ['L4'], meshes: ['M1', 'M2', 'M3'] },
    paragraphs: [
      '回路：电路中任一闭合路径。外侧这条大路径就是回路，怎么走闭合路径都算数。',
      '网孔是特殊的回路：内部不再含有任何支路的「最小回路」。这张图有 3 个网孔（虚线框出的三块区域），而回路可以有很多个。',
      '记法：网孔一定是回路，回路不一定是网孔。',
    ],
  },
  {
    id: 'kcl',
    title: '第五步 · KCL 基尔霍夫电流定律',
    circuit: 'kcl',
    highlight: { nodes: ['n1'], elements: ['e1', 'e2', 'e3'] },
    paragraphs: [
      '任一时刻，流入任一节点的电流之和等于流出该节点的电流之和，俗称「水流守恒」。',
      '取流入为正，对节点①：i₁、i₂、i₃ 参考方向全部背离①，方程就是 −i₁−i₂−i₃=0。',
      '还有个进阶版：对任意闭合面（广义节点）也成立，把几个节点包起来整体看，穿过闭合面的电流代数和同样为零。',
    ],
  },
  {
    id: 'kvl',
    title: '第六步 · KVL 基尔霍夫电压定律',
    circuit: 'terms',
    showVoltage: true,
    highlight: { loops: ['L2'] },
    paragraphs: [
      '沿任一闭合回路绕行一周，所有电压的代数和为零：Σu=0。类比爬山：绕一圈回到起点，高度差总和必然是零。',
      '先标电压参考极性（+ / −），再选绕行方向：从「+」端进「−」端出记电压降（取负），反过来记电压升（取正）。',
      '独立性：n 个节点只有 n−1 个独立 KCL 方程；b 条支路只有 b−n+1 个独立 KVL 方程，恰好取各网孔列方程最省事。',
    ],
  },
]
