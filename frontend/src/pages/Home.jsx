import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LuSearch,
  LuArrowRight,
  LuUsers,
  LuBriefcase,
  LuGraduationCap,
  LuCompass,
  LuShieldCheck,
  LuBuilding2,
  LuMapPin,
} from 'react-icons/lu';
import Button from '../components/ui/Button';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/directory?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/directory');
    }
  };

  const alumniStories = [
    {
      name: 'Aranya Sen',
      role: 'Staff Engineer at Google',
      batch: 'Class of 2017 &bull; CSE',
      location: 'Bengaluru, India',
      quote:
        'Connecting with senior alumni during my final year helped me prepare for systems engineering interviews. Now I mentor 3rd year students each semester.',
      image:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80&auto=format&fit=crop',
    },
    {
      name: 'Dr. Megha Trivedi',
      role: 'Principal Researcher at Microsoft Research',
      batch: 'Class of 2014 &bull; ECE',
      location: 'Redmond, WA',
      quote:
        'The NIT JSR alumni network provided the initial technical peer review for my doctoral research proposal. The trust across batches is unmatched.',
      image:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80&auto=format&fit=crop',
    },
    {
      name: 'Rohit K. Verma',
      role: 'Co-Founder & CEO, CleanVolt',
      batch: 'Class of 2019 &bull; Mechanical',
      location: 'Pune, India',
      quote:
        'We raised our initial seed angel round through connections made right here in the alumni directory with batchmates working in cleantech venture capital.',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80&auto=format&fit=crop',
    },
  ];

  return (
    <div>
      {/* ── HERO SECTION ── */}
      <section
        style={{
          position: 'relative',
          minHeight: '560px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-navy)',
          color: '#FFFFFF',
          overflow: 'hidden',
          padding: '80px 24px',
        }}
      >
        {/* Background real campus photography with solid deep navy overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            opacity: 0.22,
          }}
        >
          <img
            src="https://lh3.googleusercontent.com/gps-cs-s/ANWiy9RmYtiLDxuRADoBN0cYS5F_CvmOzwmIzlLBAty20q-1Bo0augLNfZloAlf-Rz665Hqha0NFC0Rf-qa7nktPXK4SEGcJOGLdOKLdZIOUXNb5oLKNRjBjUpeK06Q9qJiFl4WyEfNp=s0"
            alt="Full College Building"
            className="w-full h-auto object-contain"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>

        <div
          style={{
            maxWidth: 1040,
            margin: '0 auto',
            width: '100%',
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
          }}
        >
          <div
            className="badge badge-accent"
            style={{
              marginBottom: 20,
              background: 'rgba(224, 122, 63, 0.2)',
              color: '#F29A5C',
              border: '1px solid rgba(242, 154, 92, 0.3)',
            }}
          >
            Official NIT Jamshedpur Network
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(32px, 5.5vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#ffffffff',
              letterSpacing: '-0.03em',
              marginBottom: 20,
            }}
          >
            Connect with 30,000+ NIT Jamshedpur alumni worldwide
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: 680,
              margin: '0 auto 36px',
              lineHeight: 1.6,
            }}
          >
            Search by company, batch, or department. Get trusted referrals, 1-on-1 mentorship, and collaborate with fellow engineers.
          </p>

          {/* Alumni Quick Search Bar */}
          <form
            onSubmit={handleHeroSearch}
            style={{
              maxWidth: 600,
              margin: '0 auto 36px',
              display: 'flex',
              gap: 8,
              background: 'var(--color-surface)',
              padding: 6,
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >

             <div
              style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <LuSearch
                size={18}
                strokeWidth={1.8}
                style={{
                  position: 'absolute',
                  left: 12,
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search alumni by name, company (Google, Tata...), or role"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                style={{
                  width: '100%',
                  height: 44,
                  border: 'none',
                  outline: 'none',
                  paddingLeft: 38,
                  paddingRight: 12,
                  fontSize: 14,
                  color: 'var(--color-text)',
                  background: 'transparent',
                  fontFamily: 'var(--font-body)',
                }}
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Search Directory
            </Button>
          </form>

          {/* Trust Metric Stats */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(20px, 4vw, 48px)',
              flexWrap: 'wrap',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              paddingTop: 28,
            }}
          >
            {[
              { num: '5,400+', label: 'Verified Alumni' },
              { num: '42', label: 'Countries Represented' },
              { num: '650+', label: 'Mentorship Sessions' },
              { num: '1960', label: 'Institute Founded' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 24,
                    fontWeight: 800,
                    color: '#FFFFFF',
                  }}
                >
                  {stat.num}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginTop: 4,
                    letterSpacing: '0.02em',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (3 VARIED LAYOUTS, NOT IDENTICAL REPEATED CARDS) ── */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="badge badge-accent" style={{ marginBottom: 12 }}>
            Network Structure
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: 800,
              color: 'var(--color-text)',
              marginBottom: 12,
            }}
          >
            How Alumni Connect Works
          </h2>
          <p
            style={{
              fontSize: 16,
              color: 'var(--color-text-secondary)',
              maxWidth: 540,
              margin: '0 auto',
            }}
          >
            A dedicated system built so students and alumni forge genuine career connections.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Step 1: Split Two-Column Layout */}
          <div
            className="card"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-panel)',
                  color: 'var(--color-accent)',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  fontSize: 14,
                }}
              >
                01
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 22,
                  fontWeight: 800,
                  color: 'var(--color-text)',
                  marginBottom: 12,
                }}
              >
                Verified Student & Alumni Profiles
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: 20,
                }}
              >
                Every member signs in using their official institute credentials or graduation records. No fake profiles, recruiters, or unsolicited spam.
              </p>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LuShieldCheck size={16} style={{ color: 'var(--color-success)' }} /> Institute Email Verified
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LuGraduationCap size={16} style={{ color: 'var(--color-accent)' }} /> Department Confirmed
                </span>
              </div>
            </div>
            <div style={{ background: 'var(--color-panel)', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80&auto=format&fit=crop"
                alt="Students collaborating"
                width="600"
                height="400"
                loading="lazy"
                style={{ borderRadius: 'var(--radius-sm)', width: '100%', maxHeight: 260, objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Step 2: Interactive Filter Showcase Layout */}
          <div
            className="card"
            style={{
              padding: '36px 36px',
              background: 'var(--color-panel)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ maxWidth: 840 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-accent)',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  fontSize: 14,
                }}
              >
                02
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 22,
                  fontWeight: 800,
                  color: 'var(--color-text)',
                  marginBottom: 12,
                }}
              >
                Targeted Directory Filtering
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: 20,
                }}
              >
                Filter the community by graduation batch, field of work, and global locations to find the exact senior who walked your path.
              </p>

              {/* Sample Quick Filters */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  'Microsoft',
                  'Tata Steel',
                  'Google',
                  'Amazon',
                  'Bengaluru',
                  'Silicon Valley',
                  'Class of 2023',
                  'Civil Engg',
                  'CSE',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => navigate(`/directory?search=${encodeURIComponent(tag)}`)}
                    className="btn btn-secondary btn-sm"
                    style={{ background: 'var(--color-surface)', fontSize: 13 }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Privacy & Direct Introduction Layout */}
          <div
            className="card"
            style={{
              padding: '36px 36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 20,
            }}
          >
            <div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-panel)',
                  color: 'var(--color-accent)',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  fontSize: 14,
                }}
              >
                03
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 22,
                  fontWeight: 800,
                  color: 'var(--color-text)',
                  marginBottom: 12,
                }}
              >
                Privacy-First Contact & Messaging
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.7,
                  maxWidth: 720,
                }}
              >
                Personal contact details are never exposed publicly. You can send structured introduction requests or direct on-platform messages, respecting alumni time and boundary preferences.
              </p>
            </div>
            <div>
              <Link to={user ? '/directory' : '/register'} className="btn btn-secondary btn-md">
                Browse Directory <LuArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAMPUS LANDMARKS & LIFE ── */}
      <section style={{ padding: '60px 24px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div className="badge badge-accent" style={{ marginBottom: 12 }}>
            Campus Life & Landmarks
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: 800,
              color: 'var(--color-text)',
              marginBottom: 10,
            }}
          >
            Memories & Campus Infrastructure
          </h2>
          <p
            style={{
              fontSize: 15,
              color: 'var(--color-text-secondary)',
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            From the historic corridors of RIT to the modern Diamond Jubilee lecture halls, see how our campus continues to inspire generations.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {[
            {
              title: 'Diamond Jubilee Lecture Hall Complex',
              desc: 'State-of-the-art smart lecture theatres hosting academic symposiums and student conventions.',
              img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80&auto=format&fit=crop',
            },
            {
              title: 'Administrative Block & Central Quad',
              desc: 'The iconic heart of NIT Jamshedpur connecting engineering departments and the central gardens.',
              img: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80&auto=format&fit=crop',
            },
            {
              title: 'Central Computing & Technical Labs',
              desc: 'Advanced research computing centres supporting machine learning, VLSI, and student robotics.',
              img: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=600&q=80&auto=format&fit=crop',
            },
            {
              title: 'Annual Technical Fest — OJASS',
              desc: 'One of Eastern India’s premier student festivals bringing together innovators, coders, and alumni mentors.',
              img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80&auto=format&fit=crop',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="card"
              style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ height: 190, overflow: 'hidden' }}>
                <img
                  src={item.img}
                  alt={item.title}
                  width="600"
                  height="360"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80&auto=format&fit=crop';
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: 6,
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED ALUMNI STORIES ── */}
      <section
        style={{
          backgroundColor: 'var(--color-panel)',
          padding: '80px 24px',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="badge badge-accent" style={{ marginBottom: 12 }}>
              Community Impact
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(26px, 4vw, 36px)',
                fontWeight: 800,
                color: 'var(--color-text)',
                marginBottom: 12,
              }}
            >
              Featured Alumni Stories
            </h2>
            <p
              style={{
                fontSize: 15,
                color: 'var(--color-text-secondary)',
                maxWidth: 480,
                margin: '0 auto',
              }}
            >
              Real experiences from students and graduates building careers through the network.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 24,
            }}
          >
            {alumniStories.map((story) => (
              <div
                key={story.name}
                className="card"
                style={{
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'var(--color-surface)',
                }}
              >
                <p
                  style={{
                    fontSize: 14.5,
                    color: 'var(--color-text)',
                    lineHeight: 1.7,
                    fontStyle: 'italic',
                    marginBottom: 24,
                  }}
                >
                  "{story.quote}"
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <img
                    src={story.image}
                    alt={story.name}
                    width="48"
                    height="48"
                    loading="lazy"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--color-border)',
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 15,
                        fontWeight: 700,
                        color: 'var(--color-text)',
                      }}
                    >
                      {story.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                      }}
                    >
                      {story.role}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: 'var(--color-text-muted)',
                        marginTop: 2,
                      }}
                      dangerouslySetInnerHTML={{ __html: story.batch }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION BANNER ── */}
      <section style={{ padding: '80px 24px' }}>
        <div
          style={{
            maxWidth: 880,
            margin: '0 auto',
            textAlign: 'center',
            backgroundColor: 'var(--color-navy)',
            borderRadius: 'var(--radius-md)',
            padding: 'clamp(40px, 6vw, 64px) 24px',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(24px, 4vw, 34px)',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: 14,
            }}
          >
            {user ? 'Welcome to your Alumni Network' : 'Ready to reconnect with your batch?'}
          </h2>

          <p
            style={{
              fontSize: 16,
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: 540,
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            {user
              ? 'Browse the directory, message fellow alumni, or view upcoming campus events.'
              : 'Join today with your institute email. Create your profile, search the alumni directory, and unlock opportunities.'}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={user ? '/directory' : '/register'}
              className="btn btn-primary btn-lg"
            >
              {user ? 'Open Directory' : 'Create Student / Alumni Profile'} <LuArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
