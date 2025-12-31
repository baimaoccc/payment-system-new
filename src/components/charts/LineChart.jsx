import React from 'react'

/**
 * 折线图组件：使用 SVG 渲染，适合趋势展示
 * 参数：{ width, height, data, color }
 */
export function LineChart({ width = 380, height = 120, data = [], color = '#03C9D7' }) {
  const padding = 16
  const chartW = width - padding * 2
  const chartH = height - padding * 2
  const max = Math.max(1, ...data)
  const stepX = chartW / (data.length - 1 || 1)
  const points = data.map((v, i) => {
    const x = padding + i * stepX
    const y = padding + (1 - v / max) * chartH
    return [x, y]
  })
  const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <path d={path} stroke={color} strokeWidth="2" fill="none" />
      {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2" fill={color} />)}
    </svg>
  )
}
