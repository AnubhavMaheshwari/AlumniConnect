import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaNewspaper, FaUser, FaClock, FaPlus, FaTimes, FaFilter, FaTag } from 'react-icons/fa';

const News = () => {
    const { user } = useAuth();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [category, setCategory] = useState('');
    const [formData, setFormData] = useState({ title: '', content: '', summary: '', category: 'other', tags: '' });

    useEffect(() => { fetchNews(); }, [category]);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const params = {}; if (category) params.category = category;
            const { data } = await API.get('/news', { params }); setNews(data.news);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = { ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) };
            await API.post('/news', submitData); toast.success('Story published!'); setShowForm(false);
            setFormData({ title: '', content: '', summary: '', category: 'other', tags: '' }); fetchNews();
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to publish'); }
    };

    const categories = ['achievement', 'announcement', 'story', 'update', 'other'];

    return (
        <div className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-heading"><span className="gradient-text">News</span> & Stories</h1>
                        <p className="text-body text-lg">Celebrating NIT Jamshedpur alumni achievements and updates.</p>
                    </div>
                    {user && <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Share Story</>}</button>}
                </div>

                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <FaFilter className="text-muted shrink-0" />
                    <button onClick={() => setCategory('')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${!category ? 'bg-primary text-white' : 'text-body'}`} style={!category ? {} : { background: 'var(--bg-tertiary)' }}>All</button>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all ${category === cat ? 'bg-primary text-white' : 'text-body'}`} style={category === cat ? {} : { background: 'var(--bg-tertiary)' }}>{cat}</button>
                    ))}
                </div>

                {showForm && (
                    <div className="glass-card p-6 mb-8 animate-fade-in">
                        <h2 className="text-xl font-semibold text-heading mb-4">Share Your Story</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" required />
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                            </div>
                            <input type="text" placeholder="Brief summary" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} className="input-field" />
                            <textarea placeholder="Full story content..." value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="input-field" rows={5} required />
                            <input type="text" placeholder="Tags (comma-separated)" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="input-field" />
                            <div className="flex justify-end"><button type="submit" className="btn-primary">Publish Story</button></div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>
                ) : news.length === 0 ? (
                    <div className="text-center py-20 glass-card"><FaNewspaper className="text-6xl text-muted mx-auto mb-4" /><h3 className="text-xl font-semibold text-heading mb-2">No Stories Yet</h3><p className="text-body">Be the first to share an inspiring story!</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.map((item, i) => (
                            <div key={item._id} className="glass-card overflow-hidden group animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                <div className="h-2 bg-gradient-to-r from-primary to-primary-light"></div>
                                <div className="p-6">
                                    <span className="px-3 py-1 bg-primary/10 text-primary-light text-xs rounded-lg capitalize font-medium mb-3 inline-block">{item.category}</span>
                                    <h3 className="text-xl font-bold text-heading mb-3 line-clamp-2 group-hover:text-primary-light transition-colors">{item.title}</h3>
                                    <p className="text-body text-sm mb-4 line-clamp-3">{item.summary || item.content}</p>
                                    {item.tags?.length > 0 && <div className="flex flex-wrap gap-1.5 mb-4">{item.tags.slice(0, 3).map((tag, j) => <span key={j} className="px-2 py-1 text-body text-xs rounded-lg flex items-center gap-1" style={{ background: 'var(--bg-tertiary)' }}><FaTag className="text-[10px]" /> {tag}</span>)}</div>}
                                    <div className="flex items-center justify-between text-sm text-muted pt-4 border-t border-themed">
                                        <span className="flex items-center gap-1.5"><FaUser /> {item.author?.name || 'Alumni'}</span>
                                        <span className="flex items-center gap-1.5"><FaClock /> {new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;
