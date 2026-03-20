import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../services/api';
import {
    FaTrash, FaLock, FaSearch, FaUserPlus, FaUsers,
    FaUserShield, FaUnlock, FaChartBar, FaTimes, FaPlus,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import useIsMobile from '../hooks/useIsMobile';

/* ── font injection ──────────────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('admin-styles')) {
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700;800&display=swap';
    document.head.appendChild(l);
    const s = document.createElement('style'); s.id = 'admin-styles';
    s.textContent = `
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .adm-row:hover { background: var(--blue-faint) !important; }
        .adm-tab { transition: all 0.2s; }
        .adm-tab:hover { border-color: var(--blue-border) !important; color: var(--text-primary) !important; }
    `;
    document.head.appendChild(s);
}

/* ── helpers ─────────────────────────────────────────────────────────────── */
const DANGER = '#FF4D4D';
const DANGER_FAINT = 'rgba(255,77,77,0.1)';
const WARNING = '#F59E0B';
const WARNING_FAINT = 'rgba(245,158,11,0.1)';
const SUCCESS = '#22C55E';
const SUCCESS_FAINT = 'rgba(34,197,94,0.1)';

const inputSx = {
    width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)',
    borderRadius: 9, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13,
    outline: 'none', fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
};
const focusSx = e => { e.target.style.borderColor = 'var(--blue-light)'; e.target.style.boxShadow = `0 0 0 3px var(--blue-faint)`; };
const blurSx  = e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

const Label = ({ children }) => (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {children}
    </span>
);

const SectionCard = ({ children, style = {} }) => (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', transition: 'background 0.3s, border-color 0.3s', ...style }}>
        {children}
    </div>
);

