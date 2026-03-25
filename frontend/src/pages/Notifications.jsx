import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { toast } from 'react-toastify';
import { FaBell, FaClock, FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
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
            setActivities(data.activities || data);
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
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const getIcon = (text) => {
        const t = text.toLowerCase();
        if (t.includes('success') || t.includes('joined') || t.includes('posted')) return <FaCheckCircle style={{ color: '#22C55E' }} />;
        if (t.includes('error') || t.includes('deleted') || t.includes('removed')) return <FaExclamationCircle style={{ color: '#EF4444' }} />;
        return <FaInfoCircle style={{ color: 'var(--blue-light)' }} />;
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: isMobile ? '32px 16px 80px' : '48px 20px 80px', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', transition: 'background 0.3s, color 0.3s' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', borderRadius: 20, padding: '5px 14px', marginBottom: 16 }}>
                        <HiSparkles style={{ color: 'var(--blue-light)', fontSize: 13 }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-light)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Updates</span>
                    </div>
                    <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 28 : 36, fontWeight: 800, margin: '0 0 10px', color: 'var(--text-primary)', letterSpacing: '-0.6px' }}>
                        Notifications
                    </h1>
                    <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', margin: 0 }}>Stay updated with your recent activities and platform news.</p>
                </div>

                {/* Content */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px var(--card-shadow)' }}>
                    {loading ? (
                        <div style={{ padding: '60px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-block', width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--blue-faint)', borderTopColor: 'var(--blue-light)', animation: 'spin 0.7s linear infinite' }} />
                        </div>
                    ) : activities.length === 0 ? (
                        <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--blue-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <FaBell style={{ fontSize: 24, color: 'var(--blue-light)' }} />
                            </div>
                            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>All caught up!</h3>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>No new notifications found in your activity log.</p>
                        </div>
                    ) : (
                        <div>
                            {activities.map((activity, idx) => (
                                <div key={activity._id} style={{ 
                                    padding: '20px 24px', 
                                    borderBottom: idx === activities.length - 1 ? 'none' : '1px solid var(--border)',
                                    display: 'flex',
                                    gap: 16,
                                    alignItems: 'flex-start',
                                    transition: 'background 0.2s',
                                    cursor: 'default'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-faint)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ 
                                        width: 40, height: 40, borderRadius: 12, 
                                        background: 'var(--bg)', border: '1px solid var(--border)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 16, flexShrink: 0
                                    }}>
                                        {getIcon(activity.text)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: 14.5, lineHeight: 1.5, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                                            {activity.text}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
                                            <FaClock style={{ fontSize: 10 }} />
                                            {formatTime(activity.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Notifications;
