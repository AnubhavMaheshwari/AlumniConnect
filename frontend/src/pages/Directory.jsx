import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import {
  LuSearch,
  LuBriefcase,
  LuGraduationCap,
  LuMapPin,
  LuMessageSquare,
  LuRefreshCw,
  LuCheck,
  LuFilter,
  LuX,
} from 'react-icons/lu';
import { FaLinkedin } from 'react-icons/fa';
import Button from '../components/ui/Button';

const departments = [
  'Computer Science & Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics & Communication Engineering',
  'Metallurgical & Materials Engineering',
  'Production & Industrial Engineering',
  'Computer Applications (MCA)',
  'Mathematics & Computing',
  'Physics',
  'Chemistry',
  'Humanities & Social Sciences',
];

/* ── Alumni Card ── */
const AlumniCard = ({ user }) => {
  const navigate = useNavigate();
  const initials = user.name ? user.name.slice(0, 2).toUpperCase() : '??';

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <div style={{ padding: 20 }}>
        {/* Top Header: Avatar + Name + LinkedIn */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              flexShrink: 0,
              background: user.profileImage
                ? `url(${user.profileImage}) center/cover`
                : 'var(--color-panel)',
              border: '2px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-heading)',
              fontSize: 16,
              fontWeight: 800,
              color: 'var(--color-navy)',
            }}
          >
            {!user.profileImage && initials}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <Link
              to={`/profile/${user._id}`}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--color-text)',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.name}
            </Link>

            {user.department && (
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                  marginTop: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.department}
              </div>
            )}
          </div>

          {user.linkedin && (
            <a
              href={user.linkedin}
              target="_blank"
              rel="noreferrer"
              className="btn btn-icon"
              style={{ color: '#0A66C2', width: 32, height: 32 }}
              aria-label={`${user.name}'s LinkedIn profile`}
            >
              <FaLinkedin size={18} />
            </a>
          )}
        </div>

        {/* Career & Meta Details */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            borderTop: '1px solid var(--color-border)',
            paddingTop: 12,
          }}
        >
          {user.company && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LuBriefcase size={15} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                {user.currentPosition ? `${user.currentPosition} at ` : ''}
                {user.company}
              </span>
            </div>
          )}

          {user.graduationYear && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LuGraduationCap size={15} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <span>Class of {user.graduationYear}</span>
            </div>
          )}

          {user.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LuMapPin size={15} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <span>{user.location}</span>
            </div>
          )}

          {user.yearsOfExperience > 0 && (
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {user.yearsOfExperience} {user.yearsOfExperience === 1 ? 'year' : 'years'} professional experience
            </div>
          )}
        </div>
      </div>

      {/* Action Footers */}
      <div
        style={{
          padding: '12px 20px 16px',
          background: 'var(--color-page)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          gap: 8,
        }}
      >
        <Link
          to={`/profile/${user._id}`}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1 }}
        >
          View Profile
        </Link>
        <button
          type="button"
          onClick={() => navigate('/messages', { state: { userId: user._id } })}
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
        >
          <LuMessageSquare size={14} /> Message
        </button>
      </div>
    </div>
  );
};

/* ── Skeleton Loading Card ── */
const SkeletonCard = () => (
  <div className="card" style={{ padding: 20 }}>
    <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
      <div className="skeleton" style={{ width: 50, height: 50, borderRadius: '50%' }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '70%', height: 16, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '45%', height: 12 }} />
      </div>
    </div>
    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
      <div className="skeleton" style={{ width: '80%', height: 14, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: '60%', height: 14 }} />
    </div>
    <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
      <div className="skeleton" style={{ flex: 1, height: 32 }} />
      <div className="skeleton" style={{ flex: 1, height: 32 }} />
    </div>
  </div>
);

