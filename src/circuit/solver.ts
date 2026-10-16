/**
 * 极简线性求解器：带部分主元的高斯消元。
 * 只服务 playground 的两网孔 KCL/KVL 线性方程组，不做稀疏优化，
 * 也不追求数值库级别的精度，课堂量级的电阻/电压用 double 足够。
 */

export interface SolveResult {
  /** 解向量；矩阵奇异时为空数组 */
  x: number[]
  /** 是否成功求解 */
  ok: boolean
}

/**
 * 求解 Ax = b（A 为 n×n 方阵，b 长度为 n）。
 * 返回 ok=false 表示矩阵奇异（如电阻配置退化为 0Ω 短路等）。
 */
export function solveLinear(A: number[][], b: number[]): SolveResult {
  const n = b.length
  // 构造增广矩阵，避免修改调用方传入的数组
  const M: number[][] = A.map((row, i) => {
    if (row.length !== n) {
      throw new Error(`solveLinear: 第 ${i} 行长度 ${row.length} 与阶数 ${n} 不一致`)
    }
    return [...row, b[i]]
  })

  for (let col = 0; col < n; col++) {
    // 部分主元：在当前列选绝对值最大的行，降低舍入误差并检测奇异
    let pivot = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[pivot][col])) {
        pivot = row
      }
    }
    if (Math.abs(M[pivot][col]) < 1e-12) {
      return { x: [], ok: false }
    }
    if (pivot !== col) {
      const tmp = M[col]
      M[col] = M[pivot]
      M[pivot] = tmp
    }
    // 消元：把当前列下方所有行化为 0
    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / M[col][col]
      if (factor === 0) continue
      for (let k = col; k <= n; k++) {
        M[row][k] -= factor * M[col][k]
      }
    }
  }

  // 回代求解
  const x = new Array<number>(n).fill(0)
  for (let row = n - 1; row >= 0; row--) {
    let sum = M[row][n]
    for (let k = row + 1; k < n; k++) {
      sum -= M[row][k] * x[k]
    }
    x[row] = sum / M[row][row]
  }
  return { x, ok: true }
}

/**
 * playground 两网孔电路求解。
 * 网孔电流均取顺时针为正：
 *   (R1+R3)·Ia − R3·Ib = V
 *   −R3·Ia + (R2+R3)·Ib = 0
 * 返回各支路电流（相对各自参考方向，正值表示与参考方向相同）。
 */
export interface PlaygroundSolution {
  ok: boolean
  /** 左网孔、右网孔电流（顺时针为正），单位 A */
  mesh: [number, number]
  /** 支路电流：i1 经 R1（a→b）、i2 经 R2（b→右上）、i3 经 R3（b→c，向下）、iv 经电压源（向上） */
  branches: { i1: number; i2: number; i3: number; iv: number }
}

export function solveTwoMesh(V: number, R1: number, R2: number, R3: number): PlaygroundSolution {
  const { x, ok } = solveLinear(
    [
      [R1 + R3, -R3],
      [-R3, R2 + R3],
    ],
    [V, 0],
  )
  if (!ok) {
    return { ok: false, mesh: [0, 0], branches: { i1: 0, i2: 0, i3: 0, iv: 0 } }
  }
  const [ia, ib] = x
  return {
    ok: true,
    mesh: [ia, ib],
    branches: {
      i1: ia,
      i2: ib,
      i3: ia - ib,
      iv: ia,
    },
  }
}
