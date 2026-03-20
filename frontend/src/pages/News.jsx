import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaNewspaper, FaUser, FaClock, FaPlus, FaTimes, FaFilter, FaTag } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

/* ── colour tokens ─────────────────── */
const getCatConfig = cat => {
    const configs = {
        achievement:  { bg: 'var(--blue-faint)', color: 'var(--blue-light)', dot: 'var(--blue-light)' },
        announcement: { bg: 'var(--blue-faint)', color: 'var(--blue-light)', dot: 'var(--blue-light)' },
        story:        { bg: 'var(--blue-faint)', color: 'var(--blue-light)', dot: 'var(--blue-light)' },
        update:       { bg: 'var(--blue-faint)', color: 'var(--blue-light)', dot: 'var(--blue-light)' },
        other:        { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)', dot: 'var(--text-secondary)' },
    };
    return configs[cat] || configs.other;
};

const inputSx = {
    width: '100%', background: 'var(--input-bg)',
    border: '1px solid var(--border)',
    borderRadius: 9, padding: '10px 14px',
    color: 'var(--text-primary)', fontSize: 13.5, outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
};

const focusSx = e => {
    e.target.style.borderColor = 'var(--blue-light)';
    e.target.style.boxShadow   = `0 0 0 3px var(--blue-faint)`;
};
const blurSx = e => {
    e.target.style.borderColor = 'var(--border)';
    e.target.style.boxShadow   = 'none';
};

