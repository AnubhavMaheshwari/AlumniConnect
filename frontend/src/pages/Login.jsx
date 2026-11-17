import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  LuMail,
  LuLock,
  LuEye,
  LuEyeOff,
  LuArrowRight,
} from 'react-icons/lu';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('rememberedEmail');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      toast.success('Welcome back to Alumni Connect!', { autoClose: 900 });
      navigate('/directory');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left photograph with navy overlay */}
      <div className="auth-image">
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=1000&q=80&auto=format&fit=crop"
          alt="NIT Jamshedpur Campus"
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
            Welcome Back to Alumni Connect
          </div>
          <p
            style={{
              fontSize: 15,
              opacity: 0.9,
              maxWidth: 380,
              lineHeight: 1.6,
            }}
          >
            Reconnect with classmates, access exclusive job postings, and participate in campus mentorship.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <div style={{ marginBottom: 28 }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 28,
                fontWeight: 800,
                color: 'var(--color-text)',
                marginBottom: 8,
              }}
            >
              Sign In
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Enter your registered institute credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Input
              label="Email Address"
              type="email"
              icon={LuMail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@nitjsr.ac.in"
              required
              autoComplete="email"
            />

            <div>
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                icon={LuLock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                right={
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 4,
                    }}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <LuEyeOff size={18} strokeWidth={1.5} /> : <LuEye size={18} strokeWidth={1.5} />}
                  </button>
                }
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    accentColor: 'var(--color-accent)',
                    width: 15,
                    height: 15,
                  }}
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-accent)',
                }}
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Sign In <LuArrowRight size={16} strokeWidth={1.5} />
            </Button>
          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: 28,
              paddingTop: 20,
              borderTop: '1px solid var(--color-border)',
              fontSize: 14,
              color: 'var(--color-text-secondary)',
            }}
          >
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
              Create student / alumni account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
