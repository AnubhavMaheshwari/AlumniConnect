import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaPlus, FaTimes, FaVideo, FaFilter } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const C = {
    blue: '#203671', blueDark: '#182858', blueLight: '#2D4899',
    blueFaint: 'rgba(32,54,113,0.12)', blueBorder: 'rgba(32,54,113,0.35)',
    white: '#FFFFFF', muted: '#8A94A8', black: '#000000',
    darkBg: '#0C0E14', darkCard: '#12151F', darkBorder: '#1E2235',
};

if (typeof document !== 'undefined' && !document.getElementById('events-fonts')) {
    const l = document.createElement('link');
    l.id = 'events-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700;800&display=swap';
    document.head.appendChild(l);
}

const typeConfig = {
    reunion:    { bg: 'rgba(32,54,113,0.2)',  color: '#7B9FE8' },
    workshop:   { bg: 'rgba(24,40,88,0.28)',  color: '#A0B4F0' },
    seminar:    { bg: 'rgba(45,72,153,0.16)', color: '#6B8FE8' },
    networking: { bg: 'rgba(32,54,113,0.24)', color: '#90AAEC' },
    cultural:   { bg: 'rgba(20,35,80,0.32)',  color: '#B0C4F4' },
    other:      { bg: 'rgba(30,34,53,0.6)',   color: '#8A94A8' },
};
const getCat = t => typeConfig[t] || typeConfig.other;

const inputSx = {
    width: '100%', background: C.darkBg, border: `1px solid ${C.darkBorder}`,
    borderRadius: 9, padding: '10px 14px', color: C.white, fontSize: 13.5,
    outline: 'none', fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
};
const focusSx = e => { e.target.style.borderColor = C.blueLight; e.target.style.boxShadow = `0 0 0 3px ${C.blueFaint}`; };
const blurSx  = e => { e.target.style.borderColor = C.darkBorder; e.target.style.boxShadow = 'none'; };