const Directory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [department, setDepartment] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Sentinel ref for infinite scroll
  const observerRef = useRef(null);

  // Fetch users from backend
  const fetchUsers = useCallback(
    async (pageToLoad, isInitial = false) => {
      if (pageToLoad === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const params = {
          page: pageToLoad,
          limit: 12,
        };
        if (search.trim()) params.search = search.trim();
        if (department) params.department = department;
        if (batchYear) params.graduationYear = batchYear;
        if (company.trim()) params.company = company.trim();
        if (location.trim()) params.location = location.trim();

        const { data } = await API.get('/users', { params });

        if (data.success) {
          setUsers((prev) => (pageToLoad === 1 ? data.users : [...prev, ...data.users]));
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error('Directory fetch error:', err);
        setError('Failed to load directory. Please check your connection.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, department, batchYear, company, location]
  );

  // Trigger initial / filtered fetch
  useEffect(() => {
    setPage(1);
    fetchUsers(1, true);
  }, [fetchUsers]);

  // Infinite Scroll IntersectionObserver
  const lastElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && page < totalPages) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchUsers(nextPage);
            return nextPage;
          });
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, page, totalPages, fetchUsers]
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1, true);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('');
    setBatchYear('');
    setCompany('');
    setLocation('');
    setSearchParams({});
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search || department || batchYear || company || location
  );

  return (
    <div style={{ padding: '40px 24px 80px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(28px, 4vw, 38px)',
            fontWeight: 800,
            color: 'var(--color-text)',
            marginBottom: 8,
          }}
        >
          Alumni & Student Directory
        </h1>
        <p
          style={{
            fontSize: 15,
            color: 'var(--color-text-secondary)',
            maxWidth: 520,
            margin: '0 auto',
          }}
        >
          Explore verified members of the NIT Jamshedpur global community.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="card"
        style={{
          padding: 20,
          marginBottom: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Main search text */}
          <div style={{ flex: '2 1 240px', position: 'relative' }}>
            <LuSearch
              size={18}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search by name, current role, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 38 }}
            />
          </div>

          {/* Department Select */}
          <div style={{ flex: '1.5 1 200px' }}>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="input-field"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Year */}
          <div style={{ flex: '0.8 1 110px' }}>
            <input
              type="number"
              placeholder="Grad Year"
              value={batchYear}
              onChange={(e) => setBatchYear(e.target.value)}
              className="input-field"
              min="1960"
              max="2035"
            />
          </div>

          {/* Company filter */}
          <div style={{ flex: '1 1 140px' }}>
            <input
              type="text"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Location filter */}
          <div style={{ flex: '1 1 140px' }}>
            <input
              type="text"
              placeholder="Location / City"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field"
            />
          </div>

          <Button type="submit" variant="primary" size="md">
            Filter
          </Button>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <LuX size={16} /> Reset
            </Button>
          )}
        </div>
      </form>

      {/* ── ERROR & RETRY STATE ── */}
      {error && !loading && (
        <div
          className="card"
          style={{
            padding: '36px 24px',
            textAlign: 'center',
            marginBottom: 32,
            borderColor: 'var(--color-error)',
          }}
        >
          <p style={{ color: 'var(--color-error)', fontSize: 15, marginBottom: 16 }}>
            {error}
          </p>
          <Button
            variant="secondary"
            size="md"
            onClick={() => fetchUsers(page)}
          >
            <LuRefreshCw size={14} /> Retry
          </Button>
        </div>
      )}

      {/* ── CARD GRID ── */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 20,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : users.length === 0 ? (
        /* Empty State */
        <div
          className="card"
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            background: 'var(--color-surface)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 8,
            }}
          >
            No matching alumni found
          </h3>
          <p
            style={{
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              maxWidth: 420,
              margin: '0 auto 20px',
            }}
          >
            Try broadening your search terms or clearing specific department and batch filters.
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" size="md" onClick={handleResetFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: 20,
            }}
          >
            {users.map((u, index) => {
              const isLast = index === users.length - 1;
              return (
                <div key={u._id || index} ref={isLast ? lastElementRef : null}>
                  <AlumniCard user={u} />
                </div>
              );
            })}
          </div>

          {/* Loading More Spinner Indicator */}
          {loadingMore && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '36px 0' }}>
              <div className="spinner" />
            </div>
          )}

          {/* All Caught Up Indicator */}
          {!loadingMore && page >= totalPages && users.length > 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 0 20px',
                color: 'var(--color-text-muted)',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <LuCheck size={16} style={{ color: 'var(--color-success)' }} />
              You're all caught up! Reached the end of the directory.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Directory;
