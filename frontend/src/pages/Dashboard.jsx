import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../services/api';
import {
  LuUser,
  LuMail,
  LuPhone,
  LuBuilding,
  LuBriefcase,
  LuMapPin,
  LuCamera,
  LuCheck,
  LuX,
  LuSave,
  LuShieldCheck,
  LuClock,
  LuGlobe,
  LuCircleCheck
} from 'react-icons/lu';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { countries } from '../utils/countries';
import PhotoUploadModal from '../components/PhotoUploadModal';

const Dashboard = () => {
  const { user, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
  const [editData, setEditData] = useState({
    company: user?.company || '',
    yearsOfExperience: user?.yearsOfExperience || 0,
    location: user?.location || '',
    country: user?.country || '',
    zipCode: user?.zipCode || '',
    email: user?.email || '',
    phone: user?.phone?.replace(/^\+\d+\s?/, '') || '',
    countryCode: countries.find((c) => c.name === user?.country)?.code || '+91',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const val = value.replace(/\D/g, '').slice(0, 10);
      setEditData((prev) => ({ ...prev, [name]: val }));
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.put(`/users/${user._id}`, {
        company: editData.company,
        yearsOfExperience: Number(editData.yearsOfExperience) || 0,
        location: editData.location,
        country: editData.country,
        zipCode: editData.zipCode,
      });
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Profile details saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initiateVerification = async (type) => {
    const val = editData[type];
    if (!val) return toast.error(`Please enter a valid ${type}`);

    let fullVal = val;
    if (type === 'phone') {
      if (val.length < 10) return toast.error('Please enter a valid 10-digit mobile number');
      fullVal = `${editData.countryCode || '+91'}${val}`;
    }

    if (fullVal === user[type]) return toast.info(`This ${type} is already up to date.`);

    setLoading(true);
    try {
      if (type === 'email') {
        await API.post('/auth/send-email-otp', { email: fullVal });
        toast.success('Verification code dispatched to your email.');
        setOtpModal({ show: true, type, value: fullVal, otp: '' });
      } else {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-dash', {
            size: 'invisible',
          });
        }
        const appVerifier = window.recaptchaVerifier;
        const confirmation = await signInWithPhoneNumber(auth, fullVal, appVerifier);
        setOtpModal({ show: true, type, value: fullVal, otp: '', confirmationResult: confirmation });
        toast.success('Verification code dispatched via SMS.');
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
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Email updated successfully!');
      } else {
        const result = await otpModal.confirmationResult.confirm(otpModal.otp);
        const idToken = await result.user.getIdToken();
        const { data } = await API.post('/auth/verify-phone-otp', { idToken, phone: otpModal.value });
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Phone number updated successfully!');
      }
      setOtpModal({ show: false, type: '', value: '', otp: '' });
    } catch (err) {
      toast.error(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--page)',
        padding: '36px 20px 80px',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        {/* Top Profile Summary Card */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card, 12px)',
            overflow: 'hidden',
            marginBottom: 28,
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          }}
        >
          {/* Header Accent Bar */}
          <div
            style={{
              height: 90,
              background: 'linear-gradient(135deg, #1E3A5F 0%, #152840 100%)',
              position: 'relative',
            }}
          />

          <div
            style={{
              padding: '0 28px 24px',
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            {/* Avatar & Basic Info */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: -46 }}>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => {
                    if (user?.profileImage) setPreviewImage(user.profileImage);
                  }}
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: '50%',
                    background: 'var(--surface)',
                    border: '4px solid var(--surface)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    cursor: user?.profileImage ? 'zoom-in' : 'default',
                    color: 'var(--primary)',
                    fontWeight: 800,
                    fontSize: 32,
                  }}
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || <LuUser size={40} />
                  )}
                </div>

                {/* Edit Photo Icon Button */}
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  title="Change Profile Photo"
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    border: '2px solid var(--surface)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                >
                  <LuCamera size={14} />
                </button>
              </div>

              <div style={{ paddingBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h1
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 22,
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {user?.name}
                  </h1>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(224, 122, 63, 0.12)',
                      color: 'var(--color-accent)',
                      border: '1px solid rgba(224, 122, 63, 0.25)',
                      borderRadius: 16,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'capitalize',
                    }}
                  >
                    <LuCircleCheck size={11} style={{ color: 'var(--primary)' }} />
                    {user?.role === 'admin' ? 'Administrator' : user?.role || 'Alumni'}
                  </span>
                </div>

                <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  {user?.branch ? `${user.branch} Engineering` : 'NIT Jamshedpur'}
                  {user?.graduationYear ? ` &bull; Class of ${user.graduationYear}` : ''}
                </p>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div style={{ paddingBottom: 6 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 20,
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                Active Network Member
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              padding: '0 28px',
              borderTop: '1px solid var(--border)',
              background: 'var(--panel)',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '12px 18px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: 13.5,
                fontWeight: activeTab === 'profile' ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <LuBriefcase size={14} /> Career & Background
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              style={{
                padding: '12px 18px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'security' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'security' ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: 13.5,
                fontWeight: activeTab === 'security' ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <LuShieldCheck size={14} /> Contact & Verification
            </button>
          </div>
        </div>

        {/* Tab 1: Career & Background Form */}
        {activeTab === 'profile' && (
          <form
            onSubmit={handleSaveGeneral}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card, 12px)',
              padding: '28px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ marginBottom: 24, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 17,
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--text-primary)',
                }}
              >
                Professional & Location Details
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                This information helps batchmates and recruiters connect with you in the directory.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 18,
                marginBottom: 20,
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Current Organization / Employer
                </label>
                <div style={{ position: 'relative' }}>
                  <LuBuilding
                    size={15}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="text"
                    name="company"
                    value={editData.company}
                    onChange={handleChange}
                    placeholder="e.g. Tata Motors / Google / Founder"
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 36px',
                      borderRadius: 'var(--radius-input, 8px)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: 13.5,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Total Experience (Years)
                </label>
                <div style={{ position: 'relative' }}>
                  <LuClock
                    size={15}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="60"
                    name="yearsOfExperience"
                    value={editData.yearsOfExperience}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 36px',
                      borderRadius: 'var(--radius-input, 8px)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: 13.5,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  City / Region
                </label>
                <div style={{ position: 'relative' }}>
                  <LuMapPin
                    size={15}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="text"
                    name="location"
                    value={editData.location}
                    onChange={handleChange}
                    placeholder="e.g. Jamshedpur / Bengaluru / San Jose"
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 36px',
                      borderRadius: 'var(--radius-input, 8px)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: 13.5,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Country
                </label>
                <div style={{ position: 'relative' }}>
                  <LuGlobe
                    size={15}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      pointerEvents: 'none',
                    }}
                  />
                  <select
                    name="country"
                    value={editData.country}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 36px',
                      borderRadius: 'var(--radius-input, 8px)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: 13.5,
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Select country</option>
                    {countries.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  ZIP / Postal Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={editData.zipCode}
                  onChange={handleChange}
                  placeholder="e.g. 831014"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-input, 8px)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: 13.5,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 14 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-button, 8px)',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(224, 122, 63, 0.3)',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <LuSave size={15} />
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Contact & Security Form */}
        {activeTab === 'security' && (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card, 12px)',
              padding: '28px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ marginBottom: 24, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 17,
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--text-primary)',
                }}
              >
                Verified Contact Channels
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                Changing primary contact details requires a secure one-time passcode confirmation.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Email Address */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Email Address
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <LuMail
                      size={15}
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleChange}
                      placeholder="alumni@domain.com"
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 36px',
                        borderRadius: 'var(--radius-input, 8px)',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text-primary)',
                        fontSize: 13.5,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => initiateVerification('email')}
                    disabled={loading}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-button, 8px)',
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--primary)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Verify & Update
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Mobile Phone Number
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ display: 'flex', flex: 1 }}>
                    <select
                      name="countryCode"
                      value={editData.countryCode}
                      onChange={handleChange}
                      style={{
                        padding: '10px 10px',
                        borderRadius: '8px 0 0 8px',
                        border: '1px solid var(--border)',
                        borderRight: 'none',
                        background: 'var(--panel)',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        fontWeight: 600,
                        outline: 'none',
                        cursor: 'pointer',
                        width: 76,
                      }}
                    >
                      {countries.map((c) => (
                        <option key={c.name + c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>

                    <div style={{ position: 'relative', flex: 1 }}>
                      <LuPhone
                        size={15}
                        style={{
                          position: 'absolute',
                          left: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-muted)',
                        }}
                      />
                      <input
                        type="text"
                        name="phone"
                        maxLength={10}
                        value={editData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 36px',
                          borderRadius: '0 8px 8px 0',
                          border: '1px solid var(--border)',
                          background: 'var(--surface)',
                          color: 'var(--text-primary)',
                          fontSize: 13.5,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => initiateVerification('phone')}
                    disabled={loading}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-button, 8px)',
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--primary)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Verify & Update
                  </button>
                </div>
              </div>

              {/* Security Banner Note */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  marginTop: 6,
                }}
              >
                <LuShieldCheck size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>
                  Your contact information is protected and hidden by default. Batchmates may only reach you via direct in-app messaging.
                </span>
              </div>
            </div>

            <div id="recaptcha-container-dash" />
          </div>
        )}
      </div>

      {/* OTP Verification Modal Dialog */}
      {otpModal.show && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card, 12px)',
              padding: '28px',
              width: '100%',
              maxWidth: 380,
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 18,
                    fontWeight: 700,
                    margin: 0,
                    color: 'var(--text-primary)',
                  }}
                >
                  Verify Verification Code
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Enter the 6-digit code dispatched to your {otpModal.type}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOtpModal({ ...otpModal, show: false })}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <LuX size={18} />
              </button>
            </div>

            <input
              type="text"
              maxLength={6}
              value={otpModal.otp}
              onChange={(e) => setOtpModal({ ...otpModal, otp: e.target.value.replace(/\D/g, '') })}
              placeholder="1 2 3 4 5 6"
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: 24,
                letterSpacing: '0.3em',
                padding: '12px',
                borderRadius: 'var(--radius-input, 8px)',
                border: '1px solid var(--border)',
                background: 'var(--page)',
                color: 'var(--text-primary)',
                outline: 'none',
                marginBottom: 20,
                boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setOtpModal({ ...otpModal, show: false })}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-button, 8px)',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={verifyOtp}
                disabled={loading || otpModal.otp.length < 6}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-button, 8px)',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: otpModal.otp.length < 6 || loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Verifying...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        userId={user?._id}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 30,
            cursor: 'zoom-out',
          }}
        >
          <img
            src={previewImage}
            alt="Preview"
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          />
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <LuX size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
