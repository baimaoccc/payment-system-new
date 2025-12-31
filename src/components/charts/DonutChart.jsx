import React from 'react'

/**
 * 环形图组件：使用圆弧展示占比
 * 参数：{ size, thickness, segments: [{ value, color }] }
 */
export function DonutChart({ size = 180, thickness = 20, segments = [] }) {
  const radius = (size - thickness) / 2
  const center = size / 2
  const total = segments.reduce((a, b) => a + (b.value || 0), 0) || 1
  let start = -Math.PI / 2

  const arcs = segments.map((s, i) => {
    const value = s.value || 0
    if (value <= 0) return { empty: true }
    
    const fraction = value / total
    // Handle 100% case: render a full circle instead of an arc
    if (fraction >= 0.9999) {
      return { isCircle: true, color: s.color }
    }

    const angle = fraction * Math.PI * 2
    const end = start + angle
    const large = angle > Math.PI ? 1 : 0
    const sx = center + radius * Math.cos(start)
    const sy = center + radius * Math.sin(start)
    const ex = center + radius * Math.cos(end)
    const ey = center + radius * Math.sin(end)
    const d = `M ${sx} ${sy} A ${radius} ${radius} 0 ${large} 1 ${ex} ${ey}`
    start = end
    return { d, color: s.color }
  })

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={center} cy={center} r={radius} stroke="#ECF0F2" strokeWidth={thickness} fill="none" />
      {arcs.map((a, i) => {
        if (a.empty) return null
        if (a.isCircle) {
           return <circle key={i} cx={center} cy={center} r={radius} stroke={a.color} strokeWidth={thickness} fill="none" />
        }
        return <path key={i} d={a.d} stroke={a.color} strokeWidth={thickness} fill="none" />
      })}
    </svg>
  )
}
