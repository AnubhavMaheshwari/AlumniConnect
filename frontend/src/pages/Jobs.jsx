import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaBriefcase, FaMapMarkerAlt, FaBuilding, FaMoneyBillWave, FaClock, FaPlus, FaTimes, FaSearch, FaExternalLinkAlt, FaFilter } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const C = {
    blue: '#203671', blueDark: '#182858', blueLight: '#2D4899',
    blueFaint: 'rgba(32,54,113,0.12)', blueBorder: 'rgba(32,54,113,0.35)',
    white: '#FFFFFF', muted: '#8A94A8', black: '#000000',
    darkBg: '#0C0E14', darkCard: '#12151F', darkBorder: '#1E2235',
};

if (typeof document !== 'undefined' && !document.getElementById('jobs-fonts')) {
    const l = document.createElement('link');
    l.id = 'jobs-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700;800&display=swap';
    document.head.appendChild(l);
}

const typeConfig = {
    'full-time':  { bg: 'rgba(32,54,113,0.18)', color: '#7B9FE8', dot: '#7B9FE8' },
    'part-time':  { bg: 'rgba(24,40,88,0.25)',  color: '#A0B4F0', dot: '#A0B4F0' },
    'internship': { bg: 'rgba(45,72,153,0.15)', color: '#6B8FE8', dot: '#6B8FE8' },
    'contract':   { bg: 'rgba(32,54,113,0.22)', color: '#90AAEC', dot: '#90AAEC' },
    'remote':     { bg: 'rgba(20,35,80,0.3)',   color: '#B0C4F4', dot: '#B0C4F4' },
};
const getType = t => typeConfig[t] || typeConfig['full-time'];

const inputSx = {
    width: '100%', background: C.darkBg, border: `1px solid ${C.darkBorder}`,
    borderRadius: 9, padding: '10px 14px', color: C.white, fontSize: 13.5,
    outline: 'none', fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
};
const focusSx = e => { e.target.style.borderColor = C.blueLight; e.target.style.boxShadow = `0 0 0 3px ${C.blueFaint}`; };
const blurSx  = e => { e.target.style.borderColor = C.darkBorder; e.target.style.boxShadow = 'none'; };

