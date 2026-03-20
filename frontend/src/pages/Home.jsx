import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    FaBriefcase, FaCalendarAlt, FaNewspaper, FaUsers,
    FaQuestionCircle, FaArrowRight, FaGraduationCap,
    FaLinkedin, FaHandshake, FaGlobe,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

/* ── tokens ──────────────────────────────────────────────────────────────── */
const C = {
    blue: '#203671', blueDark: '#182858', blueLight: '#2D4899',
    blueFaint: 'rgba(32,54,113,0.12)', blueBorder: 'rgba(32,54,113,0.35)',
    white: '#FFFFFF', muted: '#8A94A8', black: '#000000',
    darkBg: '#0C0E14', darkCard: '#12151F', darkBorder: '#1E2235',
};

/* ── font + keyframes injection ──────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('home-styles')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@400;600;700;800&display=swap';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.id = 'home-styles';
    style.textContent = `
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes pulse-ring { 0% { transform: scale(0.9); opacity:0.6; } 100% { transform: scale(1.6); opacity:0; } }
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
            0%   { background-position: -200% center; }
            100% { background-position:  200% center; }
        }
        .nav-link { color: #8A94A8; text-decoration: none; font-size: 13.5px; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: #FFFFFF; }
        .feature-card { transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s; }
        .feature-card:hover { border-color: rgba(32,54,113,0.5) !important; box-shadow: 0 12px 40px rgba(32,54,113,0.22) !important; transform: translateY(-3px); }
        .stat-card { transition: border-color 0.25s, background 0.25s; }
        .stat-card:hover { border-color: rgba(32,54,113,0.4) !important; background: #161A28 !important; }
        .primary-btn { transition: opacity 0.2s, transform 0.15s; }
        .primary-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .ghost-btn { transition: background 0.2s, border-color 0.2s; }
        .ghost-btn:hover { background: rgba(32,54,113,0.12) !important; border-color: rgba(32,54,113,0.5) !important; }
    `;
    document.head.appendChild(style);
}

/* ── nav ─────────────────────────────────────────────────────────────────── */
const Navbar = ({ user }) => (
    <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.darkBorder}`,
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 12px rgba(32,54,113,0.5)` }}>
                <FaGraduationCap style={{ color: C.white, fontSize: 15 }} />
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: C.white, letterSpacing: '-0.2px' }}>
                NIT JSR Alumni
            </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {[['/', 'Home'], ['/directory', 'Directory'], ['/jobs', 'Jobs'], ['/events', 'Events'], ['/news', 'Stories'], ['/faq', 'FAQ']].map(([href, label]) => (
                <Link key={href} to={href} className="nav-link">{label}</Link>
            ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user ? (
                <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`, borderRadius: 8, padding: '8px 18px', color: C.white, fontSize: 12.5, fontWeight: 700, textDecoration: 'none', boxShadow: `0 3px 12px rgba(32,54,113,0.4)` }}>
                    Dashboard
                </Link>
            ) : (
                <>
                    <Link to="/login" style={{ color: C.muted, fontSize: 13, fontWeight: 500, textDecoration: 'none', padding: '8px 14px' }} className="nav-link">Sign In</Link>
                    <Link to="/register" className="primary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`, borderRadius: 8, padding: '8px 18px', color: C.white, fontSize: 12.5, fontWeight: 700, textDecoration: 'none', boxShadow: `0 3px 12px rgba(32,54,113,0.4)` }}>
                        Join Now
                    </Link>
                </>
            )}
        </div>
    </nav>
);

