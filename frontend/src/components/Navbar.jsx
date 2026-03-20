import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaGraduationCap, FaSun, FaMoon } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    // Links visible to everyone (guest)
    const publicLinks = [
        { name: 'Home', path: '/' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Contact', path: '/contact' },
    ];

    // Links visible only when logged in
    const authLinks = [
        { name: 'Home', path: '/' },
        { name: 'Directory', path: '/directory' },
        { name: 'Events', path: '/events' },
        { name: 'Jobs', path: '/jobs' },
        { name: 'News', path: '/news' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Contact', path: '/contact' },
        ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin' }] : []),
    ];

    const navLinks = user ? authLinks : publicLinks;

    return (
        <nav className="sticky top-0 left-0 right-0 z-50 nav-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-4 group ml-4 lg:ml-8">
                        {/* <div className="ml-4 w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FaGraduationCap className="text-white text-lg" />
                        </div> */}
                        <span className="text-xl font-bold gradient-text">NIT JSR Alumni</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path + link.name}
                                    to={link.path}
                                    className={`px-4 py-2 text-sm font-medium transition-all ${isActive
                                        ? 'text-primary font-bold underline underline-offset-8 decoration-2 decoration-primary'
                                        : 'text-body hover:text-heading hover:bg-[var(--bg-tertiary)] rounded-lg'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Auth Buttons & Theme Toggle */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-body hover:text-heading hover:bg-[var(--bg-tertiary)] transition-all"
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
                        </button>

                        {user ? (
                            <>
                                <Link to="/dashboard" className="px-4 py-2 text-sm font-medium text-body hover:text-heading transition-colors">
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} className="btn-secondary text-sm !py-2 !px-4">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="px-4 py-2 text-sm font-medium text-body hover:text-heading transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary text-sm !py-2 !px-4">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <button onClick={toggleTheme} className="w-9 h-9 rounded-xl flex items-center justify-center text-body hover:text-heading transition-all">
                            {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
                        </button>
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-body hover:text-heading">
                            {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-themed animate-fade-in" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="px-4 py-4 space-y-2">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path + link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-4 py-3 text-sm font-medium transition-all ${isActive
                                        ? 'text-primary font-bold underline underline-offset-8 decoration-2 decoration-primary bg-[var(--bg-tertiary)]/50 rounded-lg'
                                        : 'text-body hover:text-heading hover:bg-[var(--bg-tertiary)] rounded-lg'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                        <div className="pt-4 border-t border-themed space-y-2">
                            {user ? (
                                <>
                                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-body hover:text-heading hover:bg-[var(--bg-tertiary)] rounded-lg">Dashboard</Link>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-danger hover:bg-[var(--bg-tertiary)] rounded-lg">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-body hover:text-heading hover:bg-[var(--bg-tertiary)] rounded-lg">Login</Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="block px-4 py-3 btn-primary text-center">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
