import { useUI } from '../context/UIContext';

const GlobalLoader = () => {
  const { isLoading } = useUI();

  if (!isLoading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 20, 25, 0.65)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="card"
        style={{
          padding: '32px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          background: 'var(--color-surface)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="spinner" />
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--color-text)',
          }}
        >
          Alumni Connect
        </div>
        <p
          style={{
            fontSize: 12,
            color: 'var(--color-text-muted)',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Loading...
        </p>
      </div>
    </div>
  );
};

export default GlobalLoader;
