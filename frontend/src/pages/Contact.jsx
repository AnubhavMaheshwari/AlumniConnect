import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaEnvelope, FaPhone, FaUser, FaTag, FaCommentDots } from 'react-icons/fa';
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
    errorRed:   '#FF4D4D',
    errorFaint: 'rgba(255,77,77,0.1)',
};

/* ── font injection ──────────────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('contact-fonts')) {
    const l = document.createElement('link');
    l.id = 'contact-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@600;700;800&display=swap';
    document.head.appendChild(l);
}

/* ── field component ─────────────────────────────────────────────────────── */
const Field = ({ label, icon: Icon, error, children }) => (
    <div>
        <label style={{
            display: 'block', marginBottom: 7,
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: C.muted
        }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <Icon style={{
                position: 'absolute', left: 14, top: 13,
                color: error ? C.errorRed : C.muted,
                fontSize: 13, pointerEvents: 'none',
                transition: 'color 0.2s'
            }} />
            {children}
        </div>
        {error && (
            <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginTop: 6, padding: '5px 10px', borderRadius: 6,
                background: C.errorFaint, border: `1px solid rgba(255,77,77,0.2)`
            }}>
                <span style={{ fontSize: 11, color: C.errorRed }}>{error}</span>
            </div>
        )}
    </div>
);

const inputStyle = (error) => ({
    width: '100%', background: 'var(--input-bg)',
    border: `1px solid ${error ? C.errorRed : 'var(--border)'}`,
    borderRadius: 9, padding: '11px 14px 11px 40px',
    color: 'var(--text-primary)', fontSize: 13.5, outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    boxShadow: error ? `0 0 0 3px ${C.errorFaint}` : 'none'
});

