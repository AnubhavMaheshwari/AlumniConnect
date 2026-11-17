import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuMail,
  LuLock,
  LuKey,
  LuArrowRight,
  LuArrowLeft,
  LuCheck,
} from 'react-icons/lu';
import API from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');
    setLoading(true);
    try {
      await API.post('/auth/send-forgot-password-otp', { email });
      toast.success('Reset code sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (otp.length < 6) {
      return toast.error('Please enter the 6-digit OTP');
    }

    setLoading(true);
    try {
      await API.post('/auth/reset-password-otp', {
        email,
        otp,
        password,
      });
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        backgroundColor: 'var(--color-page)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '36px 32px',
        }}
      >
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 24,
              fontWeight: 800,
              color: 'var(--color-text)',
              marginBottom: 8,
            }}
          >
            {step === 1 ? 'Reset Your Password' : 'Enter Verification Code'}
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {step === 1
              ? 'Enter your registered email address to receive a secure password reset OTP.'
              : `Enter the code sent to ${email} along with your new password.`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input
              label="Institute Email Address"
              type="email"
              icon={LuMail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@nitjsr.ac.in"
              required
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Send Reset Code <LuArrowRight size={16} />
            </Button>

            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                }}
              >
                <LuArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="6-Digit Reset Code (OTP)"
              type="text"
              icon={LuKey}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="e.g. 123456"
              maxLength={6}
              required
            />

            <Input
              label="New Password"
              type="password"
              icon={LuLock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              icon={LuCheck}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Update Password <LuArrowRight size={16} />
            </Button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 13,
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Change Email
              </button>

              <Link
                to="/login"
                style={{
                  fontSize: 13,
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
