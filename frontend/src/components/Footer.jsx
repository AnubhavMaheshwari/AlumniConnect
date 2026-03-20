import { Link } from 'react-router-dom';
import { FaLinkedin, FaGithub, FaEnvelope, FaGraduationCap, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const C = {
    blue: '#203671', blueDark: '#182858', blueLight: '#2D4899',
    blueFaint: 'rgba(32,54,113,0.12)', blueBorder: 'rgba(32,54,113,0.3)',
    white: '#FFFFFF', muted: '#8A94A8', black: '#000000',
    darkCard: '#0E1118', darkBorder: '#1A1E2E',
};

if (typeof document !== 'undefined' && !document.getElementById('footer-fonts')) {
    const l = document.createElement('link');
    l.id = 'footer-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@700;800&display=swap';
    document.head.appendChild(l);
}

const NavLink = ({ to, children }) => (
    <Link to={to} style={{ color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s', display: 'block', fontFamily: "'DM Sans', sans-serif" }}
        onMouseEnter={e => e.target.style.color = 'var(--blue-light)'}
        onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
    >
        {children}
    </Link>
);

const Footer = () => (
    <footer style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        fontFamily: "'DM Sans', sans-serif",
        color: 'var(--text-primary)',
        transition: 'background 0.3s, border-color 0.3s, color 0.3s'
    }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 32px 32px' }}>

            {/* TOP ROW — brand + columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48, flexWrap: 'wrap' }}>

                {/* Brand block */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 14px rgba(32,54,113,0.5)`, flexShrink: 0 }}>
                            <FaGraduationCap style={{ color: '#fff', fontSize: 16 }} />
                        </div>
                        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                            NIT JSR Alumni
                        </span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75, margin: '0 0 22px', maxWidth: 260 }}>
                        The official alumni network of National Institute of Technology, Jamshedpur. Connecting graduates worldwide since 2024.
                    </p>

                    {/* contact info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                            <FaMapMarkerAlt style={{ color: 'var(--blue-light)', fontSize: 11, flexShrink: 0 }} />
                            Adityapur, Jamshedpur, Jharkhand
                        </div>
                        <a href="mailto:alumni@nitjsr.ac.in" style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            <FaEnvelope style={{ color: 'var(--blue-light)', fontSize: 11, flexShrink: 0 }} />
                            alumni@nitjsr.ac.in
                        </a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                            <FaPhone style={{ color: 'var(--blue-light)', fontSize: 11, flexShrink: 0 }} />
                            +91 657 237 4000
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700, color: C.white, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 18px' }}>
                        Quick Links
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/directory">Directory</NavLink>
                        <NavLink to="/events">Events</NavLink>
                        <NavLink to="/news">Stories</NavLink>
                    </div>
                </div>

                {/* Platform */}
                <div>
                    <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700, color: C.white, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 18px' }}>
                        Platform
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                        <NavLink to="/jobs">Job Board</NavLink>
                        <NavLink to="/news">News</NavLink>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                        <NavLink to="/register">Join Now</NavLink>
                    </div>
                </div>

                {/* Support */}
                <div>
                    <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 18px' }}>
                        Support
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                        <NavLink to="/contact">Contact Us</NavLink>
                        <NavLink to="/faq">FAQ</NavLink>
                        <NavLink to="/login">Sign In</NavLink>
                    </div>
                </div>
            </div>

            {/* divider */}
            <div style={{ height: 1, background: 'var(--border)', margin: '0 0 28px' }} />

            {/* BOTTOM ROW */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                    © {new Date().getFullYear()} NIT Jamshedpur Alumni Portal. All rights reserved.
                </p>

                {/* social icons */}
                <div style={{ display: 'flex', gap: 10 }}>
                    {[
                        { href: '#', Icon: FaLinkedin, label: 'LinkedIn' },
                        { href: '#', Icon: FaGithub,   label: 'GitHub' },
                        { href: 'mailto:alumni@nitjsr.ac.in', Icon: FaEnvelope, label: 'Email' },
                    ].map(({ href, Icon, label }) => (
                        <a key={label} href={href} aria-label={label} style={{
                            width: 36, height: 36, borderRadius: 9,
                            background: 'var(--blue-faint)', border: '1px solid var(--blue-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-secondary)', fontSize: 15, textDecoration: 'none',
                            transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = `rgba(32,54,113,0.25)`; e.currentTarget.style.borderColor = C.blueLight; e.currentTarget.style.color = C.white; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = C.blueFaint; e.currentTarget.style.borderColor = C.blueBorder; e.currentTarget.style.color = C.muted; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <Icon />
                        </a>
                    ))}
                </div>

                {/* built with badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 20, background: 'var(--blue-faint)', border: '1px solid var(--blue-border)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue-light)', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>Portal is live</span>
                </div>
            </div>
        </div>

        <style>{`
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
            }
        `}</style>
    </footer>
);

export default Footer;
