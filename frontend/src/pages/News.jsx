import { useState, useEffect } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  LuNewspaper,
  LuUser,
  LuClock,
  LuPlus,
  LuX,
  LuFilter,
  LuTag,
  LuSearch,
  LuArrowRight
} from 'react-icons/lu';

const CATEGORIES = [
  { value: '', label: 'All Stories' },
  { value: 'achievement', label: 'Achievements' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'story', label: 'Alumni Journeys' },
  { value: 'update', label: 'Campus Updates' },
  { value: 'other', label: 'Other' },
];

const getCategoryBadgeStyle = (category) => {
  switch (category?.toLowerCase()) {
    case 'achievement':
      return { bg: 'rgba(224, 122, 63, 0.12)', color: 'var(--primary)', border: 'rgba(224, 122, 63, 0.25)' };
    case 'announcement':
      return { bg: 'rgba(224, 122, 63, 0.12)', color: 'var(--color-accent)', border: 'rgba(224, 122, 63, 0.25)' };
    case 'story':
      return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.25)' };
    case 'update':
      return { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', border: 'rgba(99, 102, 241, 0.25)' };
    default:
      return { bg: 'var(--panel)', color: 'var(--text-secondary)', border: 'var(--border)' };
  }
};

const NewsCard = ({ item }) => {
  const badgeStyle = getCategoryBadgeStyle(item.category);
  const createdDate = new Date(item.createdAt);

  return (
    <article
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card, 12px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
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
      {/* Optional Featured Image */}
      {item.image && (
        <div style={{ width: '100%', height: 180, overflow: 'hidden', background: 'var(--panel)' }}>
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Category Badge & Date */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
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
            {item.category || 'Story'}
          </span>

          <span
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <LuClock size={12} />
            {createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <Link
          to={`/news/${item._id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          >
            {item.title}
          </h3>
        </Link>

        {/* Summary Snippet */}
        <p
          style={{
            fontSize: 13.5,
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
          {item.summary || item.content}
        </p>

        {/* Tags */}
        {item.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
            {item.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                }}
              >
                <LuTag size={10} style={{ color: 'var(--text-muted)' }} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
            fontSize: 12,
            color: 'var(--text-secondary)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: 10,
              }}
            >
              {item.author?.name ? item.author.name.charAt(0).toUpperCase() : <LuUser size={12} />}
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {item.author?.name || 'Alumni Member'}
            </span>
          </span>

          <Link
            to={`/news/${item._id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--primary)',
              textDecoration: 'none',
            }}
          >
            Read story <LuArrowRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
};

const News = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'story',
    tags: '',
  });

  useEffect(() => {
    fetchNews();
  }, [category]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      const { data } = await API.get('/news', { params });
      setNews(data.news || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load news stories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        tags: formData.tags
          ? formData.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };
      await API.post('/news', submitData);
      toast.success('Story published successfully!');
      setShowForm(false);
      setFormData({
        title: '',
        content: '',
        summary: '',
        category: 'story',
        tags: '',
      });
      fetchNews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish story');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredNews = news.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.summary?.toLowerCase().includes(q) ||
      item.content?.toLowerCase().includes(q) ||
      item.tags?.some((t) => t.toLowerCase().includes(q))
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
              <LuNewspaper size={13} style={{ color: 'var(--primary)' }} />
              ALUMNI STORIES & EDITORIALS
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
              News & Achievements
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, maxWidth: 640 }}>
              Celebrate career milestones, academic breakthroughs, entrepreneurship wins, and campus updates.
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
                  <LuPlus size={15} /> Share a Story
                </>
              )}
            </button>
          )}
        </div>

        {/* Share Story Form */}
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
                  Share an Alumni Story or Milestone
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Inspire the NIT JSR community with achievements, research, or company updates.
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
                    Story Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Batch of 2018 Alumnus Closes Series A Funding"
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
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                    {CATEGORIES.filter((c) => c.value).map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Brief Summary (Card teaser snippet)
                </label>
                <input
                  type="text"
                  placeholder="One to two sentences summarizing the highlight..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
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

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Full Article Content *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Tell the complete story: background, the journey, challenges faced, learnings, and next steps..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
                    lineHeight: 1.65,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Keywords / Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. startup, research, civil engineering, patents, placement"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
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
                  {isSubmitting ? 'Publishing...' : 'Publish Story'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search & Category Filter Toolbar */}
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
            {CATEGORIES.map((c) => {
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
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
                  {c.label}
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
              placeholder="Search stories by keyword..."
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

        {/* Stories Grid */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
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
        ) : filteredNews.length === 0 ? (
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
              <LuNewspaper size={24} />
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
              No stories found
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>
              {searchQuery || category
                ? 'Try broadening your search or switching to another category.'
                : 'No stories published yet. Be the first to share an achievement!'}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 24,
            }}
          >
            {filteredNews.map((item) => (
              <NewsCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