const JobCard = ({ job }) => {
    const ts = getType(job.type);
    return (
        <div style={{
            background: C.darkCard, border: `1px solid ${C.darkBorder}`,
            borderRadius: 14, padding: '22px 24px',
            transition: 'border-color 0.25s, box-shadow 0.25s',
            display: 'flex', flexDirection: 'column', gap: 14,
        }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.blueBorder; e.currentTarget.style.boxShadow = `0 8px 32px rgba(32,54,113,0.2)`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.darkBorder; e.currentTarget.style.boxShadow = 'none'; }}
        >
            {/* top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: C.white, margin: 0 }}>
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', fontSize: 12.5, color: C.muted }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FaBuilding style={{ color: C.blueLight, fontSize: 11 }} />{job.company}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FaMapMarkerAlt style={{ color: C.blueLight, fontSize: 11 }} />{job.location}
                        </span>
                        {job.salary && job.salary !== 'Not disclosed' && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FaMoneyBillWave style={{ color: C.blueLight, fontSize: 11 }} />{job.salary}
                            </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FaClock style={{ color: C.blueLight, fontSize: 10 }} />
                            {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                {job.applicationLink && (
                    <a href={job.applicationLink} target="_blank" rel="noopener noreferrer" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0,
                        background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`,
                        border: 'none', borderRadius: 8, padding: '9px 18px',
                        color: C.white, fontSize: 12, fontWeight: 700, textDecoration: 'none',
                        letterSpacing: '0.05em', boxShadow: `0 3px 14px rgba(32,54,113,0.4)`,
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
                fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
                {job.description}
            </p>

            {/* requirements */}
            {job.requirements?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {job.requirements.slice(0, 5).map((req, j) => (
                        <span key={j} style={{
                            background: C.blueFaint, border: `1px solid ${C.blueBorder}`,
                            borderRadius: 6, padding: '3px 10px',
                            fontSize: 11, color: C.muted,
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
        <div style={{ minHeight: '100vh', background: C.black, padding: '48px 20px 72px', fontFamily: "'DM Sans', sans-serif", color: C.white }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 40, flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.blueFaint, border: `1px solid ${C.blueBorder}`, borderRadius: 20, padding: '5px 14px', marginBottom: 16 }}>
                            <HiSparkles style={{ color: C.blueLight, fontSize: 13 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.blueLight, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Career Opportunities</span>
                        </div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 38, fontWeight: 800, margin: '0 0 10px', color: C.white, letterSpacing: '-0.6px', lineHeight: 1.15 }}>
                            Job{' '}
                            <span style={{ background: `linear-gradient(135deg, ${C.blueLight}, #6B8FE8)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Board</span>
                        </h1>
                        <p style={{ fontSize: 14.5, color: C.muted, margin: 0 }}>Discover career opportunities shared by NIT JSR alumni.</p>
                    </div>
                    {user && (
                        <button onClick={() => setShowForm(!showForm)} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: showForm ? 'transparent' : `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`,
                            border: `1px solid ${showForm ? C.blueBorder : 'transparent'}`,
                            borderRadius: 10, padding: '11px 22px', color: C.white,
                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            boxShadow: showForm ? 'none' : `0 4px 20px rgba(32,54,113,0.4)`,
                            transition: 'all 0.2s',
                        }}>
                            {showForm ? <><FaTimes style={{ fontSize: 12 }} /> Cancel</> : <><FaPlus style={{ fontSize: 12 }} /> Post Job</>}
                        </button>
                    )}
                </div>

                {/* SEARCH BAR */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: 13, pointerEvents: 'none' }} />
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
                        background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`,
                        border: 'none', borderRadius: 8, padding: '10px 22px',
                        color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif", boxShadow: `0 3px 14px rgba(32,54,113,0.4)`,
                        transition: 'opacity 0.2s', whiteSpace: 'nowrap',
                    }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >Search</button>
                </div>

                {/* FILTER BAR */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: C.darkCard, border: `1px solid ${C.darkBorder}`, marginRight: 4 }}>
                        <FaFilter style={{ color: C.muted, fontSize: 11 }} />
                        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Type</span>
                    </div>
                    {['', ...jobTypes].map(t => {
                        const active = typeFilter === t;
                        return (
                            <button key={t || 'all'} onClick={() => setTypeFilter(t)} style={{
                                background: active ? `linear-gradient(135deg, ${C.blueLight}, ${C.blue})` : C.darkCard,
                                border: `1px solid ${active ? 'transparent' : C.darkBorder}`,
                                borderRadius: 8, padding: '7px 16px', color: active ? C.white : C.muted,
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
                    <div style={{ background: C.darkCard, border: `1px solid ${C.blueBorder}`, borderRadius: 16, padding: '28px 32px', marginBottom: 36, boxShadow: `0 8px 40px rgba(32,54,113,0.2)` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${C.darkBorder}` }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px rgba(32,54,113,0.5)` }}>
                                <FaBriefcase style={{ color: C.white, fontSize: 14 }} />
                            </div>
                            <div>
                                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: C.white, margin: 0 }}>Post a Job</p>
                                <p style={{ fontSize: 11.5, color: C.muted, margin: '2px 0 0' }}>Share an opportunity with the alumni network</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                <input placeholder="Job Title *" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} required />
                                <input placeholder="Company *" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} required />
                                <input placeholder="Location *" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} required />
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ ...inputSx, appearance: 'none', cursor: 'pointer' }} onFocus={focusSx} onBlur={blurSx}>
                                    {jobTypes.map(t => <option key={t} value={t} style={{ background: C.darkBg }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                </select>
                                <input placeholder="Salary Range (e.g. ₹6–10 LPA)" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} />
                                <input type="url" placeholder="Application Link" value={formData.applicationLink} onChange={e => setFormData({ ...formData, applicationLink: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <textarea placeholder="Job Description *" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} required style={{ ...inputSx, resize: 'vertical', lineHeight: 1.65 }} onFocus={focusSx} onBlur={blurSx} />
                                <input placeholder="Requirements — comma separated" value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} />
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" style={{ background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`, border: 'none', borderRadius: 9, padding: '11px 28px', color: C.white, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 20px rgba(32,54,113,0.4)`, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
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
                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.blueFaint}`, borderTopColor: C.blueLight, animation: 'spin 0.7s linear infinite' }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : jobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '72px 32px', background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 16 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: C.blueFaint, border: `1px solid ${C.blueBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <FaBriefcase style={{ fontSize: 26, color: C.blueLight }} />
                        </div>
                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: C.white, margin: '0 0 8px' }}>No Jobs Posted Yet</h3>
                        <p style={{ fontSize: 13.5, color: C.muted, margin: 0 }}>Be the first to share an opportunity!</p>
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
