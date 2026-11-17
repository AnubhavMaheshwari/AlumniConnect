import classNames from '../../utils/classnames';

export default function Button({
  variant = 'primary', size = 'md', loading = false,
  disabled = false, type = 'button', onClick, className = '', children, ...rest
}) {
  return (
    <button
      type={type}
      className={classNames('btn', `btn-${variant}`, `btn-${size}`, loading && 'btn-loading', className)}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {children}
    </button>
  );
}
