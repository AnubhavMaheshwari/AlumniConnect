import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiMenu, HiX, HiSun, HiMoon } from 'react-icons/hi';
import {
    FaGraduationCap, FaBell, FaSignOutAlt,
    FaTachometerAlt, FaUserShield,
} from 'react-icons/fa';
import API from '../services/api';
import { formatDistanceToNow } from 'date-fns';

/* ── global styles (injected once) ──────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('nav-styles')) {
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@700;800&display=swap';
    document.head.appendChild(l);

    const s = document.createElement('style'); s.id = 'nav-styles';
    s.textContent = `
        @keyframes slideDown {
            from { opacity:0; transform:translateY(-8px); }
            to   { opacity:1; transform:translateY(0); }
        }

        /* underline hover/active for desktop links */
        .nl { position:relative; transition:color 0.2s; }
        .nl::after {
            content:''; position:absolute; bottom:-2px; left:50%; right:50%;
            height:2px; background:linear-gradient(90deg,#2D4899,#203671);
            border-radius:2px; transition:left 0.25s,right 0.25s;
        }
        .nl.act::after  { left:0; right:0; }
        .nl:hover::after { left:0; right:0; }

        /* mobile link */
        .ml {
            display:block; padding:11px 14px; font-size:14px; font-weight:500;
            color:#8A94A8; border-radius:9px; text-decoration:none;
            transition:background 0.2s,color 0.2s;
            font-family:"DM Sans",sans-serif;
        }
        .ml:hover  { background:rgba(32,54,113,0.1); color:#fff; }
        .ml.act    { background:rgba(32,54,113,0.18); color:#fff; font-weight:700; }

        /* notification list divider */
        .ni:not(:last-child) { border-bottom:1px solid #1E2235; }

        /* ── responsive breakpoints ── */

        /* hide logo text on very small phones */
        @media (max-width:380px) {
            .logo-text { display:none !important; }
        }

        /* desktop: show nav links & right section; hide hamburger */
        @media (min-width:861px) {
            .desk { display:flex !important; }
            .ham  { display:none !important; }
            .mob-drawer { display:none !important; }
        }

        /* mobile: hide desktop nav & right; show hamburger */
        @media (max-width:860px) {
            .desk { display:none !important; }
            .ham  { display:flex !important; }
        }

        /* tighten nav padding on phones */
        @media (max-width:480px) {
            .nav-inner { padding:0 12px !important; }
            .mob-drawer { padding:12px !important; }
            .ml { padding:10px 12px !important; font-size:13px !important; }
        }

        /* notification & user dropdowns: full-width on very small screens */
        @media (max-width:360px) {
            .notif-panel { width:calc(100vw - 24px) !important; right:-60px !important; }
            .user-panel  { width:calc(100vw - 24px) !important; right:-30px !important; }
        }
    `;
    document.head.appendChild(s);
}

/* ────────────────────────────────────────────────────────────────────────── */
const Navbar = () => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate  = useNavigate();
    const location  = useLocation();

    const [isOpen,  setIsOpen]  = useState(false);
    const [showBell, setShowBell] = useState(false);
    const [showUser, setShowUser] = useState(false);
    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const bellRef = useRef(null);
    const userRef = useRef(null);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        if (user) {
            fetchActivities();
        }
    }, [user, location.pathname]);

    const fetchActivities = async () => {
        try {
            const { data } = await API.get('/activity');
            if (data.success) {
                setActivities(data.activities);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    const formatTime = (date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch (err) {
            return 'Just now';
        }
    };

    /* close dropdowns on outside click */
    useEffect(() => {
        const h = e => {
            if (bellRef.current && !bellRef.current.contains(e.target)) setShowBell(false);
            if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    /* close mobile drawer on navigation */
    useEffect(() => { setIsOpen(false); }, [location.pathname]);

    const handleLogout = () => { logout(); navigate('/'); setIsOpen(false); };

    useEffect(() => {
        if (!showBell) setShowAllNotifications(false);
    }, [showBell]);

    const publicLinks = [
        { name: 'Home',    path: '/' },
        { name: 'FAQ',     path: '/faq' },
        { name: 'Contact Us', path: '/contact' },
    ];
    const authLinks = [
        { name: 'Home',      path: '/' },
        { name: 'Directory', path: '/directory' },
        { name: 'Messages',  path: '/messages' },
        { name: 'Events',    path: '/events' },
        { name: 'Jobs',      path: '/jobs' },
        { name: 'News',      path: '/news' },
        { name: 'FAQ',       path: '/faq' },
        { name: 'Contact Us',   path: '/contact' },
        ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin' }] : []),
    ];
    const navLinks = user ? authLinks : publicLinks;
    const initials = user?.name?.slice(0, 2)?.toUpperCase() || '';
    const firstName = user?.name?.split(' ')[0] || '';

    /* ── shared button style helpers ── */
    const iconBtnSx = (active) => ({
        width: 36, height: 36, borderRadius: 9, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: active ? 'var(--blue-faint)' : 'transparent',
        border: `1px solid ${active ? 'var(--blue-border)' : 'transparent'}`,
        transition: 'all 0.2s', position: 'relative', flexShrink: 0,
    });

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'var(--nav-bg)', backdropFilter: 'blur(18px)',
            borderBottom: '1px solid var(--border)',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'background 0.3s, border-color 0.3s'
        }}>
            {/* ── TOP BAR ── */}
            <div className="nav-inner" style={{
                maxWidth: 1280, margin: '0 auto', padding: '0 24px',
                height: 64, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: 12,
            }}>

                {/* LOGO */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 12px rgba(32,54,113,0.5)`, flexShrink: 0 }}>
                        <FaGraduationCap style={{ color: '#fff', fontSize: 16 }} />
                    </div>
                    <span className="logo-text" style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}>
                        NIT JSR Alumni
                    </span>
                </Link>

                {/* DESKTOP NAV LINKS */}
                <div className="desk" style={{ alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
                    {navLinks.map(link => {
                        const active  = location.pathname === link.path;
                        const isAdmin = link.name === 'Admin';
                        return (
                            <Link key={link.path + link.name} to={link.path}
                                className={`nl ${active ? 'act' : ''}`}
                                style={{
                                    padding: '6px 13px', fontSize: 13.5,
                                    fontWeight: active ? 700 : 500,
                                    color: isAdmin ? 'var(--blue-light)' : (active ? 'var(--text-primary)' : 'var(--text-secondary)'),
                                    textDecoration: 'none', borderRadius: 8,
                                    background: isAdmin ? 'var(--blue-faint)' : 'transparent',
                                    border: isAdmin ? '1px solid var(--blue-border)' : '1px solid transparent',
                                    display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                                }}
                            >
                                {isAdmin && <FaUserShield style={{ fontSize: 11 }} />}
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* DESKTOP RIGHT: bell + user */}
                <div className="desk" style={{ alignItems: 'center', gap: 8, flexShrink: 0 }}>

                    {/* Notification bell */}
                    {user && (
                        <div style={{ position: 'relative' }} ref={bellRef}>
                            <button
                                onClick={() => { setShowBell(v => !v); setShowUser(false); }}
                                style={iconBtnSx(showBell)}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue-faint)'; e.currentTarget.style.borderColor = 'var(--blue-border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                onMouseLeave={e => { if (!showBell) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                            >
                                <FaBell style={{ fontSize: 14 }} />
                                <span style={{ position: 'absolute', top: 7, right: 8, width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)', border: '1.5px solid rgba(10,10,20,0.9)' }} />
                            </button>

                            {showBell && (
                                <div className="notif-panel" style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 300, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 16px 48px var(--card-shadow)', zIndex: 200, overflow: 'hidden', animation: 'slideDown 0.2s ease both' }}>
                                    <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Activity</span>
                                        <span style={{ background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: 'var(--blue-light)' }}>{activities.length}</span>
                                    </div>
                                    <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                                        {activities.length === 0 ? (
                                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                                                No recent activity
                                            </div>
                                        ) : (
                                            (showAllNotifications ? activities : activities.slice(0, 3)).map(a => (
                                                <div key={a._id} className="ni" style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
                                                    <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 3px', lineHeight: 1.5 }}>{a.text}</p>
                                                    <p style={{ fontSize: 10.5, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>{formatTime(a.createdAt)}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {activities.length > 3 && (
                                        <Link 
                                            to="/notifications"
                                            onClick={() => setShowBell(false)}
                                            style={{ display: 'block', textAlign: 'center', width: '100%', padding: '12px 0', background: 'transparent', border: 'none', color: 'var(--blue-light)', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-faint)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            View All Notifications
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        style={iconBtnSx(false)}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue-faint)'; e.currentTarget.style.borderColor = 'var(--blue-border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? <HiSun style={{ fontSize: 16 }} /> : <HiMoon style={{ fontSize: 16 }} />}
                    </button>

                    {/* User menu / auth buttons */}
                    {user ? (
                        <div style={{ position: 'relative' }} ref={userRef}>
                            <button
                                onClick={() => { setShowUser(v => !v); setShowBell(false); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, background: showUser ? 'var(--blue-faint)' : 'transparent', border: `1px solid ${showUser ? 'var(--blue-border)' : 'var(--border)'}`, borderRadius: 10, padding: '5px 10px 5px 5px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue-border)'; e.currentTarget.style.background = 'var(--blue-faint)'; }}
                                onMouseLeave={e => { if (!showUser) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; } }}
                            >
                                <div style={{ 
                                    width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, var(--blue-light), var(--blue-dark))`, 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif", fontSize: 11, 
                                    fontWeight: 800, color: '#FFFFFF', flexShrink: 0,
                                    backgroundImage: user.profileImage ? `url('${user.profileImage}')` : 'none',
                                    backgroundSize: 'cover', backgroundPosition: 'center'
                                }}>
                                    {!user.profileImage && initials}
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {firstName}
                                </span>
                            </button>

                            {showUser && (
                                <div className="user-panel" style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 200, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 16px 48px var(--card-shadow)', zIndex: 200, overflow: 'hidden', animation: 'slideDown 0.2s ease both' }}>
                                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>{user.name}</p>
                                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                                    </div>
                                    {[
                                        { label: 'Dashboard',   path: '/dashboard', Icon: FaTachometerAlt },
                                        ...(user.role === 'admin' ? [{ label: 'Admin Panel', path: '/admin', Icon: FaUserShield }] : []),
                                    ].map(item => (
                                        <Link key={item.path} to={item.path} onClick={() => setShowUser(false)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'background 0.2s,color 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue-faint)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                        >
                                            <item.Icon style={{ fontSize: 12, color: 'var(--blue-light)' }} /> {item.label}
                                        </Link>
                                    ))}
                                    <div style={{ borderTop: '1px solid var(--border)' }}>
                                        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'none', border: 'none', color: 'var(--danger)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,77,0.07)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <FaSignOutAlt style={{ fontSize: 12 }} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Link to="/login" style={{ padding: '7px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                            >Sign In</Link>
                            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', background: `linear-gradient(135deg, var(--blue-light), var(--blue))`, borderRadius: 8, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: `0 3px 12px rgba(32,54,113,0.4)`, transition: 'opacity 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >Join Now</Link>
                        </div>
                    )}
                </div>

                {/* MOBILE: bell (when logged in) + hamburger */}
                <div className="ham" style={{ alignItems: 'center', gap: 8 }}>
                    <button
                        onClick={toggleTheme}
                        style={iconBtnSx(false)}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue-faint)'; e.currentTarget.style.borderColor = 'var(--blue-border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                    >
                        {isDark ? <HiSun style={{ fontSize: 16 }} /> : <HiMoon style={{ fontSize: 16 }} />}
                    </button>

                    {user && (
                        <div style={{ position: 'relative' }} ref={bellRef}>
                            <button
                                onClick={() => { setShowBell(v => !v); setShowUser(false); }}
                                style={iconBtnSx(showBell)}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue-faint)'; e.currentTarget.style.borderColor = 'var(--blue-border)'; }}
                                onMouseLeave={e => { if (!showBell) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}
                            >
                                <FaBell style={{ fontSize: 14, color: 'var(--text-secondary)' }} />
                                <span style={{ position: 'absolute', top: 7, right: 8, width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)', border: '1.5px solid var(--nav-bg)' }} />
                            </button>

                            {showBell && (
                                <div className="notif-panel" style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 280, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 16px 48px var(--card-shadow)', zIndex: 200, overflow: 'hidden', animation: 'slideDown 0.2s ease both' }}>
                                    <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Activity</span>
                                        <span style={{ background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: 'var(--blue-light)' }}>{activities.length}</span>
                                    </div>
                                    <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                                        {activities.length === 0 ? (
                                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                                                No recent activity
                                            </div>
                                        ) : (
                                            (showAllNotifications ? activities : activities.slice(0, 3)).map(a => (
                                                <div key={a._id} className="ni" style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
                                                    <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 3px', lineHeight: 1.5 }}>{a.text}</p>
                                                    <p style={{ fontSize: 10.5, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>{formatTime(a.createdAt)}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {activities.length > 3 && (
                                        <Link 
                                            to="/notifications"
                                            onClick={() => { setShowBell(false); setIsOpen(false); }}
                                            style={{ display: 'block', textAlign: 'center', width: '100%', padding: '12px 0', background: 'transparent', border: 'none', color: 'var(--blue-light)', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-faint)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            View All Notifications
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => setIsOpen(v => !v)}
                        style={{ ...iconBtnSx(isOpen), border: `1px solid ${isOpen ? 'var(--blue-border)' : 'var(--border)'}` }}
                    >
                        {isOpen ? <HiX size={19} style={{ color: 'var(--text-primary)' }} /> : <HiMenu size={19} style={{ color: 'var(--text-secondary)' }} />}
                    </button>
                </div>
            </div>

            {/* ── MOBILE DRAWER ── */}
            {isOpen && (
                <div className="mob-drawer" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '14px 16px', animation: 'slideDown 0.22s ease both' }}>

                    {/* user identity strip */}
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', borderRadius: 10, marginBottom: 12 }}>
                            <div style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#FFFFFF', flexShrink: 0,
                                backgroundImage: user.profileImage ? `url('${user.profileImage}')` : 'none',
                                backgroundSize: 'cover', backgroundPosition: 'center'
                            }}>
                                {!user.profileImage && initials}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                            </div>
                        </div>
                    )}

                    {/* nav links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 12 }}>
                        {navLinks.map(link => {
                            const active  = location.pathname === link.path;
                            const isAdmin = link.name === 'Admin';
                            return (
                                <Link key={link.path + link.name} to={link.path} onClick={() => setIsOpen(false)}
                                    className={`ml ${active ? 'act' : ''}`}
                                    style={isAdmin ? { color: 'var(--blue-light)', background: 'var(--blue-faint)', border: '1px solid var(--blue-border)' } : {}}
                                >
                                    {isAdmin && <FaUserShield style={{ fontSize: 11, marginRight: 7, verticalAlign: 'middle' }} />}
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* auth section */}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {user ? (
                            <>
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="ml">
                                    <FaTachometerAlt style={{ fontSize: 11, marginRight: 8, verticalAlign: 'middle', color: 'var(--blue-light)' }} />
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', background: 'rgba(255,77,77,0.07)', border: '1px solid rgba(255,77,77,0.18)', borderRadius: 9, color: 'var(--danger)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%', marginTop: 2 }}>
                                    <FaSignOutAlt style={{ fontSize: 12 }} /> Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login"    onClick={() => setIsOpen(false)} className="ml">Sign In</Link>
                                <Link to="/register" onClick={() => setIsOpen(false)}
                                    style={{ display: 'block', textAlign: 'center', background: `linear-gradient(135deg, var(--blue-light), var(--blue))`, borderRadius: 9, padding: '12px 0', color: '#fff', fontSize: 13.5, fontWeight: 700, textDecoration: 'none', boxShadow: `0 3px 12px rgba(32,54,113,0.4)` }}
                                >
                                    Join Now
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;