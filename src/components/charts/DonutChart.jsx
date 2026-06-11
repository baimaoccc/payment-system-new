import React, { useState } from 'react'

/**
 * 环形图组件：使用圆弧展示占比
 * 参数：{ size, thickness, segments: [{ value, color, label }] }
 */
export function DonutChart({ size = 180, thickness = 20, segments = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  
  const radius = (size - thickness) / 2
  const center = size / 2
  const total = segments.reduce((a, b) => a + (b.value || 0), 0) || 1
  let start = -Math.PI / 2

  const arcs = segments.map((s, i) => {
    const value = s.value || 0
    if (value <= 0) return { empty: true }
    
    const fraction = value / total
    const percentage = (fraction * 100).toFixed(1) + '%'
    // Handle 100% case: render a full circle instead of an arc
    if (fraction >= 0.9999) {
      return { 
        isCircle: true, 
        color: s.color, 
        percentage, 
        label: s.label, 
        index: i,
        // Label position (center top for full circle)
         labelX: center,
         labelY: center - radius - 25, // 相应增加了 100% 圆形的线条和文字高度
         lineX1: center,
         lineY1: center - radius,
         lineX2: center,
         lineY2: center - radius - 20 // 线条长度
       }
    }

    const angle = fraction * Math.PI * 2
    const end = start + angle
    const large = angle > Math.PI ? 1 : 0
    const sx = center + radius * Math.cos(start)
    const sy = center + radius * Math.sin(start)
    const ex = center + radius * Math.cos(end)
    const ey = center + radius * Math.sin(end)
    const d = `M ${sx} ${sy} A ${radius} ${radius} 0 ${large} 1 ${ex} ${ey}`
    
    // Calculate middle point for the label and line
    const midAngle = start + angle / 2
    
    // Position on the arc (for line start)
    const arcX = center + radius * Math.cos(midAngle)
    const arcY = center + radius * Math.sin(midAngle)
    
    // Distance to push the label out (make sure there's enough room)
     const pushOutDistance = 25 // 增加了线条长度
     const labelRadius = radius + pushOutDistance
    
    // End of line and position of text
    const labelX = center + labelRadius * Math.cos(midAngle)
    const labelY = center + labelRadius * Math.sin(midAngle)
    
    // Text anchor depends on which side of the circle we are
    const textAnchor = Math.cos(midAngle) >= 0 ? "start" : "end"
    
    start = end
    return { 
      d, 
      color: s.color, 
      percentage, 
      label: s.label, 
      index: i,
      arcX, arcY, labelX, labelY, textAnchor
    }
  })

  // Provide some extra padding so the labels don't get cut off by the viewBox
   const padding = 50 // 增加了 viewBox 的 padding 以容纳更长的线条
   const viewBoxSize = size + padding * 2
   const offset = padding

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} width={viewBoxSize} height={viewBoxSize}>
        {/* We wrap everything in a group shifted by padding */}
        <g transform={`translate(${offset}, ${offset})`}>
          <circle cx={center} cy={center} r={radius} stroke="#ECF0F2" strokeWidth={thickness} fill="none" />
          
          {arcs.map((a, i) => {
            if (a.empty) return null
            if (a.isCircle) {
               return (
                 <g key={`arc-${i}`}>
                   <circle 
                     cx={center} 
                     cy={center} 
                     r={radius} 
                     stroke={a.color} 
                     strokeWidth={thickness} 
                     fill="none"
                     onMouseEnter={() => setHoveredIndex(a.index)}
                     onMouseLeave={() => setHoveredIndex(null)}
                     className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                   />
                   {/* Line and Label for 100% case */}
                   {a.label !== "No Data" && (
                     <>
                       <line 
                         x1={a.lineX1} y1={a.lineY1} 
                         x2={a.lineX2} y2={a.lineY2} 
                         stroke={a.color} strokeWidth="1" 
                       />
                       <text 
                         x={a.labelX} y={a.labelY} 
                         fill={a.color} 
                         fontSize="14" 
                         fontWeight="600" 
                         textAnchor="middle" 
                         alignmentBaseline="bottom"
                       >
                         {a.percentage}
                       </text>
                     </>
                   )}
                 </g>
               )
            }
            return (
              <g key={`arc-${i}`}>
                <path 
                  d={a.d} 
                  stroke={a.color} 
                  strokeWidth={thickness} 
                  fill="none" 
                  onMouseEnter={() => setHoveredIndex(a.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                />
                {/* Line pointer */}
                <line 
                  x1={a.arcX} y1={a.arcY} 
                  x2={a.labelX} y2={a.labelY} 
                  stroke={a.color} strokeWidth="1" 
                />
                {/* Text percentage */}
                <text 
                  x={a.labelX + (a.textAnchor === "start" ? 2 : -2)} 
                  y={a.labelY} 
                  fill={a.color} 
                  fontSize="14" 
                  fontWeight="600" 
                  textAnchor={a.textAnchor} 
                  alignmentBaseline="middle"
                >
                  {a.percentage}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
      
      {/* Tooltip for label context on hover */}
      {hoveredIndex !== null && arcs[hoveredIndex] && !arcs[hoveredIndex].empty && arcs[hoveredIndex].label !== "No Data" && (
        <div 
          className="absolute z-10 pointer-events-none bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-medium py-1 px-2 rounded shadow-lg whitespace-nowrap"
          style={{ 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          {arcs[hoveredIndex].label}
        </div>
      )}
    </div>
  )
}