/* ── hero ────────────────────────────────────────────────────────────────── */
const Hero = ({ user }) => (
    <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 20px 80px', position: 'relative', overflow: 'hidden',
        background: C.black,
    }}>
        {/* background grid */}
        <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `
                linear-gradient(rgba(32,54,113,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(32,54,113,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
        }} />
        {/* radial glow */}
        <div style={{
            position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
            width: 700, height: 400, borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(32,54,113,0.18) 0%, transparent 70%)`,
            pointerEvents: 'none',
        }} />

        {/* floating orbs */}
        {[
            { size: 220, top: '8%',  right: '5%',  opacity: 0.07, delay: '0s' },
            { size: 140, top: '60%', left: '3%',   opacity: 0.05, delay: '1.5s' },
            { size: 90,  top: '30%', right: '18%', opacity: 0.09, delay: '0.8s' },
        ].map((orb, i) => (
            <div key={i} style={{
                position: 'absolute', width: orb.size, height: orb.size,
                top: orb.top, left: orb.left, right: orb.right,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(45,72,153,${orb.opacity * 2}) 0%, transparent 70%)`,
                border: `1px solid rgba(32,54,113,${orb.opacity})`,
                animation: `float 6s ease-in-out infinite`,
                animationDelay: orb.delay,
                pointerEvents: 'none',
            }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 780 }}>
            {/* badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.blueFaint, border: `1px solid ${C.blueBorder}`, borderRadius: 20, padding: '6px 16px', marginBottom: 28, animation: 'fadeUp 0.6s ease both' }}>
                <HiSparkles style={{ color: C.blueLight, fontSize: 13 }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: C.blueLight, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Official Alumni Portal · Est. 2026
                </span>
            </div>

            {/* headline */}
            <h1 style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 'clamp(36px, 6vw, 72px)',
                fontWeight: 800, color: C.white,
                lineHeight: 1.1, margin: '0 0 24px',
                letterSpacing: '-1.5px',
                animation: 'fadeUp 0.7s ease 0.1s both',
            }}>
                Where NIT Jamshedpur<br />
                <span style={{
                    background: `linear-gradient(135deg, #FFFFFF 0%, ${C.blueLight} 40%, #6B8FE8 100%)`,
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    animation: 'shimmer 4s linear infinite',
                }}>Alumni Connect</span>
            </h1>

            {/* subtext */}
            <p style={{
                fontSize: 17, color: C.muted, lineHeight: 1.75,
                maxWidth: 560, margin: '0 auto 40px',
                animation: 'fadeUp 0.7s ease 0.2s both',
            }}>
                The official network for graduates of NIT Jamshedpur. Discover opportunities, share your story, attend events, and give back to your alma mater.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.7s ease 0.3s both' }}>
                <Link to={user ? '/directory' : '/register'} className="primary-btn" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 9,
                    background: `linear-gradient(135deg, ${C.blueLight} 0%, ${C.blue} 100%)`,
                    borderRadius: 10, padding: '14px 30px',
                    color: C.white, fontSize: 14, fontWeight: 700,
                    textDecoration: 'none', letterSpacing: '0.04em',
                    boxShadow: `0 6px 28px rgba(32,54,113,0.5)`,
                }}>
                    {user ? 'Explore Directory' : 'Join the Network'}
                    <FaArrowRight style={{ fontSize: 12 }} />
                </Link>
                <Link to="/jobs" className="ghost-btn" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 9,
                    background: 'transparent',
                    border: `1px solid ${C.darkBorder}`,
                    borderRadius: 10, padding: '14px 30px',
                    color: C.white, fontSize: 14, fontWeight: 600,
                    textDecoration: 'none',
                }}>
                    Browse Jobs <FaBriefcase style={{ fontSize: 12 }} />
                </Link>
            </div>

            {/* trust row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginTop: 56, flexWrap: 'wrap', animation: 'fadeUp 0.7s ease 0.45s both' }}>
                {[['500+', 'Alumni Members'], ['50+', 'Job Postings'], ['30+', 'Events Hosted'], ['1960', 'Est. Year']].map(([num, label]) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: C.white, lineHeight: 1 }}>{num}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

/* ── features grid ───────────────────────────────────────────────────────── */
const features = [
    { icon: FaUsers,        title: 'Alumni Directory',   desc: 'Search and connect with NIT JSR graduates by department, batch, company, or skill set.', href: '/directory',  label: 'Browse Directory' },
    { icon: FaBriefcase,    title: 'Job Board',          desc: 'Discover and post career opportunities exclusively within the NIT Jamshedpur alumni network.', href: '/jobs', label: 'View Jobs' },
    { icon: FaCalendarAlt,  title: 'Events & Reunions',  desc: 'RSVP to upcoming gatherings, workshops, seminars, and batch reunions.', href: '/events',     label: 'See Events' },
    { icon: FaNewspaper,    title: 'News & Stories',     desc: 'Share achievements, read inspiring alumni journeys, and stay updated with institute news.', href: '/news', label: 'Read Stories' },
    { icon: FaHandshake,    title: 'Mentorship',         desc: 'Connect with experienced alumni for guidance on career growth and industry transitions.', href: '/directory', label: 'Find a Mentor' },
    { icon: FaQuestionCircle, title: 'Help & FAQ',       desc: 'Everything you need to get started — registration, profile setup, and portal features.', href: '/faq',       label: 'Read FAQ' },
];

const Features = () => (
    <section style={{ background: C.black, padding: '80px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.blueFaint, border: `1px solid ${C.blueBorder}`, borderRadius: 20, padding: '5px 14px', marginBottom: 18 }}>
                    <FaGlobe style={{ color: C.blueLight, fontSize: 12 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.blueLight, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Everything in One Place</span>
                </div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: C.white, margin: '0 0 14px', letterSpacing: '-0.6px' }}>
                    Built for the Alumni Community
                </h2>
                <p style={{ fontSize: 15, color: C.muted, maxWidth: 500, margin: '0 auto' }}>
                    Every feature designed to strengthen the bond between NIT Jamshedpur graduates worldwide.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {features.map(f => (
                    <div key={f.title} className="feature-card" style={{
                        background: C.darkCard, border: `1px solid ${C.darkBorder}`,
                        borderRadius: 14, padding: '26px 26px 22px',
                        cursor: 'pointer',
                    }}>
                        <div style={{ width: 44, height: 44, borderRadius: 11, background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: `0 4px 16px rgba(32,54,113,0.45)` }}>
                            <f.icon style={{ color: C.white, fontSize: 17 }} />
                        </div>
                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: C.white, margin: '0 0 10px' }}>{f.title}</h3>
                        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: '0 0 18px' }}>{f.desc}</p>
                        <Link to={f.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C.blueLight, textDecoration: 'none', letterSpacing: '0.04em' }}>
                            {f.label} <FaArrowRight style={{ fontSize: 10 }} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

/* ── stats banner ────────────────────────────────────────────────────────── */
const Stats = () => (
    <section style={{ background: C.darkCard, borderTop: `1px solid ${C.darkBorder}`, borderBottom: `1px solid ${C.darkBorder}`, padding: '64px 20px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
            {[
                { num: '1960', label: 'Founded', sub: 'Formerly RIT Jamshedpur' },
                { num: '60+',  label: 'Years Legacy', sub: 'Of engineering excellence' },
                { num: '500+', label: 'Registered Alumni', sub: 'And growing daily' },
                { num: '20+',  label: 'Departments', sub: 'Across all disciplines' },
                { num: '100%', label: 'Free to Join', sub: 'No membership fees' },
            ].map(s => (
                <div key={s.label} className="stat-card" style={{
                    textAlign: 'center', padding: '28px 20px',
                    borderRadius: 12, background: 'transparent',
                    border: '1px solid transparent',
                    cursor: 'default',
                }}>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 36, fontWeight: 800, color: C.white, lineHeight: 1, marginBottom: 6 }}>
                        {s.num}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.blueLight, marginBottom: 4, letterSpacing: '0.04em' }}>{s.label}</div>
                    <div style={{ fontSize: 11.5, color: C.muted }}>{s.sub}</div>
                </div>
            ))}
        </div>
    </section>
);

