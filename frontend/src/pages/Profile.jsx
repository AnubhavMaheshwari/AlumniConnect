import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { FaEnvelope, FaPhone, FaLinkedin, FaMapMarkerAlt, FaBuilding, FaGraduationCap, FaArrowLeft } from 'react-icons/fa';

const Profile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchProfile(); }, [id]);

    const fetchProfile = async () => {
        try { const { data } = await API.get(`/users/${id}`); setProfile(data.user); }
        catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>;
    if (!profile) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold text-heading mb-2">Profile Not Found</h2><Link to="/directory" className="text-primary-light hover:underline">Back to Directory</Link></div></div>;

    return (
        <div className="py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <Link to="/directory" className="inline-flex items-center gap-2 text-body hover:text-heading mb-6 transition-colors"><FaArrowLeft /> Back to Directory</Link>
                <div className="glass-card p-8 animate-fade-in">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-4xl font-bold shrink-0">{profile.name?.charAt(0)?.toUpperCase()}</div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold text-heading mb-1">{profile.name}</h1>
                            {profile.currentPosition && <p className="text-primary-light text-lg">{profile.currentPosition}</p>}
                            {profile.company && <p className="text-body flex items-center justify-center md:justify-start gap-2 mt-1"><FaBuilding /> {profile.company}</p>}
                        </div>
                    </div>
                    {profile.bio && <div className="mb-8"><h2 className="text-lg font-semibold text-heading mb-3">About</h2><p className="text-body leading-relaxed">{profile.bio}</p></div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-heading mb-3">Details</h2>
                            {profile.email && <div className="flex items-center gap-3 text-body"><FaEnvelope className="text-primary-light" /><span>{profile.email}</span></div>}
                            {profile.phone && <div className="flex items-center gap-3 text-body"><FaPhone className="text-primary-light" /><span>{profile.phone}</span></div>}
                            {profile.location && <div className="flex items-center gap-3 text-body"><FaMapMarkerAlt className="text-primary-light" /><span>{profile.location}</span></div>}
                            {profile.department && <div className="flex items-center gap-3 text-body"><FaGraduationCap className="text-primary-light" /><span>{profile.department}{profile.graduationYear ? ` — Class of ${profile.graduationYear}` : ''}</span></div>}
                            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-primary-light hover:text-primary transition-colors"><FaLinkedin /><span>LinkedIn Profile</span></a>}
                        </div>
                        {profile.skills?.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-heading mb-3">Skills</h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, i) => <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary-light text-sm rounded-xl border border-primary/20">{skill}</span>)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
