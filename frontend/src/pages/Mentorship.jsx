import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
    FaChalkboardTeacher, FaSearch, FaFilter, FaUserAlt, 
    FaBriefcase, FaGraduationCap, FaStar, FaClock, FaCheckCircle,
    FaPlus, FaTimes, FaDollarSign, FaLanguage, FaLaptopCode
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const inputSx = {
    width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '12px 16px', color: 'var(--text-primary)', fontSize: 14,
    outline: 'none', fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s', boxSizing: 'border-box',
};

const Mentorship = () => {
    const { user } = useAuth();
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showOptIn, setShowOptIn] = useState(false);
    const [filters, setFilters] = useState({ domain: '', company: '', type: '' });
    const [optInData, setOptInData] = useState({
        domain: '', experience: '', bio: '', type: 'free', price: 0
    });

    useEffect(() => {
        fetchMentors();
    }, [filters]);

    const fetchMentors = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/mentors', { params: filters });
            setMentors(data.mentors);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOptIn = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...optInData,
                domain: optInData.domain.split(',').map(d => d.trim()).filter(Boolean)
            };
            await API.post('/mentors', submitData);
            toast.success('Successfully opted in as mentor!');
            setShowOptIn(false);
            fetchMentors();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to opt in');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '60px 24px 100px', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 48, flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', borderRadius: 20, padding: '6px 16px', marginBottom: 16 }}>
                            <HiSparkles style={{ color: 'var(--blue-light)', fontSize: 13 }} />
                            <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--blue-light)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Mentorship Program</span>
                        </div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-1px', lineHeight: 1.1 }}>
                            Empowering the Next <span style={{ background: 'linear-gradient(135deg, var(--blue-light), #6B8FE8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Generation</span>
                        </h1>
                        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>
                            Connect with experienced seniors and peers for guidance in career, startups, and academic excellence.
                        </p>
                    </div>

                    {!showOptIn && (
                        <button onClick={() => setShowOptIn(true)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, var(--blue-light), var(--blue))', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 28px', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 25px rgba(32,54,113,0.35)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <FaPlus /> Become a Mentor
                        </button>
                    )}
                </div>

                {/* OPT-IN FORM */}
                {showOptIn && (
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--blue-border)', borderRadius: 24, padding: 40, marginBottom: 48, boxShadow: '0 20px 60px var(--card-shadow)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, margin: 0 }}>Mentor Registration</h2>
                            <button onClick={() => setShowOptIn(false)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}><FaTimes /></button>
                        </div>

                        <form onSubmit={handleOptIn} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Key Skills / Domains (comma separated) *</label>
                                    <input placeholder="DSA, Machine Learning, UI Design..." value={optInData.domain} onChange={e => setOptInData({ ...optInData, domain: e.target.value })} style={inputSx} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Experience (Years) *</label>
                                        <input type="number" value={optInData.experience} onChange={e => setOptInData({ ...optInData, experience: e.target.value })} style={inputSx} required />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Mentor Type *</label>
                                        <select value={optInData.type} onChange={e => setOptInData({ ...optInData, type: e.target.value })} style={inputSx}>
                                            <option value="free">Free Mentorship</option>
                                            <option value="paid">Paid sessions</option>
                                        </select>
                                    </div>
                                </div>
                                {optInData.type === 'paid' && (
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Fee per Session (₹)</label>
                                        <div style={{ position: 'relative' }}>
                                            <FaDollarSign style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input type="number" value={optInData.price} onChange={e => setOptInData({ ...optInData, price: e.target.value })} style={{ ...inputSx, paddingLeft: 32 }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Professional Bio *</label>
                                    <textarea placeholder="Tell potential mentees about your journey and how you can help..." value={optInData.bio} onChange={e => setOptInData({ ...optInData, bio: e.target.value })} style={{ ...inputSx, height: 160, resize: 'none' }} required />
                                </div>
                                <button type="submit" style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 14, padding: '16px', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 'auto' }}>Complete Registration →</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* FILTER BAR */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px', position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input placeholder="Search skills, bio..." style={{ ...inputSx, paddingLeft: 38 }} />
                    </div>
                    <div style={{ flex: '1 1 180px' }}>
                        <input placeholder="Company..." style={inputSx} onChange={e => setFilters({ ...filters, company: e.target.value })} />
                    </div>
                    <div style={{ flex: '1 1 180px' }}>
                        <select style={inputSx} onChange={e => setFilters({ ...filters, type: e.target.value })}>
                            <option value="">Any Plan</option>
                            <option value="free">Free</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                </div>

                {/* MENTORS GRID */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--blue-faint)', borderTopColor: 'var(--blue-light)', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                    </div>
                ) : mentors.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 80, background: 'var(--bg-secondary)', borderRadius: 24, border: '1px solid var(--border)' }}>
                        <FaChalkboardTeacher style={{ fontSize: 40, color: 'var(--blue-light)', marginBottom: 20 }} />
                        <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>No Mentors Found</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search filters.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                        {mentors.map(mentor => (
                            <div key={mentor._id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.25s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue-border)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px var(--card-shadow)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                <div style={{ padding: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {mentor.user?.profileImage ? <img src={mentor.user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaUserAlt style={{ color: 'var(--blue-light)', fontSize: 20 }} />}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 4px' }}>{mentor.user?.name}</h3>
                                                <p style={{ fontSize: 12, color: 'var(--blue-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{mentor.user?.company || 'Student'}</p>
                                            </div>
                                        </div>
                                        <div style={{ background: mentor.type === 'free' ? 'var(--green-faint)' : 'var(--blue-faint)', color: mentor.type === 'free' ? '#22c55e' : 'var(--blue-light)', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
                                            {mentor.type === 'free' ? 'Free' : `₹${mentor.price}`}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                                        {mentor.domain.map((d, i) => (
                                            <span key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{d}</span>
                                        ))}
                                    </div>

                                    <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {mentor.bio}
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                                            <FaBriefcase style={{ color: 'var(--blue-light)', fontSize: 12 }} />
                                            <span>{mentor.experience} yrs exp.</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                                            <FaCheckCircle style={{ color: '#22c55e', fontSize: 12 }} />
                                            <span>Verified</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: '0 24px 24px', marginTop: 'auto' }}>
                                    <button style={{ width: '100%', background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', borderRadius: 12, padding: '12px', color: 'var(--blue-light)', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue)'; e.currentTarget.style.color = '#fff'; }}>Book a Session</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Mentorship;
