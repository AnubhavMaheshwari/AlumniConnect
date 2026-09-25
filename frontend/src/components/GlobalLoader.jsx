import { useUI } from '../context/UIContext';
import { useTheme } from '../context/ThemeContext';
import { FaGraduationCap } from 'react-icons/fa';

const GlobalLoader = () => {
    const { isLoading } = useUI();
    const { isDark } = useTheme();

    if (!isLoading) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDark ? 'rgba(12, 14, 20, 0.95)' : 'rgba(248, 250, 252, 0.95)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.4s ease'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: 80,
                    height: 80,
                    margin: '0 auto 24px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Outer pulse rings */}
                    <div style={{
                        position: 'absolute',
                        inset: -10,
                        border: '2px solid var(--blue-light)',
                        borderRadius: '50%',
                        animation: 'pulseRing 1.8s cubic-bezier(0.24, 0, 0.38, 1) infinite',
                        opacity: 0.3
                    }} />
                    <div style={{
                        position: 'absolute',
                        inset: -20,
                        border: '1px solid var(--blue-light)',
                        borderRadius: '50%',
                        animation: 'pulseRing 1.8s cubic-bezier(0.24, 0, 0.38, 1) infinite 0.3s',
                        opacity: 0.15
                    }} />
                    
                    {/* Main Icon Container */}
                    <div style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 22,
                        background: 'linear-gradient(135deg, var(--blue-light), var(--blue-dark))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(32, 54, 113, 0.4)',
                        animation: 'float 2.5s ease-in-out infinite'
                    }}>
                        <FaGraduationCap style={{ color: '#fff', fontSize: 36 }} />
                    </div>
                </div>

                <div style={{ position: 'relative' }}>
                    <h2 style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 18,
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        margin: 0,
                        letterSpacing: '0.5px'
                    }}>
                        Campus Connect
                    </h2>
                    <div style={{
                        marginTop: 12,
                        width: 140,
                        height: 3,
                        background: 'var(--border)',
                        borderRadius: 10,
                        margin: '12px auto 0',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: '40%',
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--blue), var(--blue-light))',
                            borderRadius: 10,
                            animation: 'loadingBar 1.2s cubic-bezier(0.65, 0, 0.35, 1) infinite'
                        }} />
                    </div>
                    <p style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        marginTop: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em'
                    }}>
                        Processing...
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes pulseRing {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    100% { transform: scale(1.4); opacity: 0; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes loadingBar {
                    0% { transform: translateX(-100%); width: 30%; }
                    50% { width: 60%; }
                    100% { transform: translateX(250%); width: 30%; }
                }
            `}</style>
        </div>
    );
};

export default GlobalLoader;
