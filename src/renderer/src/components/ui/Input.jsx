
/**
 * Reusable Input Component
 * @param {string} type - Input type (text, email, password, number, etc.)
 * @param {string} id - Input ID
 * @param {string} name - Input name
 * @param {string} label - Label text
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {function} onBlur - Blur handler
 * @param {string} error - Error message
 * @param {boolean} required - Required field
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 * @param {object} inputProps - Additional input attributes
 */
const Input = ({
  type = 'text',
  id,
  name,
  label,
  placeholder = '',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  className = '',
  style = {},
  inputProps = {},
  ...props
}) => {
  const containerStyle = {
    width: '100%',
    marginBottom: '20px',
    ...style
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  }

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: error ? '1px solid #dc3545' : '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '16px',
    transition: 'border-color 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box'
  }

  const errorStyle = {
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '5px'
  }

  return (
    <div className="input-container" style={containerStyle}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
          {required && <span style={{ color: '#dc3545', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        style={inputStyle}
        className={`form-control ${className}`}
        {...inputProps}
        {...props}
      />
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  )
}

export default Input
