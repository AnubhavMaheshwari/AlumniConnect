import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaBriefcase, FaNewspaper, FaUser, FaEnvelope, FaGraduationCap, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const Dashboard = () => {
    const { user } = useAuth();

    const quickLinks = [
        { icon: FaUsers, title: 'Alumni Directory', desc: 'Browse & connect', path: '/directory' },
        { icon: FaCalendarAlt, title: 'Events', desc: 'Upcoming events', path: '/events' },
        { icon: FaBriefcase, title: 'Job Board', desc: 'Career opportunities', path: '/jobs' },
        { icon: FaNewspaper, title: 'News & Stories', desc: 'Latest updates', path: '/news' }
    ];

    return (
        <div className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="glass-card p-8 mb-8 animate-fade-in">
                    <div className="flex items-center gap-3 mb-2">
                        <HiSparkles className="text-primary-light text-2xl" />
                        <h1 className="text-2xl md:text-3xl font-bold text-heading">
                            Welcome back, <span className="gradient-text">{user?.name || 'Alumni'}</span>
                        </h1>
                    </div>
                    <p className="text-body ml-9">Here's what's happening in the NIT Jamshedpur alumni network.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-semibold text-heading mb-6 flex items-center gap-2">
                                <FaUser className="text-primary-light" /> Your Profile
                            </h2>
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                </div>
                                <h3 className="text-xl font-bold text-heading">{user?.name}</h3>
                                <p className="text-primary-light text-sm">{user?.role === 'admin' ? 'Administrator' : 'Alumni'}</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-body text-sm"><FaEnvelope className="text-primary-light" /><span>{user?.email}</span></div>
                                {user?.department && <div className="flex items-center gap-3 text-body text-sm"><FaBuilding className="text-primary-light" /><span>{user.department}</span></div>}
                                {user?.graduationYear && <div className="flex items-center gap-3 text-body text-sm"><FaGraduationCap className="text-primary-light" /><span>Class of {user.graduationYear}</span></div>}
                                {user?.location && <div className="flex items-center gap-3 text-body text-sm"><FaMapMarkerAlt className="text-primary-light" /><span>{user.location}</span></div>}
                            </div>
                            <Link to={`/profile/${user?._id}`} className="btn-secondary w-full justify-center mt-6 text-sm">View Full Profile</Link>
                        </div>
                    </div>

                    <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-lg font-semibold text-heading mb-4">Quick Access</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {quickLinks.map((item, i) => (
                                <Link key={i} to={item.path} className="glass-card p-6 group">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <item.icon className="text-white text-xl" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-heading mb-1">{item.title}</h3>
                                    <p className="text-body text-sm">{item.desc}</p>
                                </Link>
                            ))}
                        </div>

                        <div className="glass-card p-6 mt-6">
                            <h2 className="text-lg font-semibold text-heading mb-4">Recent Activity</h2>
                            <div className="space-y-4">
                                {[
                                    { text: 'Welcome to NIT Jamshedpur Alumni Portal! Complete your profile to get started.', time: 'Just now' },
                                    { text: 'Check out the latest events and RSVP to connect with alumni.', time: 'Suggestion' },
                                    { text: 'Browse the job board for exciting career opportunities.', time: 'Suggestion' }
                                ].map((activity, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-colors" style={{ background: 'transparent' }}>
                                        <div className="w-2 h-2 rounded-full bg-primary-light mt-2 shrink-0"></div>
                                        <div>
                                            <p className="text-body text-sm">{activity.text}</p>
                                            <p className="text-muted text-xs mt-1">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
