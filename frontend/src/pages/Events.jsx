import { useState, useEffect } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  LuCalendar,
  LuMapPin,
  LuUsers,
  LuClock,
  LuPlus,
  LuX,
  LuVideo,
  LuFilter,
  LuSearch,
  LuCheck,
  LuTicket,
  LuSparkles
} from 'react-icons/lu';

const EVENT_TYPES = [
  { value: '', label: 'All Events' },
  { value: 'reunion', label: 'Reunion' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'networking', label: 'Networking' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'other', label: 'Other' },
];

const getTypeBadgeStyle = (type) => {
  switch (type) {
    case 'reunion':
      return { bg: 'rgba(224, 122, 63, 0.12)', color: 'var(--primary)', border: 'rgba(224, 122, 63, 0.25)' };
    case 'workshop':
      return { bg: 'rgba(224, 122, 63, 0.12)', color: 'var(--color-accent)', border: 'rgba(224, 122, 63, 0.25)' };
    case 'networking':
      return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.25)' };
    case 'seminar':
      return { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', border: 'rgba(99, 102, 241, 0.25)' };
    case 'cultural':
      return { bg: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', border: 'rgba(236, 72, 153, 0.25)' };
    default:
      return { bg: 'var(--panel)', color: 'var(--text-secondary)', border: 'var(--border)' };
  }
};

const EventCard = ({ event, user, onRSVP }) => {
  const badgeStyle = getTypeBadgeStyle(event.type);
  const isGoing = event.attendees?.includes(user?._id);
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();

  return (
    <article
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card, 12px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top Banner & Date Header */}
      <div
        style={{
          padding: '20px 20px 14px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          borderBottom: '1px solid var(--border)',
          background: 'var(--panel)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          {/* Calendar Block */}
          <div
            style={{
              width: 50,
              height: 52,
              borderRadius: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: 'var(--primary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              {eventDate.toLocaleString('default', { month: 'short' })}
            </span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.1,
                marginTop: 2,
              }}
            >
              {eventDate.getDate()}
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: badgeStyle.bg,
                  color: badgeStyle.color,
                  border: `1px solid ${badgeStyle.border}`,
                  borderRadius: 16,
                  padding: '3px 9px',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'capitalize',
                }}
              >
                {event.type || 'Event'}
              </span>

              {event.isOnline && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'rgba(224, 122, 63, 0.12)',
                    color: 'var(--color-accent)',
                    border: '1px solid rgba(224, 122, 63, 0.25)',
                    borderRadius: 16,
                    padding: '3px 9px',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  <LuVideo size={11} /> Virtual
                </span>
              )}
            </div>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 12,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <LuClock size={12} />
              {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {event.registrationType === 'paid' ? (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--primary)',
              background: 'rgba(224, 122, 63, 0.1)',
              padding: '4px 8px',
              borderRadius: 6,
              whiteSpace: 'nowrap',
            }}
          >
            ₹{event.price}
          </span>
        ) : (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '3px 8px',
              borderRadius: 6,
            }}
          >
            Free
          </span>
        )}
      </div>

      {/* Body Content */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link
          to={`/events/${event._id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          >
            {event.title}
          </h3>
        </Link>

        <p
          style={{
            fontSize: 13.5,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {event.shortDescription || event.description}
        </p>

        {/* Location & Attendees Meta */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
            fontSize: 12.5,
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <LuMapPin size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.location}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <LuUsers size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>{event.attendees?.length || 0} attending</span>
            </span>

            {event.maxAttendees > 0 && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Max {event.maxAttendees} seats
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 8 }}>
          {user ? (
            !isPast ? (
              <button
                type="button"
                onClick={() => onRSVP(event._id)}
                style={{
                  width: '100%',
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-input, 8px)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                  border: isGoing ? '1px solid var(--primary)' : 'none',
                  background: isGoing ? 'rgba(224, 122, 63, 0.1)' : 'var(--primary)',
                  color: isGoing ? 'var(--primary)' : '#ffffff',
                }}
              >
                {isGoing ? (
                  <>
                    <LuCheck size={14} /> You're Going
                  </>
                ) : (
                  'RSVP for Event'
                )}
              </button>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '8px',
                  borderRadius: 'var(--radius-input, 8px)',
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                Event Concluded
              </div>
            )
          ) : (
            <Link
              to="/login"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '9px 16px',
                borderRadius: 'var(--radius-input, 8px)',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                background: 'var(--panel)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              Sign in to RSVP
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    date: '',
    location: '',
    type: 'reunion',
    isOnline: false,
    meetingLink: '',
    maxAttendees: '',
    registrationType: 'free',
    price: '',
    registrationDeadline: '',
  });

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.type = filter;
      const { data } = await API.get('/events', { params });
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/events', {
        ...formData,
        maxAttendees: formData.maxAttendees ? Number(formData.maxAttendees) : 0,
        price: formData.price ? Number(formData.price) : 0,
      });
      toast.success('Event published successfully!');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        shortDescription: '',
        date: '',
        location: '',
        type: 'reunion',
        isOnline: false,
        meetingLink: '',
        maxAttendees: '',
        registrationType: 'free',
        price: '',
        registrationDeadline: '',
      });
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRSVP = async (id) => {
    try {
      const { data } = await API.post(`/events/${id}/rsvp`);
      toast.success(data.message || 'RSVP updated!');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Please log in to RSVP');
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ev.title?.toLowerCase().includes(q) ||
      ev.location?.toLowerCase().includes(q) ||
      ev.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--page)',
        padding: '36px 20px 80px',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 20,
            marginBottom: 32,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(224, 122, 63, 0.12)',
                color: 'var(--color-accent)',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: 10,
              }}
            >
              <LuCalendar size={13} style={{ color: 'var(--primary)' }} />
              CAMPUS & ALUMNI GATHERINGS
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 32,
                fontWeight: 800,
                margin: '0 0 8px',
                color: 'var(--text-primary)',
                letterSpacing: '-0.5px',
              }}
            >
              Events & Reunions
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, maxWidth: 640 }}>
              Connect in person and virtually with fellow alumni, faculty, and student chapters across the globe.
            </p>
          </div>

          {user && (
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: showForm ? 'var(--panel)' : 'var(--primary)',
                color: showForm ? 'var(--text-primary)' : '#ffffff',
                border: showForm ? '1px solid var(--border)' : 'none',
                borderRadius: 'var(--radius-button, 8px)',
                padding: '10px 20px',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: showForm ? 'none' : '0 2px 8px rgba(224, 122, 63, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              {showForm ? (
                <>
                  <LuX size={15} /> Close Form
                </>
              ) : (
                <>
                  <LuPlus size={15} /> Host an Event
                </>
              )}
            </button>
          )}
        </div>

        {/* Create Event Drawer / Card */}
        {showForm && (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card, 12px)',
              padding: '28px',
              marginBottom: 36,
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 16,
                borderBottom: '1px solid var(--border)',
                marginBottom: 24,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 19,
                    fontWeight: 700,
                    margin: 0,
                    color: 'var(--text-primary)',
                  }}
                >
                  Create an Alumni Gathering
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Share meetup details, reunion schedules, or technical webinars with verified alumni.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 6,
                }}
              >
                <LuX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2014 Batch 10-Year Jubilee Reunion"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-input, 8px)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-input, 8px)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Location / Venue *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diamond Jubilee Lecture Hall / Bengaluru Chapter"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-input, 8px)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Category
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-input, 8px)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    {EVENT_TYPES.filter((t) => t.value).map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Online / Ticket Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                  marginBottom: 16,
                  padding: '14px 16px',
                  borderRadius: 8,
                  background: 'var(--panel)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="isOnlineCheckbox"
                    checked={formData.isOnline}
                    onChange={(e) => setFormData({ ...formData, isOnline: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <label htmlFor="isOnlineCheckbox" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Virtual Event (Google Meet / Zoom)
                  </label>
                </div>

                {formData.isOnline && (
                  <div>
                    <input
                      type="url"
                      placeholder="Meeting Link (https://meet.google.com/...)"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-input, 8px)',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                )}

                <div>
                  <select
                    value={formData.registrationType}
                    onChange={(e) => setFormData({ ...formData, registrationType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-input, 8px)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="free">Free Admission</option>
                    <option value="paid">Paid Admission</option>
                  </select>
                </div>

                {formData.registrationType === 'paid' && (
                  <div>
                    <input
                      type="number"
                      required
                      placeholder="Price in INR (₹)"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-input, 8px)',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Descriptions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Short Summary (Preview card snippet)
                  </label>
                  <input
                    type="text"
                    maxLength={160}
                    placeholder="Brief 1-line overview of the agenda or celebration..."
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-input, 8px)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Full Event Schedule & Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide full details: itinerary, keynote speakers, accommodation guidelines, dress code, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-input, 8px)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                      resize: 'vertical',
                      lineHeight: 1.6,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-button, 8px)',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-button, 8px)',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(224, 122, 63, 0.3)',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Publishing Event...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 28,
            flexWrap: 'wrap',
          }}
        >
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginRight: 4,
              }}
            >
              Filter:
            </span>
            {EVENT_TYPES.map((t) => {
              const active = filter === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setFilter(t.value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: active ? 'rgba(224, 122, 63, 0.12)' : 'var(--surface)',
                    color: active ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
            <LuSearch
              size={14}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search by title or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: 'var(--radius-input, 8px)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 24,
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                style={{
                  height: 320,
                  borderRadius: 'var(--radius-card, 12px)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 24px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card, 12px)',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--text-muted)',
              }}
            >
              <LuCalendar size={24} />
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 6px',
              }}
            >
              No events found
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>
              {searchQuery || filter
                ? 'Try adjusting your search keywords or switching category filters.'
                : 'There are no upcoming events scheduled at the moment.'}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 24,
            }}
          >
            {filteredEvents.map((event) => (
              <EventCard key={event._id} event={event} user={user} onRSVP={handleRSVP} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
