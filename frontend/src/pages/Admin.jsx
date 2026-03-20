import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../services/api';
import { FaTrash, FaLock, FaSearch, FaUserPlus, FaUsers, FaUserShield } from 'react-icons/fa';

const Admin = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [bannedUsers, setBannedUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        department: '',
        graduationYear: new Date().getFullYear(),
        phone: '',
        role: 'alumni'
    });

    // Redirect if not admin
    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    // Fetch data based on active tab
    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'banned') fetchBannedUsers();
        if (activeTab === 'stats') fetchStats();
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/admin/users');
            setUsers(data.users);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchBannedUsers = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/admin/banned-users');
            setBannedUsers(data.users);
        } catch (error) {
            toast.error('Failed to fetch banned users');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/admin/stats');
            setStats(data.stats);
        } catch (error) {
            toast.error('Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await API.post('/admin/users', newUser);
            toast.success('User added successfully');
            setNewUser({
                name: '',
                email: '',
                password: '',
                department: '',
                graduationYear: new Date().getFullYear(),
                phone: '',
                role: 'alumni'
            });
            setShowAddForm(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await API.delete(`/admin/users/${userId}`);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    };

    const handleBanUser = async (userId, reason = '') => {
        try {
            await API.patch(`/admin/users/${userId}/ban`, { banReason: reason });
            toast.success('User status updated');
            fetchUsers();
            fetchBannedUsers();
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await API.patch(`/admin/users/${userId}/role`, { role: newRole });
            toast.success('User role updated');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user role');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchUsers();
            return;
        }
        setLoading(true);
        try {
            const { data } = await API.get(`/admin/search?q=${searchQuery}`);
            setUsers(data.users);
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-heading mb-2">Admin Dashboard</h1>
                    <p className="text-body text-lg">Manage users, view statistics, and control access</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8 flex-wrap">
                    {[
                        { id: 'users', label: 'Users', icon: FaUsers },
                        { id: 'banned', label: 'Banned Users', icon: FaLock },
                        { id: 'stats', label: 'Statistics', icon: FaUserShield }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                activeTab === tab.id
                                    ? 'bg-primary text-white'
                                    : 'bg-[var(--bg-tertiary)] text-body hover:text-heading'
                            }`}
                        >
                            <tab.icon /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        {/* Add User Form */}
                        <div className="glass-card p-6">
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                            >
                                <FaUserPlus /> Add New User
                            </button>

                            {showAddForm && (
                                <form onSubmit={handleAddUser} className="mt-6 space-y-4 p-6 bg-[var(--bg-tertiary)]/30 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone"
                                            value={newUser.phone}
                                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                            className="input-field"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Department"
                                            value={newUser.department}
                                            onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                                            className="input-field"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Graduation Year"
                                            value={newUser.graduationYear}
                                            onChange={(e) => setNewUser({ ...newUser, graduationYear: parseInt(e.target.value) })}
                                            className="input-field"
                                        />
                                        <select
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                            className="input-field"
                                        >
                                            <option value="alumni">Alumni</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="submit" className="btn-primary">Add User</button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddForm(false)}
                                            className="btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Search Bar */}
                        <div className="glass-card p-6">
                            <div className="flex gap-3">
                                <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)]/30 rounded-lg">
                                    <FaSearch className="text-body" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or department..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="flex-1 bg-transparent outline-none text-body"
                                    />
                                </div>
                                <button onClick={handleSearch} className="btn-primary">Search</button>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="glass-card overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-themed">
                                        <th className="text-left p-4 font-bold text-heading">Name</th>
                                        <th className="text-left p-4 font-bold text-heading">Email</th>
                                        <th className="text-left p-4 font-bold text-heading">Department</th>
                                        <th className="text-left p-4 font-bold text-heading">Role</th>
                                        <th className="text-left p-4 font-bold text-heading">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="text-center p-4 text-body">Loading...</td>
                                        </tr>
                                    ) : users.length > 0 ? (
                                        users.map(u => (
                                            <tr key={u._id} className="border-b border-themed/50 hover:bg-[var(--bg-tertiary)]/20 transition">
                                                <td className="p-4 text-body">{u.name}</td>
                                                <td className="p-4 text-body">{u.email}</td>
                                                <td className="p-4 text-body">{u.department || '-'}</td>
                                                <td className="p-4">
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                                                        className="input-field py-1 px-2 text-sm"
                                                    >
                                                        <option value="alumni">Alumni</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="p-4 flex gap-2">
                                                    <button
                                                        onClick={() => handleBanUser(u._id, 'Banned by admin')}
                                                        className="p-2 rounded-lg bg-warning/20 text-warning hover:bg-warning/30 transition"
                                                        title="Ban user"
                                                    >
                                                        <FaLock size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id)}
                                                        className="p-2 rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition"
                                                        title="Delete user"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center p-4 text-body">No users found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Banned Users Tab */}
                {activeTab === 'banned' && (
                    <div className="glass-card overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-themed">
                                    <th className="text-left p-4 font-bold text-heading">Name</th>
                                    <th className="text-left p-4 font-bold text-heading">Email</th>
                                    <th className="text-left p-4 font-bold text-heading">Ban Reason</th>
                                    <th className="text-left p-4 font-bold text-heading">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center p-4 text-body">Loading...</td>
                                    </tr>
                                ) : bannedUsers.length > 0 ? (
                                    bannedUsers.map(u => (
                                        <tr key={u._id} className="border-b border-themed/50">
                                            <td className="p-4 text-body">{u.name}</td>
                                            <td className="p-4 text-body">{u.email}</td>
                                            <td className="p-4 text-body text-sm">{u.banReason || '-'}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleBanUser(u._id)}
                                                    className="px-3 py-1 bg-success/20 text-success rounded-lg text-sm hover:bg-success/30 transition"
                                                >
                                                    Unban
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center p-4 text-body">No banned users</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Statistics Tab */}
                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Users', value: stats?.totalUsers, color: 'primary' },
                            { label: 'Alumni', value: stats?.totalAlumni, color: 'success' },
                            { label: 'Admins', value: stats?.totalAdmins, color: 'warning' },
                            { label: 'Banned', value: stats?.totalBanned, color: 'danger' }
                        ].map((stat, i) => (
                            <div key={i} className={`glass-card p-6 border-l-4 border-${stat.color}`}>
                                <h3 className="text-body text-sm mb-2">{stat.label}</h3>
                                <p className={`text-4xl font-bold text-${stat.color}`}>{loading ? '-' : stat.value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