/* ── CTA strip ───────────────────────────────────────────────────────────── */
const CTAStrip = ({ user }) => (
    <section style={{ background: C.black, padding: '80px 20px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <div style={{
                background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
                borderRadius: 20, padding: '56px 48px',
                position: 'relative', overflow: 'hidden',
                boxShadow: `0 24px 64px rgba(32,54,113,0.4)`,
            }}>
                {/* decorative circles */}
                <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'absolute', left: -20, bottom: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <FaGraduationCap style={{ color: C.white, fontSize: 24 }} />
                    </div>
                    <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 30, fontWeight: 800, color: C.white, margin: '0 0 14px', letterSpacing: '-0.4px' }}>
                        {user ? 'Welcome back!' : 'Ready to reconnect?'}
                    </h2>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', margin: '0 0 32px', lineHeight: 1.65 }}>
                        {user
                            ? 'Your alumni network is waiting. Explore jobs, events, and connect with fellow graduates.'
                            : 'Join thousands of NIT Jamshedpur alumni already on the platform. Registration is free and takes under a minute.'
                        }
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to={user ? '/directory' : '/register'} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: C.white, borderRadius: 10, padding: '13px 28px',
                            color: C.blue, fontSize: 13.5, fontWeight: 800,
                            textDecoration: 'none', letterSpacing: '0.03em',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                            transition: 'opacity 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            {user ? 'Browse Directory' : 'Create Free Account'}
                            <FaArrowRight style={{ fontSize: 11 }} />
                        </Link>
                        {!user && (
                            <Link to="/login" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: 10, padding: '13px 28px',
                                color: C.white, fontSize: 13.5, fontWeight: 600,
                                textDecoration: 'none',
                                transition: 'border-color 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </section>
);

/* ── footer ──────────────────────────────────────────────────────────────── */
const Footer = () => (
    <footer style={{ background: C.darkCard, borderTop: `1px solid ${C.darkBorder}`, padding: '' }}>
        
    </footer>
);

/* ── main ────────────────────────────────────────────────────────────────── */
const Home = () => {
    const { user } = useAuth();

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.black, color: C.white }}>
            <Navbar user={user} />
            <Hero user={user} />
            <Features />
            <Stats />
            <CTAStrip user={user} />
            <Footer />
        </div>
    );
};

export default Home;