const EventCard = ({ event, user, onRSVP }) => {
    const cs = getCat(event.type);
    const isGoing = event.attendees?.includes(user?._id);
    const eventDate = new Date(event.date);
    const isPast = eventDate < new Date();

    return (
        <div style={{
            background: C.darkCard, border: `1px solid ${C.darkBorder}`,
            borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column',
            transition: 'border-color 0.25s, box-shadow 0.25s',
        }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.blueBorder; e.currentTarget.style.boxShadow = `0 8px 32px rgba(32,54,113,0.2)`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.darkBorder; e.currentTarget.style.boxShadow = 'none'; }}
        >
            {/* accent bar */}
            <div style={{ height: 3, background: `linear-gradient(90deg, ${C.blue}, ${C.blueLight})` }} />

            {/* date badge */}
            <div style={{ padding: '18px 22px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{
                    width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                    background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 16px rgba(32,54,113,0.4)`,
                }}>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: C.white, lineHeight: 1 }}>
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
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(32,54,113,0.15)', borderRadius: 20, padding: '3px 10px', fontSize: 10.5, fontWeight: 700, color: '#90AAEC' }}>
                            <FaVideo style={{ fontSize: 9 }} /> Online
                        </span>
                    )}
                </div>
            </div>

            <div style={{ padding: '14px 22px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: C.white, margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.title}
                </h3>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12.5, color: C.muted }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <FaClock style={{ color: C.blueLight, fontSize: 11, flexShrink: 0 }} />
                        {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <FaMapMarkerAlt style={{ color: C.blueLight, fontSize: 11, flexShrink: 0 }} />
                        {event.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <FaUsers style={{ color: C.blueLight, fontSize: 11, flexShrink: 0 }} />
                        {event.attendees?.length || 0} attending
                    </span>
                </div>

                {user && !isPast && (
                    <button onClick={() => onRSVP(event._id)} style={{
                        width: '100%', border: isGoing ? `1px solid ${C.blueBorder}` : 'none',
                        background: isGoing ? C.blueFaint : `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`,
                        borderRadius: 9, padding: '10px 0',
                        color: isGoing ? C.blueLight : C.white,
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        boxShadow: isGoing ? 'none' : `0 3px 14px rgba(32,54,113,0.4)`,
                        transition: 'all 0.2s', letterSpacing: '0.04em',
                    }}>
                        {isGoing ? '✓ Going' : 'RSVP Now'}
                    </button>
                )}
                {isPast && (
                    <div style={{ textAlign: 'center', padding: '8px', borderRadius: 8, background: 'rgba(30,34,53,0.6)', fontSize: 12, color: C.muted, fontWeight: 600 }}>
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
        <div style={{ minHeight: '100vh', background: C.black, padding: '48px 20px 72px', fontFamily: "'DM Sans', sans-serif", color: C.white }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 40, flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.blueFaint, border: `1px solid ${C.blueBorder}`, borderRadius: 20, padding: '5px 14px', marginBottom: 16 }}>
                            <HiSparkles style={{ color: C.blueLight, fontSize: 13 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.blueLight, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Alumni Gatherings</span>
                        </div>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 38, fontWeight: 800, margin: '0 0 10px', color: C.white, letterSpacing: '-0.6px', lineHeight: 1.15 }}>
                            Events &{' '}
                            <span style={{ background: `linear-gradient(135deg, ${C.blueLight}, #6B8FE8)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Reunions</span>
                        </h1>
                        <p style={{ fontSize: 14.5, color: C.muted, margin: 0 }}>Stay connected with upcoming NIT JSR alumni gatherings.</p>
                    </div>
                    {user && (
                        <button onClick={() => setShowForm(!showForm)} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: showForm ? 'transparent' : `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`,
                            border: `1px solid ${showForm ? C.blueBorder : 'transparent'}`,
                            borderRadius: 10, padding: '11px 22px', color: C.white,
                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            boxShadow: showForm ? 'none' : `0 4px 20px rgba(32,54,113,0.4)`, transition: 'all 0.2s',
                        }}>
                            {showForm ? <><FaTimes style={{ fontSize: 12 }} /> Cancel</> : <><FaPlus style={{ fontSize: 12 }} /> Create Event</>}
                        </button>
                    )}
                </div>

                {/* FILTER BAR */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: C.darkCard, border: `1px solid ${C.darkBorder}`, marginRight: 4 }}>
                        <FaFilter style={{ color: C.muted, fontSize: 11 }} />
                        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Filter</span>
                    </div>
                    {['', ...eventTypes].map(t => {
                        const active = filter === t;
                        return (
                            <button key={t || 'all'} onClick={() => setFilter(t)} style={{
                                background: active ? `linear-gradient(135deg, ${C.blueLight}, ${C.blue})` : C.darkCard,
                                border: `1px solid ${active ? 'transparent' : C.darkBorder}`,
                                borderRadius: 8, padding: '7px 16px', color: active ? C.white : C.muted,
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
                    <div style={{ background: C.darkCard, border: `1px solid ${C.blueBorder}`, borderRadius: 16, padding: '28px 32px', marginBottom: 36, boxShadow: `0 8px 40px rgba(32,54,113,0.2)` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${C.darkBorder}` }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px rgba(32,54,113,0.5)` }}>
                                <FaCalendarAlt style={{ color: C.white, fontSize: 14 }} />
                            </div>
                            <div>
                                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: C.white, margin: 0 }}>Create New Event</p>
                                <p style={{ fontSize: 11.5, color: C.muted, margin: '2px 0 0' }}>Bring alumni together for something memorable</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                <input placeholder="Event Title *" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} required />
                                <input type="datetime-local" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ ...inputSx, colorScheme: 'dark' }} onFocus={focusSx} onBlur={blurSx} required />
                                <input placeholder="Location *" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} style={inputSx} onFocus={focusSx} onBlur={blurSx} required />
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ ...inputSx, appearance: 'none', cursor: 'pointer' }} onFocus={focusSx} onBlur={blurSx}>
                                    {eventTypes.map(t => <option key={t} value={t} style={{ background: C.darkBg }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <textarea placeholder="Description *" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} required style={{ ...inputSx, resize: 'vertical', lineHeight: 1.65 }} onFocus={focusSx} onBlur={blurSx} />
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" style={{ background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`, border: 'none', borderRadius: 9, padding: '11px 28px', color: C.white, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 20px rgba(32,54,113,0.4)`, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
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
                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.blueFaint}`, borderTopColor: C.blueLight, animation: 'spin 0.7s linear infinite' }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : events.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '72px 32px', background: C.darkCard, border: `1px solid ${C.darkBorder}`, borderRadius: 16 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: C.blueFaint, border: `1px solid ${C.blueBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <FaCalendarAlt style={{ fontSize: 26, color: C.blueLight }} />
                        </div>
                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: C.white, margin: '0 0 8px' }}>No Events Yet</h3>
                        <p style={{ fontSize: 13.5, color: C.muted, margin: 0 }}>Be the first to create an event!</p>
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
