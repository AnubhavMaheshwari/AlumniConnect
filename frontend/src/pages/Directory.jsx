import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { FaSearch } from 'react-icons/fa';

const Directory = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [department, setDepartment] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const departments = [
        'Computer Science & Engineering', 'Electrical Engineering', 'Mechanical Engineering',
        'Civil Engineering', 'Electronics & Communication', 'Metallurgical & Materials Engineering',
        'Production & Industrial Engineering', 'Computer Applications', 'Mathematics',
        'Physics', 'Chemistry', 'Humanities & Social Sciences'
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
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchUsers(); };

    return (
        <div className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-heading">Alumni <span className="gradient-text">Directory</span></h1>
                    <p className="text-body text-lg max-w-2xl mx-auto">Find and connect with fellow NIT Jamshedpur alumni from across the world.</p>
                </div>

                <div className="glass-card p-6 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, company, or skills..." className="input-field !pl-11" />
                        </div>
                        <select value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1); }} className="input-field !w-auto min-w-[200px] appearance-none">
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <button type="submit" className="btn-primary">Search</button>
                    </form>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20 glass-card">
                        <FaSearch className="text-6xl text-muted mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-heading mb-2">No Alumni Found</h3>
                        <p className="text-body">Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {users.map((user, i) => (
                                <Link 
                                    key={user._id} 
                                    to={`/profile/${user._id}`} 
                                    className="bg-white border-2 border-black rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between animate-fade-in" 
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    {/* Top Section */}
                                    <div className="flex justify-between items-start mb-4">
                                        {/* Profile Icon */}
                                        <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center text-2xl font-semibold">
                                            {user.name?.charAt(0)?.toUpperCase()}
                                        </div>

                                        {/* Right Icons */}
                                        <div className="flex flex-col gap-3 items-center">
                                            {user.linkedin && (
                                                <a
                                                    href={user.linkedin}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-blue-600 text-xl font-bold"
                                                >
                                                    in
                                                </a>
                                            )}

                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    // handle request contact
                                                }}
                                                className="border p-1 rounded hover:bg-gray-100"
                                            >
                                                ⬆️
                                            </button>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="text-left space-y-1 text-sm text-gray-700 mb-4">
                                        <p><span className="font-medium">Name :</span> {user.name}</p>
                                        <p><span className="font-medium">Batch :</span> {user.graduationYear || 'N/A'}</p>
                                        <p><span className="font-medium">Course :</span> B.Tech</p>
                                        <p><span className="font-medium">Company :</span> {user.company || 'N/A'}</p>
                                        <p><span className="font-medium">Year of Exp :</span> {user.experience || 'N/A'}</p>
                                    </div>

                                    {/* Buttons */}
                                    <div className="space-y-3 mt-auto">
                                        <button
                                            className="w-full border-2 border-black rounded-full py-2 font-medium hover:bg-gray-100 transition"
                                        >
                                            Details
                                        </button>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    window.location.href = `mailto:${user.email}`;
                                                }}
                                                className="flex-1 bg-sky-500 text-white rounded-xl py-2 hover:bg-sky-600 transition"
                                            >
                                                Email
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    // request contact number logic
                                                }}
                                                className="flex-[2] bg-blue-700 text-white rounded-xl py-2 hover:bg-blue-800 transition"
                                            >
                                                Ask Contact Number?
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-10">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary !py-2 !px-4 text-sm disabled:opacity-40">Previous</button>
                                <span className="px-4 py-2 text-body text-sm flex items-center">Page {page} of {totalPages}</span>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary !py-2 !px-4 text-sm disabled:opacity-40">Next</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Directory;
