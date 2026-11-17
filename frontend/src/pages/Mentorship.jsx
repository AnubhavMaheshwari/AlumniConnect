import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  LuUserCheck,
  LuSearch,
  LuFilter,
  LuBriefcase,
  LuGraduationCap,
  LuClock,
  LuCircleCheck,
  LuPlus,
  LuX,
  LuTag,
  LuUser
} from 'react-icons/lu';

const Mentorship = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOptIn, setShowOptIn] = useState(false);
  const [filters, setFilters] = useState({ domain: '', company: '', type: '' });
  const [search, setSearch] = useState('');
  const [optInData, setOptInData] = useState({
    domain: '',
    experience: '',
    bio: '',
    type: 'free',
    price: 0,
  });

  useEffect(() => {
    fetchMentors();
  }, [filters]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/mentors', { params: filters });
      setMentors(data.mentors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptIn = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...optInData,
        experience: Number(optInData.experience) || 0,
        price: Number(optInData.price) || 0,
        domain: optInData.domain
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
      };
      await API.post('/mentors', submitData);
      toast.success('Successfully registered as an alumni mentor!');
      setShowOptIn(false);
      fetchMentors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to opt in');
    }
  };

  const filteredMentors = mentors.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.user?.name?.toLowerCase().includes(q) ||
      m.user?.company?.toLowerCase().includes(q) ||
      m.bio?.toLowerCase().includes(q) ||
      m.domain?.some((d) => d.toLowerCase().includes(q))
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
        {/* Header */}
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
              <LuUserCheck size={13} style={{ color: 'var(--primary)' }} />
              1-ON-1 ALUMNI ADVISORY
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
              Alumni Mentorship Program
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, maxWidth: 640 }}>
              Receive trusted guidance on campus placements, higher studies, civil services, and startup journeys from
              experienced graduates.
            </p>
          </div>

          {!showOptIn && user && (
            <button
              type="button"
              onClick={() => setShowOptIn(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-button, 8px)',
                padding: '10px 20px',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(224, 122, 63, 0.25)',
              }}
            >
              <LuPlus size={15} /> Become a Mentor
            </button>
          )}
        </div>

        {/* Opt-In Registration Card */}
        {showOptIn && (
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
                justifyContent: 'space-between',
                alignItems: 'center',
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
                  Register as an Alumni Mentor
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Give back to junior students by offering mock interviews, resume critiques, or career guidance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOptIn(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <LuX size={18} />
              </button>
            </div>

            <form onSubmit={handleOptIn}>
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
                    Key Focus Areas & Skills (Comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. System Design, Product Management, Data Science"
                    value={optInData.domain}
                    onChange={(e) => setOptInData({ ...optInData, domain: e.target.value })}
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
                    Industry Experience (Years) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 4"
                    value={optInData.experience}
                    onChange={(e) => setOptInData({ ...optInData, experience: e.target.value })}
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
                    Mentorship Model
                  </label>
                  <select
                    value={optInData.type}
                    onChange={(e) => setOptInData({ ...optInData, type: e.target.value })}
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
                    <option value="free">Complimentary / Pro-bono Mentorship</option>
                    <option value="paid">Structured Paid Advisory</option>
                  </select>
                </div>

                {optInData.type === 'paid' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Fee per Session (₹)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 500"
                      value={optInData.price}
                      onChange={(e) => setOptInData({ ...optInData, price: e.target.value })}
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
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Mentor Bio & How You Help *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share a brief overview of your background, companies you've worked with, and what students can expect from your sessions..."
                  value={optInData.bio}
                  onChange={(e) => setOptInData({ ...optInData, bio: e.target.value })}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowOptIn(false)}
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
                  }}
                >
                  Complete Mentor Profile
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters Toolbar */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card, 12px)',
            padding: '16px 20px',
            marginBottom: 28,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <LuSearch
              size={15}
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
              placeholder="Search by mentor name, skill, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: 'var(--radius-input, 8px)',
                border: '1px solid var(--border)',
                background: 'var(--page)',
                color: 'var(--text-primary)',
                fontSize: 13.5,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ flex: '0 1 200px' }}>
            <input
              type="text"
              placeholder="Filter by company..."
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-input, 8px)',
                border: '1px solid var(--border)',
                background: 'var(--page)',
                color: 'var(--text-primary)',
                fontSize: 13.5,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-input, 8px)',
                border: '1px solid var(--border)',
                background: 'var(--page)',
                color: 'var(--text-primary)',
                fontSize: 13.5,
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              <option value="">All Session Types</option>
              <option value="free">Complimentary</option>
              <option value="paid">Paid Sessions</option>
            </select>
          </div>
        </div>

        {/* Mentors Grid */}
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
                  height: 280,
                  borderRadius: 'var(--radius-card, 12px)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            ))}
          </div>
        ) : filteredMentors.length === 0 ? (
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
              <LuUserCheck size={24} />
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
              No mentors found
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>
              Try broadening your keyword search or adjusting company filters.
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
            {filteredMentors.map((mentor) => (
              <article
                key={mentor._id}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-card, 12px)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'var(--panel)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: 15,
                        overflow: 'hidden',
                      }}
                    >
                      {mentor.user?.profileImage ? (
                        <img
                          src={mentor.user.profileImage}
                          alt={mentor.user.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        mentor.user?.name?.charAt(0)?.toUpperCase() || <LuUser size={20} />
                      )}
                    </div>
                    <div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 16,
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          margin: '0 0 2px',
                        }}
                      >
                        {mentor.user?.name}
                      </h3>
                      <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {mentor.user?.company || 'NIT JSR Alumni'}
                      </p>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      borderRadius: 16,
                      padding: '3px 9px',
                      background: mentor.type === 'free' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(224, 122, 63, 0.12)',
                      color: mentor.type === 'free' ? '#10b981' : 'var(--primary)',
                      border: `1px solid ${mentor.type === 'free' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(224, 122, 63, 0.25)'}`,
                    }}
                  >
                    {mentor.type === 'free' ? 'Free' : `₹${mentor.price}`}
                  </span>
                </div>

                {/* Domains */}
                {mentor.domain?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {mentor.domain.map((d, i) => (
                      <span
                        key={i}
                        style={{
                          background: 'var(--panel)',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          padding: '2px 8px',
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                          fontWeight: 500,
                        }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bio */}
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {mentor.bio}
                </p>

                {/* Footer with Experience & Connect */}
                <div
                  style={{
                    paddingTop: 12,
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                    <LuBriefcase size={12} style={{ color: 'var(--primary)' }} />
                    {mentor.experience} yrs exp.
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      toast.info(`Reach out to ${mentor.user?.name} via direct Messages in the navbar!`);
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 'var(--radius-button, 8px)',
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--primary)';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--panel)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    Request Mentorship
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentorship;
