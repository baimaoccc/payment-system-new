import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

/**
 * 图标按钮：统一尺寸与交互样式
 */
export function IconButton({ icon, label, onClick, className = '' }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className={`inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 ${className}`}>
      <FontAwesomeIcon icon={icon} />
    </button>
  )
}

