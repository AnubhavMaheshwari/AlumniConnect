import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
    FaGraduationCap, FaUser, FaEnvelope, FaLock,
    FaBuilding, FaCalendarAlt, FaArrowRight, FaPhone,
    FaBriefcase, FaEye, FaEyeSlash,
} from 'react-icons/fa';
import useIsMobile from '../hooks/useIsMobile';

if (typeof document !== 'undefined' && !document.getElementById('reg-fonts')) {
    const l = document.createElement('link'); l.id = 'reg-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700;800&display=swap';
    document.head.appendChild(l);
    const s = document.createElement('style');
    s.textContent = `@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`;
    document.head.appendChild(s);
}

const inputSx = (hasRight = false) => ({
    width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)',
    borderRadius: 9, padding: `10px 14px 10px 40px`,
    paddingRight: hasRight ? 40 : 14,
    color: 'var(--text-primary)', fontSize: 13.5, outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
});
const focusSx = e => { e.target.style.borderColor = 'var(--blue-light)'; e.target.style.boxShadow = `0 0 0 3px var(--blue-faint)`; };
const blurSx  = e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

const Field = ({ label, icon: Icon, children, right }) => (
    <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {label}
        </label>
        <div style={{ position: 'relative' }}>
            <Icon style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 12, pointerEvents: 'none', zIndex: 1 }} />
            {children}
            {right && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>{right}</div>}
        </div>
    </div>
);

const SectionLabel = ({ num, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, var(--blue-light), var(--blue))`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 10, fontWeight: 800, color: '#fff' }}>{num}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{children}</span>
    </div>
);

const departments = [
    'Computer Science & Engineering', 'Electrical Engineering', 'Mechanical Engineering',
    'Civil Engineering', 'Electronics & Communication', 'Metallurgical & Materials Engineering',
    'Production & Industrial Engineering', 'Computer Applications', 'Mathematics',
    'Physics', 'Chemistry', 'Humanities & Social Sciences', 'Other',
];

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        graduationYear: '', department: '', phone: '', company: '', yearsOfExperience: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw]   = useState(false);
    const [showCp, setShowCp]   = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
        if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await register({
                name: formData.name, email: formData.email, password: formData.password,
                graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
                department: formData.department, phone: formData.phone,
                company: formData.company,
                yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : 0,
            });
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    const gridCols = isMobile ? '1fr' : '1fr 1fr';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '32px 16px' : '48px 20px', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden', transition: 'background 0.3s, color 0.3s' }}>

            {/* bg */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(32,54,113,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(32,54,113,0.05) 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '10%', right: '15%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, rgba(32,54,113,0.14) 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '8%', left: '12%', width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, rgba(45,72,153,0.1) 0%, transparent 70%)`, pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 540, position: 'relative', zIndex: 1, animation: 'fadeUp 0.6s ease both' }}>

                {/* header */}
                <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 32 }}>
                    <div style={{ width: isMobile ? 56 : 68, height: isMobile ? 56 : 68, borderRadius: 18, background: `linear-gradient(135deg, var(--blue-light), var(--blue-dark))`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: `0 8px 32px rgba(32,54,113,0.5)`, animation: 'float 5s ease-in-out infinite' }}>
                        <FaGraduationCap style={{ color: '#fff', fontSize: isMobile ? 24 : 30 }} />
                    </div>
                    <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 24 : 28, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.4px' }}>Join NIT JSR Alumni</h1>
                    <p style={{ fontSize: isMobile ? 13 : 14, color: 'var(--text-muted)', margin: 0 }}>Create your alumni profile — it's free</p>
                </div>

                {/* card */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 18, padding: isMobile ? '24px' : '32px', boxShadow: '0 24px 64px var(--card-shadow)', transition: 'background 0.3s, border-color 0.3s' }}>
                    <div style={{ height: 3, background: `linear-gradient(90deg, var(--blue), var(--blue-light))`, borderRadius: '4px 4px 0 0', margin: isMobile ? '-24px -24px 26px' : '-32px -32px 30px' }} />

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                        {/* SECTION 1 — Account */}
                        <div>
                            <SectionLabel num="1">Account Info</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 14 }}>
                                <Field label="Full Name" icon={FaUser}>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required style={inputSx()} onFocus={focusSx} onBlur={blurSx} />
                                </Field>
                                <Field label="Email" icon={FaEnvelope}>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required style={inputSx()} onFocus={focusSx} onBlur={blurSx} />
                                </Field>
                                <Field label="Password" icon={FaLock} right={
                                    <button type="button" onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, padding: 4 }}>
                                        {showPw ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                }>
                                    <input type={showPw ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Min. 6 chars" required style={inputSx(true)} onFocus={focusSx} onBlur={blurSx} />
                                </Field>
                                <Field label="Confirm Password" icon={FaLock} right={
                                    <button type="button" onClick={() => setShowCp(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, padding: 4 }}>
                                        {showCp ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                }>
                                    <input type={showCp ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required style={inputSx(true)} onFocus={focusSx} onBlur={blurSx} />
                                </Field>
                            </div>
                        </div>

                        {/* SECTION 2 — Academic */}
                        <div>
                            <SectionLabel num="2">Academic Details</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 14 }}>
                                <Field label="Graduation Year" icon={FaCalendarAlt}>
                                    <input type="number" name="graduationYear" value={formData.graduationYear} onChange={handleChange} placeholder="e.g. 2022" min="1960" max="2030" style={inputSx()} onFocus={focusSx} onBlur={blurSx} />
                                </Field>
                                <Field label="Department" icon={FaBuilding}>
                                    <select name="department" value={formData.department} onChange={handleChange} style={{ ...inputSx(), appearance: 'none', cursor: 'pointer' }} onFocus={focusSx} onBlur={blurSx}>
                                        <option value="" style={{ background: 'var(--bg-secondary)' }}>Select Department</option>
                                        {departments.map(d => <option key={d} value={d} style={{ background: 'var(--bg-secondary)' }}>{d}</option>)}
                                    </select>
                                </Field>
                            </div>
                        </div>

                        {/* SECTION 3 — Professional */}
                        <div>
                            <SectionLabel num="3">Professional Info</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 14 }}>
                                <Field label="Phone" icon={FaPhone}>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" style={inputSx()} onFocus={focusSx} onBlur={blurSx} />
                                </Field>
                                <Field label="Company" icon={FaBriefcase}>
                                    <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Google / Amazon" style={inputSx()} onFocus={focusSx} onBlur={blurSx} />
                                </Field>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <Field label="Years of Experience" icon={FaBriefcase}>
                                        <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} placeholder="e.g. 5" min="0" max="50" style={inputSx()} onFocus={focusSx} onBlur={blurSx} />
                                    </Field>
                                </div>
                            </div>
                        </div>

                        {/* submit */}
                        <button type="submit" disabled={loading} style={{
                            width: '100%', background: `linear-gradient(135deg, var(--blue-light), var(--blue))`,
                            border: 'none', borderRadius: 10, padding: '13px 0',
                            color: '#fff', fontSize: 14, fontWeight: 700,
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
                                ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                : <>Create Account <FaArrowRight style={{ fontSize: 12 }} /></>
                            }
                        </button>
                    </form>

                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: 'var(--blue-light)', fontWeight: 700, textDecoration: 'none' }}
                                onMouseEnter={e => e.target.style.opacity = '0.75'}
                                onMouseLeave={e => e.target.style.opacity = '1'}
                            >Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
