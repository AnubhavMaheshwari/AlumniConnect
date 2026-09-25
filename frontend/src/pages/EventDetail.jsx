import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
    FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaArrowLeft, 
    FaVideo, FaGlobe, FaTicketAlt, FaUserAlt, FaEnvelope, FaPhone,
    FaRegCalendarCheck, FaRegClock, FaArrowRight, FaLink
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/events/${id}`);
            setEvent(data.event);
        } catch (err) {
            toast.error('Failed to load event details');
            navigate('/events');
        } finally {
            setLoading(false);
        }
    };

    const handleRSVP = async () => {
        if (!user) {
            toast.error('Please login to RSVP');
            return;
        }
        try {
            const { data } = await API.post(`/events/${id}/rsvp`);
            toast.success(data.message);
            fetchEvent();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to RSVP');
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <div style={{ width: 45, height: 45, borderRadius: '50%', border: '3px solid var(--blue-faint)', borderTopColor: 'var(--blue-light)', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!event) return null;

    const isGoing = event.attendees?.some(a => (a._id || a) === user?._id);
    const eventDate = new Date(event.date);
    const isPast = eventDate < new Date();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>
            {/* HERO SECTION */}
            <div style={{ position: 'relative', height: '45vh', minHeight: 400, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070'})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.4) saturate(1.2)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, var(--bg))' }} />
                
                <div style={{ position: 'relative', height: '100%', maxWidth: 1100, margin: '0 auto', padding: '120px 24px 0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <Link to="/events" style={{ position: 'absolute', top: 32, left: 24, display: 'flex', alignItems: 'center', gap: 8, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, padding: '10px 18px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)' }}>
                        <FaArrowLeft style={{ fontSize: 11 }} /> Back to Events
                    </Link>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--blue-light)', color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20, width: 'fit-content', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                        <HiSparkles style={{ fontSize: 13 }} />
                        {event.type}
                    </div>
                    
                    <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(32px, 6vw, 54px)', fontWeight: 800, color: '#fff', margin: '0 0 200vw', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
                        {event.title}
                    </h1>

                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.9)' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaCalendarAlt style={{ fontSize: 16 }} />
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: 0, textTransform: 'uppercase' }}>Date</p>
                                <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{eventDate.toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.9)' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaMapMarkerAlt style={{ fontSize: 16 }} />
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: 0, textTransform: 'uppercase' }}>Location</p>
                                <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{event.location}</p>
                            </div>
                        </div>

                        {event.registrationType === 'paid' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.9)' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FaTicketAlt style={{ fontSize: 16 }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: 0, textTransform: 'uppercase' }}>Price</p>
                                    <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>₹{event.price}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div style={{ maxWidth: 1100, margin: '-60px auto 100px', padding: '0 24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 40 }}>
                {/* LEFT: INFO */}
                <div>
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 24, padding: 32, marginBottom: 32, boxShadow: '0 10px 40px var(--card-shadow)' }}>
                        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, margin: '0 0 20px', color: 'var(--blue-light)' }}>About the Event</h2>
                        <div style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                            {event.description}
                        </div>
                        
                        {event.meetingLink && (
                            <div style={{ marginTop: 32, padding: 20, background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <FaVideo style={{ color: 'var(--blue-light)', fontSize: 20 }} />
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Virtual Meeting Link</p>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Join via Zoom/Google Meet</p>
                                    </div>
                                </div>
                                <a href={event.meetingLink} target="_blank" rel="noreferrer" style={{ background: 'var(--blue)', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    Join Now <FaArrowRight style={{ fontSize: 10 }} />
                                </a>
                            </div>
                        )}
                    </div>

                    {/* ORGANIZER */}
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 24, padding: 32, boxShadow: '0 10px 40px var(--card-shadow)' }}>
                        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, margin: '0 0 24px', color: 'var(--text-primary)' }}>Event Organizer</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--blue-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--blue-border)', overflow: 'hidden' }}>
                                {event.organizer?.profileImage ? <img src={event.organizer.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaUserAlt style={{ color: 'var(--blue-light)', fontSize: 24 }} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>{event.organizerContact?.name || event.organizer?.name}</h3>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Campus Coordinator / Organizer</p>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <a href={`mailto:${event.organizerContact?.email || event.organizer?.email}`} style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--blue-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue-light)', textDecoration: 'none' }}><FaEnvelope /></a>
                                {event.organizerContact?.phone && <a href={`tel:${event.organizerContact.phone}`} style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--blue-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue-light)', textDecoration: 'none' }}><FaPhone /></a>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: SIDEBAR */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* REGISTRATION CARD */}
                    <div style={{ position: 'sticky', top: 120, background: 'var(--bg-secondary)', border: '1px solid var(--blue-border)', borderRadius: 24, padding: 28, boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            {event.registrationType === 'paid' ? (
                                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>
                                    ₹{event.price}<span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}> / person</span>
                                </div>
                            ) : (
                                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--blue-light)' }}>Free Entry</div>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                                <FaRegClock style={{ color: 'var(--blue-light)' }} />
                                <div style={{ fontSize: 13 }}>
                                    <p style={{ fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>Deadline</p>
                                    <p style={{ fontWeight: 700, margin: 0 }}>{event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString() : 'No deadline set'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                                <FaUsers style={{ color: 'var(--blue-light)' }} />
                                <div style={{ fontSize: 13 }}>
                                    <p style={{ fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>Capacity</p>
                                    <p style={{ fontWeight: 700, margin: 0 }}>{event.attendees?.length || 0} / {event.maxAttendees || '∞'} registered</p>
                                </div>
                            </div>
                        </div>

                        {!isPast ? (
                            <button 
                                onClick={handleRSVP}
                                style={{ 
                                    width: '100%', 
                                    background: isGoing ? 'var(--blue-faint)' : 'linear-gradient(135deg, var(--blue-light), var(--blue))', 
                                    color: isGoing ? 'var(--blue-light)' : '#fff', 
                                    border: isGoing ? '1px solid var(--blue-border)' : 'none', 
                                    borderRadius: 14, padding: '16px 0', fontSize: 15, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', boxShadow: isGoing ? 'none' : '0 10px 24px rgba(32,54,113,0.3)' 
                                }}
                            >
                                {isGoing ? '✓ You are going' : 'Register Now'}
                            </button>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 16, background: 'var(--border)', borderRadius: 14, color: 'var(--text-secondary)', fontWeight: 700 }}>Event Closed</div>
                        )}

                        <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.5 }}>
                            Register now to secure your spot.
                        </p>
                    </div>

                    {/* ATTENDEES SUMMARY */}
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 24, padding: 24 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Attendees</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {event.attendees?.slice(0, 5).map(a => (
                                <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-faint)', overflow: 'hidden' }}>
                                        {a.profileImage ? <img src={a.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaUserAlt style={{ color: 'var(--blue-light)', fontSize: 12, margin: 10 }} />}
                                    </div>
                                    <div style={{ fontSize: 12.5 }}>
                                        <p style={{ fontWeight: 700, margin: 0 }}>{a.name}</p>
                                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>{a.company || 'Student'}</p>
                                    </div>
                                </div>
                            ))}
                            {event.attendees?.length > 5 && (
                                <div style={{ fontSize: 12, color: 'var(--blue-light)', fontWeight: 700, marginTop: 4 }}>
                                    + {event.attendees.length - 5} others
                                </div>
                            )}
                            {(!event.attendees || event.attendees.length === 0) && (
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Be the first to join!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
