import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaGraduationCap, FaEnvelope, FaLock, FaArrowRight, FaKey, FaChevronLeft, FaCheckCircle } from 'react-icons/fa';
import API from '../services/api';
import useIsMobile from '../hooks/useIsMobile';

const Field = ({ label, icon: Icon, error, children, right }) => (
    <div>
        <label style={{ display: 'block', marginBottom: 7, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {label}
        </label>
        <div style={{ position: 'relative' }}>
            <Icon style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13, pointerEvents: 'none', zIndex: 1 }} />
            {children}
            {right && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>{right}</div>}
        </div>
        {error && <p style={{ marginTop: 6, fontSize: 11, color: 'var(--danger)' }}>{error}</p>}
    </div>
);

const inputSx = (hasRight) => ({
    width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)',
    borderRadius: 9, padding: `11px 14px 11px 40px`,
    paddingRight: hasRight ? 40 : 14,
    color: 'var(--text-primary)', fontSize: 13.5, outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
});
const focusSx = e => { e.target.style.borderColor = 'var(--blue-light)'; e.target.style.boxShadow = `0 0 0 3px var(--blue-faint)`; };
const blurSx  = e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & Password
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        password: '',
        confirmPassword: ''
    });
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!formData.email) return toast.error('Please enter your email');
        setLoading(true);
        try {
            await API.post('/auth/send-forgot-password-otp', { email: formData.email });
            toast.success('OTP sent to your email');
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (formData.otp.length < 6) {
            return toast.error('Please enter a valid OTP');
        }
        setLoading(true);
        try {
            await API.post('/auth/reset-password-otp', {
                email: formData.email,
                otp: formData.otp,
                password: formData.password
            });
            toast.success('Password reset successful! Please login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '32px 16px' : '40px 20px', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden', transition: 'background 0.3s, color 0.3s' }}>
            
            {/* Background elements (matching Login.jsx) */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(32,54,113,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(32,54,113,0.05) 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '15%', left: '20%', width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, rgba(32,54,113,0.15) 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle, rgba(45,72,153,0.12) 0%, transparent 70%)`, pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, animation: 'fadeUp 0.6s ease both' }}>
                
                {/* Logo & Headline */}
                <div style={{ textAlign: 'center', marginBottom: isMobile ? 28 : 36 }}>
                    <div style={{ width: isMobile ? 56 : 68, height: isMobile ? 56 : 68, borderRadius: 18, background: `linear-gradient(135deg, var(--blue-light), var(--blue-dark))`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 8px 32px rgba(32,54,113,0.5)` }}>
                        <FaGraduationCap style={{ color: '#fff', fontSize: isMobile ? 24 : 30 }} />
                    </div>
                    <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 24 : 28, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.4px' }}>
                        {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                    </h1>
                    <p style={{ fontSize: isMobile ? 13 : 14, color: 'var(--text-muted)', margin: 0 }}>
                        {step === 1 ? 'Enter your email to receive a reset code' : 'Enter the OTP and your new password'}
                    </p>
                </div>

                {/* Main Card */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 18, padding: isMobile ? '24px' : '32px', boxShadow: '0 24px 64px var(--card-shadow)', transition: 'background 0.3s, border-color 0.3s' }}>
                    
                    <div style={{ height: 3, background: `linear-gradient(90deg, var(--blue), var(--blue-light))`, borderRadius: '4px 4px 0 0', margin: isMobile ? '-24px -24px 24px' : '-32px -32px 28px' }} />

                    {step === 1 ? (
                        <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <Field label="Email Address" icon={FaEnvelope}>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required style={inputSx(false)} onFocus={focusSx} onBlur={blurSx} />
                            </Field>

                            <button type="submit" disabled={loading} style={{
                                width: '100%', background: `linear-gradient(135deg, var(--blue-light), var(--blue))`,
                                border: 'none', borderRadius: 10, padding: '13px 0',
                                color: '#fff', fontSize: 14, fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                                fontFamily: "'DM Sans', sans-serif",
                                boxShadow: `0 4px 24px rgba(32,54,113,0.45)`,
                                transition: 'opacity 0.2s', opacity: loading ? 0.75 : 1,
                            }}>
                                {loading ? <div className="spinner" /> : <>Send Reset Code <FaArrowRight style={{ fontSize: 12 }} /></>}
                            </button>

                            <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, marginTop: 4 }}>
                                <FaChevronLeft style={{ fontSize: 10 }} /> Back to Login
                            </Link>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <Field label="Verification Code (OTP)" icon={FaKey}>
                                <input type="text" name="otp" value={formData.otp} onChange={handleChange} placeholder="Enter 6-digit code" required maxLength="6" style={inputSx(false)} onFocus={focusSx} onBlur={blurSx} />
                            </Field>

                            <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

                            <Field label="New Password" icon={FaLock}>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required style={inputSx(false)} onFocus={focusSx} onBlur={blurSx} />
                            </Field>

                            <Field label="Confirm New Password" icon={FaCheckCircle}>
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required style={inputSx(false)} onFocus={focusSx} onBlur={blurSx} />
                            </Field>

                            <button type="submit" disabled={loading} style={{
                                width: '100%', background: `linear-gradient(135deg, var(--blue-light), var(--blue))`,
                                border: 'none', borderRadius: 10, padding: '13px 0',
                                color: '#fff', fontSize: 14, fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                                fontFamily: "'DM Sans', sans-serif",
                                boxShadow: `0 4px 24px rgba(32,54,113,0.45)`,
                                transition: 'opacity 0.2s', opacity: loading ? 0.75 : 1,
                            }}>
                                {loading ? <div className="spinner" /> : <>Reset Password <FaArrowRight style={{ fontSize: 12 }} /></>}
                            </button>

                            <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}>
                                Change Email
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ForgotPassword;