const NewsCard = ({ item }) => {
    const cs = getCatConfig(item.category);
    return (
        <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 14, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            transition: 'border-color 0.25s, box-shadow 0.25s',
        }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--blue-border)';
                e.currentTarget.style.boxShadow   = `0 8px 32px var(--card-shadow)`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow   = 'none';
            }}
        >
            {/* top accent bar */}
            <div style={{
                height: 3,
                background: `linear-gradient(90deg, var(--blue), var(--blue-light))`,
            }} />

            <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* category badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: cs.bg, borderRadius: 20, padding: '4px 10px',
                        fontSize: 10.5, fontWeight: 700, color: cs.color,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: cs.dot }} />
                        {item.category}
                    </span>
                </div>

                {/* title */}
                <h3 style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
                    lineHeight: 1.4, margin: 0,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {item.title}
                </h3>

                {/* summary */}
                <p style={{
                    fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
                    margin: 0, flex: 1,
                    display: '-webkit-box', WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {item.summary || item.content}
                </p>

                {/* tags */}
                {item.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {item.tags.slice(0, 3).map((tag, j) => (
                            <span key={j} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                background: 'var(--blue-faint)', border: '1px solid var(--blue-border)',
                                borderRadius: 6, padding: '3px 8px',
                                fontSize: 10.5, color: 'var(--text-secondary)',
                            }}>
                                <FaTag style={{ fontSize: 8, color: 'var(--blue-light)' }} /> {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* footer */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: 12, borderTop: '1px solid var(--border)',
                    fontSize: 11.5, color: 'var(--text-secondary)',
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: `linear-gradient(135deg, var(--blue-light), var(--blue))`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <FaUser style={{ fontSize: 9, color: '#fff' }} />
                        </div>
                        {item.author?.name || 'Alumni'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <FaClock style={{ fontSize: 10 }} />
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                </div>
            </div>
        </div>
    );
};

const News = () => {
    const { user } = useAuth();
    const [news, setNews]         = useState([]);
    const [loading, setLoading]   = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [category, setCategory] = useState('');
    const [formData, setFormData] = useState({ title: '', content: '', summary: '', category: 'other', tags: '' });

    const categories = ['achievement', 'announcement', 'story', 'update', 'other'];

    useEffect(() => { fetchNews(); }, [category]);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const params = {}; if (category) params.category = category;
            const { data } = await API.get('/news', { params });
            setNews(data.news);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const submitData = { ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) };
            await API.post('/news', submitData);
            toast.success('Story published!');
            setShowForm(false);
            setFormData({ title: '', content: '', summary: '', category: 'other', tags: '' });
            fetchNews();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to publish'); }
    };

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg)',
            padding: '48px 20px 72px', fontFamily: "'DM Sans', sans-serif",
            color: 'var(--text-primary)', transition: 'background 0.3s, color 0.3s'
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* HEADER */}
                <div style={{
                    display: 'flex', alignItems: 'flex-start',
                    justifyContent: 'space-between', gap: 20,
                    marginBottom: 40, flexWrap: 'wrap'
                }}>
                    <div>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: 'var(--blue-faint)', border: '1px solid var(--blue-border)',
                            borderRadius: 20, padding: '5px 14px', marginBottom: 16
                        }}>
                            <HiSparkles style={{ color: 'var(--blue-light)', fontSize: 13 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-light)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                Alumni Stories
                            </span>
                        </div>

                        <h1 style={{
                            fontFamily: "'Sora', sans-serif",
                            fontSize: 38, fontWeight: 800, margin: '0 0 10px',
                            color: 'var(--text-primary)', letterSpacing: '-0.6px', lineHeight: 1.15
                        }}>
                            News &{' '}
                            <span style={{
                                background: `linear-gradient(135deg, var(--blue-light), #6B8FE8)`,
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                            }}>Stories</span>
                        </h1>
                        <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', margin: 0 }}>
                            Celebrating NIT Jamshedpur alumni achievements and updates.
                        </p>
                    </div>

                    {user && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: showForm
                                    ? 'transparent'
                                    : `linear-gradient(135deg, var(--blue-light), var(--blue))`,
                                border: `1px solid ${showForm ? 'var(--blue-border)' : 'transparent'}`,
                                borderRadius: 10, padding: '11px 22px',
                                color: '#fff', fontSize: 13, fontWeight: 700,
                                letterSpacing: '0.05em', cursor: 'pointer',
                                fontFamily: "'DM Sans', sans-serif",
                                boxShadow: showForm ? 'none' : `0 4px 20px rgba(32,54,113,0.35)`,
                                transition: 'all 0.2s',
                            }}
                        >
                            {showForm ? <><FaTimes style={{ fontSize: 12 }} /> Cancel</> : <><FaPlus style={{ fontSize: 12 }} /> Share Story</>}
                        </button>
                    )}
                </div>

                {/* FILTER BAR */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 32, flexWrap: 'wrap'
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 8,
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        marginRight: 4
                    }}>
                        <FaFilter style={{ color: 'var(--text-muted)', fontSize: 11 }} />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Filter</span>
                    </div>

                    {['', ...categories].map(cat => {
                        const active = category === cat;
                        return (
                            <button
                                key={cat || 'all'}
                                onClick={() => setCategory(cat)}
                                style={{
                                    background: active
                                        ? `linear-gradient(135deg, var(--blue-light), var(--blue))`
                                        : 'var(--bg-secondary)',
                                    border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
                                    borderRadius: 8, padding: '7px 16px',
                                    color: active ? '#fff' : 'var(--text-secondary)',
                                    fontSize: 12, fontWeight: active ? 700 : 500,
                                    textTransform: 'capitalize', cursor: 'pointer',
                                    letterSpacing: active ? '0.04em' : '0',
                                    fontFamily: "'DM Sans', sans-serif",
                                    boxShadow: active ? `0 2px 12px rgba(32,54,113,0.35)` : 'none',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {cat || 'All'}
                            </button>
                        );
                    })}
                </div>

                {/* FORM */}
                {showForm && (
                    <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--blue-border)',
                        borderRadius: 16, padding: '28px 32px',
                        marginBottom: 36,
                        boxShadow: `0 8px 40px var(--card-shadow)`
                    }}>
                        {/* form header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24,
                            paddingBottom: 16, borderBottom: '1px solid var(--border)'
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 9,
                                background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 4px 14px rgba(32,54,113,0.5)`
                            }}>
                                <FaNewspaper style={{ color: '#fff', fontSize: 14 }} />
                            </div>
                            <div>
                                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Share Your Story</p>
                                <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '2px 0 0' }}>Inspire fellow alumni with your journey</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                                    <input
                                        type="text" placeholder="Story title *"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        style={inputSx} onFocus={focusSx} onBlur={blurSx} required
                                    />
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        style={{ ...inputSx, appearance: 'none', cursor: 'pointer' }}
                                        onFocus={focusSx} onBlur={blurSx}
                                    >
                                        {categories.map(c => <option key={c} value={c} style={{ background: 'var(--bg-secondary)' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                    </select>
                                </div>

                                <input
                                    type="text" placeholder="Brief summary (optional)"
                                    value={formData.summary}
                                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                                    style={inputSx} onFocus={focusSx} onBlur={blurSx}
                                />

                                <textarea
                                    placeholder="Full story content *"
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    rows={5} required
                                    style={{ ...inputSx, resize: 'vertical', lineHeight: 1.65 }}
                                    onFocus={focusSx} onBlur={blurSx}
                                />

                                <input
                                    type="text" placeholder="Tags — comma separated (e.g. startup, placement, research)"
                                    value={formData.tags}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                    style={inputSx} onFocus={focusSx} onBlur={blurSx}
                                />

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        type="submit"
                                        style={{
                                            background: `linear-gradient(135deg, var(--blue-light), var(--blue))`,
                                            border: 'none', borderRadius: 9, padding: '11px 28px',
                                            color: '#fff', fontSize: 13, fontWeight: 700,
                                            letterSpacing: '0.05em', cursor: 'pointer',
                                            fontFamily: "'DM Sans', sans-serif",
                                            boxShadow: `0 4px 20px rgba(32,54,113,0.35)`,
                                            transition: 'opacity 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                    >
                                        Publish Story →
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* CONTENT */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            border: `3px solid var(--blue-faint)`,
                            borderTopColor: 'var(--blue-light)',
                            animation: 'spin 0.7s linear infinite'
                        }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : news.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '72px 32px',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        borderRadius: 16
                    }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 18,
                            background: 'var(--blue-faint)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <FaNewspaper style={{ fontSize: 26, color: 'var(--blue-light)' }} />
                        </div>
                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>No Stories Yet</h3>
                        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>Be the first to share an inspiring story!</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: 20
                    }}>
                        {news.map(item => <NewsCard key={item._id} item={item} />)}
                    </div>
                )}

            </div>
        </div>
    );
};

export default News;