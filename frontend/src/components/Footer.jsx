import { Link } from 'react-router-dom';
import { FaLinkedin, FaGithub, FaEnvelope, FaGraduationCap, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const C = {
    blue:       'var(--blue)',
    blueDark:   'var(--blue-dark)',
    blueLight:  'var(--blue-light)',
    blueFaint:  'var(--blue-faint)',
    blueBorder: 'var(--blue-border)',
    white:      'var(--text-primary)',
    muted:      'var(--text-secondary)',
    black:      'var(--bg)',
    darkBg:     'var(--bg)',
    darkCard:   'var(--bg-secondary)',
    darkBorder: 'var(--border)',
};

if (typeof document !== 'undefined' && !document.getElementById('footer-styles')) {
    const l = document.createElement('link');
    l.id = 'footer-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@700;800&display=swap';
    document.head.appendChild(l);

    const s = document.createElement('style'); s.id = 'footer-styles';
    s.textContent = `
        .ft-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 48px;
            margin-bottom: 48px;
        }
        .ft-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
        }
        .ft-link {
            color: #8A94A8;
            font-size: 13px;
            text-decoration: none;
            display: block;
            font-family: "DM Sans", sans-serif;
            transition: color 0.2s;
            padding: 2px 0;
        }
        .ft-link:hover { color: var(--text-primary); }

        /* tablet: 2-col grid */
        @media (max-width: 860px) {
            .ft-grid {
                grid-template-columns: 1fr 1fr;
                gap: 36px;
            }
            .ft-brand { grid-column: 1 / -1; }
        }

        /* mobile: single column */
        @media (max-width: 520px) {
            .ft-grid {
                grid-template-columns: 1fr;
                gap: 28px;
            }
            .ft-brand { grid-column: auto; }
            .ft-pad { padding: 40px 20px 28px !important; }
            .ft-bottom {
                flex-direction: column;
                align-items: flex-start;
                gap: 14px;
            }
            .ft-col-title { font-size: 11px !important; }
        }

        /* keep bottom badge from wrapping oddly on mid-size */
        @media (max-width: 680px) and (min-width: 521px) {
            .ft-live-badge { display: none !important; }
        }

        @keyframes ft-pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.4; }
        }
    `;
    document.head.appendChild(s);
}

const NavLink = ({ to, children }) => (
    <Link to={to} className="ft-link">{children}</Link>
);

const ColTitle = ({ children }) => (
    <h4 className="ft-col-title" style={{
        fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700,
        color: C.white, letterSpacing: '0.12em', textTransform: 'uppercase',
        margin: '0 0 16px',
    }}>
        {children}
    </h4>
);

const Footer = () => {
    return (
        <footer style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
            fontFamily: "'DM Sans', sans-serif",
            color: 'var(--text-primary)',
            transition: 'background 0.3s, border-color 0.3s, color 0.3s'
        }}>
        <div className="ft-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 32px 32px' }}>

            {/* ── TOP GRID ── */}
            <div className="ft-grid">

                {/* Brand */}
                <div className="ft-brand">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 14px rgba(32,54,113,0.5)`, flexShrink: 0 }}>
                            <FaGraduationCap style={{ color: '#FFFFFF', fontSize: 16 }} />
                        </div>
                        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: C.white, letterSpacing: '-0.2px' }}>
                            NIT JSR Alumni
                        </span>
                    </div>

                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, margin: '0 0 20px', maxWidth: 300 }}>
                        The official alumni network of National Institute of Technology, Jamshedpur. Connecting graduates worldwide since 2024.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: C.muted }}>
                            <FaMapMarkerAlt style={{ color: C.blueLight, fontSize: 11, flexShrink: 0 }} />
                            Adityapur, Jamshedpur, Jharkhand
                        </div>
                        <a href="mailto:alumni@nitjsr.ac.in" style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: C.muted, textDecoration: 'none', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = C.white}
                            onMouseLeave={e => e.currentTarget.style.color = C.muted}
                        >
                            <FaEnvelope style={{ color: C.blueLight, fontSize: 11, flexShrink: 0 }} />
                            alumni@nitjsr.ac.in
                        </a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: C.muted }}>
                            <FaPhone style={{ color: C.blueLight, fontSize: 11, flexShrink: 0 }} />
                            +91 657 237 4000
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <ColTitle>Quick Links</ColTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/directory">Directory</NavLink>
                        <NavLink to="/events">Events</NavLink>
                        <NavLink to="/news">Stories</NavLink>
                    </div>
                </div>

                {/* Platform */}
                <div>
                    <ColTitle>Platform</ColTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                        <NavLink to="/jobs">Job Board</NavLink>
                        <NavLink to="/news">News</NavLink>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                        <NavLink to="/register">Join Now</NavLink>
                    </div>
                </div>

                {/* Support */}
                <div>
                    <ColTitle>Support</ColTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                        <NavLink to="/contact">Contact Us</NavLink>
                        <NavLink to="/faq">FAQ</NavLink>
                        <NavLink to="/login">Sign In</NavLink>
                    </div>
                </div>
            </div>

            {/* divider */}
            <div style={{ height: 1, background: C.darkBorder, margin: '0 0 24px' }} />

            {/* ── BOTTOM ROW ── */}
            <div className="ft-bottom">
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                    © {new Date().getFullYear()} NIT Jamshedpur Alumni Portal. All rights reserved.
                </p>

                {/* social icons */}
                <div style={{ display: 'flex', gap: 9 }}>
                    {[
                        { href: '#',                           Icon: FaLinkedin, label: 'LinkedIn' },
                        { href: '#',                           Icon: FaGithub,   label: 'GitHub'   },
                        { href: 'mailto:alumni@nitjsr.ac.in', Icon: FaEnvelope, label: 'Email'    },
                    ].map(({ href, Icon, label }) => (
                        <a key={label} href={href} aria-label={label} style={{
                            width: 36, height: 36, borderRadius: 9,
                            background: C.blueFaint, border: `1px solid ${C.blueBorder}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: C.muted, fontSize: 15, textDecoration: 'none',
                            transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(32,54,113,0.25)'; e.currentTarget.style.borderColor = C.blueLight; e.currentTarget.style.color = C.white; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = C.blueFaint; e.currentTarget.style.borderColor = C.blueBorder; e.currentTarget.style.color = C.muted; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <Icon />
                        </a>
                    ))}
                </div>

                {/* live badge — hidden on mid-narrow screens to avoid crowding */}
                <div className="ft-live-badge" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 20, background: C.blueFaint, border: `1px solid ${C.blueBorder}` }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.blueLight, animation: 'ft-pulse 2s infinite' }} />
                    <span style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>Portal is live</span>
                </div>
            </div>
        </div>
    </footer>
    );
};

export default Footer;