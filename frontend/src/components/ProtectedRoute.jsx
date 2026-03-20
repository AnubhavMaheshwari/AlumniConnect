import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap } from 'react-icons/fa';

const C = {
    blue: 'var(--blue)', blueLight: 'var(--blue-light)',
    blueFaint: 'var(--blue-faint)', blueBorder: 'var(--blue-border)',
    white: '#FFFFFF', black: 'var(--bg)', darkBorder: 'var(--border)',
};

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', background: C.black,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 20,
            }}>
                {/* logo mark */}
                <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 8px 28px rgba(32,54,113,0.5)`,
                    marginBottom: 4,
                }}>
                    <FaGraduationCap style={{ color: C.white, fontSize: 24 }} />
                </div>

                {/* spinner */}
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: `3px solid ${C.blueFaint}`,
                    borderTopColor: C.blueLight,
                    animation: 'spin 0.7s linear infinite',
                }} />

                {/* label */}
                <p style={{
                    fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    fontFamily: "'DM Sans', sans-serif", margin: 0,
                }}>
                    Loading…
                </p>

                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
