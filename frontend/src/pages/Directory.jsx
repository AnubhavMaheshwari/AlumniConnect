import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { FaSearch, FaLinkedin, FaEnvelope, FaPhone, FaBriefcase, FaGraduationCap, FaUsers } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const C = {
    blue: '#203671', blueDark: '#182858', blueLight: '#2D4899',
    blueFaint: 'rgba(32,54,113,0.12)', blueBorder: 'rgba(32,54,113,0.35)',
    white: '#FFFFFF', muted: '#8A94A8', black: '#000000',
    darkBg: '#0C0E14', darkCard: '#12151F', darkBorder: '#1E2235',
};

if (typeof document !== 'undefined' && !document.getElementById('dir-fonts')) {
    const l = document.createElement('link');
    l.id = 'dir-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700;800&display=swap';
    document.head.appendChild(l);
}

const inputSx = {
    width: '100%', background: C.darkBg, border: `1px solid ${C.darkBorder}`,
    borderRadius: 9, padding: '10px 14px', color: C.white, fontSize: 13.5,
    outline: 'none', fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
};
const focusSx = e => { e.target.style.borderColor = C.blueLight; e.target.style.boxShadow = `0 0 0 3px ${C.blueFaint}`; };
const blurSx  = e => { e.target.style.borderColor = C.darkBorder; e.target.style.boxShadow = 'none'; };