const IconBtn = ({ onClick, title, bg, color, children }) => (
    <button onClick={onClick} title={title} style={{
        width: 32, height: 32, borderRadius: 8,
        background: bg, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, fontSize: 13, transition: 'opacity 0.2s',
    }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >{children}</button>
);

const TH = ({ children }) => (
    <th style={{ textAlign: 'left', padding: '13px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
        {children}
    </th>
);

const TD = ({ children, style = {} }) => (
    <td style={{ padding: '13px 18px', fontSize: 13, color: 'var(--text-secondary)', verticalAlign: 'middle', ...style }}>
        {children}
    </td>
);

/* ── main ────────────────────────────────────────────────────────────────── */
const Admin = () => {
    const { user }   = useAuth();
    const navigate   = useNavigate();
    const isMobile   = useIsMobile();
    const [activeTab, setActiveTab]     = useState('users');
    const [users, setUsers]             = useState([]);
    const [bannedUsers, setBannedUsers] = useState([]);
    const [stats, setStats]             = useState(null);
    const [loading, setLoading]         = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser]         = useState({
        name: '', email: '', password: '', department: '',
        graduationYear: new Date().getFullYear(), phone: '', role: 'alumni',
    });

    useEffect(() => { if (user && user.role !== 'admin') navigate('/'); }, [user, navigate]);
    useEffect(() => {
        if (activeTab === 'users')  fetchUsers();
        if (activeTab === 'banned') fetchBannedUsers();
        if (activeTab === 'stats')  fetchStats();
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try { const { data } = await API.get('/admin/users'); setUsers(data.users); }
        catch { toast.error('Failed to fetch users'); }
        finally { setLoading(false); }
    };
    const fetchBannedUsers = async () => {
        setLoading(true);
        try { const { data } = await API.get('/admin/banned-users'); setBannedUsers(data.users); }
        catch { toast.error('Failed to fetch banned users'); }
        finally { setLoading(false); }
    };
    const fetchStats = async () => {
        setLoading(true);
        try { const { data } = await API.get('/admin/stats'); setStats(data.stats); }
        catch { toast.error('Failed to fetch stats'); }
        finally { setLoading(false); }
    };
    const handleAddUser = async e => {
        e.preventDefault();
        try {
            await API.post('/admin/users', newUser);
            toast.success('User added');
            setNewUser({ name:'', email:'', password:'', department:'', graduationYear: new Date().getFullYear(), phone:'', role:'alumni' });
            setShowAddForm(false); fetchUsers();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to add user'); }
    };
    const handleDeleteUser = async id => {
        if (!window.confirm('Delete this user?')) return;
        try { await API.delete(`/admin/users/${id}`); toast.success('User deleted'); fetchUsers(); }
        catch { toast.error('Failed to delete'); }
    };
    const handleBanUser = async (id, reason = '') => {
        try { await API.patch(`/admin/users/${id}/ban`, { banReason: reason }); toast.success('Status updated'); fetchUsers(); fetchBannedUsers(); }
        catch { toast.error('Failed to update status'); }
    };
    const handleUpdateRole = async (id, role) => {
        try { await API.patch(`/admin/users/${id}/role`, { role }); toast.success('Role updated'); fetchUsers(); }
        catch { toast.error('Failed to update role'); }
    };
    const handleSearch = async () => {
        if (!searchQuery.trim()) { fetchUsers(); return; }
        setLoading(true);
        try { const { data } = await API.get(`/admin/search?q=${searchQuery}`); setUsers(data.users); }
        catch { toast.error('Search failed'); }
        finally { setLoading(false); }
    };

    if (user?.role !== 'admin') return null;

    const tabs = [
        { id: 'users',  label: 'Users',        icon: FaUsers },
        { id: 'banned', label: 'Banned',        icon: FaLock },
        { id: 'stats',  label: 'Statistics',    icon: FaChartBar },
    ];

    const blueLight = 'var(--blue-light)';

    const statCards = [
        { label: 'Total Users',  value: stats?.totalUsers,  accent: blueLight,  icon: FaUsers },
        { label: 'Alumni',       value: stats?.totalAlumni, accent: SUCCESS,    icon: FaUserPlus },
        { label: 'Admins',       value: stats?.totalAdmins, accent: WARNING,    icon: FaUserShield },
        { label: 'Banned',       value: stats?.totalBanned, accent: DANGER,     icon: FaLock },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: isMobile ? '32px 12px 56px' : '48px 20px 72px', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', transition: 'background 0.3s, color 0.3s' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto' }}>

                {/* ── HEADER ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: isMobile ? 28 : 40, flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', borderRadius: 20, padding: '5px 14px', marginBottom: 16 }}>
                            <HiSparkles style={{ color: 'var(--blue-light)', fontSize: 13 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-light)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Administrator</span>
                        </div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 28 : 36, fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                            Admin{' '}
                            <span style={{ background: `linear-gradient(135deg, var(--blue-light), #6B8FE8)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Manage users, view statistics, and control access.</p>
                    </div>
                    {!isMobile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 16px' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: SUCCESS, animation: 'pulse 2s infinite' }} />
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Signed in as <span style={{ color: 'var(--text-primary)' }}>{user?.name}</span></span>
                        </div>
                    )}
                </div>

                {/* ── TAB BAR ── */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
                    {tabs.map(tab => {
                        const active = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="adm-tab" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: active ? `linear-gradient(135deg, var(--blue-light), var(--blue))` : 'var(--bg-secondary)',
                                border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
                                borderRadius: 9, padding: isMobile ? '9px 16px' : '10px 22px',
                                color: active ? '#fff' : 'var(--text-muted)',
                                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                fontFamily: "'DM Sans', sans-serif",
                                boxShadow: active ? `0 3px 14px rgba(32,54,113,0.4)` : 'none',
                            }}>
                                <tab.icon style={{ fontSize: 13 }} /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ─────────────────── USERS TAB ─────────────────── */}
                {activeTab === 'users' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp 0.4s ease both' }}>

                        {/* search + add button row */}
                        <SectionCard>
                            <div style={{ padding: isMobile ? '14px 12px' : '18px 20px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 260px', position: 'relative' }}>
                                    <FaSearch style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 12, pointerEvents: 'none' }} />
                                    <input
                                        type="text" value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search by name, email, or department…"
                                        style={{ ...inputSx, paddingLeft: 36 }}
                                        onFocus={focusSx} onBlur={blurSx}
                                    />
                                </div>
                                <button onClick={handleSearch} style={{ background: `linear-gradient(135deg, var(--blue-light), var(--blue))`, border: 'none', borderRadius: 8, padding: '10px 22px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: `0 3px 14px rgba(32,54,113,0.4)`, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >Search</button>

                                <button onClick={() => setShowAddForm(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: showAddForm ? 'transparent' : 'var(--bg-tertiary)', border: `1px solid ${showAddForm ? 'var(--blue-border)' : 'transparent'}`, borderRadius: 8, padding: '10px 18px', color: showAddForm ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                                    {showAddForm ? <><FaTimes style={{ fontSize: 11 }} /> Cancel</> : <><FaPlus style={{ fontSize: 11 }} /> Add User</>}
                                </button>
                            </div>

                            {/* add user form */}
                            {showAddForm && (
                                <div style={{ borderTop: '1px solid var(--border)', padding: isMobile ? '16px 12px' : '22px 20px', background: 'var(--bg)' }}>
                                    <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 18px' }}>Add New User</p>
                                    <form onSubmit={handleAddUser}>
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
                                            {[
                                                { name: 'name',           placeholder: 'Full Name *',       type: 'text',     required: true },
                                                { name: 'email',          placeholder: 'Email *',           type: 'email',    required: true },
                                                { name: 'password',       placeholder: 'Password *',        type: 'password', required: true },
                                                { name: 'phone',          placeholder: 'Phone',             type: 'tel' },
                                                { name: 'department',     placeholder: 'Department',        type: 'text' },
                                                { name: 'graduationYear', placeholder: 'Graduation Year',   type: 'number' },
                                            ].map(f => (
                                                <div key={f.name}>
                                                    <input type={f.type} placeholder={f.placeholder} required={f.required}
                                                        value={newUser[f.name]}
                                                        onChange={e => setNewUser({ ...newUser, [f.name]: f.type === 'number' ? parseInt(e.target.value) : e.target.value })}
                                                        style={inputSx} onFocus={focusSx} onBlur={blurSx}
                                                    />
                                                </div>
                                            ))}
                                            <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={{ ...inputSx, appearance: 'none', cursor: 'pointer' }} onFocus={focusSx} onBlur={blurSx}>
                                                <option value="alumni" style={{ background: 'var(--bg-secondary)' }}>Alumni</option>
                                                <option value="admin"  style={{ background: 'var(--bg-secondary)' }}>Admin</option>
                                            </select>
                                        </div>
                                        <button type="submit" style={{ background: `linear-gradient(135deg, var(--blue-light), var(--blue))`, border: 'none', borderRadius: 8, padding: '10px 24px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: `0 3px 14px rgba(32,54,113,0.4)` }}>
                                            Add User
                                        </button>
                                    </form>
                                </div>
                            )}
                        </SectionCard>

                        {/* users table */}
                        <SectionCard>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 640 : 'auto' }}>
                                    <thead>
                                        <tr>
                                            <TH>Name</TH>
                                            <TH>Email</TH>
                                            <TH>Department</TH>
                                            <TH>Batch</TH>
                                            <TH>Role</TH>
                                            <TH>Actions</TH>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>
                                                <div style={{ display: 'inline-block', width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--blue-faint)', borderTopColor: 'var(--blue-light)', animation: 'spin 0.7s linear infinite' }} />
                                            </td></tr>
                                        ) : users.length === 0 ? (
                                            <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No users found</td></tr>
                                        ) : users.map(u => (
                                            <tr key={u._id} className="adm-row" style={{ borderTop: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                                <TD>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, var(--blue-light), var(--blue-dark))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                                                            {u.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{u.name}</span>
                                                    </div>
                                                </TD>
                                                <TD>{u.email}</TD>
                                                <TD>{u.department || <span style={{ color: 'var(--border)' }}>—</span>}</TD>
                                                <TD>{u.graduationYear || <span style={{ color: 'var(--border)' }}>—</span>}</TD>
                                                <TD>
                                                    <select value={u.role} onChange={e => handleUpdateRole(u._id, e.target.value)}
                                                        style={{ background: u.role === 'admin' ? WARNING_FAINT : 'var(--blue-faint)', border: `1px solid ${u.role === 'admin' ? 'rgba(245,158,11,0.3)' : 'var(--blue-border)'}`, borderRadius: 7, padding: '5px 10px', color: u.role === 'admin' ? WARNING : 'var(--blue-light)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", outline: 'none', appearance: 'none' }}
                                                    >
                                                        <option value="alumni" style={{ background: 'var(--bg-secondary)' }}>Alumni</option>
                                                        <option value="admin"  style={{ background: 'var(--bg-secondary)' }}>Admin</option>
                                                    </select>
                                                </TD>
                                                <TD>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <IconBtn onClick={() => handleBanUser(u._id, 'Banned by admin')} title="Ban user" bg={WARNING_FAINT} color={WARNING}>
                                                            <FaLock style={{ fontSize: 11 }} />
                                                        </IconBtn>
                                                        <IconBtn onClick={() => handleDeleteUser(u._id)} title="Delete user" bg={DANGER_FAINT} color={DANGER}>
                                                            <FaTrash style={{ fontSize: 11 }} />
                                                        </IconBtn>
                                                    </div>
                                                </TD>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>
                    </div>
                )}

                {/* ─────────────────── BANNED TAB ─────────────────── */}
                {activeTab === 'banned' && (
                    <SectionCard style={{ animation: 'fadeUp 0.4s ease both' }}>
                        <div style={{ padding: isMobile ? '14px 12px' : '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: DANGER_FAINT, border: '1px solid rgba(255,77,77,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaLock style={{ color: DANGER, fontSize: 12 }} />
                            </div>
                            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Banned Users</span>
                            <span style={{ marginLeft: 'auto', background: DANGER_FAINT, border: '1px solid rgba(255,77,77,0.25)', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, color: DANGER }}>
                                {bannedUsers.length}
                            </span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 500 : 'auto' }}>
                                <thead>
                                    <tr>
                                        <TH>Name</TH>
                                        <TH>Email</TH>
                                        <TH>Ban Reason</TH>
                                        <TH>Action</TH>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-block', width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--blue-faint)', borderTopColor: 'var(--blue-light)', animation: 'spin 0.7s linear infinite' }} />
                                        </td></tr>
                                    ) : bannedUsers.length === 0 ? (
                                        <tr><td colSpan="4" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No banned users</td></tr>
                                    ) : bannedUsers.map(u => (
                                        <tr key={u._id} className="adm-row" style={{ borderTop: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                            <TD>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: DANGER_FAINT, border: '1px solid rgba(255,77,77,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: DANGER, flexShrink: 0 }}>
                                                        {u.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{u.name}</span>
                                                </div>
                                            </TD>
                                            <TD>{u.email}</TD>
                                            <TD>
                                                <span style={{ background: DANGER_FAINT, border: '1px solid rgba(255,77,77,0.2)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: DANGER }}>
                                                    {u.banReason || 'No reason given'}
                                                </span>
                                            </TD>
                                            <TD>
                                                <button onClick={() => handleBanUser(u._id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: SUCCESS_FAINT, border: '1px solid rgba(34,197,94,0.25)', borderRadius: 7, padding: '6px 14px', color: SUCCESS, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.75'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                                >
                                                    <FaUnlock style={{ fontSize: 10 }} /> Unban
                                                </button>
                                            </TD>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}

                {/* ─────────────────── STATS TAB ─────────────────── */}
                {activeTab === 'stats' && (
                    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
                            {statCards.map((s, i) => (
                                <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, padding: isMobile ? '18px' : '24px', position: 'relative', overflow: 'hidden', borderLeft: `3px solid ${s.accent}`, transition: 'background 0.3s, border-color 0.3s' }}>
                                    <div style={{ position: 'absolute', right: -10, top: -10, width: 70, height: 70, borderRadius: '50%', background: `${s.accent}10` }} />
                                    <div style={{ width: 36, height: 36, borderRadius: 9, background: `${s.accent}18`, border: `1px solid ${s.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                                        <s.icon style={{ color: s.accent, fontSize: 15 }} />
                                    </div>
                                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 8px' }}>{s.label}</p>
                                    <p style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 28 : 36, fontWeight: 800, color: s.accent, margin: 0, lineHeight: 1 }}>
                                        {loading ? '—' : (s.value ?? '—')}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* extra info panel */}
                        {stats && !loading && (
                            <SectionCard>
                                <div style={{ padding: isMobile ? '14px 16px' : '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
                                    <FaChartBar style={{ color: 'var(--blue-light)', fontSize: 13 }} />
                                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Platform Overview</span>
                                </div>
                                <div style={{ padding: isMobile ? '16px' : '20px 22px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                                    {[
                                        { label: 'Total Jobs Posted',   value: stats.totalJobs   ?? 0 },
                                        { label: 'Total Events',        value: stats.totalEvents ?? 0 },
                                        { label: 'Stories Published',   value: stats.totalNews   ?? 0 },
                                        { label: 'Active This Month',   value: stats.activeUsers ?? 0 },
                                    ].map((r, i) => (
                                        <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{r.label}</p>
                                            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{r.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}
                    </div>
                )}
            </div>
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
    );
};

export default Admin;