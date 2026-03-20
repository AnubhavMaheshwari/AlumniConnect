import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaPlus, FaTimes, FaVideo, FaFilter } from 'react-icons/fa';

const Events = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('');
    const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', type: 'other', isOnline: false, meetingLink: '', maxAttendees: 0 });

    useEffect(() => { fetchEvents(); }, [filter]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = {}; if (filter) params.type = filter;
            const { data } = await API.get('/events', { params }); setEvents(data.events);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/events', formData); toast.success('Event created!'); setShowForm(false);
            setFormData({ title: '', description: '', date: '', location: '', type: 'other', isOnline: false, meetingLink: '', maxAttendees: 0 }); fetchEvents();
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to create event'); }
    };

    const handleRSVP = async (id) => {
        try { const { data } = await API.post(`/events/${id}/rsvp`); toast.success(data.message); fetchEvents(); }
        catch (error) { toast.error('Please login to RSVP'); }
    };

    const eventTypes = ['reunion', 'workshop', 'seminar', 'networking', 'cultural', 'other'];

    return (
        <div className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-heading"><span className="gradient-text">Events</span> & Reunions</h1>
                        <p className="text-body text-lg">Stay connected with upcoming NIT JSR alumni gatherings.</p>
                    </div>
                    {user && <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Create Event</>}</button>}
                </div>

                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <FaFilter className="text-muted shrink-0" />
                    <button onClick={() => setFilter('')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${!filter ? 'bg-primary text-white' : 'text-body hover:bg-[var(--bg-tertiary)]'}`} style={!filter ? {} : { background: 'var(--bg-tertiary)' }}>All Events</button>
                    {eventTypes.map(type => (
                        <button key={type} onClick={() => setFilter(type)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all ${filter === type ? 'bg-primary text-white' : 'text-body hover:bg-[var(--bg-tertiary)]'}`} style={filter === type ? {} : { background: 'var(--bg-tertiary)' }}>{type}</button>
                    ))}
                </div>

                {showForm && (
                    <div className="glass-card p-6 mb-8 animate-fade-in">
                        <h2 className="text-xl font-semibold text-heading mb-4">Create New Event</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Event Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" required />
                            <input type="datetime-local" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input-field" required />
                            <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input-field" required />
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input-field">{eventTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field md:col-span-2" rows={3} required />
                            <div className="md:col-span-2 flex justify-end"><button type="submit" className="btn-primary">Create Event</button></div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20 glass-card"><FaCalendarAlt className="text-6xl text-muted mx-auto mb-4" /><h3 className="text-xl font-semibold text-heading mb-2">No Events Yet</h3><p className="text-body">Be the first to create an event!</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event, i) => (
                            <div key={event._id} className="glass-card overflow-hidden group animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                <div className="h-2 bg-gradient-to-r from-primary to-primary-light"></div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-3 py-1 bg-primary/10 text-primary-light text-xs rounded-lg capitalize font-medium">{event.type}</span>
                                        {event.isOnline && <span className="px-3 py-1 bg-success/10 text-success text-xs rounded-lg flex items-center gap-1"><FaVideo /> Online</span>}
                                    </div>
                                    <h3 className="text-xl font-bold text-heading mb-3 line-clamp-2">{event.title}</h3>
                                    <p className="text-body text-sm mb-4 line-clamp-2">{event.description}</p>
                                    <div className="space-y-2 text-sm text-body mb-4">
                                        <div className="flex items-center gap-2"><FaClock className="text-primary-light" />{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                        <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-primary-light" />{event.location}</div>
                                        <div className="flex items-center gap-2"><FaUsers className="text-primary-light" />{event.attendees?.length || 0} attending</div>
                                    </div>
                                    {user && (
                                        <button onClick={() => handleRSVP(event._id)} className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${event.attendees?.includes(user._id) ? 'bg-success/10 text-success border border-success/20' : 'btn-primary justify-center'}`}>
                                            {event.attendees?.includes(user._id) ? '✓ Going' : 'RSVP Now'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events;
