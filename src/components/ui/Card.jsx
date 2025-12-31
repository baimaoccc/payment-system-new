import React from 'react'

/**
 * 通用卡片组件：用于包裹内容区域，提供标题与操作区插槽
 */
export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`p-3 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-2">
          {title && <h3 className="text-sm font-semibold text-navy">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

