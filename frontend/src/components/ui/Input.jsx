import React from 'react';
import classNames from '../../utils/classnames';

export default function Input({
  label,
  error,
  helper,
  icon: Icon,
  right,
  className = '',
  disabled,
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: 12,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-muted)',
              zIndex: 1,
            }}
          >
            <Icon size={18} strokeWidth={1.5} />
          </div>
        )}
        <input
          id={inputId}
          disabled={disabled}
          className={classNames(
            'input-field',
            error && 'input-error',
            className
          )}
          style={{
            paddingLeft: Icon ? 38 : 12,
            paddingRight: right ? 40 : 12,
          }}
          {...props}
        />
        {right && (
          <div
            style={{
              position: 'absolute',
              right: 8,
              display: 'flex',
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            {right}
          </div>
        )}
      </div>
      {error && <span className="input-error-msg">{error}</span>}
      {helper && !error && <span className="input-helper">{helper}</span>}
    </div>
  );
}
