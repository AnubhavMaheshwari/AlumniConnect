import { useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';

const faqData = [
  {
    q: 'What is the NIT Jamshedpur Alumni Portal?',
    a: 'The NIT Jamshedpur Alumni Portal is the official networking platform connecting alumni, professors, and current students of the institute. It provides directory search, 1-on-1 mentorship, campus events, and exclusive job opportunities.',
  },
  {
    q: 'Who is eligible to register on the platform?',
    a: 'All current undergraduate, postgraduate, and doctoral students of NIT Jamshedpur, as well as alumni who have graduated from the institute (including legacy RIT Jamshedpur batches), are welcome to register.',
  },
  {
    q: 'Is there any fee to use the standard features?',
    a: 'No. Directory browsing, peer messaging, event registration, and basic networking are 100% free for all students and alumni.',
  },
  {
    q: 'Why is an @nitjsr.ac.in email required for student sign-up?',
    a: 'We require verified institute email addresses to maintain high trust, preventing spam, unauthorized recruiters, or fraudulent profiles from joining the network.',
  },
  {
    q: 'How does the Alumni Directory work?',
    a: 'The directory lets you find fellow NIT Jamshedpur graduates by batch year, engineering branch, employer (e.g. Google, Tata Steel, Microsoft), or geographic location. You can view public career profiles and send direct messages.',
  },
  {
    q: 'Can alumni post jobs and internship opportunities?',
    a: 'Yes! Verified alumni can post job openings and internship listings under the Job Board to hire talented students and fellow alumni directly from their alma mater.',
  },
  {
    q: 'How is my personal privacy protected?',
    a: 'Your phone number and email address are never displayed publicly without your explicit consent. Other verified members can only communicate through on-platform messaging.',
  },
  {
    q: 'How do I organize or RSVP for a batch reunion?',
    a: 'Navigate to the Events page to view upcoming regional and campus reunions. You can RSVP with a single click, view fellow attendees, or submit your own regional meetup proposal to the alumni cell.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <div style={{ padding: '64px 24px 96px', maxWidth: 880, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="badge badge-accent" style={{ marginBottom: 12 }}>
          Help & Answers
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(28px, 4.5vw, 40px)',
            fontWeight: 800,
            color: 'var(--color-text)',
            marginBottom: 10,
          }}
        >
          Frequently Asked Questions
        </h1>
        <p
          style={{
            fontSize: 15,
            color: 'var(--color-text-secondary)',
            maxWidth: 520,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Everything you need to know about registration, directory usage, profile privacy, and community features.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {faqData.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={item.q}
              className="card"
              style={{
                transition: 'all 0.2s ease',
                borderColor: isOpen ? 'var(--color-accent)' : 'var(--color-border)',
                boxShadow: isOpen ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(index)}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-body)',
                }}
                aria-expanded={isOpen}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    color: isOpen ? 'var(--color-accent)' : 'var(--color-text)',
                  }}
                >
                  {item.q}
                </span>
                <LuChevronDown
                  size={18}
                  strokeWidth={2}
                  style={{
                    flexShrink: 0,
                    color: isOpen ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease, color 0.2s ease',
                  }}
                />
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: '0 20px 20px',
                    fontSize: 14.5,
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.65,
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: 16,
                  }}
                >
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQ;
