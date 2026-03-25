import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import PhotoUploadModal from '../components/PhotoUploadModal';
import {
    FaEnvelope, FaPhone, FaLinkedin, FaMapMarkerAlt,
    FaBuilding, FaGraduationCap, FaArrowLeft, FaBriefcase, FaCamera,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import useIsMobile from '../hooks/useIsMobile';

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: href ? 'var(--blue-light)' : 'var(--text-muted)', padding: '8px 0' }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ fontSize: 12, color: 'var(--blue-light)' }} />
            </div>
            <span>{children}</span>
        </div>
    );
    if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.75'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>{content}</a>;
    return content;
};

const Profile = () => {
    const { id } = useParams();
    const { user, setUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const isMobile = useIsMobile();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => { fetchProfile(); }, [id]);

    const fetchProfile = async () => {
        try { const { data } = await API.get(`/users/${id}`); setProfile(data.user); }
        catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', border: '3px solid var(--blue-faint)', borderTopColor: 'var(--blue-light)', animation: 'spin 0.7s linear infinite' }} />
        </div>
    );

    if (!profile) return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.3s' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                    <FaGraduationCap style={{ color: 'var(--blue-light)', fontSize: 24 }} />
                </div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>Profile Not Found</h2>
                <Link to="/directory" style={{ color: 'var(--blue-light)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>← Back to Directory</Link>
            </div>
        </div>
    );

    const initials = profile.name?.slice(0, 2).toUpperCase() || '??';
    const isOwnProfile = user && profile && user._id === profile._id;

    const handleUploadSuccess = (newImageUrl) => {
        setProfile((prev) => ({ ...prev, profileImage: newImageUrl }));
        if (isOwnProfile) {
            const updatedUser = { ...user, profileImage: newImageUrl };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: isMobile ? '32px 16px 56px' : '48px 20px 72px', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', transition: 'background 0.3s, color 0.3s' }}>
            <div style={{ maxWidth: 860, margin: '0 auto' }}>
                <PhotoUploadModal 
                    isOpen={isUploadModalOpen} 
                    onClose={() => setIsUploadModalOpen(false)} 
                    userId={profile._id}
                    onUploadSuccess={handleUploadSuccess}
                />


                {/* back link */}
                <button onClick={() => navigate(location.state?.from || '/directory', { state: location.state })} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
                    color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    transition: 'border-color 0.2s, color 0.2s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue-border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                    <FaArrowLeft style={{ fontSize: 11 }} /> {location.state?.from === '/messages' ? 'Back to Messages' : 'Back to Directory'}
                </button>

                {/* main card */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 64px var(--card-shadow)', animation: 'fadeUp 0.5s ease both', transition: 'background 0.3s, border-color 0.3s' }}>

                    {/* profile banner */}
                    <div style={{
                        background: `linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%)`,
                        padding: isMobile ? '24px 20px' : '32px 36px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 16 : 24,
                        position: 'relative', overflow: 'hidden', flexWrap: 'wrap',
                        flexDirection: isMobile ? 'column' : 'row',
                    }}>
                        <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                        <div style={{ position: 'absolute', right: 80, bottom: -60, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

                        {/* avatar */}
                        <div 
                            onClick={() => isOwnProfile && setIsUploadModalOpen(true)}
                            className="profile-avatar-container"
                            style={{ 
                                width: isMobile ? 64 : 80, height: isMobile ? 64 : 80, borderRadius: '50%', flexShrink: 0, 
                                background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.3)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif", 
                                fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', 
                                zIndex: 1, position: 'relative', overflow: 'hidden', cursor: isOwnProfile ? 'pointer' : 'default',
                                backgroundImage: profile.profileImage ? `url(${profile.profileImage})` : 'none',
                                backgroundSize: 'cover', backgroundPosition: 'center'
                            }}
                        >
                            {!profile.profileImage && initials}
                            {isOwnProfile && (
                                <div className="profile-camera-overlay" style={{
                                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s'
                                }}>
                                    <FaCamera style={{ fontSize: 20, color: '#fff' }} />
                                </div>
                            )}
                        </div>
                        <style>{`
                            .profile-avatar-container:hover .profile-camera-overlay { opacity: 1 !important; }
                        `}</style>

                        <div style={{ zIndex: 1 }}>
                            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 20 : 24, fontWeight: 800, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.3px' }}>{profile.name}</p>
                            {profile.currentPosition && <p style={{ fontSize: isMobile ? 13 : 14, color: 'rgba(255,255,255,0.85)', margin: '0 0 6px', fontWeight: 500 }}>{profile.currentPosition}</p>}
                            {profile.company && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 12px' }}>
                                    <FaBuilding style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }} />
                                    <span style={{ fontSize: 12.5, color: '#fff', fontWeight: 600 }}>{profile.company}</span>
                                </div>
                            )}
                        </div>

                        {/* quick actions */}
                        <div style={{ marginLeft: isMobile ? 0 : 'auto', display: 'flex', gap: 10, zIndex: 1, flexWrap: 'wrap' }}>
                            {profile.email && (
                                <a href={`mailto:${profile.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', borderRadius: 9, padding: '9px 18px', color: 'var(--blue)', fontSize: 12, fontWeight: 800, textDecoration: 'none', boxShadow: '0 3px 14px rgba(0,0,0,0.25)', transition: 'opacity 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >
                                    <FaEnvelope style={{ fontSize: 11 }} /> Send Email
                                </a>
                            )}
                            {profile.linkedin && (
                                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 9, padding: '9px 18px', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                >
                                    <FaLinkedin style={{ fontSize: 13 }} /> LinkedIn
                                </a>
                            )}
                        </div>
                    </div>

                    {/* body */}
                    <div style={{ padding: isMobile ? '24px 20px' : '32px 36px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 24 : 32, alignItems: 'start' }}>

                            {/* LEFT — details */}
                            <div>
                                {/* about */}
                                {profile.bio && (
                                    <div style={{ marginBottom: 28 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                                            <HiSparkles style={{ color: 'var(--blue-light)', fontSize: 13 }} />
                                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>About</span>
                                        </div>
                                        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.75, margin: 0 }}>{profile.bio}</p>
                                    </div>
                                )}

                                {/* contact & info */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                                        <FaEnvelope style={{ color: 'var(--blue-light)', fontSize: 11 }} />
                                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Contact & Details</span>
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                                        <FaBriefcase style={{ color: 'var(--blue-light)', fontSize: 11 }} />
                                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Skills</span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {profile.skills.map((skill, i) => (
                                            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', borderRadius: 8, padding: '6px 13px', fontSize: 12.5, color: 'var(--blue-light)', fontWeight: 600 }}>
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
