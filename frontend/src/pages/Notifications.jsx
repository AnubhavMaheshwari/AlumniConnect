import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { toast } from 'react-toastify';
import {
  LuBell,
  LuClock,
  LuCircleCheck,
  LuCircleAlert,
  LuInfo
} from 'react-icons/lu';
import useIsMobile from '../hooks/useIsMobile';

const Notifications = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/activity');
      setActivities(data.activities || data || []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = (now - d) / 1000;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusIcon = (text) => {
    const t = text.toLowerCase();
    if (t.includes('success') || t.includes('joined') || t.includes('posted')) {
      return <LuCircleCheck size={18} style={{ color: '#10b981' }} />;
    }
    if (t.includes('error') || t.includes('deleted') || t.includes('removed')) {
      return <LuCircleAlert size={18} style={{ color: '#ef4444' }} />;
    }
    return <LuInfo size={18} style={{ color: 'var(--primary)' }} />;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--page)',
        padding: isMobile ? '32px 16px 80px' : '36px 20px 80px',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(224, 122, 63, 0.12)',
              color: 'var(--color-accent)',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
              marginBottom: 10,
            }}
          >
            <LuBell size={13} style={{ color: 'var(--primary)' }} />
            ACTIVITY NOTIFICATIONS
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: isMobile ? 26 : 30,
              fontWeight: 800,
              margin: '0 0 6px',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px',
            }}
          >
            Notifications & Feed
          </h1>
          <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', margin: 0 }}>
            Stay updated with replies, RSVPs, batch messages, and alumni events.
          </p>
        </div>

        {/* Content Box */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card, 12px)',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          {loading ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-block',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '3px solid var(--border)',
                  borderTopColor: 'var(--primary)',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : activities.length === 0 ? (
            <div style={{ padding: '64px 32px', textAlign: 'center' }}>
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
                <LuBell size={24} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 17,
                  fontWeight: 700,
                  margin: '0 0 6px',
                  color: 'var(--text-primary)',
                }}
              >
                All caught up!
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>
                No unread notifications at the moment.
              </p>
            </div>
          ) : (
            <div>
              {activities.map((activity, idx) => (
                <div
                  key={activity._id || idx}
                  style={{
                    padding: '18px 24px',
                    borderBottom: idx === activities.length - 1 ? 'none' : '1px solid var(--border)',
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--panel)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getStatusIcon(activity.text || '')}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, lineHeight: 1.5, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                      {activity.text}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        color: 'var(--text-muted)',
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      <LuClock size={12} />
                      {formatTime(activity.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
