/**
 * 电路数据模型：所有电路图均为数据驱动，CircuitBoard 渲染层只负责把数据画成 SVG。
 * 坐标为固定 viewBox 内的逻辑坐标，移动端通过 SVG viewBox 自适应缩放。
 */

/** 电路节点：两条或更多支路的连接点 */
export interface CircuitNode {
  id: string
  x: number
  y: number
  /** 节点标注（如 ①②③），保留课堂记号 */
  label: string
  /** 标注相对圆点的偏移 */
  labelDx?: number
  labelDy?: number
}

/** 元件主体在支路上的摆放方式：h = 水平，v = 垂直 */
export type ElementOrientation = 'h' | 'v'

/** 电路元件（电阻、电压源等），课堂图中统一画成方框 */
export interface CircuitElement {
  id: string
  /** 元件编号，画在方框内，如 '1'、'R1' */
  label: string
  kind: 'box' | 'source'
  /** 支路两端连接的节点 */
  nodes: [string, string]
  /** 元件方框中心 */
  body: { x: number; y: number }
  orientation: ElementOrientation
  /** 电流参考方向：从 nodes[0] 指向 nodes[1] 为 'ab'，反之为 'ba' */
  current?: {
    label: string
    dir: 'ab' | 'ba'
    /** 箭头显式摆放位置（覆盖默认放在元件旁的规则），dx/dy 为单位方向向量 */
    marker?: { x: number; y: number; dx: number; dy: number }
  }
  /** 电压参考极性：'+' 端所在的节点 */
  voltage?: {
    label: string
    plusNode: string
  }
}

/** 纯导线：折线连接，端点通常落在节点或元件方框边缘 */
export interface WirePath {
  id: string
  points: { x: number; y: number }[]
}

/** 闭合回路：供 KVL 选择与路径高亮，path 为沿导线的折线 */
export interface LoopDef {
  id: string
  name: string
  /** 回路包含的元件（按顺时针绕行经过顺序） */
  elements: string[]
  /** 与 elements 一一对应：顺时针绕行时进入该元件的节点 */
  entries: string[]
  path: { x: number; y: number }[]
}

/** 网孔区域：供数结构练习点击与引导课高亮的多边形 */
export interface MeshDef {
  id: string
  name: string
  /** 区域内包含的元件 */
  elements: string[]
  /** 可点击区域（略大于实际闭合面，方便手指点按） */
  polygon: { x: number; y: number }[]
  /** 高亮描边路径 */
  outline: { x: number; y: number }[]
}

/** 一张完整电路图的定义 */
export interface CircuitDef {
  id: string
  width: number
  height: number
  nodes: CircuitNode[]
  elements: CircuitElement[]
  wires: WirePath[]
  loops?: LoopDef[]
  meshes?: MeshDef[]
  /** 逻辑上属于某节点、但视觉上分开画的导线圆点（如整条底导线上的多个黑点同属一个节点） */
  extraDots?: { nodeId: string; x: number; y: number }[]
}
