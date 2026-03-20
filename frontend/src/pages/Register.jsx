import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaGraduationCap, FaUser, FaEnvelope, FaLock, FaBuilding, FaCalendarAlt, FaArrowRight, FaPhone, FaBriefcase } from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', graduationYear: '', department: '',
        phone: '', company: '', yearsOfExperience: ''
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const departments = [
        'Computer Science & Engineering', 'Electrical Engineering', 'Mechanical Engineering',
        'Civil Engineering', 'Electronics & Communication', 'Metallurgical & Materials Engineering',
        'Production & Industrial Engineering', 'Computer Applications', 'Mathematics',
        'Physics', 'Chemistry', 'Humanities & Social Sciences', 'Other'
    ];

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
        if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await register({
                name: formData.name, email: formData.email, password: formData.password,
                graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
                department: formData.department,
                phone: formData.phone,
                company: formData.company,
                yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : 0
            });
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center py-12 px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-primary-dark/10 rounded-full filter blur-3xl"></div>
            </div>

            <div className="w-full max-w-lg relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-4">
                        <FaGraduationCap className="text-white text-3xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-heading mb-2">Join NIT JSR Alumni</h1>
                    <p className="text-body">Create your alumni profile</p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-body mb-2">Full Name</label>
                                <div className="relative">
                                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field !pl-11" placeholder="John Doe" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-body mb-2">Email</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field !pl-11" placeholder="you@example.com" required />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-body mb-2">Graduation Year</label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                    <input type="number" name="graduationYear" value={formData.graduationYear} onChange={handleChange} className="input-field !pl-11" placeholder="2024" min="1960" max="2030" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-body mb-2">Department</label>
                                <div className="relative">
                                    <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-muted z-10" />
                                    <select name="department" value={formData.department} onChange={handleChange} className="input-field !pl-11 appearance-none">
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-body mb-2">Contact Number</label>
                                <div className="relative">
                                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field !pl-11" placeholder="+91 1234567890" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-body mb-2">Company</label>
                                <div className="relative">
                                    <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                    <input type="text" name="company" value={formData.company} onChange={handleChange} className="input-field !pl-11" placeholder="Google / Amazon" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-body mb-2">Years of Experience</label>
                            <div className="relative">
                                <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} className="input-field !pl-11" placeholder="e.g. 5" min="0" max="50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-body mb-2">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field !pl-11" placeholder="Min. 6 characters" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-body mb-2">Confirm Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field !pl-11" placeholder="••••••••" required />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3.5 text-base">
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Create Account <FaArrowRight /></>}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-body text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-light hover:text-primary font-medium transition-colors">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
