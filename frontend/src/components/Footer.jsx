import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaArrowUp, FaClock, FaUtensils, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Catering', path: '/catering' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const services = [
    'Wedding Catering',
    'Corporate Events',
    'Private Parties',
    'Daily Meal Plans',
    'Custom Menu Design'
  ];

  const socialLinks = [
    { icon: FaFacebookF, href: '#', color: '#1877f2' },
    { icon: FaTwitter, href: '#', color: '#1da1f2' },
    { icon: FaInstagram, href: '#', color: '#e4405f' }
  ];

  return (
    <>
      <style>{styles}</style>
      
      <footer className="premium-footer">
        {/* Decorative Top Border */}
        <div className="footer-border-top">
          <div className="footer-border-line"></div>
          <div className="footer-border-glow"></div>
        </div>

        {/* Main Footer Content */}
        <div className="footer-main">
          <div className="footer-container">
            <div className="footer-grid">
              
              {/* Brand Column */}
              <div className="footer-col footer-brand-col">
                <div className="footer-logo">
                  <span className="footer-logo-icon">🍽️</span>
                  <h3 className="footer-logo-text">Mutindo <span>Catering</span></h3>
                </div>
                <p className="footer-description">
                  Delicious meals delivered to your doorstep. Quality catering for all occasions, 
                  bringing culinary excellence to every event across Uganda.
                </p>
                <div className="footer-social">
                  {socialLinks.map((social, idx) => {
                    const Icon = social.icon;
                    return (
                      <a 
                        key={idx} 
                        href={social.href} 
                        className="footer-social-link"
                        style={{ '--hover-color': social.color }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon size={16} />
                      </a>
                    );
                  })}
                </div>
                <div className="footer-trust-badge">
                  <FaHeart size={12} />
                  <span>Trusted by 1000+ happy clients</span>
                </div>
              </div>

              {/* Quick Links Column */}
              <div className="footer-col">
                <h4 className="footer-col-title">Quick Links</h4>
                <ul className="footer-links">
                  {quickLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link to={link.path} className="footer-link">
                        <span className="footer-link-dot"></span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services Column */}
              <div className="footer-col">
                <h4 className="footer-col-title">Our Services</h4>
                <ul className="footer-links">
                  {services.map((service, idx) => (
                    <li key={idx}>
                      <span className="footer-link">
                        <span className="footer-link-dot"></span>
                        {service}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Column - Updated with your phone number */}
              <div className="footer-col">
                <h4 className="footer-col-title">Contact Info</h4>
                <ul className="footer-contact">
                  <li>
                    <div className="footer-contact-icon">
                      <FaMapMarkerAlt size={14} />
                    </div>
                    <div className="footer-contact-text">
                      <strong>Visit Us</strong>
                      <span>Kampala, Uganda</span>
                    </div>
                  </li>
                  <li>
                    <div className="footer-contact-icon">
                      <FaPhone size={14} />
                    </div>
                    <div className="footer-contact-text">
                      <strong>Call Us</strong>
                      <span>+256 707 097 503</span>
                    </div>
                  </li>
                  <li>
                    <div className="footer-contact-icon">
                      <FaEnvelope size={14} />
                    </div>
                    <div className="footer-contact-text">
                      <strong>Email Us</strong>
                      <span>info@mutindocatering.com</span>
                    </div>
                  </li>
                  <li>
                    <div className="footer-contact-icon">
                      <FaClock size={14} />
                    </div>
                    <div className="footer-contact-text">
                      <strong>Working Hours</strong>
                      <span>Mon-Sat: 8am - 8pm</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Newsletter Section REMOVED */}
        <div className="footer-bottom">
          <div className="footer-container">
            <div className="footer-bottom-content">
              <p className="footer-copyright">
                © {currentYear} Mutindo Catering Services. All rights reserved. 
                <span className="footer-copyright-separator">|</span>
                <a href="#" className="footer-bottom-link">Privacy Policy</a>
                <span className="footer-copyright-separator">|</span>
                <a href="#" className="footer-bottom-link">Terms of Service</a>
              </p>
              <div className="footer-payment-methods">
                <span>Secure Payments</span>
                <span>🔒</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button className="footer-scroll-top" onClick={scrollToTop}>
            <FaArrowUp size={16} />
          </button>
        )}
      </footer>
    </>
  );
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .premium-footer {
    background: linear-gradient(180deg, #0a0a0a 0%, #050505 100%);
    position: relative;
    margin-top: auto;
  }

  /* Top Border Animation */
  .footer-border-top {
    position: relative;
    height: 2px;
    overflow: hidden;
  }
  .footer-border-line {
    height: 1px;
    background: linear-gradient(90deg, transparent, #FF6B35, #00C9A7, #FFD700, transparent);
    width: 100%;
    animation: borderGlow 3s ease-in-out infinite;
  }
  .footer-border-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: radial-gradient(circle, rgba(255,107,53,0.5) 0%, transparent 80%);
    filter: blur(2px);
  }

  /* Main Footer */
  .footer-main {
    padding: 60px 0 40px;
  }

  .footer-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 6vw;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
    gap: 40px;
  }

  @media (max-width: 1024px) {
    .footer-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 40px;
    }
  }

  @media (max-width: 768px) {
    .footer-grid {
      grid-template-columns: 1fr;
      gap: 32px;
    }
  }

  /* Brand Column */
  .footer-brand-col {
    max-width: 320px;
  }

  .footer-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .footer-logo-icon {
    font-size: 2rem;
    animation: subtlePulse 2s ease-in-out infinite;
  }

  .footer-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 900;
    color: #f0ece4;
    margin: 0;
  }

  .footer-logo-text span {
    color: #FF6B35;
  }

  .footer-description {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 300;
    color: rgba(240,236,228,0.6);
    line-height: 1.7;
    margin-bottom: 24px;
  }

  /* Social Links */
  .footer-social {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .footer-social-link {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 3px;
    color: rgba(240,236,228,0.6);
    transition: all 0.3s ease;
  }

  .footer-social-link:hover {
    background: var(--hover-color);
    border-color: var(--hover-color);
    color: #fff;
    transform: translateY(-3px);
  }

  .footer-trust-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    color: rgba(240,236,228,0.5);
    padding: 8px 12px;
    background: rgba(255,107,53,0.08);
    border-radius: 3px;
    width: fit-content;
  }

  .footer-trust-badge svg {
    color: #FF6B35;
  }

  /* Column Titles */
  .footer-col-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #f0ece4;
    margin-bottom: 20px;
    position: relative;
    padding-bottom: 12px;
  }

  .footer-col-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 30px;
    height: 2px;
    background: #FF6B35;
  }

  /* Links Lists */
  .footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .footer-links li {
    margin-bottom: 12px;
  }

  .footer-link {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 300;
    color: rgba(240,236,228,0.6);
    text-decoration: none;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .footer-link:hover {
    color: #FF6B35;
    transform: translateX(5px);
  }

  .footer-link-dot {
    width: 4px;
    height: 4px;
    background: #FF6B35;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .footer-link:hover .footer-link-dot {
    width: 8px;
    height: 8px;
    background: #FF6B35;
  }

  /* Contact List */
  .footer-contact {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .footer-contact li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 20px;
  }

  .footer-contact-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,107,53,0.1);
    border-radius: 3px;
    color: #FF6B35;
    flex-shrink: 0;
  }

  .footer-contact-text {
    flex: 1;
  }

  .footer-contact-text strong {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(240,236,228,0.7);
    margin-bottom: 4px;
    letter-spacing: 0.5px;
  }

  .footer-contact-text span {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 300;
    color: rgba(240,236,228,0.5);
  }

  /* Bottom Bar */
  .footer-bottom {
    padding: 24px 0;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .footer-bottom-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  .footer-copyright {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 300;
    color: rgba(240,236,228,0.4);
    margin: 0;
  }

  .footer-copyright-separator {
    margin: 0 12px;
    color: rgba(240,236,228,0.2);
  }

  .footer-bottom-link {
    color: rgba(240,236,228,0.4);
    text-decoration: none;
    transition: color 0.3s;
  }

  .footer-bottom-link:hover {
    color: #FF6B35;
  }

  .footer-payment-methods {
    display: flex;
    gap: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 300;
    color: rgba(240,236,228,0.4);
  }

  @media (max-width: 768px) {
    .footer-bottom-content {
      flex-direction: column;
      text-align: center;
    }
    .footer-copyright {
      line-height: 1.8;
    }
  }

  /* Scroll to Top Button */
  .footer-scroll-top {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 44px;
    height: 44px;
    border-radius: 3px;
    background: #FF6B35;
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(255,107,53,0.3);
  }

  .footer-scroll-top:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(255,107,53,0.4);
  }

  /* Animations */
  @keyframes borderGlow {
    0%, 100% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(100%);
    }
  }

  @keyframes subtlePulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  /* Responsive Adjustments */
  @media (max-width: 480px) {
    .footer-main {
      padding: 40px 0 30px;
    }
    .footer-col-title::after {
      width: 40px;
    }
  }
`;

export default Footer;