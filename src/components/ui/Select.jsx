import React from 'react'
import ReactSelect from 'react-select'
import { useSelector } from 'react-redux'

export function Select({ value, options, onChange, placeholder, isClearable=false, isDisabled=false, className, isMulti=false, menuPlacement = 'bottom', menuPortalTarget, isSearchable = false, ...props }) {
  const theme = useSelector((s) => s.ui?.theme || "light");
  const isDark = theme === "dark";
  const list = options.map(o => typeof o === 'object' ? o : { value: o, label: String(o) })
  
  let current;
  if (isMulti) {
     current = list.filter(o => Array.isArray(value) && value.includes(o.value));
  } else {
     current = list.find(o => o.value === value) || null
  }

  const handleChange = (opt) => {
      if (isMulti) {
          onChange(opt ? opt.map(o => o.value) : []);
      } else {
          onChange(opt ? opt.value : null);
      }
  }

  const styles = {
    control: (base, state) => ({
      ...base,
      minHeight: 36,
      borderRadius: 8,
      backgroundColor: isDark ? (state.isFocused ? "#374151" : "#1F2937") : (state.isFocused ? "white" : "#F9FAFB"),
      borderColor: isDark ? (state.isFocused ? "#3B82F6" : "rgba(55, 65, 81, 0.5)") : (state.isFocused ? "#1E4DB7" : "#ECF0F2"),
      boxShadow: state.isFocused ? (isDark ? "0 0 0 2px rgba(59, 130, 246, 0.1)" : "0 0 0 2px #1E4DB74D") : "none",
      '&:hover': { borderColor: isDark ? '#6B7280' : '#1E4DB7' },
    }),
    menu: base => ({ ...base, borderRadius: 8, overflow: 'hidden', backgroundColor: isDark ? "#1F2937" : "white", border: isDark ? "1px solid #374151" : "1px solid #F3F4F6" }),
    menuPortal: base => ({ ...base, zIndex: 9999 }),
    option: (base, state) => ({
      ...base,
      fontSize: 13,
      backgroundColor: state.isFocused ? (isDark ? '#374151' : '#F3F5F9') : (isDark ? '#1F2937' : '#fff'),
      color: isDark ? '#D1D5DB' : '#11142D',
      ':active': {
        backgroundColor: isDark ? '#4B5563' : '#E0E7FF',
      }
    }),
    singleValue: base => ({ ...base, color: isDark ? '#D1D5DB' : '#11142D' }),
    multiValue: base => ({ ...base, backgroundColor: isDark ? '#374151' : '#E0E7FF', borderRadius: 4 }),
    multiValueLabel: base => ({ ...base, color: isDark ? '#93C5FD' : '#1E4DB7', fontSize: 12 }),
    multiValueRemove: base => ({ ...base, color: isDark ? '#93C5FD' : '#1E4DB7', ':hover': { backgroundColor: isDark ? '#4B5563' : '#1E4DB7', color: 'white' } }),
    placeholder: base => ({ ...base, color: isDark ? '#9CA3AF' : '#949DB2' }),
    dropdownIndicator: (base, state) => ({ ...base, color: state.isFocused ? (isDark ? '#60A5FA' : '#1E4DB7') : (isDark ? '#9CA3AF' : '#949DB2') }),
    indicatorSeparator: base => ({ ...base, display: 'none' }),
  }
  return (
    <ReactSelect
      className={className}
      value={current}
      options={list}
      onChange={handleChange}
      placeholder={placeholder}
      isClearable={isClearable}
      isDisabled={isDisabled}
      styles={styles}
      isSearchable={isSearchable}
      isMulti={isMulti}
      menuPlacement={menuPlacement}
      menuPortalTarget={menuPortalTarget}
      {...props}
    />
  )
}
