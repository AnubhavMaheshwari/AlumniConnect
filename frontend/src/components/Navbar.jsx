import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LuSun,
  LuMoon,
  LuMenu,
  LuX,
  LuBell,
  LuLogOut,
  LuLayoutDashboard,
  LuShield,
} from 'react-icons/lu';
import classNames from '../utils/classnames';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const publicLinks = [
    { name: 'Home', path: '/' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const authLinks = [
    { name: 'Home', path: '/' },
    { name: 'Directory', path: '/directory' },
    { name: 'Messages', path: '/messages' },
    { name: 'Events', path: '/events' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'News', path: '/news' },
    { name: 'Membership', path: '/membership' },
    ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin' }] : []),
  ];

  const links = user ? authLinks : publicLinks;
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : '';

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="navbar-inner">
        {/* Wordmark logo */}
        <Link to="/" className="nav-brand" aria-label="Alumni Connect Home">
          <span className="nav-brand-text">Alumni Connect</span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links">
          {links.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path + link.name}
                to={link.path}
                className={classNames('nav-link', { active })}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Light/Dark Toggle */}
          <button
            type="button"
            className="btn btn-icon"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <LuSun size={20} strokeWidth={1.5} />
            ) : (
              <LuMoon size={20} strokeWidth={1.5} />
            )}
          </button>

          {user ? (
            <>
              {/* Notification icon */}
              <Link
                to="/notifications"
                className="btn btn-icon"
                aria-label="View notifications"
                title="Notifications"
              >
                <LuBell size={20} strokeWidth={1.5} />
              </Link>

              {/* User Avatar & Dropdown */}
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  style={{ gap: 8, padding: '0 12px 0 6px' }}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: user.profileImage
                        ? `url(${user.profileImage}) center/cover`
                        : 'var(--color-navy)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {!user.profileImage && initials}
                  </div>
                  <span
                    style={{
                      maxWidth: 100,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.name?.split(' ')[0] || 'User'}
                  </span>
                </button>

                {userMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: 220,
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      overflow: 'hidden',
                      zIndex: 200,
                    }}
                  >
                    <div
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: 'var(--color-text)',
                        }}
                      >
                        {user.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--color-text-secondary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {user.email}
                      </div>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 16px',
                        fontSize: 13,
                        color: 'var(--color-text)',
                        textDecoration: 'none',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'var(--color-panel)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      <LuLayoutDashboard size={16} strokeWidth={1.5} />
                      Dashboard
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 16px',
                          fontSize: 13,
                          color: 'var(--color-text)',
                          textDecoration: 'none',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = 'var(--color-panel)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = 'transparent')
                        }
                      >
                        <LuShield size={16} strokeWidth={1.5} />
                        Admin Panel
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid var(--color-border)' }}>
                      <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 16px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-error)',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            'var(--color-error-bg)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = 'transparent')
                        }
                      >
                        <LuLogOut size={16} strokeWidth={1.5} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Join Now
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="btn btn-icon nav-mobile-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <LuX size={20} strokeWidth={1.5} />
            ) : (
              <LuMenu size={20} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={classNames('nav-mobile-drawer', { open: mobileOpen })}>
        {links.map((link) => {
          const active = location.pathname === link.path;
          return (
            <Link
              key={link.path + link.name}
              to={link.path}
              className={classNames('nav-link', { active })}
              onClick={() => setMobileOpen(false)}
            >
              {link.name}
            </Link>
          );
        })}

        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            marginTop: 12,
            paddingTop: 12,
          }}
        >
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Link
                to="/dashboard"
                className="nav-link"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-error)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <LuLogOut size={16} strokeWidth={1.5} />
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link
                to="/login"
                className="btn btn-secondary btn-sm w-full"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm w-full"
                onClick={() => setMobileOpen(false)}
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
