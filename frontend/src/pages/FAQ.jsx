import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

/* ── colour tokens ───────────────────────────────────────────────────────── */
const C = {
    blue:       'var(--blue)',
    blueDark:   'var(--blue-dark)',
    blueLight:  'var(--blue-light)',
    blueFaint:  'var(--blue-faint)',
    blueBorder: 'var(--blue-border)',
    white:      'var(--text-primary)',
    muted:      'var(--text-secondary)',
    black:      'var(--bg)',
    darkBg:     'var(--bg)',
    darkCard:   'var(--bg-secondary)',
    darkBorder: 'var(--border)',
};

/* ── font injection ──────────────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('faq-fonts')) {
    const l = document.createElement('link');
    l.id = 'faq-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700;800&display=swap';
    document.head.appendChild(l);
}

const flatFaqData = [
    { q: 'What is the NIT Jamshedpur Alumni Portal?', a: 'The NIT Jamshedpur Alumni Portal is the official platform for alumni of National Institute of Technology, Jamshedpur. It helps graduates stay connected, discover opportunities, attend events, and give back to the institute.' },
    { q: 'Who can register on the portal?', a: 'Any graduate, postgraduate, or doctoral alumnus of NIT Jamshedpur (formerly RIT Jamshedpur) can register. Current students and faculty with admin approval can also access certain features.' },
    { q: 'Is there a fee to use the portal?', a: 'No, the alumni portal is completely free to use. Simply register with your email and start connecting with fellow alumni.' },
    { q: 'How do I create an account?', a: 'Click the "Sign Up" button on the homepage, fill in your details including name, email, graduation year, and department, then set a password. Your account will be created instantly.' },
    { q: 'How do I update my profile information?', a: 'After logging in, go to your Dashboard and click "View Full Profile". From there you can edit your bio, current position, company, location, skills, and contact details.' },
    { q: 'I forgot my password. What should I do?', a: "Click \"Forgot password?\" on the login page. Enter your registered email and we'll send you a password reset link. The link is valid for 10 minutes." },
    { q: 'How does the Alumni Directory work?', a: 'The Alumni Directory lets you search for fellow NIT Jamshedpur graduates by name, department, batch, company, or skills. Click on any profile card to view their full profile and connect.' },
    { q: 'Can I post a job on the Job Board?', a: 'Yes! Once logged in, visit the Jobs page and click "Post Job". Fill in the job details including title, company, location, type, and description. Your posting will be visible to all alumni.' },
    { q: 'How do I RSVP to an event?', a: "Navigate to the Events page, find the event you're interested in, and click the \"RSVP Now\" button. You'll be added to the attendees list and can view other attendees." },
    { q: 'Can I share my success story?', a: 'Absolutely! Go to the News & Stories page and click "Share Story". Write your story with a title, summary, and full content. You can also add tags to categorize it.' },
    { q: 'Is my personal information safe?', a: 'Yes. We use industry-standard encryption for passwords and secure communication. Your personal data is only visible to registered alumni members and is never shared with third parties.' },
    { q: 'Can I control what information is visible on my profile?', a: 'Yes, you can choose what details to share on your profile. Only your name and department are required — all other fields like phone, location, and bio are optional.' },
];

/* ── accordion item ──────────────────────────────────────────────────────── */
const FAQItem = ({ item, index, isOpen, onToggle }) => (
    <div
        style={{
            background: isOpen ? C.darkCard : 'transparent',
            border: `1px solid ${isOpen ? C.blueBorder : C.darkBorder}`,
            borderRadius: 12,
            overflow: 'hidden',
            transition: 'border-color 0.25s, background 0.25s',
            boxShadow: isOpen ? `0 4px 24px rgba(32,54,113,0.18)` : 'none',
        }}
    >
        <button
            onClick={onToggle}
            style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: 16, padding: '18px 22px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontFamily: "'DM Sans', sans-serif",
            }}
        >
            {/* number badge */}
            <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: isOpen
                    ? `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`
                    : C.blueFaint,
                border: `1px solid ${isOpen ? 'transparent' : C.blueBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.25s, border 0.25s',
            }}>
                <span style={{
                    fontSize: 11, fontWeight: 800,
                    color: isOpen ? C.white : C.blueLight,
                    fontFamily: "'Sora', sans-serif",
                    transition: 'color 0.25s'
                }}>
                    {String(index + 1).padStart(2, '0')}
                </span>
            </div>

            {/* question */}
            <span style={{
                flex: 1, fontSize: 14.5, fontWeight: 600,
                color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                lineHeight: 1.45, transition: 'color 0.25s'
            }}>
                {item.q}
            </span>

            {/* chevron */}
            <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: isOpen ? C.blueFaint : 'transparent',
                border: `1px solid ${isOpen ? C.blueBorder : C.darkBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s',
            }}>
                <FaChevronDown style={{
                    color: isOpen ? C.blueLight : C.muted,
                    fontSize: 11,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s, color 0.25s',
                }} />
            </div>
        </button>

        {/* answer */}
        <div style={{
            maxHeight: isOpen ? 300 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.35s ease',
        }}>
            <div style={{
                padding: '0 22px 20px 68px',
                borderTop: `1px solid ${C.darkBorder}`,
                paddingTop: 16,
            }}>
                <p style={{
                    fontSize: 13.5, color: C.muted,
                    lineHeight: 1.75, margin: 0,
                    fontFamily: "'DM Sans', sans-serif"
                }}>
                    {item.a}
                </p>
            </div>
        </div>
    </div>
);

