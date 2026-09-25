import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaBriefcase, FaMapMarkerAlt, FaBuilding, FaMoneyBillWave, FaClock, FaPlus, FaTimes, FaSearch, FaExternalLinkAlt, FaFilter } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const getType = t => {
    const configs = {
        'full-time':  { bg: 'var(--blue-faint)', color: 'var(--blue-light)', dot: 'var(--blue-light)' },
        'part-time':  { bg: 'var(--blue-faint)', color: 'var(--blue-light)', dot: 'var(--blue-light)' },
        'internship': { bg: 'var(--blue-faint)', color: 'var(--blue-light)', dot: 'var(--blue-light)' },
        'contract':   { bg: 'var(--blue-faint)', color: 'var(--blue-light)', dot: 'var(--blue-light)' },
        'remote':     { bg: 'var(--blue-faint)', color: 'var(--blue-light)', dot: 'var(--blue-light)' },
    };
    return configs[t] || configs['full-time'];
};

const inputSx = {
    width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)',
    borderRadius: 9, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13.5,
    outline: 'none', fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
};
const focusSx = e => { e.target.style.borderColor = 'var(--blue-light)'; e.target.style.boxShadow = `0 0 0 3px var(--blue-faint)`; };
const blurSx  = e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

const JobCard = ({ job }) => {
    const ts = getType(job.type);
    return (
        <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '22px 24px',
            transition: 'border-color 0.25s, box-shadow 0.25s',
            display: 'flex', flexDirection: 'column', gap: 14,
        }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue-border)'; e.currentTarget.style.boxShadow = `0 8px 32px var(--card-shadow)`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            {/* top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            {job.title}
                        </h3>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: ts.bg, borderRadius: 20, padding: '3px 10px',
                            fontSize: 10.5, fontWeight: 700, color: ts.color,
                            letterSpacing: '0.08em', textTransform: 'capitalize',
                        }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: ts.dot }} />
                            {job.type}
                        </span>
                    </div>

                    {/* meta row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FaBuilding style={{ color: 'var(--blue-light)', fontSize: 11 }} />{job.company}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FaMapMarkerAlt style={{ color: 'var(--blue-light)', fontSize: 11 }} />{job.location}
                        </span>
                        {job.salary && job.salary !== 'Not disclosed' && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FaMoneyBillWave style={{ color: 'var(--blue-light)', fontSize: 11 }} />{job.salary}
                            </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FaClock style={{ color: 'var(--blue-light)', fontSize: 10 }} />
                            {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                {job.applicationLink && (
                    <a href={job.applicationLink} target="_blank" rel="noopener noreferrer" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0,
                        background: `linear-gradient(135deg, var(--blue-light), var(--blue))`,
                        border: 'none', borderRadius: 8, padding: '9px 18px',
                        color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none',
                        letterSpacing: '0.05em', boxShadow: `0 3px 14px rgba(32,54,113,0.35)`,
                        transition: 'opacity 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        Apply <FaExternalLinkAlt style={{ fontSize: 10 }} />
                    </a>
                )}
            </div>

            {/* description */}
            <p style={{
                fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
                {job.description}
            </p>

            {/* requirements */}
            {job.requirements?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {job.requirements.slice(0, 5).map((req, j) => (
                        <span key={j} style={{
                            background: 'var(--blue-faint)', border: '1px solid var(--blue-border)',
                            borderRadius: 6, padding: '3px 10px',
                            fontSize: 11, color: 'var(--text-secondary)',
                        }}>{req}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

const Jobs = () => {
    const { user } = useAuth();
    const [jobs, setJobs]           = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showForm, setShowForm]   = useState(false);
    const [search, setSearch]       = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [formData, setFormData]   = useState({
        title: '', company: '', location: '', type: 'full-time',
        description: '', salary: '', applicationLink: '', requirements: ''
    });

    const jobTypes = ['full-time', 'part-time', 'internship', 'contract', 'remote'];

    useEffect(() => { fetchJobs(); }, [typeFilter]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (typeFilter) params.type = typeFilter;
            const { data } = await API.get('/jobs', { params });
            setJobs(data.jobs);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const submitData = { ...formData, requirements: formData.requirements.split(',').map(r => r.trim()).filter(Boolean) };
            await API.post('/jobs', submitData);
            toast.success('Job posted!');
            setShowForm(false);
            setFormData({ title: '', company: '', location: '', type: 'full-time', description: '', salary: '', applicationLink: '', requirements: '' });
            fetchJobs();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to post job'); }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '48px 20px 72px', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', transition: 'background 0.3s, color 0.3s' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 40, flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', borderRadius: 20, padding: '5px 14px', marginBottom: 16 }}>
                            <HiSparkles style={{ color: 'var(--blue-light)', fontSize: 13 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-light)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Career Opportunities</span>
                        </div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 38, fontWeight: 800, margin: '0 0 10px', color: 'var(--text-primary)', letterSpacing: '-0.6px', lineHeight: 1.15 }}>
                            Job{' '}
                            <span style={{ background: `linear-gradient(135deg, var(--blue-light), #6B8FE8)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Board</span>
                        </h1>
                        <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', margin: 0 }}>Discover career opportunities shared by NIT JSR students.</p>
                    </div>
                    {user && (
                        <button onClick={() => setShowForm(!showForm)} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: showForm ? 'transparent' : `linear-gradient(135deg, var(--blue-light), var(--blue))`,
                            border: `1px solid ${showForm ? 'var(--blue-border)' : 'transparent'}`,
                            borderRadius: 10, padding: '11px 22px', color: '#fff',
                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            boxShadow: showForm ? 'none' : `0 4px 20px rgba(32,54,113,0.35)`,
                            transition: 'all 0.2s',
                        }}>
                            {showForm ? <><FaTimes style={{ fontSize: 12 }} /> Cancel</> : <><FaPlus style={{ fontSize: 12 }} /> Post Job</>}
                        </button>
                    )}
                </div>

                {/* SEARCH BAR */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, position: 'relative', minWidth: 260 }}>
                        <FaSearch style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13, pointerEvents: 'none' }} />
                        <input
                            type="text" value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchJobs()}
                            placeholder="Search by title, company, or skill..."
                            style={{ ...inputSx, paddingLeft: 38 }}
                            onFocus={focusSx} onBlur={blurSx}
                        />
                    </div>
                    <button onClick={fetchJobs} style={{
                        background: `linear-gradient(135deg, var(--blue-light), var(--blue))`,
                        border: 'none', borderRadius: 8, padding: '10px 22px',
                        color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif", boxShadow: `0 3px 14px rgba(32,54,113,0.35)`,
                        transition: 'opacity 0.2s', whiteSpace: 'nowrap',
                    }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >Search</button>
                </div>

                {/* FILTER BAR */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginRight: 4 }}>
                        <FaFilter style={{ color: 'var(--text-muted)', fontSize: 11 }} />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Type</span>
                    </div>
                    {['', ...jobTypes].map(t => {
                        const active = typeFilter === t;
                        return (
                            <button key={t || 'all'} onClick={() => setTypeFilter(t)} style={{
                                background: active ? `linear-gradient(135deg, var(--blue-light), var(--blue))` : 'var(--bg-secondary)',
                                border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
                                borderRadius: 8, padding: '7px 16px', color: active ? '#fff' : 'var(--text-secondary)',
                                fontSize: 12, fontWeight: active ? 700 : 500, textTransform: 'capitalize',
                                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                                boxShadow: active ? `0 2px 12px rgba(32,54,113,0.35)` : 'none',
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                            }}>{t || 'All Types'}</button>
                        );
                    })}
                </div>

                {/* POST JOB FORM */}
                {showForm && (
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--blue-border)', borderRadius: 16, padding: '28px 32px', marginBottom: 36, boxShadow: `0 8px 40px var(--card-shadow)` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px rgba(32,54,113,0.5)` }}>
                                <FaBriefcase style={{ color: '#fff', fontSize: 14 }} />
                            </div>
                            <div>
                                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Post a Job</p>
                                <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '2px 0 0' }}>Share an opportunity with the campus network</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 14 }}>
                                <input placeholder="Job Title *" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} required />
                                <input placeholder="Company *" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} required />
                                <input placeholder="Location *" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} required />
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ ...inputSx, appearance: 'none', cursor: 'pointer' }} onFocus={focusSx} onBlur={blurSx}>
                                    {jobTypes.map(t => <option key={t} value={t} style={{ background: 'var(--bg-secondary)' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                </select>
                                <input placeholder="Salary Range (e.g. ₹6–10 LPA)" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} />
                                <input type="url" placeholder="Application Link" value={formData.applicationLink} onChange={e => setFormData({ ...formData, applicationLink: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <textarea placeholder="Job Description *" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} required style={{ ...inputSx, resize: 'vertical', lineHeight: 1.65 }} onFocus={focusSx} onBlur={blurSx} />
                                <input placeholder="Requirements — comma separated" value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} />
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" style={{ background: `linear-gradient(135deg, var(--blue-light), var(--blue))`, border: 'none', borderRadius: 9, padding: '11px 28px', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 20px rgba(32,54,113,0.35)`, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                        Post Job →
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* CONTENT */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid var(--blue-faint)`, borderTopColor: 'var(--blue-light)', animation: 'spin 0.7s linear infinite' }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : jobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '72px 32px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--blue-faint)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <FaBriefcase style={{ fontSize: 26, color: 'var(--blue-light)' }} />
                        </div>
                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>No Jobs Posted Yet</h3>
                        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>Be the first to share an opportunity!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {jobs.map(job => <JobCard key={job._id} job={job} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Jobs;
