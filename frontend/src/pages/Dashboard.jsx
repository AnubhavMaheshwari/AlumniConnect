import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../services/api';
import {
    FaEnvelope, FaBuilding, FaSave, FaCheckCircle, FaTimes,
    FaPhone, FaBriefcase, FaIdCard, FaCamera
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { countries } from '../utils/countries';
import PhotoUploadModal from '../components/PhotoUploadModal';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const Avatar = ({ name, imageUrl, onCameraClick, onImageClick }) => (
    <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0 }}>
        <div 
            onClick={onImageClick}
            style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: imageUrl ? `url(${imageUrl}) center/cover no-repeat` : `linear-gradient(140deg, var(--blue-light) 0%, var(--blue) 60%, var(--blue-dark) 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 800, color: '#fff',
                letterSpacing: '-0.5px',
                boxShadow: `0 0 0 3px var(--blue-border), 0 4px 20px rgba(32,54,113,0.4)`,
                overflow: 'hidden',
                cursor: imageUrl ? 'zoom-in' : 'default'
            }}
        >
            {!imageUrl && name?.charAt(0)?.toUpperCase()}
        </div>
        {onCameraClick && (
            <button 
                type="button"
                onClick={onCameraClick}
                style={{
                    position: 'absolute', right: -4, bottom: -4,
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--blue)', border: '2px solid var(--bg-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff', padding: 0,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    zIndex: 2, transition: 'all 0.2s',
                    outline: 'none'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'var(--blue-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--blue)'; }}
                title="Update Profile Picture"
            >
                <FaCamera style={{ fontSize: 10 }} />
            </button>
        )}
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
        location: user?.location || '',
        country: user?.country || '',
        zipCode: user?.zipCode || '',
        email: user?.email || '',
        phone: user?.phone?.replace(/^\+\d+\s?/, '') || '',
        countryCode: countries.find(c => c.name === user?.country)?.code || '+91'
    });
    const [loading, setLoading] = useState(false);
    const [otpModal, setOtpModal] = useState({ show: false, type: '', value: '', otp: '' });
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const handleUploadSuccess = (imageUrl) => {
        const updatedUser = { ...user, profileImage: imageUrl };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile photo updated successfully');
    };

    const handleChange = e => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const val = value.replace(/\D/g, '').slice(0, 10);
            setEditData(prev => ({ ...prev, [name]: val }));
        } else {
            setEditData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveGeneral = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await API.put(`/users/${user._id}`, {
                company: editData.company,
                yearsOfExperience: editData.yearsOfExperience,
                location: editData.location,
                country: editData.country,
                zipCode: editData.zipCode
            });
            setUser(data.user);
            toast.success('Profile updated successfully');
        } catch {
            toast.error('Update failed');
        } finally {
            setLoading(false);
        }
    };

    const initiateVerification = async type => {
        const val = editData[type];
        if (!val) return toast.error(`Enter a valid ${type}`);
        
        let fullVal = val;
        if (type === 'phone') {
            if (val.length < 10) return toast.error('Enter a valid 10-digit number');
            fullVal = `${editData.countryCode || '+91'}${val}`;
        }

        if (fullVal === user[type]) return toast.info(`${type} is unchanged`);
        
        setLoading(true);
        try {
            if (type === 'email') {
                await API.post('/auth/send-email-otp', { email: fullVal });
                toast.success('Verification code sent to email');
                setOtpModal({ show: true, type, value: fullVal, otp: '' });
            } else {
                // Phone Verification
                if (!window.recaptchaVerifier) {
                    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-dash', {
                        'size': 'invisible'
                    });
                }
                const appVerifier = window.recaptchaVerifier;
                const confirmation = await signInWithPhoneNumber(auth, fullVal, appVerifier);
                setOtpModal({ show: true, type, value: fullVal, otp: '', confirmationResult: confirmation });
                toast.success('Verification code sent to phone');
            }
        } catch (err) {
            toast.error(err.message || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        setLoading(true);
        try {
            if (otpModal.type === 'email') {
                await API.post('/auth/verify-email-otp', { email: otpModal.value, otp: otpModal.otp });
                const { data } = await API.put(`/users/${user._id}`, { email: otpModal.value });
                setUser(data.user);
                toast.success('Email updated');
            } else {
                const result = await otpModal.confirmationResult.confirm(otpModal.otp);
                const idToken = await result.user.getIdToken();
                const { data } = await API.post('/auth/verify-phone-otp', { idToken, phone: otpModal.value });
                setUser(data.user);
                toast.success('Phone updated');
            }
            setOtpModal({ show: false, type: '', value: '', otp: '' });
        } catch (err) {
            toast.error(err.message || 'Verification failed');
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
                        <Avatar 
                            name={user?.name} 
                            imageUrl={user?.profileImage} 
                            onCameraClick={() => setIsPhotoModalOpen(true)}
                            onImageClick={() => { if (user?.profileImage) setPreviewImage(user?.profileImage); }}
                        />
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
                                    <FieldRow label="Location">
                                        <InputField
                                            icon={FaBuilding}
                                            name="location"
                                            value={editData.location}
                                            onChange={handleChange}
                                            placeholder="City, State"
                                        />
                                    </FieldRow>
                                    <FieldRow label="Country">
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <FaBuilding style={{
                                                position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                                                color: 'var(--text-muted)', fontSize: 13, pointerEvents: 'none', zIndex: 1
                                            }} />
                                            <select
                                                name="country"
                                                value={editData.country}
                                                onChange={handleChange}
                                                style={{
                                                    width: '100%', background: 'var(--input-bg)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 8, padding: '10px 13px 10px 38px',
                                                    color: 'var(--text-primary)', fontSize: 13.5, outline: 'none',
                                                    fontFamily: "'DM Sans', sans-serif", appearance: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="">Select Country</option>
                                                {countries.map(c => <option key={c.name} value={c.name} style={{ background: 'var(--bg-secondary)' }}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </FieldRow>
                                    <FieldRow label="Zip / Postal Code">
                                        <InputField
                                            icon={FaBuilding}
                                            name="zipCode"
                                            value={editData.zipCode}
                                            onChange={handleChange}
                                            placeholder="e.g. 10001"
                                        />
                                    </FieldRow>
                                </div>

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
                                    <div style={{ display: 'flex', gap: 0, flex: 1 }}>
                                        <select
                                            name="countryCode"
                                            value={editData.countryCode}
                                            onChange={handleChange}
                                            style={{
                                                background: 'var(--input-bg)', border: '1px solid var(--border)', 
                                                borderRight: 'none', borderRadius: '8px 0 0 8px', padding: '10px 0', 
                                                color: 'var(--text-muted)', fontSize: 12.5, width: 48, textAlign: 'center',
                                                outline: 'none', cursor: 'pointer', appearance: 'none',
                                                fontFamily: "'DM Sans', sans-serif", fontWeight: 600
                                            }}
                                        >
                                            {countries.map(c => (
                                                <option key={c.name + c.code} value={c.code} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                                                    {c.code} ({c.name})
                                                </option>
                                            ))}
                                        </select>
                                        <InputField
                                            icon={FaPhone}
                                            name="phone"
                                            value={editData.phone}
                                            onChange={handleChange}
                                            placeholder="9876543210"
                                            style={{ borderRadius: '0 8px 8px 0' }}
                                            maxLength="10"
                                        />
                                    </div>
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
                            <div id="recaptcha-container-dash"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSaveGeneral}
                            disabled={loading}
                            style={{
                                marginTop: 10, width: '100%',
                                background: `linear-gradient(135deg, var(--blue-light) 0%, var(--blue) 100%)`,
                                border: 'none', borderRadius: 9, padding: '12px 0',
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
                                color: '#FFFFFF', fontSize: 13, fontWeight: 700,
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

            <PhotoUploadModal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                userId={user?._id}
                onUploadSuccess={handleUploadSuccess}
            />

            {/* ════════════════ IMAGE PREVIEW ════════════════ */}
            {previewImage && (
                <div onClick={() => setPreviewImage(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 40, cursor: 'zoom-out' }}>
                    <img src={previewImage} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, boxShadow: '0 40px 100px rgba(0,0,0,0.8)', animation: 'fadeUp 0.3s ease' }} />
                    <FaTimes style={{ position: 'absolute', top: 30, right: 30, color: '#fff', fontSize: 28, cursor: 'pointer', opacity: 0.7 }} onClick={() => setPreviewImage(null)} />
                </div>
            )}
        </div>
    );
};

export default Dashboard;