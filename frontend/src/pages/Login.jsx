import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaGraduationCap, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center py-12 px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-primary-dark/10 rounded-full filter blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-4">
                        <FaGraduationCap className="text-white text-3xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-heading mb-2">Welcome Back</h1>
                    <p className="text-body">Sign in to NIT Jamshedpur Alumni Portal</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-body mb-2">Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field !pl-11" placeholder="you@example.com" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-body mb-2">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field !pl-11" placeholder="••••••••" required />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-body">
                                <input type="checkbox" className="rounded" /> Remember me
                            </label>
                            <Link to="/forgot-password" className="text-sm text-primary-light hover:text-primary transition-colors">Forgot password?</Link>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3.5 text-base">
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Sign In <FaArrowRight /></>}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-body text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-light hover:text-primary font-medium transition-colors">Sign up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
