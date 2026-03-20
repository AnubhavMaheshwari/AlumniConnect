import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaGraduationCap, FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';

const C = {
    blue: '#203671', blueDark: '#182858', blueLight: '#2D4899',
    blueFaint: 'rgba(32,54,113,0.12)', blueBorder: 'rgba(32,54,113,0.35)',
    white: '#FFFFFF', muted: '#8A94A8', black: '#000000',
    darkBg: '#0C0E14', darkCard: '#12151F', darkBorder: '#1E2235',
};

if (typeof document !== 'undefined' && !document.getElementById('auth-fonts')) {
    const l = document.createElement('link');
    l.id = 'auth-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700;800&display=swap';
    document.head.appendChild(l);
    const s = document.createElement('style');
    s.textContent = `@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } } @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }`;
    document.head.appendChild(s);
}

const Field = ({ label, icon: Icon, error, right, children }) => (
    <div>
        <label style={{ display: 'block', marginBottom: 7, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>
            {label}
        </label>
        <div style={{ position: 'relative' }}>
            <Icon style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: 13, pointerEvents: 'none', zIndex: 1 }} />
            {children}
            {right && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>{right}</div>}
        </div>
        {error && <p style={{ marginTop: 6, fontSize: 11, color: '#FF4D4D' }}>{error}</p>}
    </div>
);

const inputSx = (hasRight) => ({
    width: '100%', background: C.darkBg, border: `1px solid ${C.darkBorder}`,
    borderRadius: 9, padding: `11px 14px 11px 40px`,
    paddingRight: hasRight ? 40 : 14,
    color: C.white, fontSize: 13.5, outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
});
const focusSx = e => { e.target.style.borderColor = C.blueLight; e.target.style.boxShadow = `0 0 0 3px ${C.blueFaint}`; };
const blurSx  = e => { e.target.style.borderColor = C.darkBorder; e.target.style.boxShadow = 'none'; };

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading]   = useState(false);
    const [showPw, setShowPw]     = useState(false);
    const { login } = useAuth();
    const navigate  = useNavigate();

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', background: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>

            {/* bg grid */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(32,54,113,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(32,54,113,0.05) 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />
            {/* glows */}
            <div style={{ position: 'absolute', top: '15%', left: '20%', width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, rgba(32,54,113,0.15) 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle, rgba(45,72,153,0.12) 0%, transparent 70%)`, pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, animation: 'fadeUp 0.6s ease both' }}>

                {/* logo + title */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{ width: 68, height: 68, borderRadius: 18, background: `linear-gradient(135deg, ${C.blueLight}, ${C.blueDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 8px 32px rgba(32,54,113,0.5)`, animation: 'float 5s ease-in-out infinite' }}>
                        <FaGraduationCap style={{ color: C.white, fontSize: 30 }} />
                    </div>
                    <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: C.white, margin: '0 0 8px', letterSpacing: '-0.4px' }}>Welcome Back</h1>
                    <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>Sign in to NIT Jamshedpur Alumni Portal</p>
                </div>

                {/* card */}
                <div style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 18, padding: '32px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>

                    {/* card header strip */}
                    <div style={{ height: 3, background: `linear-gradient(90deg, ${C.blue}, ${C.blueLight})`, borderRadius: '4px 4px 0 0', margin: '-32px -32px 28px' }} />

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        <Field label="Email Address" icon={FaEnvelope}>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required style={inputSx(false)} onFocus={focusSx} onBlur={blurSx} />
                        </Field>

                        <Field label="Password" icon={FaLock} right={
                            <button type="button" onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 13, padding: 4 }}>
                                {showPw ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        }>
                            <input type={showPw ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required style={inputSx(true)} onFocus={focusSx} onBlur={blurSx} />
                        </Field>

                        {/* remember + forgot */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: C.muted, cursor: 'pointer' }}>
                                <input type="checkbox" style={{ accentColor: C.blueLight, width: 14, height: 14 }} />
                                Remember me
                            </label>
                            <Link to="/forgot-password" style={{ fontSize: 12.5, color: C.blueLight, textDecoration: 'none', fontWeight: 600, transition: 'opacity 0.2s' }}
                                onMouseEnter={e => e.target.style.opacity = '0.75'}
                                onMouseLeave={e => e.target.style.opacity = '1'}
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%', background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`,
                            border: 'none', borderRadius: 10, padding: '13px 0',
                            color: C.white, fontSize: 14, fontWeight: 700,
                            letterSpacing: '0.04em', cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                            fontFamily: "'DM Sans', sans-serif",
                            boxShadow: `0 4px 24px rgba(32,54,113,0.45)`,
                            transition: 'opacity 0.2s', opacity: loading ? 0.75 : 1,
                        }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85'; }}
                            onMouseLeave={e => e.currentTarget.style.opacity = loading ? '0.75' : '1'}
                        >
                            {loading
                                ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: C.white, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                : <>Sign In <FaArrowRight style={{ fontSize: 12 }} /></>
                            }
                        </button>
                    </form>

                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.darkBorder}`, textAlign: 'center' }}>
                        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: C.blueLight, fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.2s' }}
                                onMouseEnter={e => e.target.style.opacity = '0.75'}
                                onMouseLeave={e => e.target.style.opacity = '1'}
                            >Create account</Link>
                        </p>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Login;