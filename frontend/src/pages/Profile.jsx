import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import {
    FaEnvelope, FaPhone, FaLinkedin, FaMapMarkerAlt,
    FaBuilding, FaGraduationCap, FaArrowLeft, FaBriefcase,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const C = {
    blue: '#203671', blueDark: '#182858', blueLight: '#2D4899',
    blueFaint: 'rgba(32,54,113,0.12)', blueBorder: 'rgba(32,54,113,0.35)',
    white: '#FFFFFF', muted: '#8A94A8', black: '#000000',
    darkBg: '#0C0E14', darkCard: '#12151F', darkBorder: '#1E2235',
};

if (typeof document !== 'undefined' && !document.getElementById('profile-fonts')) {
    const l = document.createElement('link'); l.id = 'profile-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700;800&display=swap';
    document.head.appendChild(l);
    const s = document.createElement('style');
    s.textContent = `@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`;
    document.head.appendChild(s);
}

const DetailRow = ({ icon: Icon, children, href }) => {
    const content = (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: href ? C.blueLight : C.muted, padding: '8px 0' }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: C.blueFaint, border: `1px solid ${C.blueBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ fontSize: 12, color: C.blueLight }} />
            </div>
            <span>{children}</span>
        </div>
    );
    if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.75'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>{content}</a>;
    return content;
};

const Profile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchProfile(); }, [id]);

    const fetchProfile = async () => {
        try { const { data } = await API.get(`/users/${id}`); setProfile(data.user); }
        catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', border: `3px solid ${C.blueFaint}`, borderTopColor: C.blueLight, animation: 'spin 0.7s linear infinite' }} />
        </div>
    );

    if (!profile) return (
        <div style={{ minHeight: '100vh', background: C.black, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: C.blueFaint, border: `1px solid ${C.blueBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                    <FaGraduationCap style={{ color: C.blueLight, fontSize: 24 }} />
                </div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, color: C.white, margin: '0 0 10px' }}>Profile Not Found</h2>
                <Link to="/directory" style={{ color: C.blueLight, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>← Back to Directory</Link>
            </div>
        </div>
    );

    const initials = profile.name?.slice(0, 2).toUpperCase() || '??';

    return (
        <div style={{ minHeight: '100vh', background: C.black, padding: '48px 20px 72px', fontFamily: "'DM Sans', sans-serif", color: C.white }}>
            <div style={{ maxWidth: 860, margin: '0 auto' }}>

                {/* back link */}
                <Link to="/directory" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
                    color: C.muted, fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    padding: '7px 14px', borderRadius: 8,
                    background: C.darkCard, border: `1px solid ${C.darkBorder}`,
                    transition: 'border-color 0.2s, color 0.2s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.blueBorder; e.currentTarget.style.color = C.white; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.darkBorder; e.currentTarget.style.color = C.muted; }}
                >
                    <FaArrowLeft style={{ fontSize: 11 }} /> Back to Directory
                </Link>

                {/* main card */}
                <div style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', animation: 'fadeUp 0.5s ease both' }}>

                    {/* profile banner */}
                    <div style={{
                        background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
                        padding: '32px 36px', display: 'flex', alignItems: 'center', gap: 24,
                        position: 'relative', overflow: 'hidden', flexWrap: 'wrap',
                    }}>
                        <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                        <div style={{ position: 'absolute', right: 80, bottom: -60, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

                        {/* avatar */}
                        <div style={{ width: 80, height: 80, borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: C.white, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 1 }}>
                            {initials}
                        </div>

                        <div style={{ zIndex: 1 }}>
                            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: C.white, margin: '0 0 6px', letterSpacing: '-0.3px' }}>{profile.name}</p>
                            {profile.currentPosition && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: '0 0 6px', fontWeight: 500 }}>{profile.currentPosition}</p>}
                            {profile.company && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 12px' }}>
                                    <FaBuilding style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }} />
                                    <span style={{ fontSize: 12.5, color: C.white, fontWeight: 600 }}>{profile.company}</span>
                                </div>
                            )}
                        </div>

                        {/* quick actions top-right */}
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, zIndex: 1, flexWrap: 'wrap' }}>
                            {profile.email && (
                                <a href={`mailto:${profile.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.white, borderRadius: 9, padding: '9px 18px', color: C.blue, fontSize: 12, fontWeight: 800, textDecoration: 'none', boxShadow: '0 3px 14px rgba(0,0,0,0.25)', transition: 'opacity 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >
                                    <FaEnvelope style={{ fontSize: 11 }} /> Send Email
                                </a>
                            )}
                            {profile.linkedin && (
                                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 9, padding: '9px 18px', color: C.white, fontSize: 12, fontWeight: 700, textDecoration: 'none', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                >
                                    <FaLinkedin style={{ fontSize: 13 }} /> LinkedIn
                                </a>
                            )}
                        </div>
                    </div>

                    {/* body */}
                    <div style={{ padding: '32px 36px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

                            {/* LEFT — details */}
                            <div>
                                {/* about */}
                                {profile.bio && (
                                    <div style={{ marginBottom: 28 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.darkBorder}` }}>
                                            <HiSparkles style={{ color: C.blueLight, fontSize: 13 }} />
                                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: C.muted }}>About</span>
                                        </div>
                                        <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.75, margin: 0 }}>{profile.bio}</p>
                                    </div>
                                )}

                                {/* contact & info */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.darkBorder}` }}>
                                        <FaEnvelope style={{ color: C.blueLight, fontSize: 11 }} />
                                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: C.muted }}>Contact & Details</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {profile.email    && <DetailRow icon={FaEnvelope}     href={`mailto:${profile.email}`}>{profile.email}</DetailRow>}
                                        {profile.phone    && <DetailRow icon={FaPhone}        >{profile.phone}</DetailRow>}
                                        {profile.location && <DetailRow icon={FaMapMarkerAlt} >{profile.location}</DetailRow>}
                                        {profile.department && (
                                            <DetailRow icon={FaGraduationCap}>
                                                {profile.department}{profile.graduationYear ? ` — Class of ${profile.graduationYear}` : ''}
                                            </DetailRow>
                                        )}
                                        {profile.yearsOfExperience !== undefined && profile.yearsOfExperience > 0 && (
                                            <DetailRow icon={FaBriefcase}>{profile.yearsOfExperience} years of experience</DetailRow>
                                        )}
                                        {profile.linkedin && <DetailRow icon={FaLinkedin} href={profile.linkedin}>LinkedIn Profile</DetailRow>}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT — skills */}
                            {profile.skills?.length > 0 && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.darkBorder}` }}>
                                        <FaBriefcase style={{ color: C.blueLight, fontSize: 11 }} />
                                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: C.muted }}>Skills</span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {profile.skills.map((skill, i) => (
                                            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', background: C.blueFaint, border: `1px solid ${C.blueBorder}`, borderRadius: 8, padding: '6px 13px', fontSize: 12.5, color: C.blueLight, fontWeight: 600 }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
