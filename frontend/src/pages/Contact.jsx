import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  LuSend,
  LuMail,
  LuPhone,
  LuUser,
  LuMessageSquare,
  LuMapPin,
  LuClock,
} from 'react-icons/lu';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success('Your message has been sent. We will get back to you shortly!');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{ padding: '64px 24px 96px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="badge badge-accent" style={{ marginBottom: 12 }}>
          Help & Inquiries
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
          Contact the Alumni Relations Cell
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
          Have questions regarding transcripts, reunion organizing, mentorship, or portal accounts? Reach out to our campus office.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32,
          alignItems: 'start',
        }}
      >
        {/* Contact Info Card */}
        <div
          className="card"
          style={{
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            background: 'var(--color-surface)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--color-text)',
            }}
          >
            Office Information
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-panel)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--color-accent)',
                }}
              >
                <LuMapPin size={18} strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                  Campus Address
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', marginTop: 2, lineHeight: 1.5 }}>
                  Alumni Relations Office, Administrative Block,<br />
                  NIT Jamshedpur, Adityapur, Jharkhand 831014
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-panel)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--color-accent)',
                }}
              >
                <LuMail size={18} strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                  Email Support
                </div>
                <a
                  href="mailto:alumni@nitjsr.ac.in"
                  style={{
                    fontSize: 13.5,
                    color: 'var(--color-accent)',
                    display: 'block',
                    marginTop: 2,
                  }}
                >
                  alumni@nitjsr.ac.in
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-panel)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--color-accent)',
                }}
              >
                <LuPhone size={18} strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                  Helpline
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  +91 8303607708
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-panel)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--color-accent)',
                }}
              >
                <LuClock size={18} strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                  Office Working Hours
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  Monday &ndash; Friday: 9:30 AM &ndash; 5:30 PM IST
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="card"
          style={{
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 4,
            }}
          >
            Send a Direct Message
          </h2>

          <Input
            label="Your Full Name"
            name="name"
            icon={LuUser}
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Rahul Singh"
            required
          />

          <Input
            label="Your Email Address"
            name="email"
            type="email"
            icon={LuMail}
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <div className="input-group">
            <label className="input-label">Inquiry Subject</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select Topic</option>
              <option value="General Query">General Query</option>
              <option value="Account / Login Issue">Account / Login Issue</option>
              <option value="Transcript / Document Verification">
                Transcript / Document Verification
              </option>
              <option value="Reunion & Events">Reunion & Events Coordination</option>
              <option value="Job Board / Hiring">Job Board / Student Hiring</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Message Content</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="How can the alumni office assist you?"
              className="input-field"
              rows={4}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Send Message <LuSend size={15} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
