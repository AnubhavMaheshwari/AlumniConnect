import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaBriefcase, FaMapMarkerAlt, FaBuilding, FaMoneyBillWave, FaClock, FaPlus, FaTimes, FaSearch, FaExternalLinkAlt } from 'react-icons/fa';

const Jobs = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [formData, setFormData] = useState({ title: '', company: '', location: '', type: 'full-time', description: '', salary: '', applicationLink: '', requirements: '' });

    useEffect(() => { fetchJobs(); }, [typeFilter]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = {}; if (search) params.search = search; if (typeFilter) params.type = typeFilter;
            const { data } = await API.get('/jobs', { params }); setJobs(data.jobs);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = { ...formData, requirements: formData.requirements.split(',').map(r => r.trim()).filter(Boolean) };
            await API.post('/jobs', submitData); toast.success('Job posted!'); setShowForm(false);
            setFormData({ title: '', company: '', location: '', type: 'full-time', description: '', salary: '', applicationLink: '', requirements: '' }); fetchJobs();
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to post job'); }
    };

    const handleSearch = (e) => { e.preventDefault(); fetchJobs(); };
    const jobTypes = ['full-time', 'part-time', 'internship', 'contract', 'remote'];
    const typeColors = {
        'full-time': 'bg-success/10 text-success', 'part-time': 'bg-primary-dark/10 text-primary-light',
        'internship': 'bg-primary/10 text-primary-light', 'contract': 'bg-warning/10 text-warning', 'remote': 'bg-primary/10 text-primary-light'
    };

    return (
        <div className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-heading"><span className="gradient-text">Job</span> Board</h1>
                        <p className="text-body text-lg">Discover career opportunities shared by NIT JSR alumni.</p>
                    </div>
                    {user && <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Post Job</>}</button>}
                </div>

                <form onSubmit={handleSearch} className="glass-card p-4 mb-6 flex gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex-1 relative"><FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="input-field !pl-11" /></div>
                    <button type="submit" className="btn-primary">Search</button>
                </form>

                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                    <button onClick={() => setTypeFilter('')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${!typeFilter ? 'bg-primary text-white' : 'text-body'}`} style={!typeFilter ? {} : { background: 'var(--bg-tertiary)' }}>All Types</button>
                    {jobTypes.map(type => (
                        <button key={type} onClick={() => setTypeFilter(type)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all ${typeFilter === type ? 'bg-primary text-white' : 'text-body'}`} style={typeFilter === type ? {} : { background: 'var(--bg-tertiary)' }}>{type}</button>
                    ))}
                </div>

                {showForm && (
                    <div className="glass-card p-6 mb-8 animate-fade-in">
                        <h2 className="text-xl font-semibold text-heading mb-4">Post a Job</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Job Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" required />
                            <input type="text" placeholder="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="input-field" required />
                            <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input-field" required />
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input-field">{jobTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                            <input type="text" placeholder="Salary Range (e.g., ₹6-10 LPA)" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="input-field" />
                            <input type="url" placeholder="Application Link" value={formData.applicationLink} onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })} className="input-field" />
                            <textarea placeholder="Job Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field md:col-span-2" rows={3} required />
                            <input type="text" placeholder="Requirements (comma-separated)" value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} className="input-field md:col-span-2" />
                            <div className="md:col-span-2 flex justify-end"><button type="submit" className="btn-primary">Post Job</button></div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 glass-card"><FaBriefcase className="text-6xl text-muted mx-auto mb-4" /><h3 className="text-xl font-semibold text-heading mb-2">No Jobs Posted Yet</h3><p className="text-body">Be the first to share a job opportunity!</p></div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job, i) => (
                            <div key={job._id} className="glass-card p-6 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-heading">{job.title}</h3>
                                            <span className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${typeColors[job.type] || 'bg-primary/10 text-primary-light'}`}>{job.type}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-body mb-3">
                                            <span className="flex items-center gap-1.5"><FaBuilding className="text-primary-light" />{job.company}</span>
                                            <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-primary-light" />{job.location}</span>
                                            {job.salary && job.salary !== 'Not disclosed' && <span className="flex items-center gap-1.5"><FaMoneyBillWave className="text-primary-light" />{job.salary}</span>}
                                            <span className="flex items-center gap-1.5"><FaClock className="text-primary-light" />{new Date(job.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-body text-sm line-clamp-2 mb-3">{job.description}</p>
                                        {job.requirements?.length > 0 && <div className="flex flex-wrap gap-2">{job.requirements.slice(0, 5).map((req, j) => <span key={j} className="px-2.5 py-1 text-body text-xs rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>{req}</span>)}</div>}
                                    </div>
                                    {job.applicationLink && <a href={job.applicationLink} target="_blank" rel="noopener noreferrer" className="btn-primary shrink-0">Apply <FaExternalLinkAlt /></a>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Jobs;
