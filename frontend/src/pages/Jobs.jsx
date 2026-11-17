import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  LuBriefcase,
  LuMapPin,
  LuClock,
  LuPlus,
  LuX,
  LuSearch,
  LuExternalLink,
  LuFilter,
  LuTag,
  LuDollarSign,
  LuBuilding
} from 'react-icons/lu';

const JOB_TYPES = [
  { value: '', label: 'All Positions' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
];

const getTypeBadgeStyle = (type) => {
  switch (type?.toLowerCase()) {
    case 'remote':
      return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.25)' };
    case 'internship':
      return { bg: 'rgba(224, 122, 63, 0.12)', color: 'var(--primary)', border: 'rgba(224, 122, 63, 0.25)' };
    case 'full-time':
      return { bg: 'rgba(224, 122, 63, 0.12)', color: 'var(--color-accent)', border: 'rgba(224, 122, 63, 0.25)' };
    case 'contract':
      return { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', border: 'rgba(99, 102, 241, 0.25)' };
    default:
      return { bg: 'var(--panel)', color: 'var(--text-secondary)', border: 'var(--border)' };
  }
};

const JobCard = ({ job }) => {
  const badgeStyle = getTypeBadgeStyle(job.type);

  return (
    <article
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
      {/* Top Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {job.title}
            </h3>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: badgeStyle.bg,
                color: badgeStyle.color,
                border: `1px solid ${badgeStyle.border}`,
                borderRadius: 16,
                padding: '3px 10px',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'capitalize',
              }}
            >
              {job.type || 'Full-time'}
            </span>
          </div>

          {/* Meta line: Company, Location, Salary */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px 18px',
              fontSize: 13,
              color: 'var(--text-secondary)',
              alignItems: 'center',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600, color: 'var(--text-primary)' }}>
              <LuBuilding size={14} style={{ color: 'var(--primary)' }} />
              {job.company}
            </span>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <LuMapPin size={14} style={{ color: 'var(--text-muted)' }} />
              {job.location}
            </span>

            {job.salary && job.salary !== 'Not disclosed' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, color: 'var(--primary)' }}>
                <LuDollarSign size={14} />
                {job.salary}
              </span>
            )}

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
              <LuClock size={13} />
              {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {job.applicationLink && (
          <a
            href={job.applicationLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--primary)',
              color: '#ffffff',
              padding: '9px 18px',
              borderRadius: 'var(--radius-button, 8px)',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(224, 122, 63, 0.25)',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            Apply Directly <LuExternalLink size={13} />
          </a>
        )}
      </div>

      {/* Description Snippet */}
      <p
        style={{
          fontSize: 13.5,
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
          margin: 0,
          whiteSpace: 'pre-line',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {job.description}
      </p>

      {/* Requirements Tags */}
      {job.requirements?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
          {job.requirements.slice(0, 6).map((req, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '3px 9px',
                fontSize: 11.5,
                color: 'var(--text-secondary)',
                fontWeight: 500,
              }}
            >
              <LuTag size={10} style={{ color: 'var(--text-muted)' }} />
              {req}
            </span>
          ))}
          {job.requirements.length > 6 && (
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', alignSelf: 'center', padding: '0 4px' }}>
              +{job.requirements.length - 6} more
            </span>
          )}
        </div>
      )}
    </article>
  );
};

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    description: '',
    salary: '',
    applicationLink: '',
    requirements: '',
  });

  useEffect(() => {
    fetchJobs();
  }, [typeFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (typeFilter) params.type = typeFilter;
      const { data } = await API.get('/jobs', { params });
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load career opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        requirements: formData.requirements
          ? formData.requirements
              .split(',')
              .map((r) => r.trim())
              .filter(Boolean)
          : [],
      };
      await API.post('/jobs', submitData);
      toast.success('Opportunity posted successfully!');
      setShowForm(false);
      setFormData({
        title: '',
        company: '',
        location: '',
        type: 'full-time',
        description: '',
        salary: '',
        applicationLink: '',
        requirements: '',
      });
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post opportunity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--page)',
        padding: '36px 20px 80px',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
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
              <LuBriefcase size={13} style={{ color: 'var(--primary)' }} />
              ALUMNI CAREER PORTAL
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
              Job & Internship Opportunities
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, maxWidth: 640 }}>
              Discover career openings, exclusive referrals, and internships posted directly by NIT Jamshedpur graduates.
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
                  <LuPlus size={15} /> Post an Opening
                </>
              )}
            </button>
          )}
        </div>

        {/* Post Job Form Modal / Inline Box */}
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
                  Post a Job or Internship Opportunity
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Help fellow students and alumni discover positions at your organization.
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Software Engineer / SDE-1"
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
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tata Steel / Google / Microsoft"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru, Karnataka (or Remote)"
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
                    Position Type
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
                    {JOB_TYPES.filter((t) => t.value).map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Salary Range (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹18–24 LPA or $90k/year"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
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
                    Application / Referral Link (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://company.com/careers/apply/..."
                    value={formData.applicationLink}
                    onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
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
              </div>

              {/* Description & Requirements */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Role Overview & Key Responsibilities *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe team mission, daily responsibilities, qualifications, and referral contact instructions..."
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

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Key Skills / Requirements (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, Python, Distributed Systems, SQL"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
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
              </div>

              {/* Form Actions */}
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
                  {isSubmitting ? 'Posting Opening...' : 'Publish Opening'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card, 12px)',
            padding: '16px 20px',
            marginBottom: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, width: '100%' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <LuSearch
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search by job title, company name, skill, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  borderRadius: 'var(--radius-input, 8px)',
                  border: '1px solid var(--border)',
                  background: 'var(--page)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '10px 22px',
                borderRadius: 'var(--radius-button, 8px)',
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(224, 122, 63, 0.25)',
              }}
            >
              Search
            </button>
          </form>

          {/* Type Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 4 }}>
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
              Type:
            </span>
            {JOB_TYPES.map((t) => {
              const active = typeFilter === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTypeFilter(t.value)}
                  style={{
                    padding: '5px 14px',
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
        </div>

        {/* Jobs List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                style={{
                  height: 160,
                  borderRadius: 'var(--radius-card, 12px)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
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
              <LuBriefcase size={24} />
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
              No opportunities found
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>
              {search || typeFilter
                ? 'Try broadening your search keywords or clearing the position type filter.'
                : 'No career openings posted yet. Be the first to share an opportunity with fellow alumni!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
