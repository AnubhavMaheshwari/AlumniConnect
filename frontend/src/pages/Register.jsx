import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  LuUser,
  LuMail,
  LuLock,
  LuEye,
  LuEyeOff,
  LuArrowRight,
  LuArrowLeft,
  LuCircleCheck,
  LuCheck,
  LuBriefcase,
  LuGraduationCap,
  LuShieldCheck,
  LuMapPin,
  LuPhone,
} from 'react-icons/lu';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import API from '../services/api';
import { countries } from '../utils/countries';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Stepper from '../components/ui/Stepper';

const STORAGE_KEY = 'alumni-register-draft';

const departments = [
  'Computer Science & Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics & Communication Engineering',
  'Metallurgical & Materials Engineering',
  'Production & Industrial Engineering',
  'Computer Applications (MCA)',
  'Mathematics & Computing',
  'Physics',
  'Chemistry',
  'Humanities & Social Sciences',
];

const degrees = ['B.Tech', 'M.Tech', 'MCA', 'M.Sc', 'Ph.D'];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'Alumni', // 'Alumni' | 'Student'

    // Alumni specific
    graduationYear: '',
    degree: 'B.Tech',
    department: '',
    isWorking: 'yes', // 'yes' | 'no'
    company: '',
    jobTitle: '',
    industry: '',
    yearsOfExperience: '',
    alumniStatus: 'Seeking Opportunities',

    // Student specific
    currentYear: '3rd Year',
    studentDepartment: '',
    expectedGraduation: '',
    interests: '',
    lookingFor: 'Mentorship',

    // Contact & Location
    country: 'India',
    countryCode: '+91',
    phone: '',
    zipCode: '',
    city: '',
    state: '',
    agreeTerms: false,
  });

  // Email OTP
  const [emailOtp, setEmailOtp] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Phone OTP
  const [phoneOtp, setPhoneOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.form) setForm((prev) => ({ ...prev, ...parsed.form }));
        if (typeof parsed.step === 'number') setStep(parsed.step);
      }
    } catch {}
  }, []);

  // Autosave draft
  useEffect(() => {
    if (!registeredSuccess) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, step }));
    }
  }, [form, step, registeredSuccess]);

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'country') {
      const match = countries.find((c) => c.name === value);
      setForm((prev) => ({
        ...prev,
        country: value,
        countryCode: match ? match.code : '+91',
      }));
    } else if (name === 'phone') {
      setForm((prev) => ({ ...prev, phone: value.replace(/\D/g, '').slice(0, 10) }));
    } else if (name === 'zipCode') {
      const val = value.replace(/\D/g, '').slice(0, 6);
      setForm((prev) => ({ ...prev, zipCode: val }));
      // Auto-lookup city/state mock or common PIN codes for quick assistance
      if (val === '831014') {
        setForm((prev) => ({ ...prev, city: 'Jamshedpur', state: 'Jharkhand' }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  // Password Strength Calculator
  const calculateStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6) s += 1;
    if (pw.length >= 10) s += 1;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s += 1;
    if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s += 1;
    return s;
  };

  const strength = calculateStrength(form.password);
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'var(--color-border)',
    'var(--color-error)',
    'var(--color-warning)',
    '#2563EB',
    'var(--color-success)',
  ];

  // Email verification handlers
  const sendEmailOTP = async () => {
    if (!form.email) {
      toast.error('Enter your email address first');
      return;
    }
    if (!form.email.endsWith('@nitjsr.ac.in')) {
      toast.error('Only @nitjsr.ac.in official institute email addresses are allowed');
      return;
    }
    try {
      await API.post('/auth/send-email-otp', { email: form.email });
      setEmailSent(true);
      toast.success('Verification code sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification code');
    }
  };

  const verifyEmailOTP = async () => {
    if (!emailOtp) {
      toast.error('Enter the OTP sent to your inbox');
      return;
    }
    try {
      await API.post('/auth/verify-email-otp', { email: form.email, otp: emailOtp });
      setEmailVerified(true);
      toast.success('Institute email successfully verified!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    }
  };

  // Phone verification handlers
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  };

  const sendPhoneOTP = async () => {
    if (!form.phone || form.phone.length < 10) {
      toast.error('Enter a valid 10-digit phone number');
      return;
    }
    const fullPhone = `${form.countryCode}${form.phone}`;
    try {
      await API.post('/auth/check-phone', { phone: fullPhone });
      setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      toast.success('SMS OTP sent to your phone');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send SMS OTP');
    }
  };

  const verifyPhoneOTP = async () => {
    if (!phoneOtp) {
      toast.error('Enter the SMS OTP');
      return;
    }
    const fullPhone = `${form.countryCode}${form.phone}`;
    try {
      const result = await confirmationResult.confirm(phoneOtp);
      const idToken = await result.user.getIdToken();
      await API.post('/auth/verify-phone-otp', { idToken, phone: fullPhone });
      setPhoneVerified(true);
      toast.success('Phone verified!');
    } catch (err) {
      toast.error(err.message || 'Invalid SMS OTP');
    }
  };

  // Final Registration Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!form.email.endsWith('@nitjsr.ac.in')) {
      toast.error('Registration requires a valid @nitjsr.ac.in email address');
      return;
    }
    if (!emailVerified) {
      toast.error('Please verify your institute email with the OTP first');
      setStep(0);
      return;
    }
    if (!form.agreeTerms) {
      toast.error('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      const finalDept =
        form.userType === 'Alumni' ? form.department : form.studentDepartment || form.department;
      const finalGradYear =
        form.userType === 'Alumni'
          ? form.graduationYear
            ? parseInt(form.graduationYear)
            : undefined
          : form.expectedGraduation
          ? parseInt(form.expectedGraduation)
          : undefined;
      const fullPhone = form.phone ? `${form.countryCode}${form.phone}` : undefined;

      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        graduationYear: finalGradYear,
        department: finalDept || 'General',
        phone: fullPhone,
        company: form.userType === 'Alumni' && form.isWorking === 'yes' ? form.company : undefined,
        yearsOfExperience:
          form.userType === 'Alumni' && form.isWorking === 'yes'
            ? parseInt(form.yearsOfExperience) || 0
            : 0,
        country: form.country,
        zipCode: form.zipCode,
      });

      localStorage.removeItem(STORAGE_KEY);
      setRegisteredSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 Validation
  const canProceedStep0 = () => {
    return (
      form.name.trim().length > 0 &&
      form.email.endsWith('@nitjsr.ac.in') &&
      emailVerified &&
      form.password.length >= 6 &&
      form.password === form.confirmPassword
    );
  };

  // Step 2 Validation
  const canProceedStep1 = () => {
    if (form.userType === 'Alumni') {
      return Boolean(form.department && form.graduationYear);
    }
    return Boolean(form.studentDepartment || form.department);
  };

  // Success Screen
  if (registeredSuccess) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: 520,
            width: '100%',
            padding: '48px 36px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <LuCheck size={32} strokeWidth={2} />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 26,
              fontWeight: 800,
              marginBottom: 10,
              color: 'var(--color-text)',
            }}
          >
            Welcome to the Network!
          </h2>

          <p
            style={{
              fontSize: 15,
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            Your account has been created successfully. You are now part of the official NIT Jamshedpur alumni and student community.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/dashboard')}
              style={{ flex: 1 }}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/directory')}
              style={{ flex: 1 }}
            >
              Explore Directory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      {/* Left campus image with solid navy overlay */}
      <div className="auth-image">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1000&q=80&auto=format&fit=crop"
          alt="NIT Jamshedpur Graduates"
          width="1000"
          height="1200"
          loading="lazy"
        />
        <div className="auth-image-overlay">
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 28,
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: 10,
              letterSpacing: '-0.4px',
            }}
          >
            Connect. Mentor. Grow.
          </div>
          <p
            style={{
              fontSize: 15,
              opacity: 0.9,
              maxWidth: 380,
              lineHeight: 1.6,
            }}
          >
            Join over 5,000+ NIT Jamshedpur graduates across 40+ countries. Reconnect with batchmates, hire students, and discover industry leaders.
          </p>
        </div>
      </div>

      {/* Right form container */}
      <div className="auth-form-side">
        <div className="auth-form-box" style={{ maxWidth: 480 }}>
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 26,
                fontWeight: 800,
                color: 'var(--color-text)',
                marginBottom: 6,
              }}
            >
              Create Your Profile
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Step {step + 1} of 3 &bull; Takes less than 2 minutes
            </p>
          </div>

          {/* Stepper Progress */}
          <Stepper steps={['Account', 'Academic', 'Contact & Privacy']} current={step} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* ── STEP 1: Account Info ── */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input
                  label="Full Name"
                  name="name"
                  icon={LuUser}
                  value={form.name}
                  onChange={update}
                  placeholder="e.g. Priya Sharma"
                  required
                />

                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <Input
                        label="Institute Email Address"
                        name="email"
                        type="email"
                        icon={LuMail}
                        value={form.email}
                        onChange={update}
                        placeholder="yourname@nitjsr.ac.in"
                        disabled={emailVerified}
                        required
                        helper={
                          !emailVerified
                            ? 'Must end with @nitjsr.ac.in'
                            : 'Verified institute address'
                        }
                      />
                    </div>
                    {emailVerified ? (
                      <div
                        style={{
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: 'var(--color-success)',
                          fontSize: 13,
                          fontWeight: 600,
                          paddingRight: 6,
                        }}
                      >
                        <LuCircleCheck size={18} strokeWidth={2} />
                        Verified
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        onClick={sendEmailOTP}
                        disabled={!form.email || !form.email.endsWith('@nitjsr.ac.in')}
                      >
                        {emailSent ? 'Resend OTP' : 'Send OTP'}
                      </Button>
                    )}
                  </div>

                  {emailSent && !emailVerified && (
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        marginTop: 10,
                        padding: 12,
                        background: 'var(--color-panel)',
                        borderRadius: 'var(--radius-sm)',
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Enter 6-digit email OTP"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        className="input-field"
                        style={{ flex: 1 }}
                      />
                      <Button type="button" variant="primary" size="sm" onClick={verifyEmailOTP}>
                        Verify OTP
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Input
                    label="Password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    icon={LuLock}
                    value={form.password}
                    onChange={update}
                    placeholder="Minimum 6 characters"
                    required
                    right={
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-text-muted)',
                          padding: 4,
                        }}
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                      >
                        {showPw ? <LuEyeOff size={18} strokeWidth={1.5} /> : <LuEye size={18} strokeWidth={1.5} />}
                      </button>
                    }
                  />

                  {/* Password Strength Meter */}
                  {form.password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            style={{
                              flex: 1,
                              height: 4,
                              borderRadius: 2,
                              background:
                                strength >= level
                                  ? strengthColors[strength]
                                  : 'var(--color-border)',
                              transition: 'background 0.25s ease',
                            }}
                          />
                        ))}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 11,
                          marginTop: 4,
                          color: strengthColors[strength],
                          fontWeight: 600,
                        }}
                      >
                        <span>Strength: {strengthLabels[strength]}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
                          Mix upper, lower, numbers & symbols
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showCp ? 'text' : 'password'}
                  icon={LuLock}
                  value={form.confirmPassword}
                  onChange={update}
                  placeholder="Re-enter your password"
                  required
                  error={
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? 'Passwords do not match'
                      : ''
                  }
                  right={
                    <button
                      type="button"
                      onClick={() => setShowCp((v) => !v)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)',
                        padding: 4,
                      }}
                      aria-label={showCp ? 'Hide password' : 'Show password'}
                    >
                      {showCp ? <LuEyeOff size={18} strokeWidth={1.5} /> : <LuEye size={18} strokeWidth={1.5} />}
                    </button>
                  }
                />
              </div>
            )}

            {/* ── STEP 2: Academic & Professional Details ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Segmented Control: Alumni vs Student */}
                <div className="input-group">
                  <label className="input-label">I am a</label>
                  <div
                    style={{
                      display: 'flex',
                      background: 'var(--color-panel)',
                      padding: 4,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {['Alumni', 'Student'].map((role) => {
                      const isSelected = form.userType === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, userType: role }))}
                          style={{
                            flex: 1,
                            padding: '8px 0',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                            background: isSelected ? 'var(--color-surface)' : 'transparent',
                            color: isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                            boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Conditional Fields for ALUMNI */}
                {form.userType === 'Alumni' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="input-group">
                        <label className="input-label">Degree</label>
                        <select
                          name="degree"
                          value={form.degree}
                          onChange={update}
                          className="input-field"
                        >
                          {degrees.map((deg) => (
                            <option key={deg} value={deg}>
                              {deg}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Input
                        label="Graduation Year"
                        name="graduationYear"
                        type="number"
                        placeholder="e.g. 2021"
                        value={form.graduationYear}
                        onChange={update}
                        min="1960"
                        max="2035"
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Department / Branch</label>
                      <select
                        name="department"
                        value={form.department}
                        onChange={update}
                        className="input-field"
                        required
                      >
                        <option value="">Select your department</option>
                        {departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Currently Working?</label>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 14,
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name="isWorking"
                            value="yes"
                            checked={form.isWorking === 'yes'}
                            onChange={update}
                            style={{ accentColor: 'var(--color-accent)' }}
                          />
                          Yes, currently employed
                        </label>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 14,
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name="isWorking"
                            value="no"
                            checked={form.isWorking === 'no'}
                            onChange={update}
                            style={{ accentColor: 'var(--color-accent)' }}
                          />
                          No / Other
                        </label>
                      </div>
                    </div>

                    {form.isWorking === 'yes' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <Input
                            label="Company / Employer"
                            name="company"
                            placeholder="e.g. Google, Tata Steel"
                            value={form.company}
                            onChange={update}
                            required
                          />
                          <Input
                            label="Job Title"
                            name="jobTitle"
                            placeholder="e.g. Software Engineer"
                            value={form.jobTitle}
                            onChange={update}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <Input
                            label="Industry"
                            name="industry"
                            placeholder="e.g. Tech, Manufacturing"
                            value={form.industry}
                            onChange={update}
                          />
                          <Input
                            label="Experience (Years)"
                            name="yearsOfExperience"
                            type="number"
                            placeholder="e.g. 4"
                            value={form.yearsOfExperience}
                            onChange={update}
                            min="0"
                            max="50"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="input-group">
                        <label className="input-label">Current Status</label>
                        <select
                          name="alumniStatus"
                          value={form.alumniStatus}
                          onChange={update}
                          className="input-field"
                        >
                          <option value="Seeking Opportunities">Seeking Opportunities / Job Search</option>
                          <option value="Higher Studies">Pursuing Higher Studies (MS/MBA/Ph.D)</option>
                          <option value="Entrepreneurship">Building a Startup / Founder</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Conditional Fields for STUDENT */}
                {form.userType === 'Student' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="input-group">
                        <label className="input-label">Current Year</label>
                        <select
                          name="currentYear"
                          value={form.currentYear}
                          onChange={update}
                          className="input-field"
                        >
                          {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year / Dual'].map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Input
                        label="Expected Graduation"
                        name="expectedGraduation"
                        type="number"
                        placeholder="e.g. 2026"
                        value={form.expectedGraduation}
                        onChange={update}
                        min="2024"
                        max="2032"
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Branch / Department</label>
                      <select
                        name="studentDepartment"
                        value={form.studentDepartment}
                        onChange={update}
                        className="input-field"
                        required
                      >
                        <option value="">Select your branch</option>
                        {departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Key Interests & Technologies"
                      name="interests"
                      placeholder="e.g. Distributed Systems, VLSI, Product Management"
                      value={form.interests}
                      onChange={update}
                      helper="Helps alumni mentors find and guide you"
                    />

                    <div className="input-group">
                      <label className="input-label">Primarily Looking For</label>
                      <select
                        name="lookingFor"
                        value={form.lookingFor}
                        onChange={update}
                        className="input-field"
                      >
                        <option value="Mentorship">Career Guidance & Mentorship</option>
                        <option value="Internship">Internship Opportunities</option>
                        <option value="Referral">Job Referral from Alumni</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: Contact, Location & Privacy ── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Searchable Country Selector */}
                <div className="input-group">
                  <label className="input-label">Country of Residence</label>
                  <select
                    name="country"
                    value={form.country}
                    onChange={update}
                    className="input-field"
                  >
                    {countries.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Single Embedded Phone Field */}
                <div>
                  <div className="input-group">
                    <label className="input-label">Phone Number (Optional)</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div
                        style={{
                          height: 40,
                          padding: '0 12px',
                          display: 'flex',
                          alignItems: 'center',
                          background: 'var(--color-panel)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'var(--color-text)',
                        }}
                      >
                        {form.countryCode}
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={update}
                        placeholder="9876543210"
                        className="input-field"
                        style={{ flex: 1 }}
                        disabled={phoneVerified}
                        maxLength={10}
                      />
                      {form.phone.length === 10 && !phoneVerified && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={sendPhoneOTP}
                        >
                          Verify SMS
                        </Button>
                      )}
                      {phoneVerified && (
                        <span style={{ color: 'var(--color-success)', fontSize: 13, fontWeight: 600 }}>
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {confirmationResult && !phoneVerified && (
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        marginTop: 8,
                        padding: 10,
                        background: 'var(--color-panel)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Enter SMS OTP"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        className="input-field"
                        style={{ flex: 1 }}
                      />
                      <Button type="button" variant="primary" size="sm" onClick={verifyPhoneOTP}>
                        Confirm
                      </Button>
                    </div>
                  )}
                </div>

                {/* Postal Code & City/State */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Input
                    label="Postal / PIN Code"
                    name="zipCode"
                    placeholder="e.g. 831014"
                    value={form.zipCode}
                    onChange={update}
                    required
                  />
                  <Input
                    label="City / Region"
                    name="city"
                    placeholder="e.g. Jamshedpur"
                    value={form.city}
                    onChange={update}
                  />
                </div>

                {/* Privacy Guarantee Note */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: 14,
                    background: 'var(--color-panel)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <LuShieldCheck
                    size={20}
                    strokeWidth={1.8}
                    style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: 2 }}
                  />
                  <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--color-text)', display: 'block', marginBottom: 2 }}>
                      Privacy-First Design
                    </strong>
                    Your email address and phone number remain completely confidential. Other members can only request contact or message you through the platform.
                  </div>
                </div>

                {/* Terms and Conditions Checkbox */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 13,
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    marginTop: 4,
                  }}
                >
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={form.agreeTerms}
                    onChange={update}
                    style={{ accentColor: 'var(--color-accent)', width: 16, height: 16, marginTop: 2 }}
                    required
                  />
                  <span>
                    I confirm I am an affiliated student or graduate of NIT Jamshedpur, and I agree to the{' '}
                    <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Community Guidelines</span> and Terms of Service.
                  </span>
                </label>

                <div id="recaptcha-container" />
              </div>
            )}

            {/* Stepper Navigation Buttons (One primary CTA per view rule) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                marginTop: 10,
                paddingTop: 16,
                borderTop: '1px solid var(--color-border)',
              }}
            >
              {step > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setStep((s) => s - 1)}
                >
                  <LuArrowLeft size={16} strokeWidth={1.5} /> Back
                </Button>
              ) : (
                <div />
              )}

              {step === 0 && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => setStep(1)}
                  disabled={!canProceedStep0()}
                >
                  Continue <LuArrowRight size={16} strokeWidth={1.5} />
                </Button>
              )}

              {step === 1 && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1()}
                >
                  Continue <LuArrowRight size={16} strokeWidth={1.5} />
                </Button>
              )}

              {step === 2 && (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={!form.agreeTerms || loading}
                >
                  Create Account <LuArrowRight size={16} strokeWidth={1.5} />
                </Button>
              )}
            </div>
          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: 24,
              fontSize: 14,
              color: 'var(--color-text-secondary)',
            }}
          >
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