/* ── main ────────────────────────────────────────────────────────────────── */
const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone  = phone => /^[0-9]{10}$/.test(phone.replace(/\D/g, ''));

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
        if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.name.trim())                          newErrors.name    = 'Name is required';
        if (!formData.email.trim())                         newErrors.email   = 'Email is required';
        else if (!validateEmail(formData.email))            newErrors.email   = 'Please enter a valid email address';
        if (!formData.phone.trim())                         newErrors.phone   = 'Mobile number is required';
        else if (!validatePhone(formData.phone))            newErrors.phone   = 'Please enter a valid 10-digit number';
        if (!formData.subject.trim())                       newErrors.subject = 'Subject is required';
        if (!formData.message.trim())                       newErrors.message = 'Message is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            toast.success("Message sent! We'll get back to you soon.");
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            setErrors({});
            setLoading(false);
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 4000);
        }, 1500);
    };

    const focusInput  = e => {
        e.target.style.borderColor = C.blueLight;
        e.target.style.boxShadow   = `0 0 0 3px ${C.blueFaint}`;
    };
    const blurInput = (e, hasError) => {
        e.target.style.borderColor = hasError ? C.errorRed : C.darkBorder;
        e.target.style.boxShadow   = hasError ? `0 0 0 3px ${C.errorFaint}` : 'none';
    };

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg)',
            padding: '56px 20px', fontFamily: "'DM Sans', sans-serif",
            color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.3s, color 0.3s'
        }}>
            <div style={{ width: '100%', maxWidth: 620 }}>

                {/* ── HEADING ── */}
                <div style={{ textAlign: 'center', marginBottom: 44 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: C.blueFaint, border: `1px solid ${C.blueBorder}`,
                        borderRadius: 20, padding: '5px 14px', marginBottom: 18
                    }}>
                        <HiSparkles style={{ color: C.blueLight, fontSize: 13 }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.blueLight, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                            Alumni Cell · NIT Jamshedpur
                        </span>
                    </div>

                    <h1 style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 42, fontWeight: 800, margin: '0 0 14px',
                        color: 'var(--text-primary)', letterSpacing: '-0.8px', lineHeight: 1.15
                    }}>
                        Get In{' '}
                        <span style={{
                            background: `linear-gradient(135deg, ${C.blueLight}, #6B8FE8)`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>Touch</span>
                    </h1>
                    <p style={{ fontSize: 15, color: C.muted, margin: 0, lineHeight: 1.6 }}>
                        Have a question or suggestion?<br />Reach out to the NIT Jamshedpur Alumni Cell.
                    </p>
                </div>

                {/* ── CARD ── */}
                <div style={{
                    border: `1px solid var(--border)`,
                    borderRadius: 20, overflow: 'hidden',
                    boxShadow: '0 32px 80px var(--card-shadow)',
                    transition: 'background 0.3s, border-color 0.3s'
                }}>

                    {/* card header strip */}
                    <div style={{
                        background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
                        padding: '22px 32px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute', right: -20, top: -20,
                            width: 120, height: 120, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)'
                        }} />
                        <div style={{
                            width: 40, height: 40, borderRadius: 11,
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <FaEnvelope style={{ color: '#FFFFFF', fontSize: 16 }} />
                        </div>
                        <div>
                            <p style={{
                                fontFamily: "'Sora', sans-serif",
                                fontSize: 16, fontWeight: 700, color: '#FFFFFF', margin: 0
                            }}>Send a Message</p>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '2px 0 0' }}>
                                We'll respond within 24 hours
                            </p>
                        </div>
                    </div>

                    {/* form body */}
                    <div style={{ padding: '32px' }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                                {/* Name + Email row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                                    <Field label="Your Name" icon={FaUser} error={errors.name}>
                                        <input
                                            type="text" name="name" value={formData.name}
                                            onChange={handleChange} placeholder="John Doe"
                                            style={inputStyle(errors.name)}
                                            onFocus={focusInput}
                                            onBlur={e => blurInput(e, !!errors.name)}
                                        />
                                    </Field>
                                    <Field label="Email Address" icon={FaEnvelope} error={errors.email}>
                                        <input
                                            type="email" name="email" value={formData.email}
                                            onChange={handleChange} placeholder="you@example.com"
                                            style={inputStyle(errors.email)}
                                            onFocus={focusInput}
                                            onBlur={e => blurInput(e, !!errors.email)}
                                        />
                                    </Field>
                                </div>

                                {/* Phone + Subject row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                                    <Field label="Mobile Number" icon={FaPhone} error={errors.phone}>
                                        <input
                                            type="tel" name="phone" value={formData.phone}
                                            onChange={handleChange} placeholder="+91 98765 43210"
                                            style={inputStyle(errors.phone)}
                                            onFocus={focusInput}
                                            onBlur={e => blurInput(e, !!errors.phone)}
                                        />
                                    </Field>
                                    <Field label="Subject" icon={FaTag} error={errors.subject}>
                                        <input
                                            type="text" name="subject" value={formData.subject}
                                            onChange={handleChange} placeholder="How can we help?"
                                            style={inputStyle(errors.subject)}
                                            onFocus={focusInput}
                                            onBlur={e => blurInput(e, !!errors.subject)}
                                        />
                                    </Field>
                                </div>

                                {/* Message */}
                                <Field label="Message" icon={FaCommentDots} error={errors.message}>
                                    <textarea
                                        name="message" value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Tell us what's on your mind..."
                                        rows={5}
                                        style={{
                                            ...inputStyle(errors.message),
                                            padding: '11px 14px 11px 40px',
                                            resize: 'vertical', lineHeight: 1.6
                                        }}
                                        onFocus={focusInput}
                                        onBlur={e => blurInput(e, !!errors.message)}
                                    />
                                </Field>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%', marginTop: 4,
                                        background: submitted
                                            ? 'linear-gradient(135deg, #1a6e3a 0%, #145c30 100%)'
                                            : `linear-gradient(135deg, ${C.blueLight} 0%, ${C.blue} 100%)`,
                                        border: 'none', borderRadius: 10, padding: '13px 0',
                                        color: '#FFFFFF', fontSize: 14, fontWeight: 700,
                                        letterSpacing: '0.06em', cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                                        fontFamily: "'DM Sans', sans-serif",
                                        boxShadow: `0 4px 24px rgba(32,54,113,0.45)`,
                                        transition: 'opacity 0.2s, background 0.4s',
                                        opacity: loading ? 0.8 : 1
                                    }}
                                    onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85'; }}
                                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                >
                                    {loading ? (
                                        <div style={{
                                            width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                                            borderTopColor: C.white, borderRadius: '50%',
                                            animation: 'spin 0.7s linear infinite'
                                        }} />
                                    ) : submitted ? (
                                        <>✓ Message Sent!</>
                                    ) : (
                                        <>Send Message <FaPaperPlane style={{ fontSize: 13 }} /></>
                                    )}
                                </button>

                            </div>
                        </form>
                    </div>

                    {/* footer strip */}
                    <div style={{
                        padding: '14px 32px',
                        borderTop: `1px solid ${C.darkBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: C.blueLight
                        }} />
                        <span style={{ fontSize: 11, color: C.muted }}>
                            Your message is sent directly to the Alumni Cell team
                        </span>
                    </div>
                </div>
            </div>

            {/* spin keyframe */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Contact;