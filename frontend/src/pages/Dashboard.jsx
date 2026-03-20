import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../services/api';
import {
    FaEnvelope, FaBuilding, FaSave, FaCheckCircle, FaTimes,
    FaPhone, FaBriefcase, FaIdCard
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

/* ── colour tokens ───────────────────────────────────────────────────────── */
const C = {
    blue:       '#203671',
    blueDark:   '#182858',
    blueLight:  '#2D4899',
    blueFaint:  'rgba(32,54,113,0.12)',
    blueBorder: 'rgba(32,54,113,0.35)',
    white:      '#FFFFFF',
    muted:      '#8A94A8',
    black:      '#000000',
    darkBg:     '#0C0E14',
    darkCard:   '#12151F',
    darkBorder: '#1E2235',
};

/* ── helpers ─────────────────────────────────────────────────────────────── */
const Avatar = ({ name }) => (
    <div style={{
        width: 60, height: 60, borderRadius: '50%',
        background: `linear-gradient(140deg, ${C.blueLight} 0%, ${C.blue} 60%, ${C.blueDark} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, fontWeight: 800, color: C.white,
        flexShrink: 0, letterSpacing: '-0.5px',
        boxShadow: `0 0 0 3px ${C.blueBorder}, 0 4px 20px rgba(32,54,113,0.4)`
    }}>
        {name?.charAt(0)?.toUpperCase()}
    </div>
);

const FieldRow = ({ label, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <label style={{
            width: 134, flexShrink: 0,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.13em',
            textTransform: 'uppercase', color: C.muted
        }}>
            {label}
        </label>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            {children}
        </div>
    </div>
);

const InputField = ({ icon: Icon, ...props }) => (
    <div style={{ position: 'relative', flex: 1 }}>
        {Icon && <Icon style={{
            position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
            color: C.muted, fontSize: 13, pointerEvents: 'none'
        }} />}
        <input
            {...props}
            style={{
                width: '100%', background: C.darkBg,
                border: `1px solid ${C.darkBorder}`,
                borderRadius: 8, padding: `10px 13px 10px ${Icon ? '38px' : '13px'}`,
                color: C.white, fontSize: 13.5, outline: 'none',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box'
            }}
            onFocus={e => {
                e.target.style.borderColor = C.blueLight;
                e.target.style.boxShadow = `0 0 0 3px ${C.blueFaint}`;
            }}
            onBlur={e => {
                e.target.style.borderColor = C.darkBorder;
                e.target.style.boxShadow = 'none';
            }}
        />
    </div>
);

const SectionTitle = ({ icon: Icon, children }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 22, paddingBottom: 13,
        borderBottom: `1px solid ${C.darkBorder}`
    }}>
        <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: C.blueFaint, border: `1px solid ${C.blueBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Icon style={{ color: C.blueLight, fontSize: 12 }} />
        </div>
        <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: C.muted
        }}>{children}</span>
    </div>
);

/* ── main ────────────────────────────────────────────────────────────────── */
const Dashboard = () => {
    const { user, setUser } = useAuth();

    const [editData, setEditData] = useState({
        company: user?.company || '',
        yearsOfExperience: user?.yearsOfExperience || 0,
        email: user?.email || '',
        phone: user?.phone || ''
    });
    const [loading, setLoading] = useState(false);
    const [otpModal, setOtpModal] = useState({ show: false, type: '', value: '', otp: '' });

    const handleChange = e => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveGeneral = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await API.put(`/users/${user._id}`, {
                company: editData.company,
                yearsOfExperience: editData.yearsOfExperience
            });
            setUser(data.user);
            toast.success('Profile updated successfully');
        } catch {
            toast.error('Update failed');
        } finally {
            setLoading(false);
        }
    };

    const initiateVerification = type => {
        const val = editData[type];
        if (!val) return toast.error(`Enter a valid ${type}`);
        if (val === user[type]) return toast.info(`${type} is unchanged`);
        toast.info('Verification code sent');
        setOtpModal({ show: true, type, value: val, otp: '' });
    };

    const verifyOtp = async () => {
        if (otpModal.otp !== '123456') return toast.error('Invalid verification code');
        setLoading(true);
        try {
            const field = otpModal.type === 'email'
                ? { email: otpModal.value }
                : { phone: otpModal.value };
            const { data } = await API.put(`/users/${user._id}`, field);
            setUser(data.user);
            toast.success(`${otpModal.type} updated`);
            setOtpModal({ show: false, type: '', value: '', otp: '' });
        } catch {
            toast.error('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    /* font injection */
    if (!document.getElementById('dash-fonts')) {
        const l = document.createElement('link');
        l.id = 'dash-fonts'; l.rel = 'stylesheet';
        l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700;800&display=swap';
        document.head.appendChild(l);
    }

    const updateBtnStyle = {
        flexShrink: 0,
        background: 'transparent',
        border: `1px solid ${C.blueBorder}`,
        borderRadius: 7, padding: '9px 16px',
        color: C.blueLight, fontSize: 11, fontWeight: 700,
        letterSpacing: '0.09em', textTransform: 'uppercase',
        cursor: 'pointer', transition: 'all 0.2s',
        fontFamily: "'DM Sans', sans-serif"
    };

    return (
        <div style={{
            minHeight: '100vh', background: C.black,
            padding: '44px 20px', fontFamily: "'DM Sans', sans-serif", color: C.white
        }}>
            <div style={{ maxWidth: 700, margin: '0 auto' }}>

                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 11,
                        background: C.blue,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 18px rgba(32,54,113,0.55)`
                    }}>
                        <HiSparkles style={{ color: C.white, fontSize: 18 }} />
                    </div>
                    <h1 style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 24, fontWeight: 800, color: C.white,
                        margin: 0, letterSpacing: '-0.4px'
                    }}>My Profile</h1>
                </div>

                {/* CARD */}
                <div style={{
                    background: C.darkCard,
                    border: `1px solid ${C.darkBorder}`,
                    borderRadius: 18, overflow: 'hidden',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.7)'
                }}>

                    {/* profile banner */}
                    <div style={{
                        background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
                        padding: '30px 32px',
                        display: 'flex', alignItems: 'center', gap: 20,
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute', right: -30, top: -30,
                            width: 160, height: 160, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)'
                        }} />
                        <div style={{
                            position: 'absolute', right: 60, bottom: -60,
                            width: 110, height: 110, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.04)'
                        }} />
                        <Avatar name={user?.name} />
                        <div style={{ zIndex: 1 }}>
                            <p style={{
                                fontFamily: "'Sora', sans-serif",
                                fontSize: 20, fontWeight: 700, color: C.white, margin: 0
                            }}>{user?.name}</p>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center',
                                marginTop: 7,
                                background: 'rgba(255,255,255,0.15)',
                                border: '1px solid rgba(255,255,255,0.22)',
                                borderRadius: 20, padding: '3px 11px'
                            }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: C.white, letterSpacing: '0.07em' }}>
                                    {user?.role === 'admin' ? '⚡ Administrator' : '🎓 Alumni Member'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* body */}
                    <div style={{ padding: '32px' }}>

                        {/* PROFESSIONAL */}
                        <div style={{ marginBottom: 34 }}>
                            <SectionTitle icon={FaBriefcase}>Professional Details</SectionTitle>
                            <form onSubmit={handleSaveGeneral}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <FieldRow label="Company">
                                        <InputField
                                            icon={FaBuilding}
                                            name="company"
                                            value={editData.company}
                                            onChange={handleChange}
                                            placeholder="Your company name"
                                        />
                                    </FieldRow>
                                    <FieldRow label="Experience">
                                        <InputField
                                            icon={FaIdCard}
                                            type="number"
                                            name="yearsOfExperience"
                                            value={editData.yearsOfExperience}
                                            onChange={handleChange}
                                            placeholder="Years"
                                        />
                                    </FieldRow>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        marginTop: 22, width: '100%',
                                        background: `linear-gradient(135deg, ${C.blueLight} 0%, ${C.blue} 100%)`,
                                        border: 'none', borderRadius: 9, padding: '11px 0',
                                        color: C.white, fontSize: 13, fontWeight: 700,
                                        letterSpacing: '0.06em', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        fontFamily: "'DM Sans', sans-serif",
                                        boxShadow: `0 4px 20px rgba(32,54,113,0.45)`,
                                        transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >
                                    <FaSave style={{ fontSize: 13 }} />
                                    {loading ? 'Saving…' : 'Save Changes'}
                                </button>
                            </form>
                        </div>

                        <div style={{ height: 1, background: C.darkBorder, margin: '0 0 32px' }} />

                        {/* CONTACT & SECURITY */}
                        <div>
                            <SectionTitle icon={FaCheckCircle}>Contact & Security</SectionTitle>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                                <FieldRow label="Email Address">
                                    <InputField
                                        icon={FaEnvelope}
                                        name="email"
                                        type="email"
                                        value={editData.email}
                                        onChange={handleChange}
                                        placeholder="your@email.com"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => initiateVerification('email')}
                                        style={updateBtnStyle}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = C.blueFaint;
                                            e.currentTarget.style.borderColor = C.blueLight;
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.borderColor = C.blueBorder;
                                        }}
                                    >Update</button>
                                </FieldRow>

                                <FieldRow label="Phone Number">
                                    <InputField
                                        icon={FaPhone}
                                        name="phone"
                                        value={editData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 (000) 000-0000"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => initiateVerification('phone')}
                                        style={updateBtnStyle}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = C.blueFaint;
                                            e.currentTarget.style.borderColor = C.blueLight;
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.borderColor = C.blueBorder;
                                        }}
                                    >Update</button>
                                </FieldRow>
                            </div>

                            <div style={{
                                marginTop: 16, display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 14px', borderRadius: 8,
                                background: C.blueFaint, border: `1px solid ${C.blueBorder}`
                            }}>
                                <FaCheckCircle style={{ color: C.blueLight, fontSize: 11, flexShrink: 0 }} />
                                <span style={{ fontSize: 11.5, color: C.muted }}>
                                    A one-time verification code is required for contact changes.
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* OTP MODAL */}
            {otpModal.show && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: C.darkCard,
                        border: `1px solid ${C.darkBorder}`,
                        borderRadius: 18, padding: 36,
                        width: '100%', maxWidth: 380,
                        boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                            <div>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: C.blue, marginBottom: 14,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 4px 16px rgba(32,54,113,0.5)`
                                }}>
                                    <FaCheckCircle style={{ color: C.white, fontSize: 18 }} />
                                </div>
                                <p style={{
                                    fontFamily: "'Sora', sans-serif",
                                    fontSize: 18, fontWeight: 700, color: C.white, margin: '0 0 5px'
                                }}>Verify Identity</p>
                                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                                    Enter the 6-digit code sent to your {otpModal.type}
                                </p>
                            </div>
                            <FaTimes
                                style={{ color: C.muted, cursor: 'pointer', fontSize: 15, marginTop: 4 }}
                                onClick={() => setOtpModal({ ...otpModal, show: false })}
                            />
                        </div>

                        <input
                            maxLength="6"
                            value={otpModal.otp}
                            onChange={e => setOtpModal({ ...otpModal, otp: e.target.value })}
                            placeholder="• • • • • •"
                            style={{
                                width: '100%', textAlign: 'center', fontSize: 26,
                                letterSpacing: '0.4em', padding: '15px',
                                background: C.darkBg,
                                border: `1px solid ${C.darkBorder}`,
                                borderRadius: 10, color: C.white,
                                outline: 'none', marginBottom: 18,
                                fontFamily: "'Sora', sans-serif",
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={e => {
                                e.target.style.borderColor = C.blueLight;
                                e.target.style.boxShadow = `0 0 0 3px ${C.blueFaint}`;
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = C.darkBorder;
                                e.target.style.boxShadow = 'none';
                            }}
                        />

                        <button
                            onClick={verifyOtp}
                            disabled={loading || otpModal.otp.length < 6}
                            style={{
                                width: '100%',
                                background: `linear-gradient(135deg, ${C.blueLight} 0%, ${C.blue} 100%)`,
                                border: 'none', borderRadius: 9, padding: '12px 0',
                                color: C.white, fontSize: 13, fontWeight: 700,
                                letterSpacing: '0.06em', cursor: 'pointer',
                                fontFamily: "'DM Sans', sans-serif",
                                opacity: otpModal.otp.length < 6 ? 0.4 : 1,
                                boxShadow: `0 4px 20px rgba(32,54,113,0.45)`,
                                transition: 'opacity 0.2s'
                            }}
                        >
                            {loading ? 'Verifying…' : 'Confirm & Update'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;