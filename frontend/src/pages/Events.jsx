import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaPlus, FaTimes, FaVideo, FaFilter } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const getTypeConfig = t => {
    const configs = {
        reunion:    { bg: 'var(--blue-faint)',  color: 'var(--blue-light)' },
        workshop:   { bg: 'var(--blue-faint)',  color: 'var(--blue-light)' },
        seminar:    { bg: 'var(--blue-faint)',  color: 'var(--blue-light)' },
        networking: { bg: 'var(--blue-faint)',  color: 'var(--blue-light)' },
        cultural:   { bg: 'var(--blue-faint)',  color: 'var(--blue-light)' },
        other:      { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' },
    };
    return configs[t] || configs.other;
};

const inputSx = {
    width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)',
    borderRadius: 9, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13.5,
    outline: 'none', fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
};
const focusSx = e => { e.target.style.borderColor = 'var(--blue-light)'; e.target.style.boxShadow = `0 0 0 3px var(--blue-faint)`; };
const blurSx  = e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

const EventCard = ({ event, user, onRSVP }) => {
    const cs = getTypeConfig(event.type);
    const isGoing = event.attendees?.includes(user?._id);
    const eventDate = new Date(event.date);
    const isPast = eventDate < new Date();

    return (
        <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column',
            transition: 'border-color 0.25s, box-shadow 0.25s',
        }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue-border)'; e.currentTarget.style.boxShadow = `0 8px 32px var(--card-shadow)`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            {/* accent bar */}
            <div style={{ height: 3, background: `linear-gradient(90deg, var(--blue), var(--blue-light))` }} />

            {/* date badge */}
            <div style={{ padding: '18px 22px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{
                    width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                    background: `linear-gradient(135deg, var(--blue), var(--blue-dark))`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 16px rgba(32,54,113,0.35)`,
                }}>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                        {eventDate.getDate()}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {eventDate.toLocaleString('default', { month: 'short' })}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: cs.bg, borderRadius: 20, padding: '3px 10px', fontSize: 10.5, fontWeight: 700, color: cs.color, letterSpacing: '0.08em', textTransform: 'capitalize' }}>
                        {event.type}
                    </span>
                    {event.isOnline && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--blue-faint)', borderRadius: 20, padding: '3px 10px', fontSize: 10.5, fontWeight: 700, color: 'var(--blue-light)' }}>
                            <FaVideo style={{ fontSize: 9 }} /> Online
                        </span>
                    )}
                </div>
            </div>

            <div style={{ padding: '14px 22px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <FaClock style={{ color: 'var(--blue-light)', fontSize: 11, flexShrink: 0 }} />
                        {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <FaMapMarkerAlt style={{ color: 'var(--blue-light)', fontSize: 11, flexShrink: 0 }} />
                        {event.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <FaUsers style={{ color: 'var(--blue-light)', fontSize: 11, flexShrink: 0 }} />
                        {event.attendees?.length || 0} attending
                    </span>
                </div>

                {user && !isPast && (
                    <button onClick={() => onRSVP(event._id)} style={{
                        width: '100%', border: isGoing ? '1px solid var(--blue-border)' : 'none',
                        background: isGoing ? 'var(--blue-faint)' : `linear-gradient(135deg, var(--blue-light), var(--blue))`,
                        borderRadius: 9, padding: '10px 0',
                        color: isGoing ? 'var(--blue-light)' : '#fff',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        boxShadow: isGoing ? 'none' : `0 3px 14px rgba(32,54,113,0.35)`,
                        transition: 'all 0.2s', letterSpacing: '0.04em',
                    }}>
                        {isGoing ? '✓ Going' : 'RSVP Now'}
                    </button>
                )}
                {isPast && (
                    <div style={{ textAlign: 'center', padding: '8px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Event Ended
                    </div>
                )}
            </div>
        </div>
    );
};

const Events = () => {
    const { user } = useAuth();
    const [events, setEvents]       = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showForm, setShowForm]   = useState(false);
    const [filter, setFilter]       = useState('');
    const [formData, setFormData]   = useState({ title: '', description: '', date: '', location: '', type: 'other', isOnline: false, meetingLink: '', maxAttendees: 0 });

    const eventTypes = ['reunion', 'workshop', 'seminar', 'networking', 'cultural', 'other'];

    useEffect(() => { fetchEvents(); }, [filter]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = {}; if (filter) params.type = filter;
            const { data } = await API.get('/events', { params });
            setEvents(data.events);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await API.post('/events', formData);
            toast.success('Event created!');
            setShowForm(false);
            setFormData({ title: '', description: '', date: '', location: '', type: 'other', isOnline: false, meetingLink: '', maxAttendees: 0 });
            fetchEvents();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to create event'); }
    };

    const handleRSVP = async id => {
        try { const { data } = await API.post(`/events/${id}/rsvp`); toast.success(data.message); fetchEvents(); }
        catch { toast.error('Please login to RSVP'); }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '48px 20px 72px', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)', transition: 'background 0.3s, color 0.3s' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 40, flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--blue-faint)', border: '1px solid var(--blue-border)', borderRadius: 20, padding: '5px 14px', marginBottom: 16 }}>
                            <HiSparkles style={{ color: 'var(--blue-light)', fontSize: 13 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-light)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Alumni Gatherings</span>
                        </div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 38, fontWeight: 800, margin: '0 0 10px', color: 'var(--text-primary)', letterSpacing: '-0.6px', lineHeight: 1.15 }}>
                            Events &{' '}
                            <span style={{ background: `linear-gradient(135deg, var(--blue-light), #6B8FE8)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Reunions</span>
                        </h1>
                        <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', margin: 0 }}>Stay connected with upcoming NIT JSR alumni gatherings.</p>
                    </div>
                    {user && (
                        <button onClick={() => setShowForm(!showForm)} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: showForm ? 'transparent' : `linear-gradient(135deg, var(--blue-light), var(--blue))`,
                            border: `1px solid ${showForm ? 'var(--blue-border)' : 'transparent'}`,
                            borderRadius: 10, padding: '11px 22px', color: '#fff',
                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            boxShadow: showForm ? 'none' : `0 4px 20px rgba(32,54,113,0.35)`, transition: 'all 0.2s',
                        }}>
                            {showForm ? <><FaTimes style={{ fontSize: 12 }} /> Cancel</> : <><FaPlus style={{ fontSize: 12 }} /> Create Event</>}
                        </button>
                    )}
                </div>

                {/* FILTER BAR */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginRight: 4 }}>
                        <FaFilter style={{ color: 'var(--text-muted)', fontSize: 11 }} />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Filter</span>
                    </div>
                    {['', ...eventTypes].map(t => {
                        const active = filter === t;
                        return (
                            <button key={t || 'all'} onClick={() => setFilter(t)} style={{
                                background: active ? `linear-gradient(135deg, var(--blue-light), var(--blue))` : 'var(--bg-secondary)',
                                border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
                                borderRadius: 8, padding: '7px 16px', color: active ? '#fff' : 'var(--text-secondary)',
                                fontSize: 12, fontWeight: active ? 700 : 500, textTransform: 'capitalize',
                                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                                boxShadow: active ? `0 2px 12px rgba(32,54,113,0.35)` : 'none',
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                            }}>{t || 'All Events'}</button>
                        );
                    })}
                </div>

                {/* CREATE FORM */}
                {showForm && (
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--blue-border)', borderRadius: 16, padding: '28px 32px', marginBottom: 36, boxShadow: `0 8px 40px var(--card-shadow)` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px rgba(32,54,113,0.5)` }}>
                                <FaCalendarAlt style={{ color: '#fff', fontSize: 14 }} />
                            </div>
                            <div>
                                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Create New Event</p>
                                <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '2px 0 0' }}>Bring alumni together for something memorable</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 14 }}>
                                <input placeholder="Event Title *" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} required />
                                <input type="datetime-local" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ ...inputSx, colorScheme: 'dark' }} onFocus={focusSx} onBlur={blurSx} required />
                                <input placeholder="Location *" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} required />
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ ...inputSx, appearance: 'none', cursor: 'pointer' }} onFocus={focusSx} onBlur={blurSx}>
                                    {eventTypes.map(t => <option key={t} value={t} style={{ background: 'var(--bg-secondary)' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <textarea placeholder="Description *" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} required style={{ ...inputSx, resize: 'vertical', lineHeight: 1.65 }} onFocus={focusSx} onBlur={blurSx} />
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" style={{ background: `linear-gradient(135deg, var(--blue-light), var(--blue))`, border: 'none', borderRadius: 9, padding: '11px 28px', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 20px rgba(32,54,113,0.35)`, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                        Create Event →
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* CONTENT */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid var(--blue-faint)`, borderTopColor: 'var(--blue-light)', animation: 'spin 0.7s linear infinite' }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : events.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '72px 32px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--blue-faint)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <FaCalendarAlt style={{ fontSize: 26, color: 'var(--blue-light)' }} />
                        </div>
                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>No Events Yet</h3>
                        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>Be the first to create an event!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                        {events.map(event => <EventCard key={event._id} event={event} user={user} onRSVP={handleRSVP} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events;
