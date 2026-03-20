import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../services/api';
import {
    FaEnvelope, FaBuilding, FaSave, FaCheckCircle, FaTimes,
    FaPhone, FaBriefcase, FaIdCard
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const Avatar = ({ name }) => (
    <div style={{
        width: 60, height: 60, borderRadius: '50%',
        background: `linear-gradient(140deg, var(--blue-light) 0%, var(--blue) 60%, var(--blue-dark) 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, fontWeight: 800, color: '#fff',
        flexShrink: 0, letterSpacing: '-0.5px',
        boxShadow: `0 0 0 3px var(--blue-border), 0 4px 20px rgba(32,54,113,0.4)`
    }}>
        {name?.charAt(0)?.toUpperCase()}
    </div>
);

const FieldRow = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.13em',
            textTransform: 'uppercase', color: 'var(--text-secondary)'
        }}>
            {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {children}
        </div>
    </div>
);

const InputField = ({ icon: Icon, ...props }) => (
    <div style={{ position: 'relative', flex: 1 }}>
        {Icon && <Icon style={{
            position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', fontSize: 13, pointerEvents: 'none'
        }} />}
        <input
            {...props}
            style={{
                width: '100%', background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                borderRadius: 8, padding: `10px 13px 10px ${Icon ? '38px' : '13px'}`,
                color: 'var(--text-primary)', fontSize: 13.5, outline: 'none',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box'
            }}
            onFocus={e => {
                e.target.style.borderColor = 'var(--blue-light)';
                e.target.style.boxShadow = `0 0 0 3px var(--blue-faint)`;
            }}
            onBlur={e => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
            }}
        />
    </div>
);

const SectionTitle = ({ icon: Icon, children }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 22, paddingBottom: 13,
        borderBottom: '1px solid var(--border)'
    }}>
        <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'var(--blue-faint)', border: '1px solid var(--blue-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Icon style={{ color: 'var(--blue-light)', fontSize: 12 }} />
        </div>
        <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--text-secondary)'
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
        border: '1px solid var(--blue-border)',
        borderRadius: 7, padding: '9px 16px',
        color: 'var(--blue-light)', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.09em', textTransform: 'uppercase',
        cursor: 'pointer', transition: 'all 0.2s',
        fontFamily: "'DM Sans', sans-serif"
    };

    const activities = [
        { id: 1, text: 'Updated profile information', time: '2 hours ago' },
        { id: 2, text: 'Changed contact email', time: '1 day ago' },
        { id: 3, text: 'Verified phone number', time: '3 days ago' },
    ];

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg)',
            padding: '44px 20px', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)',
            transition: 'background 0.3s, color 0.3s'
        }}>
            <div style={{ maxWidth: 700, margin: '0 auto' }}>

                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 11,
                        background: 'var(--blue)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 18px rgba(32,54,113,0.55)`
                    }}>
                        <HiSparkles style={{ color: '#fff', fontSize: 18 }} />
                    </div>
                    <h1 style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 24, fontWeight: 800, color: 'var(--text-primary)',
                        margin: 0, letterSpacing: '-0.4px'
                    }}>My Profile</h1>
                </div>

                {/* CARD */}
                <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 18, overflow: 'hidden',
                    boxShadow: '0 32px 80px var(--card-shadow)',
                    transition: 'background 0.3s, border-color 0.3s'
                }}>

                    {/* profile banner */}
                    <div style={{
                        background: `linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%)`,
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
                                fontSize: 20, fontWeight: 700, color: '#fff', margin: 0
                            }}>{user?.name}</p>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center',
                                marginTop: 7,
                                background: 'rgba(255,255,255,0.15)',
                                border: '1px solid rgba(255,255,255,0.22)',
                                borderRadius: 20, padding: '3px 11px'
                            }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', letterSpacing: '0.07em' }}>
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
                                        background: `linear-gradient(135deg, var(--blue-light) 0%, var(--blue) 100%)`,
                                        border: 'none', borderRadius: 9, padding: '11px 0',
                                        color: '#fff', fontSize: 13, fontWeight: 700,
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

                        <div style={{ height: 1, background: 'var(--border)', margin: '0 0 32px' }} />

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
                                            e.currentTarget.style.background = 'var(--blue-faint)';
                                            e.currentTarget.style.borderColor = 'var(--blue-light)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.borderColor = 'var(--blue-border)';
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
                                            e.currentTarget.style.background = 'var(--blue-faint)';
                                            e.currentTarget.style.borderColor = 'var(--blue-light)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.borderColor = 'var(--blue-border)';
                                        }}
                                    >Update</button>
                                </FieldRow>
                            </div>

                            <div style={{
                                marginTop: 16, display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 14px', borderRadius: 8,
                                background: 'var(--blue-faint)', border: '1px solid var(--blue-border)'
                            }}>
                                <FaCheckCircle style={{ color: 'var(--blue-light)', fontSize: 11, flexShrink: 0 }} />
                                <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                                    A one-time verification code is required for contact changes.
                                </span>
                            </div>
                        </div>

                        <div style={{ height: 1, background: 'var(--border)', margin: '32px 0' }} />

                        {/* RECENT ACTIVITY */}
                        <div>
                            <SectionTitle icon={HiSparkles}>Recent Activity</SectionTitle>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {activities.map((act, i) => (
                                    <div key={act.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: '14px 16px', borderRadius: 12,
                                        background: 'var(--bg)', border: '1px solid var(--border)',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(5px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                                    >
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: i === 0 ? 'var(--blue-light)' : 'var(--border)'
                                        }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 2px' }}>{act.text}</p>
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{act.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* OTP MODAL */}
            {otpModal.show && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: 20
                }}>
                    <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 18, padding: 32,
                        width: '100%', maxWidth: 380,
                        boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                            <div>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: 'var(--blue)', marginBottom: 14,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 4px 16px rgba(32,54,113,0.5)`
                                }}>
                                    <FaCheckCircle style={{ color: '#fff', fontSize: 18 }} />
                                </div>
                                <p style={{
                                    fontFamily: "'Sora', sans-serif",
                                    fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 5px'
                                }}>Verify Identity</p>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                                    Enter the 6-digit code sent to your {otpModal.type}
                                </p>
                            </div>
                            <FaTimes
                                style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: 15, marginTop: 4 }}
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
                                background: 'var(--input-bg)',
                                border: '1px solid var(--border)',
                                borderRadius: 10, color: 'var(--text-primary)',
                                outline: 'none', marginBottom: 18,
                                fontFamily: "'Sora', sans-serif",
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={e => {
                                e.target.style.borderColor = 'var(--blue-light)';
                                e.target.style.boxShadow = `0 0 0 3px var(--blue-faint)`;
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = 'var(--border)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />

                        <button
                            onClick={verifyOtp}
                            disabled={loading || otpModal.otp.length < 6}
                            style={{
                                width: '100%',
                                background: `linear-gradient(135deg, var(--blue-light) 0%, var(--blue) 100%)`,
                                border: 'none', borderRadius: 9, padding: '12px 0',
                                color: '#fff', fontSize: 13, fontWeight: 700,
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