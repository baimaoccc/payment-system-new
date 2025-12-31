import React from 'react'
import ReactSelect from 'react-select'

export function Select({ value, options, onChange, placeholder, isClearable=false, isDisabled=false, className, isMulti=false }) {
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
      borderColor: state.isFocused ? '#1E4DB7' : '#ECF0F2',
      boxShadow: state.isFocused ? '0 0 0 2px #1E4DB74D' : 'none',
      '&:hover': { borderColor: '#1E4DB7' },
    }),
    menu: base => ({ ...base, borderRadius: 8, overflow: 'hidden' }),
    option: (base, state) => ({
      ...base,
      fontSize: 13,
      backgroundColor: state.isFocused ? '#F3F5F9' : '#fff',
      color: '#11142D',
    }),
    singleValue: base => ({ ...base, color: '#11142D' }),
    multiValue: base => ({ ...base, backgroundColor: '#E0E7FF', borderRadius: 4 }),
    multiValueLabel: base => ({ ...base, color: '#1E4DB7', fontSize: 12 }),
    multiValueRemove: base => ({ ...base, color: '#1E4DB7', ':hover': { backgroundColor: '#1E4DB7', color: 'white' } }),
    placeholder: base => ({ ...base, color: '#949DB2' }),
    dropdownIndicator: (base, state) => ({ ...base, color: state.isFocused ? '#1E4DB7' : '#949DB2' }),
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
      isSearchable={false}
      isMulti={isMulti}
    />
  )
}
