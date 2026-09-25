import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaGraduationCap, FaUser, FaEnvelope, FaLock, FaBuilding, FaCalendarAlt, FaArrowRight, FaPhone, FaBriefcase, FaEye, FaEyeSlash, FaCheckCircle, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';
import useIsMobile from '../hooks/useIsMobile';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import API from '../services/api';
import { countries } from '../utils/countries';

const C = {
    blue: 'var(--blue)', blueDark: 'var(--blue-dark)', blueLight: 'var(--blue-light)',
    blueFaint: 'var(--blue-faint)', blueBorder: 'var(--blue-border)',
    text: 'var(--text-primary)', muted: 'var(--text-secondary)', white: '#FFFFFF',
    black: 'var(--bg)', darkBg: 'var(--bg)', darkCard: 'var(--card-bg)', darkBorder: 'var(--border)',
};

if (typeof document !== 'undefined' && !document.getElementById('reg-fonts')) {
    const l = document.createElement('link'); l.id = 'reg-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700;800&display=swap';
    document.head.appendChild(l);
    const s = document.createElement('style');
    s.textContent = `
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    `;
    document.head.appendChild(s);
}

const inputSx = (hasRight = false) => ({
    width: '100%', background: C.darkBg, border: `1px solid ${C.darkBorder}`,
    borderRadius: 9, padding: `10px 14px 10px 40px`,
    paddingRight: hasRight ? 72 : 14,
    color: C.text, fontSize: 13.5, outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
});
const focusSx = e => { e.target.style.borderColor = C.blueLight; e.target.style.boxShadow = `0 0 0 3px ${C.blueFaint}`; };
const blurSx  = e => { e.target.style.borderColor = C.darkBorder; e.target.style.boxShadow = 'none'; };

const Field = ({ label, icon: Icon, children, right }) => (
    <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>
            {label}
        </label>
        <div style={{ position: 'relative' }}>
            {Icon && <Icon style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: 12, pointerEvents: 'none', zIndex: 1 }} />}
            {children}
            {right && <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>{right}</div>}
        </div>
    </div>
);

const OtpRow = ({ value, onChange, onVerify, placeholder }) => (
    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
        <input
            type="text" placeholder={placeholder} value={value} onChange={onChange}
            style={{ ...inputSx(), paddingLeft: 14, flex: 1 }}
            onFocus={focusSx} onBlur={blurSx}
        />
        <button type="button" onClick={onVerify} style={{
            background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`,
            color: C.white, border: 'none', borderRadius: 8, padding: '0 18px',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            fontFamily: "'DM Sans', sans-serif", boxShadow: `0 2px 10px rgba(32,54,113,0.4)`,
        }}>Verify</button>
    </div>
);

const SectionLabel = ({ num, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${C.darkBorder}` }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 10, fontWeight: 800, color: C.white }}>{num}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: C.muted }}>{children}</span>
    </div>
);

const VerifyBtn = ({ onClick, sent, verified }) => (
    <button type="button" onClick={onClick} style={{
        background: 'none', border: 'none',
        color: C.blueLight, fontSize: 10, fontWeight: 800,
        cursor: 'pointer', letterSpacing: '0.06em', padding: '2px 4px',
        fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
    }}>
        {sent ? 'RESEND' : 'VERIFY'}
    </button>
);

const departments = [
    'Computer Science & Engineering', 'Electrical Engineering', 'Mechanical Engineering',
    'Civil Engineering', 'Electronics & Communication', 'Metallurgical & Materials Engineering',
    'Production & Industrial Engineering', 'Computer Applications', 'Mathematics',
    'Physics', 'Chemistry', 'Humanities & Social Sciences', 'Other',
];

