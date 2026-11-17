import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  LuArrowLeft,
  LuClock,
  LuUser,
  LuShare2,
  LuBookmark,
  LuTag,
  LuHeart,
  LuMessageSquare,
  LuCheck
} from 'react-icons/lu';

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

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    fetchNewsItem();
  }, [id]);

  const fetchNewsItem = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/news/${id}`);
      setItem(data.news);
    } catch (err) {
      toast.error('Failed to load story');
      navigate('/news');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: item?.title,
          text: item?.summary || item?.title,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Story link copied to clipboard!');
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

  if (!item) return null;

  const badgeStyle = getCategoryBadgeStyle(item.category);
  const createdDate = new Date(item.createdAt);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--page)',
        color: 'var(--text-primary)',
        padding: '36px 20px 96px',
      }}
    >
      <article style={{ maxWidth: 840, margin: '0 auto' }}>
        {/* Navigation & Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 32,
          }}
        >
          <Link
            to="/news"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: 13.5,
              fontWeight: 600,
              padding: '8px 14px',
              borderRadius: 'var(--radius-button, 8px)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              transition: 'color 0.15s ease',
            }}
          >
            <LuArrowLeft size={15} /> Back to Stories
          </Link>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleShare}
              title="Share story"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 'var(--radius-button, 8px)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LuShare2 size={14} /> Share
            </button>
            <button
              type="button"
              onClick={() => {
                setBookmarked(!bookmarked);
                toast.info(bookmarked ? 'Story removed from bookmarks' : 'Story bookmarked!');
              }}
              title="Save story"
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-button, 8px)',
                background: bookmarked ? 'rgba(224, 122, 63, 0.12)' : 'var(--surface)',
                border: bookmarked ? '1px solid var(--primary)' : '1px solid var(--border)',
                color: bookmarked ? 'var(--primary)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <LuBookmark size={15} />
            </button>
          </div>
        </div>

        {/* Story Category & Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: badgeStyle.bg,
              color: badgeStyle.color,
              border: `1px solid ${badgeStyle.border}`,
              borderRadius: 16,
              padding: '4px 12px',
              fontSize: 11.5,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {item.category || 'Alumni Story'}
          </span>

          <span
            style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <LuClock size={13} />
            {createdDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Story Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800,
            lineHeight: 1.25,
            color: 'var(--text-primary)',
            letterSpacing: '-0.5px',
            margin: '0 0 24px',
          }}
        >
          {item.title}
        </h1>

        {/* Author Byline Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderRadius: 'var(--radius-card, 12px)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            marginBottom: 36,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
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
              {item.author?.profileImage ? (
                <img
                  src={item.author.profileImage}
                  alt={item.author.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : item.author?.name ? (
                item.author.name.charAt(0).toUpperCase()
              ) : (
                <LuUser size={20} />
              )}
            </div>

            <div>
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                {item.author?.name || 'Alumni Contributor'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                NIT Jamshedpur Community
              </p>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {item.image && (
          <div
            style={{
              width: '100%',
              borderRadius: 'var(--radius-card, 12px)',
              overflow: 'hidden',
              marginBottom: 36,
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              maxHeight: 460,
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Story Body */}
        <div
          style={{
            fontSize: 16.5,
            lineHeight: 1.85,
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            marginBottom: 44,
          }}
        >
          {item.content}
        </div>

        {/* Tags Row */}
        {item.tags?.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              paddingTop: 20,
              borderTop: '1px solid var(--border)',
              marginBottom: 36,
            }}
          >
            {item.tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 12px',
                  borderRadius: 6,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                }}
              >
                <LuTag size={11} style={{ color: 'var(--primary)' }} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Article Reaction Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px 20px',
            borderRadius: 'var(--radius-card, 12px)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            width: 'fit-content',
          }}
        >
          <button
            type="button"
            onClick={() => setLiked(!liked)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              color: liked ? '#e11d48' : 'var(--text-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            <LuHeart size={16} style={{ fill: liked ? '#e11d48' : 'none' }} />
            {liked ? 'Liked' : 'Applaud Story'}
          </button>

          <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

          <button
            type="button"
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <LuShare2 size={16} /> Share with Batchmates
          </button>
        </div>
      </article>
    </div>
  );
};

export default NewsDetail;
