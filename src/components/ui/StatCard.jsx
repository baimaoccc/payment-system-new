import React from 'react'

/**
 * 统计卡组件：展示简洁的指标数字与可选按钮
 */
export function StatCard({ label, value, hint, color = 'brand', onClick, buttonText }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-2xl font-semibold ${color === 'brand' ? 'text-brand' : color === 'peach' ? 'text-peach' : 'text-navy'}`}>{value}</div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
      {buttonText && (
        <button onClick={onClick} className="mt-3 bg-brand hover:bg-brand-dark text-white text-sm px-3 py-1 rounded">
          {buttonText}
        </button>
      )}
    </div>
  )}

