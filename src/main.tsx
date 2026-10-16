import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const container = document.getElementById('root')
if (!container) {
  // 入口挂载点缺失属于构建期配置错误，直接抛出便于在控制台定位
  throw new Error('找不到 #root 挂载点，请检查 index.html')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
