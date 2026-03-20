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

/* ── tokens ──────────────────────────────────────────────────────────────── */
const C = {
    blue: '#203671', blueDark: '#182858', blueLight: '#2D4899',
    blueFaint: 'rgba(32,54,113,0.12)', blueBorder: 'rgba(32,54,113,0.35)',
    white: '#FFFFFF', muted: '#8A94A8', black: '#000000',
    darkBg: '#0C0E14', darkCard: '#12151F', darkBorder: '#1E2235',
    danger:  '#FF4D4D', dangerFaint:  'rgba(255,77,77,0.1)',
    warning: '#F59E0B', warningFaint: 'rgba(245,158,11,0.1)',
    success: '#22C55E', successFaint: 'rgba(34,197,94,0.1)',
};

/* ── font injection ──────────────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('admin-styles')) {
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700;800&display=swap';
    document.head.appendChild(l);
    const s = document.createElement('style'); s.id = 'admin-styles';
    s.textContent = `
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .adm-row:hover { background: rgba(32,54,113,0.06) !important; }
        .adm-tab { transition: all 0.2s; }
        .adm-tab:hover { border-color: rgba(32,54,113,0.45) !important; color: #fff !important; }
    `;
    document.head.appendChild(s);
}

/* ── helpers ─────────────────────────────────────────────────────────────── */
const inputSx = {
    width: '100%', background: C.darkBg, border: `1px solid ${C.darkBorder}`,
    borderRadius: 9, padding: '10px 14px', color: C.white, fontSize: 13,
    outline: 'none', fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
};
const focusSx = e => { e.target.style.borderColor = C.blueLight; e.target.style.boxShadow = `0 0 0 3px ${C.blueFaint}`; };
const blurSx  = e => { e.target.style.borderColor = C.darkBorder; e.target.style.boxShadow = 'none'; };

const Label = ({ children }) => (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>
        {children}
    </span>
);

