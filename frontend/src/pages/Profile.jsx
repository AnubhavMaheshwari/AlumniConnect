import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import PhotoUploadModal from '../components/PhotoUploadModal';
import {
  LuMail,
  LuPhone,
  LuLinkedin,
  LuMapPin,
  LuBuilding,
  LuGraduationCap,
  LuArrowLeft,
  LuBriefcase,
  LuCamera,
  LuCircleCheck,
  LuExternalLink,
  LuX,
  LuUser,
  LuMessageSquare
} from 'react-icons/lu';
import useIsMobile from '../hooks/useIsMobile';

const DetailRow = ({ icon: Icon, children, href }) => {
  const content = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 13.5,
        color: href ? 'var(--primary)' : 'var(--text-secondary)',
        padding: '10px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'var(--primary)',
        }}
      >
        <Icon size={14} />
      </div>
      <span style={{ wordBreak: 'break-word' }}>{children}</span>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', transition: 'opacity 0.15s ease' }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        {content}
      </a>
    );
  }
  return content;
};

const Profile = () => {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get(`/users/${id}`);
      setProfile(data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '80vh',
          background: 'var(--page)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        style={{
          minHeight: '80vh',
          background: 'var(--page)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card, 12px)',
            padding: '48px 32px',
            maxWidth: 420,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--text-muted)',
            }}
          >
            <LuGraduationCap size={24} />
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 19,
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 8px',
            }}
          >
            Profile Not Found
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
            The alumni profile you are searching for does not exist or has been made private.
          </p>
          <Link
            to="/directory"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 18px',
              borderRadius: 'var(--radius-button, 8px)',
              background: 'var(--primary)',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <LuArrowLeft size={14} /> Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const initials = profile.name?.slice(0, 2).toUpperCase() || 'AL';
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
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--page)',
        padding: isMobile ? '24px 16px 64px' : '36px 20px 80px',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        <PhotoUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          userId={profile._id}
          onUploadSuccess={handleUploadSuccess}
        />

        {/* Back Link */}
        <button
          onClick={() => navigate(location.state?.from || '/directory', { state: location.state })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 600,
            padding: '7px 14px',
            borderRadius: 'var(--radius-button, 8px)',
            cursor: 'pointer',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            transition: 'border-color 0.15s ease',
          }}
        >
          <LuArrowLeft size={14} />{' '}
          {location.state?.from === '/messages' ? 'Back to Messages' : 'Back to Alumni Directory'}
        </button>

        {/* Main Card */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card, 12px)',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1E3A5F 0%, #152840 100%)',
              color: '#ffffff',
              padding: isMobile ? '28px 20px' : '36px 32px',
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? 16 : 24,
              flexWrap: 'wrap',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            {/* Avatar */}
            <div
              onClick={() => {
                if (profile.profileImage) setPreviewImage(profile.profileImage);
              }}
              style={{
                width: isMobile ? 72 : 84,
                height: isMobile ? 72 : 84,
                borderRadius: '50%',
                flexShrink: 0,
                background: '#FFFFFF',
                border: '3px solid rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? 24 : 28,
                fontWeight: 800,
                color: '#1E3A5F',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                cursor: profile.profileImage ? 'zoom-in' : 'default',
              }}
            >
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initials
              )}

              {isOwnProfile && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUploadModalOpen(true);
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                >
                  <LuCamera size={22} style={{ color: '#fff' }} />
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: isMobile ? 22 : 26,
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: '0 0 6px',
                  letterSpacing: '-0.3px',
                }}
              >
                {profile.name || 'Alumni Member'}
              </h1>

              {profile.currentPosition && (
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.92)', margin: '0 0 8px', fontWeight: 500 }}>
                  {profile.currentPosition}
                </p>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {profile.company && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(255,255,255,0.18)',
                      borderRadius: 16,
                      padding: '3px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <LuBuilding size={12} />
                    {profile.company}
                  </span>
                )}

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: 'rgba(224, 122, 63, 0.25)',
                    color: '#ffffff',
                    borderRadius: 16,
                    padding: '3px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <LuCircleCheck size={12} style={{ color: 'var(--primary)' }} />
                  {profile.role === 'admin' ? 'Administrator' : profile.role || 'Alumni'}
                </span>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {!isOwnProfile && (
                <button
                  type="button"
                  onClick={() => navigate('/messages', { state: { userId: profile._id } })}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--color-accent, #E07A3F)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-button, 8px)',
                    padding: '9px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <LuMessageSquare size={14} /> Message
                </button>
              )}

              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: isOwnProfile ? 'var(--color-accent, #E07A3F)' : 'rgba(255,255,255,0.18)',
                    border: isOwnProfile ? 'none' : '1px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-button, 8px)',
                    padding: '9px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <LuMail size={14} /> Send Email
                </a>
              )}

              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 'var(--radius-button, 8px)',
                    padding: '9px 16px',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <LuLinkedin size={14} /> LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Body Section */}
          <div style={{ padding: isMobile ? '24px 20px' : '32px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',
                gap: 32,
              }}
            >
              {/* Left Column: Details */}
              <div>
                {profile.bio && (
                  <div style={{ marginBottom: 28 }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        margin: '0 0 12px',
                      }}
                    >
                      About
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                      {profile.bio}
                    </p>
                  </div>
                )}

                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      margin: '0 0 8px',
                    }}
                  >
                    Directory Information
                  </h3>
                  <div>
                    {profile.department && (
                      <DetailRow icon={LuGraduationCap}>
                        {profile.department}
                        {profile.graduationYear ? ` &bull; Class of ${profile.graduationYear}` : ''}
                      </DetailRow>
                    )}
                    {profile.email && (
                      <DetailRow icon={LuMail} href={`mailto:${profile.email}`}>
                        {profile.email}
                      </DetailRow>
                    )}
                    {profile.phone && <DetailRow icon={LuPhone}>{profile.phone}</DetailRow>}
                    {profile.location && <DetailRow icon={LuMapPin}>{profile.location}</DetailRow>}
                    {(profile.country || profile.zipCode) && (
                      <DetailRow icon={LuMapPin}>
                        {[profile.country, profile.zipCode].filter(Boolean).join(', ')}
                      </DetailRow>
                    )}
                    {profile.yearsOfExperience !== undefined && profile.yearsOfExperience > 0 && (
                      <DetailRow icon={LuBriefcase}>{profile.yearsOfExperience} years of experience</DetailRow>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Skills */}
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    margin: '0 0 14px',
                  }}
                >
                  Expertise & Skills
                </h3>

                {profile.skills?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {profile.skills.map((skill, i) => (
                      <span
                        key={i}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: 'var(--panel)',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          padding: '5px 12px',
                          fontSize: 12.5,
                          color: 'var(--text-secondary)',
                          fontWeight: 500,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                    No specific skills or technologies listed.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 30,
            cursor: 'zoom-out',
          }}
        >
          <img
            src={previewImage}
            alt="Profile Preview"
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          />
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <LuX size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
