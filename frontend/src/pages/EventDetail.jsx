import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  LuArrowLeft,
  LuCalendar,
  LuMapPin,
  LuClock,
  LuUsers,
  LuVideo,
  LuExternalLink,
  LuMail,
  LuPhone,
  LuCheck,
  LuTicket,
  LuShare2,
  LuUser
} from 'react-icons/lu';

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
      toast.error('Please log in to RSVP for this event');
      return;
    }
    try {
      const { data } = await API.post(`/events/${id}/rsvp`);
      toast.success(data.message || 'RSVP updated!');
      fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to RSVP');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event?.title,
          text: `Join ${event?.title} on NIT Jamshedpur Alumni Connect`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--page)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!event) return null;

  const isGoing = event.attendees?.some((a) => (a._id || a) === user?._id);
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page)', color: 'var(--text-primary)', paddingBottom: 80 }}>
      {/* Top Banner Header with Solid Navy / Photo Background */}
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #1E3A5F 0%, #152840 100%)',
          color: '#ffffff',
          padding: '48px 24px 64px',
          overflow: 'hidden',
        }}
      >
        {/* Subtle photo overlay if image present */}
        {event.image && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${event.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.22,
              filter: 'grayscale(25%)',
            }}
          />
        )}

        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto' }}>
          {/* Back button & Action row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 28,
            }}
          >
            <Link
              to="/events"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-button, 8px)',
                padding: '8px 14px',
                transition: 'background 0.15s ease',
              }}
            >
              <LuArrowLeft size={14} /> Back to Events
            </Link>

            <button
              type="button"
              onClick={handleShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-button, 8px)',
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LuShare2 size={14} /> Share
            </button>
          </div>

          {/* Event Category Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'var(--primary)',
                color: '#ffffff',
                borderRadius: 16,
                padding: '4px 12px',
                fontSize: 11.5,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {event.type || 'Alumni Gathering'}
            </span>

            {event.isOnline && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  borderRadius: 16,
                  padding: '4px 10px',
                  fontSize: 11.5,
                  fontWeight: 600,
                }}
              >
                <LuVideo size={12} /> Virtual Meetup
              </span>
            )}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(26px, 4vw, 40px)',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 20px',
              lineHeight: 1.2,
              letterSpacing: '-0.5px',
              maxWidth: 820,
            }}
          >
            {event.title}
          </h1>

          {/* Key Event Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LuCalendar size={18} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' }}>
                  Date & Time
                </p>
                <p style={{ margin: 0, fontWeight: 700 }}>
                  {eventDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  &bull; {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LuMapPin size={18} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' }}>
                  Venue
                </p>
                <p style={{ margin: 0, fontWeight: 700 }}>{event.location}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LuUsers size={18} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' }}>
                  Attendees
                </p>
                <p style={{ margin: 0, fontWeight: 700 }}>{event.attendees?.length || 0} registered</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div
        style={{
          maxWidth: 1100,
          margin: '-24px auto 0',
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: 28,
        }}
      >
        {/* Left Column: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Description Section */}
          <section
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card, 12px)',
              padding: '28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 20,
                fontWeight: 700,
                margin: '0 0 16px',
                color: 'var(--text-primary)',
              }}
            >
              About the Event
            </h2>
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.75,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {event.description}
            </div>

            {/* Virtual Meeting Box */}
            {event.meetingLink && (
              <div
                style={{
                  marginTop: 28,
                  padding: '16px 20px',
                  borderRadius: 8,
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: 'rgba(224, 122, 63, 0.12)',
                      color: 'var(--color-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LuVideo size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Virtual Meeting Access
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                      Join with fellow alumni via secure video conference
                    </p>
                  </div>
                </div>

                <a
                  href={event.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-button, 8px)',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Join Meeting <LuExternalLink size={13} />
                </a>
              </div>
            )}
          </section>

          {/* Organizer Card */}
          <section
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card, 12px)',
              padding: '24px 28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 16,
                fontWeight: 700,
                margin: '0 0 16px',
                color: 'var(--text-primary)',
              }}
            >
              Organized By
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {event.organizer?.profileImage ? (
                  <img
                    src={event.organizer.profileImage}
                    alt={event.organizer.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <LuUser size={24} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 160 }}>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {event.organizerContact?.name || event.organizer?.name || 'Alumni Chapter Coordinator'}
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                  NIT Jamshedpur Alumni Association
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {(event.organizerContact?.email || event.organizer?.email) && (
                  <a
                    href={`mailto:${event.organizerContact?.email || event.organizer?.email}`}
                    title="Email Organizer"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                    }}
                  >
                    <LuMail size={16} />
                  </a>
                )}
                {event.organizerContact?.phone && (
                  <a
                    href={`tel:${event.organizerContact.phone}`}
                    title="Call Organizer"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                    }}
                  >
                    <LuPhone size={16} />
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sticky RSVP Action Card & Attendees List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              position: 'sticky',
              top: 84,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* Registration Box */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card, 12px)',
                padding: '24px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Admission
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  {event.registrationType === 'paid' ? (
                    <>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 28,
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                        }}
                      >
                        ₹{event.price}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>/ person</span>
                    </>
                  ) : (
                    <span
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 24,
                        fontWeight: 800,
                        color: 'var(--primary)',
                      }}
                    >
                      Complimentary Entry
                    </span>
                  )}
                </div>
              </div>

              {/* Deadline & Capacity Meta */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 12.5,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <LuClock size={15} style={{ color: 'var(--primary)' }} />
                  <span>
                    Deadline:{' '}
                    <strong>
                      {event.registrationDeadline
                        ? new Date(event.registrationDeadline).toLocaleDateString()
                        : 'Open until start'}
                    </strong>
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 12.5,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <LuTicket size={15} style={{ color: 'var(--primary)' }} />
                  <span>
                    Registration: <strong>{event.attendees?.length || 0}</strong>
                    {event.maxAttendees ? ` / ${event.maxAttendees} max seats` : ' (Unlimited)'}
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              {!isPast ? (
                <button
                  type="button"
                  onClick={handleRSVP}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-button, 8px)',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    border: isGoing ? '1px solid var(--primary)' : 'none',
                    background: isGoing ? 'rgba(224, 122, 63, 0.12)' : 'var(--primary)',
                    color: isGoing ? 'var(--primary)' : '#ffffff',
                    boxShadow: isGoing ? 'none' : '0 4px 14px rgba(224, 122, 63, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isGoing ? (
                    <>
                      <LuCheck size={16} /> RSVP Confirmed (Attending)
                    </>
                  ) : (
                    'Confirm My Attendance'
                  )}
                </button>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '12px',
                    borderRadius: 'var(--radius-button, 8px)',
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                  }}
                >
                  This event has concluded.
                </div>
              )}

              <p
                style={{
                  textAlign: 'center',
                  fontSize: 11.5,
                  color: 'var(--text-muted)',
                  margin: '12px 0 0',
                }}
              >
                Instant confirmation added to your dashboard.
              </p>
            </div>

            {/* Attendees Summary */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card, 12px)',
                padding: '20px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                }}
              >
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Attendees ({event.attendees?.length || 0})
                </h4>
              </div>

              {event.attendees?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {event.attendees.slice(0, 5).map((att) => {
                    const attName = att.name || 'Alumni Member';
                    const attInfo = att.company || (att.graduationYear ? `Class of ${att.graduationYear}` : 'Student');
                    return (
                      <div key={att._id || att} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'var(--panel)',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                            color: 'var(--primary)',
                            overflow: 'hidden',
                          }}
                        >
                          {att.profileImage ? (
                            <img src={att.profileImage} alt={attName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            attName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {attName}
                          </p>
                          <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {attInfo}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {event.attendees.length > 5 && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                      + {event.attendees.length - 5} other alumni registered
                    </p>
                  )}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)' }}>
                  Be the first alumni member to RSVP!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
