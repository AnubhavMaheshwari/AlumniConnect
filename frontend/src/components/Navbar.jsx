import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaGraduationCap, FaBell, FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaUserShield } from 'react-icons/fa';

/* ── tokens ──────────────────────────────────────────────────────────────── */
const C = {
    blue: '#203671', blueDark: '#182858', blueLight: '#2D4899',
    blueFaint: 'rgba(32,54,113,0.12)', blueBorder: 'rgba(32,54,113,0.35)',
    white: '#FFFFFF', muted: '#8A94A8', black: '#000000',
    darkBg: '#0C0E14', darkCard: '#12151F', darkBorder: '#1E2235',
    danger: '#FF4D4D',
};

/* ── font / style injection ──────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('nav-styles')) {
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@700;800&display=swap';
    document.head.appendChild(l);
    const s = document.createElement('style'); s.id = 'nav-styles';
    s.textContent = `
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        .nav-link-item { position:relative; transition: color 0.2s; }
        .nav-link-item::after { content:''; position:absolute; bottom:-2px; left:50%; right:50%; height:2px; background:linear-gradient(90deg,#2D4899,#203671); border-radius:2px; transition: left 0.25s, right 0.25s; }
        .nav-link-item.active::after { left:0; right:0; }
        .nav-link-item:hover::after { left:0; right:0; }
        .mob-link { display:block; padding:11px 16px; font-size:13.5px; font-weight:500; color:#8A94A8; border-radius:9px; text-decoration:none; transition:background 0.2s,color 0.2s; font-family:"DM Sans",sans-serif; }
        .mob-link:hover { background:rgba(32,54,113,0.1); color:#fff; }
        .mob-link.active { background:rgba(32,54,113,0.16); color:#fff; font-weight:700; }
        .notif-item:not(:last-child) { border-bottom:1px solid #1E2235; }
    `;
    document.head.appendChild(s);
}

/* ── main ────────────────────────────────────────────────────────────────── */
const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate  = useNavigate();
    const location  = useLocation();
    const [isOpen, setIsOpen]                   = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu]        = useState(false);
    const notifRef   = useRef(null);
    const userRef    = useRef(null);

    const activities = [
        { id: 1, text: 'You updated your profile information.', time: 'Just now' },
        { id: 2, text: 'Logged in from a new device.',          time: '2 hours ago' },
        { id: 3, text: 'Welcome to the Alumni Portal!',         time: '1 day ago' },
    ];

    useEffect(() => {
        const handler = e => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
            if (userRef.current  && !userRef.current.contains(e.target))  setShowUserMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // close mobile on route change
    useEffect(() => { setIsOpen(false); }, [location.pathname]);

    const handleLogout = () => { logout(); navigate('/'); setIsOpen(false); };

    const publicLinks = [
        { name: 'Home',    path: '/' },
        { name: 'FAQ',     path: '/faq' },
        { name: 'Contact', path: '/contact' },
    ];
    const authLinks = [
        { name: 'Home',      path: '/' },
        { name: 'Directory', path: '/directory' },
        { name: 'Events',    path: '/events' },
        { name: 'Jobs',      path: '/jobs' },
        { name: 'News',      path: '/news' },
        { name: 'FAQ',       path: '/faq' },
        { name: 'Contact',   path: '/contact' },
        ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin' }] : []),
    ];
    const navLinks = user ? authLinks : publicLinks;
    const initials = user?.name?.slice(0, 2)?.toUpperCase() || '';

    return (
        <nav style={{
            position: 'sticky', top: 0, left: 0, right: 0, zIndex: 100,
            background: 'rgba(10,10,20,0.88)', backdropFilter: 'blur(18px)',
            borderBottom: `1px solid ${C.darkBorder}`,
            fontFamily: "'DM Sans', sans-serif",
        }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

                {/* ── LOGO ── */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 12px rgba(32,54,113,0.5)` }}>
                        <FaGraduationCap style={{ color: C.white, fontSize: 16 }} />
                    </div>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: C.white, letterSpacing: '-0.2px' }}>
                        NIT JSR Alumni
                    </span>
                </Link>

                {/* ── DESKTOP LINKS ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }} className="desktop-nav">
                    {navLinks.map(link => {
                        const active = location.pathname === link.path;
                        const isAdmin = link.name === 'Admin';
                        return (
                            <Link key={link.path + link.name} to={link.path}
                                className={`nav-link-item ${active ? 'active' : ''}`}
                                style={{
                                    padding: '6px 13px', fontSize: 13.5, fontWeight: active ? 700 : 500,
                                    color: isAdmin ? C.blueLight : (active ? C.white : C.muted),
                                    textDecoration: 'none', borderRadius: 8,
                                    background: isAdmin ? C.blueFaint : 'transparent',
                                    border: isAdmin ? `1px solid ${C.blueBorder}` : '1px solid transparent',
                                    display: 'flex', alignItems: 'center', gap: 5,
                                }}
                            >
                                {isAdmin && <FaUserShield style={{ fontSize: 11 }} />}
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* ── DESKTOP RIGHT ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }} className="desktop-nav">

                    {/* bell */}
                    {user && (
                        <div style={{ position: 'relative' }} ref={notifRef}>
                            <button onClick={() => { setShowNotifications(v => !v); setShowUserMenu(false); }} style={{ width: 36, height: 36, borderRadius: 9, background: showNotifications ? C.blueFaint : 'transparent', border: `1px solid ${showNotifications ? C.blueBorder : 'transparent'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, transition: 'all 0.2s', position: 'relative' }}
                                onMouseEnter={e => { e.currentTarget.style.background = C.blueFaint; e.currentTarget.style.borderColor = C.blueBorder; e.currentTarget.style.color = C.white; }}
                                onMouseLeave={e => { if (!showNotifications) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = C.muted; } }}
                            >
                                <FaBell style={{ fontSize: 14 }} />
                                <span style={{ position: 'absolute', top: 6, right: 7, width: 7, height: 7, borderRadius: '50%', background: C.danger, border: `1px solid rgba(10,10,20,0.9)` }} />
                            </button>

                            {showNotifications && (
                                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 300, background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.6)', zIndex: 200, overflow: 'hidden', animation: 'slideDown 0.2s ease both' }}>
                                    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.darkBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: C.white }}>Activity</span>
                                        <span style={{ background: C.blueFaint, border: `1px solid ${C.blueBorder}`, borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: C.blueLight }}>{activities.length}</span>
                                    </div>
                                    {activities.map(act => (
                                        <div key={act.id} className="notif-item" style={{ padding: '12px 16px' }}>
                                            <p style={{ fontSize: 12.5, color: C.muted, margin: '0 0 3px', lineHeight: 1.5 }}>{act.text}</p>
                                            <p style={{ fontSize: 10.5, color: C.darkBorder === act.time ? C.darkBorder : '#3D4460', margin: 0, fontWeight: 600 }}>{act.time}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* user menu / auth buttons */}
                    {user ? (
                        <div style={{ position: 'relative' }} ref={userRef}>
                            <button onClick={() => { setShowUserMenu(v => !v); setShowNotifications(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: showUserMenu ? C.blueFaint : 'transparent', border: `1px solid ${showUserMenu ? C.blueBorder : C.darkBorder}`, borderRadius: 10, padding: '5px 10px 5px 5px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = C.blueBorder; e.currentTarget.style.background = C.blueFaint; }}
                                onMouseLeave={e => { if (!showUserMenu) { e.currentTarget.style.borderColor = C.darkBorder; e.currentTarget.style.background = 'transparent'; } }}
                            >
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${C.blueLight}, ${C.blueDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 800, color: C.white }}>
                                    {initials}
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: C.white, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user.name?.split(' ')[0]}
                                </span>
                            </button>

                            {showUserMenu && (
                                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 200, background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,0.6)', zIndex: 200, overflow: 'hidden', animation: 'slideDown 0.2s ease both' }}>
                                    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.darkBorder}` }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: C.white, margin: '0 0 2px' }}>{user.name}</p>
                                        <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{user.email}</p>
                                    </div>
                                    {[
                                        { label: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
                                        ...(user.role === 'admin' ? [{ label: 'Admin Panel', path: '/admin', icon: FaUserShield }] : []),
                                    ].map(item => (
                                        <Link key={item.path} to={item.path} onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', color: C.muted, textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'background 0.2s, color 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = C.blueFaint; e.currentTarget.style.color = C.white; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}
                                        >
                                            <item.icon style={{ fontSize: 12, color: C.blueLight }} /> {item.label}
                                        </Link>
                                    ))}
                                    <div style={{ borderTop: `1px solid ${C.darkBorder}` }}>
                                        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'none', border: 'none', color: C.danger, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s' }}
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
                            <Link to="/login" style={{ padding: '7px 16px', fontSize: 13, fontWeight: 600, color: C.muted, textDecoration: 'none', borderRadius: 8, transition: 'color 0.2s' }}
                                onMouseEnter={e => e.target.style.color = C.white}
                                onMouseLeave={e => e.target.style.color = C.muted}
                            >Sign In</Link>
                            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`, borderRadius: 8, padding: '8px 18px', color: C.white, fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: `0 3px 12px rgba(32,54,113,0.4)`, transition: 'opacity 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >Join Now</Link>
                        </div>
                    )}
                </div>

                {/* ── MOBILE HAMBURGER ── */}
                <button onClick={() => setIsOpen(v => !v)} style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 9, background: isOpen ? C.blueFaint : 'transparent', border: `1px solid ${isOpen ? C.blueBorder : C.darkBorder}`, cursor: 'pointer', color: C.white, transition: 'all 0.2s' }} className="mobile-menu-btn">
                    {isOpen ? <HiX size={20} /> : <HiMenu size={20} />}
                </button>
            </div>

            {/* ── MOBILE DRAWER ── */}
            {isOpen && (
                <div style={{ borderTop: `1px solid ${C.darkBorder}`, background: C.darkCard, padding: '16px', animation: 'slideDown 0.2s ease both' }} className="mobile-drawer">

                    {/* nav links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                        {navLinks.map(link => {
                            const active = location.pathname === link.path;
                            return (
                                <Link key={link.path + link.name} to={link.path} onClick={() => setIsOpen(false)}
                                    className={`mob-link ${active ? 'active' : ''}`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* auth section */}
                    <div style={{ borderTop: `1px solid ${C.darkBorder}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {user ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: C.blueFaint, border: `1px solid ${C.blueBorder}`, borderRadius: 9, marginBottom: 4 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${C.blueLight}, ${C.blueDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: C.white, flexShrink: 0 }}>{initials}</div>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: C.white, margin: 0 }}>{user.name}</p>
                                        <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{user.email}</p>
                                    </div>
                                </div>
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="mob-link">Dashboard</Link>
                                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', background: 'rgba(255,77,77,0.07)', border: `1px solid rgba(255,77,77,0.15)`, borderRadius: 9, color: C.danger, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%', marginTop: 4 }}>
                                    <FaSignOutAlt style={{ fontSize: 12 }} /> Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login"    onClick={() => setIsOpen(false)} className="mob-link">Sign In</Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} style={{ display: 'block', textAlign: 'center', background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`, borderRadius: 9, padding: '11px 0', color: C.white, fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: `0 3px 12px rgba(32,54,113,0.4)` }}>
                                    Join Now
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* responsive overrides */}
            <style>{`
                @media (max-width: 860px) {
                    .desktop-nav { display: none !important; }
                    .mobile-menu-btn { display: flex !important; }
                }
                @media (min-width: 861px) {
                    .mobile-drawer { display: none !important; }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;