/* ── main ────────────────────────────────────────────────────────────────── */
const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = i => setOpenIndex(openIndex === i ? null : i);

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg)',
            padding: '56px 20px 72px', fontFamily: "'DM Sans', sans-serif",
            color: 'var(--text-primary)', transition: 'background 0.3s, color 0.3s'
        }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>

                {/* ── HEADING ── */}
                <div style={{ textAlign: 'center', marginBottom: 52 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: C.blueFaint, border: `1px solid ${C.blueBorder}`,
                        borderRadius: 20, padding: '5px 14px', marginBottom: 20
                    }}>
                        <HiSparkles style={{ color: C.blueLight, fontSize: 13 }} />
                        <span style={{
                            fontSize: 11, fontWeight: 700, color: C.blueLight,
                            letterSpacing: '0.12em', textTransform: 'uppercase'
                        }}>
                            Help Centre
                        </span>
                    </div>

                    <h1 style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 42, fontWeight: 800, margin: '0 0 14px',
                        color: 'var(--text-primary)', letterSpacing: '-0.8px', lineHeight: 1.15
                    }}>
                        Frequently Asked{' '}
                        <span style={{
                            background: `linear-gradient(135deg, ${C.blueLight}, #6B8FE8)`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>Questions</span>
                    </h1>
                    <p style={{ fontSize: 15, color: C.muted, margin: 0, lineHeight: 1.6 }}>
                        Everything you need to know about the NIT Jamshedpur Alumni Portal.
                    </p>

                    {/* stat pills */}
                    <div style={{
                        display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24,
                        flexWrap: 'wrap'
                    }}>
                        {[
                            { label: `${flatFaqData.length} Questions`, },
                            { label: 'Updated 2025' },
                            { label: 'Free to Use' },
                        ].map(({ label }) => (
                            <div key={label} style={{
                                background: C.darkCard,
                                border: `1px solid ${C.darkBorder}`,
                                borderRadius: 20, padding: '5px 14px',
                                fontSize: 11.5, color: C.muted, fontWeight: 500
                            }}>{label}</div>
                        ))}
                    </div>
                </div>

                {/* ── FAQ LIST ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {flatFaqData.map((item, i) => (
                        <FAQItem
                            key={i}
                            item={item}
                            index={i}
                            isOpen={openIndex === i}
                            onToggle={() => toggle(i)}
                        />
                    ))}
                </div>

                {/* ── FOOTER CTA ── */}
                <div style={{
                    marginTop: 48, textAlign: 'center',
                    padding: '32px', borderRadius: 16,
                    background: C.darkCard,
                    border: `1px solid ${C.darkBorder}`,
                }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: C.blue, margin: '0 auto 14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 16px rgba(32,54,113,0.5)`
                    }}>
                        <HiSparkles style={{ color: C.white, fontSize: 18 }} />
                    </div>
                    <p style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 17, fontWeight: 700, color: C.white, margin: '0 0 8px'
                    }}>Still have questions?</p>
                    <p style={{ fontSize: 13, color: C.muted, margin: '0 0 20px' }}>
                        Can't find the answer you're looking for? Reach out to our support team.
                    </p>
                    <a
                        href="/contact"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: `linear-gradient(135deg, ${C.blueLight} 0%, ${C.blue} 100%)`,
                            border: 'none', borderRadius: 9, padding: '11px 28px',
                            color: '#FFFFFF', fontSize: 13, fontWeight: 700,
                            letterSpacing: '0.05em', cursor: 'pointer',
                            textDecoration: 'none',
                            boxShadow: `0 4px 20px rgba(32,54,113,0.45)`,
                            fontFamily: "'DM Sans', sans-serif"
                        }}
                    >
                        Contact Support →
                    </a>
                </div>

            </div>
        </div>
    );
};

export default FAQ;