const SectionCard = ({ children, style = {} }) => (
    <div style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 14, overflow: 'hidden', ...style }}>
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
    <th style={{ textAlign: 'left', padding: '13px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, borderBottom: `1px solid ${C.darkBorder}`, whiteSpace: 'nowrap' }}>
        {children}
    </th>
);

const TD = ({ children, style = {} }) => (
    <td style={{ padding: '13px 18px', fontSize: 13, color: C.muted, verticalAlign: 'middle', ...style }}>
        {children}
    </td>
);

/* ── main ────────────────────────────────────────────────────────────────── */
const Admin = () => {
    const { user }   = useAuth();
    const navigate   = useNavigate();
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

    const statCards = [
        { label: 'Total Users',  value: stats?.totalUsers,  accent: C.blueLight,  icon: FaUsers },
        { label: 'Alumni',       value: stats?.totalAlumni, accent: C.success,    icon: FaUserPlus },
        { label: 'Admins',       value: stats?.totalAdmins, accent: C.warning,    icon: FaUserShield },
        { label: 'Banned',       value: stats?.totalBanned, accent: C.danger,     icon: FaLock },
    ];

    return (
        <div style={{ minHeight: '100vh', background: C.black, padding: '48px 20px 72px', fontFamily: "'DM Sans', sans-serif", color: C.white }}>
            <div style={{ maxWidth: 1280, margin: '0 auto' }}>

                {/* ── HEADER ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 40, flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.blueFaint, border: `1px solid ${C.blueBorder}`, borderRadius: 20, padding: '5px 14px', marginBottom: 16 }}>
                            <HiSparkles style={{ color: C.blueLight, fontSize: 13 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.blueLight, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Administrator</span>
                        </div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 36, fontWeight: 800, margin: '0 0 8px', color: C.white, letterSpacing: '-0.5px' }}>
                            Admin{' '}
                            <span style={{ background: `linear-gradient(135deg, ${C.blueLight}, #6B8FE8)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
                        </h1>
                        <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>Manage users, view statistics, and control access.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 10, padding: '8px 16px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.success, animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Signed in as <span style={{ color: C.white }}>{user?.name}</span></span>
                    </div>
                </div>

                {/* ── TAB BAR ── */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
                    {tabs.map(tab => {
                        const active = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="adm-tab" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: active ? `linear-gradient(135deg, ${C.blueLight}, ${C.blue})` : C.darkCard,
                                border: `1px solid ${active ? 'transparent' : C.darkBorder}`,
                                borderRadius: 9, padding: '10px 22px',
                                color: active ? C.white : C.muted,
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
                            <div style={{ padding: '18px 20px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 260px', position: 'relative' }}>
                                    <FaSearch style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: 12, pointerEvents: 'none' }} />
                                    <input
                                        type="text" value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search by name, email, or department…"
                                        style={{ ...inputSx, paddingLeft: 36 }}
                                        onFocus={focusSx} onBlur={blurSx}
                                    />
                                </div>
                                <button onClick={handleSearch} style={{ background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`, border: 'none', borderRadius: 8, padding: '10px 22px', color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: `0 3px 14px rgba(32,54,113,0.4)`, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >Search</button>

                                <button onClick={() => setShowAddForm(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: showAddForm ? 'transparent' : C.darkBorder, border: `1px solid ${showAddForm ? C.blueBorder : 'transparent'}`, borderRadius: 8, padding: '10px 18px', color: showAddForm ? C.muted : C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                                    {showAddForm ? <><FaTimes style={{ fontSize: 11 }} /> Cancel</> : <><FaPlus style={{ fontSize: 11 }} /> Add User</>}
                                </button>
                            </div>

                            {/* add user form */}
                            {showAddForm && (
                                <div style={{ borderTop: `1px solid ${C.darkBorder}`, padding: '22px 20px', background: C.darkBg }}>
                                    <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: C.white, margin: '0 0 18px' }}>Add New User</p>
                                    <form onSubmit={handleAddUser}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
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
                                                <option value="alumni" style={{ background: C.darkBg }}>Alumni</option>
                                                <option value="admin"  style={{ background: C.darkBg }}>Admin</option>
                                            </select>
                                        </div>
                                        <button type="submit" style={{ background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`, border: 'none', borderRadius: 8, padding: '10px 24px', color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: `0 3px 14px rgba(32,54,113,0.4)` }}>
                                            Add User
                                        </button>
                                    </form>
                                </div>
                            )}
                        </SectionCard>

                        {/* users table */}
                        <SectionCard>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                                                <div style={{ display: 'inline-block', width: 32, height: 32, borderRadius: '50%', border: `3px solid ${C.blueFaint}`, borderTopColor: C.blueLight, animation: 'spin 0.7s linear infinite' }} />
                                            </td></tr>
                                        ) : users.length === 0 ? (
                                            <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: C.muted, fontSize: 13 }}>No users found</td></tr>
                                        ) : users.map(u => (
                                            <tr key={u._id} className="adm-row" style={{ borderTop: `1px solid ${C.darkBorder}`, transition: 'background 0.2s' }}>
                                                <TD>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${C.blueLight}, ${C.blueDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: C.white, flexShrink: 0 }}>
                                                            {u.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <span style={{ color: C.white, fontWeight: 600 }}>{u.name}</span>
                                                    </div>
                                                </TD>
                                                <TD>{u.email}</TD>
                                                <TD>{u.department || <span style={{ color: C.darkBorder }}>—</span>}</TD>
                                                <TD>{u.graduationYear || <span style={{ color: C.darkBorder }}>—</span>}</TD>
                                                <TD>
                                                    <select value={u.role} onChange={e => handleUpdateRole(u._id, e.target.value)}
                                                        style={{ background: u.role === 'admin' ? 'rgba(245,158,11,0.1)' : C.blueFaint, border: `1px solid ${u.role === 'admin' ? 'rgba(245,158,11,0.3)' : C.blueBorder}`, borderRadius: 7, padding: '5px 10px', color: u.role === 'admin' ? C.warning : C.blueLight, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", outline: 'none', appearance: 'none' }}
                                                    >
                                                        <option value="alumni" style={{ background: C.darkBg }}>Alumni</option>
                                                        <option value="admin"  style={{ background: C.darkBg }}>Admin</option>
                                                    </select>
                                                </TD>
                                                <TD>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <IconBtn onClick={() => handleBanUser(u._id, 'Banned by admin')} title="Ban user" bg={C.warningFaint} color={C.warning}>
                                                            <FaLock style={{ fontSize: 11 }} />
                                                        </IconBtn>
                                                        <IconBtn onClick={() => handleDeleteUser(u._id)} title="Delete user" bg={C.dangerFaint} color={C.danger}>
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
                        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.darkBorder}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.dangerFaint, border: `1px solid rgba(255,77,77,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaLock style={{ color: C.danger, fontSize: 12 }} />
                            </div>
                            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: C.white }}>Banned Users</span>
                            <span style={{ marginLeft: 'auto', background: C.dangerFaint, border: `1px solid rgba(255,77,77,0.25)`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, color: C.danger }}>
                                {bannedUsers.length}
                            </span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                                            <div style={{ display: 'inline-block', width: 32, height: 32, borderRadius: '50%', border: `3px solid ${C.blueFaint}`, borderTopColor: C.blueLight, animation: 'spin 0.7s linear infinite' }} />
                                        </td></tr>
                                    ) : bannedUsers.length === 0 ? (
                                        <tr><td colSpan="4" style={{ padding: '48px', textAlign: 'center', color: C.muted, fontSize: 13 }}>No banned users</td></tr>
                                    ) : bannedUsers.map(u => (
                                        <tr key={u._id} className="adm-row" style={{ borderTop: `1px solid ${C.darkBorder}`, transition: 'background 0.2s' }}>
                                            <TD>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.dangerFaint, border: `1px solid rgba(255,77,77,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: C.danger, flexShrink: 0 }}>
                                                        {u.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <span style={{ color: C.white, fontWeight: 600 }}>{u.name}</span>
                                                </div>
                                            </TD>
                                            <TD>{u.email}</TD>
                                            <TD>
                                                <span style={{ background: C.dangerFaint, border: `1px solid rgba(255,77,77,0.2)`, borderRadius: 6, padding: '3px 10px', fontSize: 11, color: C.danger }}>
                                                    {u.banReason || 'No reason given'}
                                                </span>
                                            </TD>
                                            <TD>
                                                <button onClick={() => handleBanUser(u._id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.successFaint, border: `1px solid rgba(34,197,94,0.25)`, borderRadius: 7, padding: '6px 14px', color: C.success, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.2s' }}
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
                            {statCards.map((s, i) => (
                                <div key={i} style={{ background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 14, padding: '24px', position: 'relative', overflow: 'hidden', borderLeft: `3px solid ${s.accent}` }}>
                                    <div style={{ position: 'absolute', right: -10, top: -10, width: 70, height: 70, borderRadius: '50%', background: `${s.accent}10` }} />
                                    <div style={{ width: 36, height: 36, borderRadius: 9, background: `${s.accent}18`, border: `1px solid ${s.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                                        <s.icon style={{ color: s.accent, fontSize: 15 }} />
                                    </div>
                                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, margin: '0 0 8px' }}>{s.label}</p>
                                    <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 36, fontWeight: 800, color: s.accent, margin: 0, lineHeight: 1 }}>
                                        {loading ? '—' : (s.value ?? '—')}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* extra info panel */}
                        {stats && !loading && (
                            <SectionCard>
                                <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.darkBorder}`, display: 'flex', alignItems: 'center', gap: 9 }}>
                                    <FaChartBar style={{ color: C.blueLight, fontSize: 13 }} />
                                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: C.white }}>Platform Overview</span>
                                </div>
                                <div style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                                    {[
                                        { label: 'Total Jobs Posted',   value: stats.totalJobs   ?? 0 },
                                        { label: 'Total Events',        value: stats.totalEvents ?? 0 },
                                        { label: 'Stories Published',   value: stats.totalNews   ?? 0 },
                                        { label: 'Active This Month',   value: stats.activeUsers ?? 0 },
                                    ].map((r, i) => (
                                        <div key={i} style={{ background: C.darkBg, border: `1px solid ${C.darkBorder}`, borderRadius: 10, padding: '16px 18px' }}>
                                            <p style={{ fontSize: 11, color: C.muted, margin: '0 0 6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{r.label}</p>
                                            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: C.white, margin: 0 }}>{r.value}</p>
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