const Register = () => {
    const { isDark } = useTheme();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        graduationYear: '', department: '', phone: '', company: '',
        yearsOfExperience: '', location: '', country: 'India', zipCode: '',
        countryCode: '+91'
    });
    const [locationLoading, setLocationLoading] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [showPw, setShowPw]     = useState(false);
    const [showCp, setShowCp]     = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [isEmailSent, setIsEmailSent]       = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [phoneOtp, setPhoneOtp]             = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);

    const navigate = useNavigate();
    const isMobile = useIsMobile();

    const handleChange = e => {
        const { name, value } = e.target;
        if (name === 'country') {
            const country = countries.find(c => c.name === value);
            setFormData(prev => ({ ...prev, country: value, countryCode: country ? country.code : '', phone: '' }));
        } else if (name === 'phone') {
            // Only allow digits and max 10
            const val = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: val }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) return toast.error("Geolocation not supported");
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async ({ coords: { latitude, longitude } }) => {
                try {
                    const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    setFormData(prev => ({ ...prev, location: data.display_name || `${latitude}, ${longitude}` }));
                    toast.success("Location updated");
                } catch {
                    setFormData(prev => ({ ...prev, location: `${latitude}, ${longitude}` }));
                } finally { setLocationLoading(false); }
            },
            () => { toast.error("Unable to retrieve location"); setLocationLoading(false); }
        );
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
        if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        if (!formData.email.endsWith('@nitjsr.ac.in')) { toast.error('Only @nitjsr.ac.in email addresses are allowed'); return; }
        if (!isEmailVerified) { toast.error('Please verify your email first'); return; }
        // if (!isPhoneVerified) { toast.error('Please verify your phone number first'); return; }
        setLoading(true);
        try {
            const fullPhone = `${formData.countryCode}${formData.phone}`;
            await register({
                name: formData.name, email: formData.email, password: formData.password,
                graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
                department: formData.department, phone: formData.phone ? fullPhone : undefined,
                company: formData.company, location: formData.location,
                country: formData.country, zipCode: formData.zipCode,
                yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : 0,
            });
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    const sendEmailOTP = async () => {
        if (!formData.email) return toast.error('Enter email first');
        if (!formData.email.endsWith('@nitjsr.ac.in')) return toast.error('OTPs can only be sent to @nitjsr.ac.in addresses');
        try {
            await API.post('/auth/send-email-otp', { email: formData.email });
            setIsEmailSent(true);
            toast.success('OTP sent to email');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to send OTP'); }
    };

    const verifyEmailOTP = async () => {
        try {
            await API.post('/auth/verify-email-otp', { email: formData.email, otp: emailOtp });
            setIsEmailVerified(true);
            toast.success('Email verified!');
        } catch (err) { toast.error(err.response?.data?.message || 'Invalid OTP'); }
    };

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
        }
    };

    const sendPhoneOTP = async () => {
        if (!formData.phone) return toast.error('Enter phone number first');
        if (formData.phone.length < 10) return toast.error('Enter a valid 10-digit number');
        const fullPhone = `${formData.countryCode}${formData.phone}`;
        try {
            // Check if phone already exists
            await API.post('/auth/check-phone', { phone: fullPhone });
            
            setupRecaptcha();
            const confirmation = await signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier);
            setConfirmationResult(confirmation);
            toast.success('SMS OTP sent');
        } catch (err) { 
            toast.error(err.response?.data?.message || err.message || 'Failed to send SMS OTP'); 
        }
    };

    const verifyPhoneOTP = async () => {
        const fullPhone = `${formData.countryCode}${formData.phone}`;
        try {
            const result  = await confirmationResult.confirm(phoneOtp);
            const idToken = await result.user.getIdToken();
            await API.post('/auth/verify-phone-otp', { idToken, phone: fullPhone });
            setIsPhoneVerified(true);
            toast.success('Phone verified!');
        } catch (err) { toast.error(err.message || 'Invalid SMS OTP'); }
    };

    const col2 = isMobile ? '1fr' : '1fr 1fr';
    const pad  = isMobile ? '24px' : '32px';

    return (
        <div style={{
            minHeight: '100vh', background: C.black,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: isMobile ? '32px 16px' : '48px 20px',
            fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden',
        }}>
            {/* background decorations */}
            <div style={{ 
                position: 'absolute', inset: 0, 
                backgroundImage: `linear-gradient(${isDark ? 'rgba(32,54,113,0.05)' : 'rgba(32,54,113,0.03)'} 1px, transparent 1px), 
                                 linear-gradient(90deg, ${isDark ? 'rgba(32,54,113,0.05)' : 'rgba(32,54,113,0.03)'} 1px, transparent 1px)`, 
                backgroundSize: '60px 60px', pointerEvents: 'none' 
            }} />
            <div style={{ position: 'absolute', top: '10%', right: '15%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${isDark ? 'rgba(32,54,113,0.14)' : 'rgba(32,54,113,0.08)'} 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '8%', left: '12%', width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${isDark ? 'rgba(45,72,153,0.1)' : 'rgba(45,72,153,0.05)'} 0%, transparent 70%)`, pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 1, animation: 'fadeUp 0.6s ease both' }}>

                {/* header */}
                <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 32 }}>
                    <div style={{ width: isMobile ? 56 : 68, height: isMobile ? 56 : 68, borderRadius: 18, background: `linear-gradient(135deg, ${C.blueLight}, ${C.blueDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: `0 8px 32px rgba(32,54,113,0.5)`, animation: 'float 5s ease-in-out infinite' }}>
                        <FaGraduationCap style={{ color: '#FFFFFF', fontSize: isMobile ? 24 : 30 }} />
                    </div>
                    <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 24 : 28, fontWeight: 800, color: C.text, margin: '0 0 8px', letterSpacing: '-0.4px' }}>
                        Join Campus Connect
                    </h1>
                    <p style={{ fontSize: isMobile ? 13 : 14, color: C.muted, margin: 0 }}>Create your student profile — it's free</p>
                </div>

                {/* card */}
                <div style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 18, padding: pad, boxShadow: 'var(--card-shadow)' }}>
                    <div style={{ height: 3, background: `linear-gradient(90deg, ${C.blue}, ${C.blueLight})`, borderRadius: '4px 4px 0 0', margin: isMobile ? '-24px -24px 26px' : '-32px -32px 30px' }} />

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                        {/* ── SECTION 1: Account Info ── */}
                        <div>
                            <SectionLabel num="1">Account Info</SectionLabel>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                                {/* Row 1: Name only */}
                                <Field label="Full Name" icon={FaUser}>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                                        placeholder="John Doe" required
                                        style={inputSx()} onFocus={focusSx} onBlur={blurSx} />
                                </Field>

                                {/* Row 2: Email — full width, on its own line */}
                                <Field label="Email Address" icon={FaEnvelope} right={
                                    isEmailVerified
                                        ? <FaCheckCircle style={{ color: '#10B981', fontSize: 14 }} />
                                        : <VerifyBtn onClick={sendEmailOTP} sent={isEmailSent} />
                                }>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                                        placeholder="you@example.com" required disabled={isEmailVerified}
                                        style={inputSx(true)} onFocus={focusSx} onBlur={blurSx} />
                                </Field>

                                {/* Email OTP row */}
                                {isEmailSent && !isEmailVerified && (
                                    <OtpRow
                                        value={emailOtp}
                                        onChange={e => setEmailOtp(e.target.value)}
                                        onVerify={verifyEmailOTP}
                                        placeholder="Enter email OTP"
                                    />
                                )}

                                {/* Row 3: Password + Confirm side by side (or stacked on mobile) */}
                                <div style={{ display: 'grid', gridTemplateColumns: col2, gap: 14 }}>
                                    <Field label="Password" icon={FaLock} right={
                                        <button type="button" onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 13, padding: 4 }}>
                                            {showPw ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    }>
                                        <input type={showPw ? 'text' : 'password'} name="password" value={formData.password}
                                            onChange={handleChange} placeholder="Min. 6 chars" required
                                            style={inputSx(true)} onFocus={focusSx} onBlur={blurSx} />
                                    </Field>
                                    <Field label="Confirm Password" icon={FaLock} right={
                                        <button type="button" onClick={() => setShowCp(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 13, padding: 4 }}>
                                            {showCp ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    }>
                                        <input type={showCp ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword}
                                            onChange={handleChange} placeholder="••••••••" required
                                            style={inputSx(true)} onFocus={focusSx} onBlur={blurSx} />
                                    </Field>
                                </div>
                            </div>
                        </div>

                        {/* ── SECTION 2: Academic Details ── */}
                        <div>
                            <SectionLabel num="2">Academic Details</SectionLabel>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                                {/* Grad year + Department */}
                                <div style={{ display: 'grid', gridTemplateColumns: col2, gap: 14 }}>
                                    <Field label="Expected Graduation Year" icon={FaCalendarAlt}>
                                        <input type="number" name="graduationYear" value={formData.graduationYear}
                                            onChange={handleChange} placeholder="e.g. 2022" min="1960" max="2030"
                                            style={inputSx()} onFocus={focusSx} onBlur={blurSx} />
                                    </Field>
                                    <Field label="Department" icon={FaBuilding}>
                                        <select name="department" value={formData.department} onChange={handleChange}
                                            style={{ ...inputSx(), appearance: 'none', cursor: 'pointer' }}
                                            onFocus={focusSx} onBlur={blurSx}>
                                            <option value="" style={{ background: C.darkBg }}>Select Department</option>
                                            {departments.map(d => <option key={d} value={d} style={{ background: C.darkBg }}>{d}</option>)}
                                        </select>
                                    </Field>
                                </div>
                            </div>
                        </div>

                        {/* ── SECTION 3: Professional Info ── */}
                        <div>
                            <SectionLabel num="3">Professional Info</SectionLabel>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                                {/* Country + Phone */}
                                <div style={{ display: 'grid', gridTemplateColumns: col2, gap: 14 }}>
                                    <Field label="Country" icon={FaMapMarkerAlt}>
                                        <select name="country" value={formData.country} onChange={handleChange}
                                            style={{ ...inputSx(), appearance: 'none', cursor: 'pointer' }}
                                            onFocus={focusSx} onBlur={blurSx}>
                                            <option value="" style={{ background: C.darkBg }}>Select Country</option>
                                            {countries.map(c => <option key={c.name} value={c.name} style={{ background: C.darkBg }}>{c.name} ({c.code})</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Phone" right={
                                        isPhoneVerified
                                            ? <FaCheckCircle style={{ color: '#10B981', fontSize: 14 }} />
                                            : <VerifyBtn onClick={sendPhoneOTP} sent={!!confirmationResult} />
                                    }>
                                        <div style={{ display: 'flex', gap: 0 }}>
                                            <div style={{ 
                                                background: 'var(--bg-secondary)', border: `1px solid ${C.darkBorder}`, 
                                                borderRight: 'none', borderRadius: '9px 0 0 9px', padding: '10px 8px 10px 32px', 
                                                color: C.muted, fontSize: 13.5, minWidth: 45, textAlign: 'center', position: 'relative'
                                            }}>
                                                <FaPhone style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: 12 }} />
                                                {formData.countryCode}
                                            </div>
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                                placeholder="9876543210 (Optional)" disabled={isPhoneVerified}
                                                style={{ ...inputSx(true), borderRadius: '0 9px 9px 0', paddingLeft: 10 }} 
                                                onFocus={focusSx} onBlur={blurSx} maxLength="10" />
                                        </div>
                                    </Field>
                                </div>

                                {/* Phone OTP row */}
                                {confirmationResult && !isPhoneVerified && (
                                    <OtpRow
                                        value={phoneOtp}
                                        onChange={e => setPhoneOtp(e.target.value)}
                                        onVerify={verifyPhoneOTP}
                                        placeholder="Enter SMS OTP"
                                    />
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: col2, gap: 14 }}>
                                    <Field label="Years of Experience" icon={FaBriefcase}>
                                        <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience}
                                            onChange={handleChange} placeholder="e.g. 5" min="0" max="50"
                                            style={inputSx()} onFocus={focusSx} onBlur={blurSx} />
                                    </Field>
                                    <Field label="Zip / Postal Code" icon={FaMapMarkerAlt}>
                                        <input type="text" name="zipCode" value={formData.zipCode}
                                            onChange={handleChange} placeholder="e.g. 10001" required
                                            style={inputSx()} onFocus={focusSx} onBlur={blurSx} />
                                    </Field>
                                </div>

                                <div id="recaptcha-container" />
                            </div>
                        </div>

                        {/* submit */}
                        <button type="submit" disabled={loading} style={{
                            width: '100%', background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`,
                            border: 'none', borderRadius: 10, padding: '14px 0',
                            color: '#FFFFFF', fontSize: 14, fontWeight: 700,
                            letterSpacing: '0.04em', cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                            fontFamily: "'DM Sans', sans-serif",
                            boxShadow: `0 4px 24px rgba(32,54,113,0.4)`,
                            transition: 'opacity 0.2s', opacity: loading ? 0.75 : 1,
                            marginTop: 10
                        }}
                            onMouseEnter={e => { if(!loading) e.currentTarget.style.opacity = '0.85'; }}
                            onMouseLeave={e => e.currentTarget.style.opacity = loading? '0.75' : '1'}
                        >
                            {loading
                                ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                : <>Create Account <FaArrowRight style={{ fontSize: 12 }} /></>
                            }
                        </button>
                    </form>

                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.darkBorder}`, textAlign: 'center' }}>
                        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: C.blueLight, fontWeight: 700, textDecoration: 'none' }}
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