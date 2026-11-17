import { Link } from 'react-router-dom';
import {
  LuMapPin,
  LuMail,
  LuPhone,
  LuGlobe,
} from 'react-icons/lu';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-grid">
        {/* Brand & Info */}
        <div className="footer-brand">
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--color-navy)',
              marginBottom: 12,
              letterSpacing: '-0.3px',
            }}
          >
            Alumni Connect
          </div>
          <p
            style={{
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
              marginBottom: 20,
              maxWidth: 320,
            }}
          >
            The official professional networking platform for National Institute of
            Technology Jamshedpur alumni and students.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 13,
                color: 'var(--color-text-secondary)',
              }}
            >
              <LuMapPin size={16} strokeWidth={1.5} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              Adityapur, Jamshedpur, Jharkhand 831014
            </div>
            <a
              href="mailto:alumni@nitjsr.ac.in"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 13,
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
              }}
            >
              <LuMail size={16} strokeWidth={1.5} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              alumni@nitjsr.ac.in
            </a>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 13,
                color: 'var(--color-text-secondary)',
              }}
            >
              <LuPhone size={16} strokeWidth={1.5} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              +91 8303607708
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <div className="footer-col-title">Quick Links</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/directory" className="footer-link">Alumni Directory</Link>
            <Link to="/events" className="footer-link">Events & Reunions</Link>
            <Link to="/news" className="footer-link">News & Stories</Link>
          </div>
        </div>

        {/* Platform */}
        <div>
          <div className="footer-col-title">Platform</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/jobs" className="footer-link">Job Board</Link>
            <Link to="/mentorship" className="footer-link">Mentorship</Link>
            <Link to="/membership" className="footer-link">Membership Plans</Link>
            <Link to="/register" className="footer-link">Join Network</Link>
          </div>
        </div>

        {/* Support */}
        <div>
          <div className="footer-col-title">Support</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/faq" className="footer-link">Frequently Asked Questions</Link>
            <Link to="/contact" className="footer-link">Contact Support</Link>
            <Link to="/login" className="footer-link">Sign In</Link>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          &copy; {new Date().getFullYear()} National Institute of Technology Jamshedpur. All rights reserved.
        </p>

        <div className="footer-socials">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="footer-social"
          >
            <FaLinkedin size={16} />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="footer-social"
          >
            <FaGithub size={16} />
          </a>
          <a
            href="mailto:alumni@nitjsr.ac.in"
            aria-label="Email"
            className="footer-social"
          >
            <LuMail size={16} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