/* ── alumni card ─────────────────────────────────────────────────────────── */
const AlumniCard = ({ user }) => {
    const initials = user.name?.slice(0, 2).toUpperCase() || '??';

    return (
        <div style={{
            background: C.darkCard, border: `1px solid ${C.darkBorder}`,
            borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column',
            transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.2s',
        }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.blueBorder; e.currentTarget.style.boxShadow = `0 10px 36px rgba(32,54,113,0.22)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.darkBorder; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
            {/* top accent */}
            <div style={{ height: 3, background: `linear-gradient(90deg, ${C.blue}, ${C.blueLight})` }} />

            <div style={{ padding: '20px 20px 0' }}>
                {/* avatar row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{
                        width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, ${C.blueLight}, ${C.blueDark})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: C.white,
                        boxShadow: `0 0 0 3px ${C.blueBorder}`,
                    }}>
                        {initials}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                        {user.linkedin && (
                            <a href={user.linkedin} target="_blank" rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: C.blueFaint, border: `1px solid ${C.blueBorder}`, color: C.blueLight, fontSize: 14, textDecoration: 'none', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = `rgba(32,54,113,0.25)`}
                                onMouseLeave={e => e.currentTarget.style.background = C.blueFaint}
                            >
                                <FaLinkedin />
                            </a>
                        )}
                    </div>
                </div>

                {/* name + role */}
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: C.white, margin: '0 0 4px', lineHeight: 1.3 }}>
                    {user.name}
                </p>
                {user.department && (
                    <p style={{ fontSize: 11, color: C.blueLight, margin: '0 0 14px', fontWeight: 600, letterSpacing: '0.04em', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {user.department}
                    </p>
                )}

                {/* meta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
                    {user.graduationYear && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: C.muted }}>
                            <FaGraduationCap style={{ color: C.blueLight, fontSize: 11, flexShrink: 0 }} />
                            Batch of {user.graduationYear}
                        </div>
                    )}
                    {user.company && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: C.muted }}>
                            <FaBriefcase style={{ color: C.blueLight, fontSize: 11, flexShrink: 0 }} />
                            {user.company}
                        </div>
                    )}
                    {user.yearsOfExperience > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: C.muted }}>
                            <span style={{ width: 11, height: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: C.blueLight, fontSize: 11, flexShrink: 0 }}>⏱</span>
                            {user.yearsOfExperience} yrs experience
                        </div>
                    )}
                </div>
            </div>

            {/* action buttons */}
            <div style={{ padding: '0 14px 16px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to={`/profile/${user._id}`} style={{
                    display: 'block', textAlign: 'center', textDecoration: 'none',
                    background: C.blueFaint, border: `1px solid ${C.blueBorder}`,
                    borderRadius: 8, padding: '8px 0',
                    color: C.blueLight, fontSize: 12, fontWeight: 700,
                    letterSpacing: '0.05em', transition: 'background 0.2s',
                    fontFamily: "'DM Sans', sans-serif",
                }}
                    onMouseEnter={e => e.currentTarget.style.background = `rgba(32,54,113,0.22)`}
                    onMouseLeave={e => e.currentTarget.style.background = C.blueFaint}
                >
                    View Profile
                </Link>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); window.location.href = `mailto:${user.email}`; }}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`,
                            border: 'none', borderRadius: 8, padding: '8px 0',
                            color: C.white, fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            boxShadow: `0 2px 10px rgba(32,54,113,0.35)`,
                            transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        <FaEnvelope style={{ fontSize: 10 }} /> Email
                    </button>

                    <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                        style={{
                            flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            background: 'transparent', border: `1px solid ${C.blueBorder}`,
                            borderRadius: 8, padding: '8px 0',
                            color: C.muted, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.blueLight; e.currentTarget.style.color = C.blueLight; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.blueBorder; e.currentTarget.style.color = C.muted; }}
                    >
                        <FaPhone style={{ fontSize: 10 }} /> Request Contact
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── main ────────────────────────────────────────────────────────────────── */
const Directory = () => {
    const [users, setUsers]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [department, setDepartment] = useState('');
    const [page, setPage]             = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const departments = [
        'Computer Science & Engineering', 'Electrical Engineering', 'Mechanical Engineering',
        'Civil Engineering', 'Electronics & Communication', 'Metallurgical & Materials Engineering',
        'Production & Industrial Engineering', 'Computer Applications', 'Mathematics',
        'Physics', 'Chemistry', 'Humanities & Social Sciences',
    ];

    useEffect(() => { fetchUsers(); }, [page, department]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 12 };
            if (search) params.search = search;
            if (department) params.department = department;
            const { data } = await API.get('/users', { params });
            setUsers(data.users);
            setTotalPages(data.totalPages);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSearch = e => { e.preventDefault(); setPage(1); fetchUsers(); };

    return (
        <div style={{ minHeight: '100vh', background: C.black, padding: '48px 20px 72px', fontFamily: "'DM Sans', sans-serif", color: C.white }}>
            <div style={{ maxWidth: 1280, margin: '0 auto' }}>

                {/* HEADER */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.blueFaint, border: `1px solid ${C.blueBorder}`, borderRadius: 20, padding: '5px 14px', marginBottom: 18 }}>
                        <HiSparkles style={{ color: C.blueLight, fontSize: 13 }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.blueLight, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Alumni Network</span>
                    </div>
                    <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, margin: '0 0 14px', color: C.white, letterSpacing: '-0.7px', lineHeight: 1.15 }}>
                        Alumni{' '}
                        <span style={{ background: `linear-gradient(135deg, ${C.blueLight}, #6B8FE8)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Directory</span>
                    </h1>
                    <p style={{ fontSize: 15, color: C.muted, margin: 0, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.65 }}>
                        Find and connect with fellow NIT Jamshedpur alumni from across the world.
                    </p>
                </div>

                {/* SEARCH + FILTER */}
                <div style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 14, padding: '20px 22px', marginBottom: 36 }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: '1 1 260px', position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: 13, pointerEvents: 'none' }} />
                            <input
                                type="text" value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name, company, or skills…"
                                style={{ ...inputSx, paddingLeft: 38 }}
                                onFocus={focusSx} onBlur={blurSx}
                            />
                        </div>

                        <div style={{ flex: '1 1 220px' }}>
                            <select
                                value={department}
                                onChange={e => { setDepartment(e.target.value); setPage(1); }}
                                style={{ ...inputSx, appearance: 'none', cursor: 'pointer' }}
                                onFocus={focusSx} onBlur={blurSx}
                            >
                                <option value="" style={{ background: C.darkBg }}>All Departments</option>
                                {departments.map(d => <option key={d} value={d} style={{ background: C.darkBg }}>{d}</option>)}
                            </select>
                        </div>

                        <button type="submit" style={{
                            background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`,
                            border: 'none', borderRadius: 9, padding: '10px 26px',
                            color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            boxShadow: `0 3px 14px rgba(32,54,113,0.4)`,
                            transition: 'opacity 0.2s', whiteSpace: 'nowrap',
                        }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* CONTENT */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.blueFaint}`, borderTopColor: C.blueLight, animation: 'spin 0.7s linear infinite' }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '72px 32px', background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 16 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: C.blueFaint, border: `1px solid ${C.blueBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <FaUsers style={{ fontSize: 26, color: C.blueLight }} />
                        </div>
                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: C.white, margin: '0 0 8px' }}>No Alumni Found</h3>
                        <p style={{ fontSize: 13.5, color: C.muted, margin: 0 }}>Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
                            {users.map(u => <AlumniCard key={u._id} user={u} />)}
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 44 }}>
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    style={{
                                        background: C.darkCard, border: `1px solid ${C.darkBorder}`,
                                        borderRadius: 8, padding: '9px 20px',
                                        color: page === 1 ? C.darkBorder : C.muted,
                                        fontSize: 13, fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer',
                                        fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { if (page !== 1) { e.currentTarget.style.borderColor = C.blueBorder; e.currentTarget.style.color = C.white; } }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.darkBorder; e.currentTarget.style.color = page === 1 ? C.darkBorder : C.muted; }}
                                >← Previous</button>

                                <div style={{ display: 'flex', gap: 6 }}>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pg = i + 1;
                                        const active = pg === page;
                                        return (
                                            <button key={pg} onClick={() => setPage(pg)} style={{
                                                width: 36, height: 36, borderRadius: 8,
                                                background: active ? `linear-gradient(135deg, ${C.blueLight}, ${C.blue})` : C.darkCard,
                                                border: `1px solid ${active ? 'transparent' : C.darkBorder}`,
                                                color: active ? C.white : C.muted,
                                                fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer',
                                                fontFamily: "'DM Sans', sans-serif",
                                                boxShadow: active ? `0 2px 10px rgba(32,54,113,0.4)` : 'none',
                                                transition: 'all 0.2s',
                                            }}>{pg}</button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    style={{
                                        background: C.darkCard, border: `1px solid ${C.darkBorder}`,
                                        borderRadius: 8, padding: '9px 20px',
                                        color: page === totalPages ? C.darkBorder : C.muted,
                                        fontSize: 13, fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                        fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { if (page !== totalPages) { e.currentTarget.style.borderColor = C.blueBorder; e.currentTarget.style.color = C.white; } }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.darkBorder; e.currentTarget.style.color = page === totalPages ? C.darkBorder : C.muted; }}
                                >Next →</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Directory;
