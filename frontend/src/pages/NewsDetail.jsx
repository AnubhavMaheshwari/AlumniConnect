import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
    FaArrowLeft, FaRegClock, FaUserAlt, FaShareAlt, 
    FaTag, FaBookmark, FaHeart, FaComment
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNewsItem();
    }, [id]);

    const fetchNewsItem = async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/news/${id}`);
            setItem(data.news);
        } catch (err) {
            toast.error('Failed to load story');
            navigate('/news');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <div style={{ width: 45, height: 45, borderRadius: '50%', border: '3px solid var(--blue-faint)', borderTopColor: 'var(--blue-light)', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!item) return null;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>
            {/* ARTICLE HEADER */}
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '120px 24px 60px' }}>
                <Link to="/news" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 700, marginBottom: 40, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--blue-light)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                    <FaArrowLeft style={{ fontSize: 11 }} /> Back to Stories
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <span style={{ background: 'var(--blue-faint)', color: 'var(--blue-light)', padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {item.category}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FaRegClock /> {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>

                <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, margin: '0 0 32px', lineHeight: 1.15, letterSpacing: '-1px' }}>
                    {item.title}
                </h1>

                {/* AUTHOR ROW */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 32, borderBottom: '1px solid var(--border)', marginBottom: 48 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--blue-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--blue-border)', overflow: 'hidden' }}>
                            {item.author?.profileImage ? <img src={item.author.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaUserAlt style={{ color: 'var(--blue-light)', fontSize: 18 }} />}
                        </div>
                        <div>
                            <p style={{ fontSize: 14.5, fontWeight: 700, margin: 0 }}>{item.author?.name || 'Student Contributor'}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>NIT Jamshedpur Student</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue-border)'; e.currentTarget.style.color = 'var(--blue-light)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                            <FaShareAlt />
                        </button>
                        <button style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue-border)'; e.currentTarget.style.color = 'var(--blue-light)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                            <FaBookmark />
                        </button>
                    </div>
                </div>

                {/* FEATURED IMAGE */}
                {item.image && (
                    <div style={{ width: '100%', height: 480, borderRadius: 24, overflow: 'hidden', marginBottom: 48, boxShadow: '0 20px 60px var(--card-shadow)' }}>
                        <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}

                {/* CONTENT */}
                <div style={{ fontSize: 18, lineHeight: 1.85, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: 60 }}>
                    {item.content}
                </div>

                {/* TAGS */}
                {item.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 60, padding: '24px 0', borderTop: '1px solid var(--border)' }}>
                        {item.tags.map((tag, idx) => (
                            <span key={idx} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '6px 16px', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FaTag style={{ fontSize: 11, color: 'var(--blue-light)' }} /> {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* FOOTER ACTIONS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '24px 32px', borderRadius: 20, background: 'var(--bg-secondary)', border: '1px solid var(--border)', width: 'fit-content' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                        <FaHeart style={{ fontSize: 18, color: '#ff4b5c' }} /> Like
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                        <FaComment style={{ fontSize: 18, color: 'var(--blue-light)' }} /> 0 Comments
                    </button>
                </div>
            </div>

            {/* RELATED SECTION (Placeholder) */}
            <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '100px 24px' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <HiSparkles style={{ color: 'var(--blue-light)' }} />
                        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--blue-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recommended</span>
                    </div>
                    <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, margin: '0 0 40px' }}>More from Campus Stories</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Stories coming soon...</p>
                </div>
            </div>
        </div>
    );
};

export default NewsDetail;
