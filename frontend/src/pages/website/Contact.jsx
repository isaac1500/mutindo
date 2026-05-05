import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

/* ─── Public folder images (your WhatsApp images) ─────────────────────── */
const HERO_BG = '/tricia.jpeg';
const SIDEBAR_IMG = '/liz.jpeg';

/* ─── WhatsApp Configuration ──────────────────────────────────── */
const WHATSAPP_NUMBER = "256707097503"; // Your WhatsApp number (without +)

/* ─── Inline SVG icons ──────────────────────────────────── */
const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);
const MailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const PinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);
const MapDotIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

/* ════════════════════════════════════════════════════════════
   CONTACT COMPONENT
════════════════════════════════════════════════════════════ */
const Contact = () => {
  const [formData, setFormData] = useState({ name:'', email:'', subject:'', message:'' });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [visible, setVisible]   = useState({});

  const handleChange = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    
    // Build WhatsApp message
    const messageText = `*NEW CONTACT FORM MESSAGE*\n\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Subject:* ${formData.subject}\n*Message:* ${formData.message}\n\n_Sent from Mutindo Catering Website_`;
    const encodedMessage = encodeURIComponent(messageText);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    // Show success message
    setSuccess(true);
    setFormData({ name:'', email:'', subject:'', message:'' });
    toast.success("Message opened in WhatsApp! Press send to complete.");
    
    setTimeout(() => setSuccess(false), 5000);
    setLoading(false);
  };

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.dataset.reveal]: true }));
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const INFO_CARDS = [
    {
      icon: <PhoneIcon />,
      title: 'Call Us',
      primary: '+256 707 097 503',
      secondary: 'Mon – Sat · 8 am – 8 pm',
      accent: '#C9A96E',
    },
    {
      icon: <MailIcon />,
      title: 'Email Us',
      primary: 'info@mutindocatering.com',
      secondary: 'support@mutindocatering.com',
      accent: '#FF6B35',
    },
    {
      icon: <PinIcon />,
      title: 'Visit Us',
      primary: 'Kampala, Uganda',
      secondary: 'We deliver nationwide',
      accent: '#C9A96E',
    },
  ];

  const HOURS = [
    { day: 'Monday – Friday', time: '8:00 AM – 10:00 PM' },
    { day: 'Saturday',        time: '9:00 AM – 11:00 PM' },
    { day: 'Sunday',          time: '10:00 AM – 8:00 PM' },
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section className="co-hero">
        <div className="co-hero-photo" style={{ backgroundImage:`url(${HERO_BG})` }} />
        <div className="co-hero-veil" />
        <div className="co-hero-bottom-rule" />

        <div className="co-hero-inner">
          <div className="co-hero-left">
            <p className="co-eyebrow">
              <span className="co-eyebrow-line" />
              Get In Touch
            </p>
            <h1 className="co-hero-h1">
              Let's Create<br />
              <em>Something Amazing</em>
            </h1>
            <p className="co-hero-body">
              Have a question about our catering services? Need a custom quote?
              We're here to make your next event truly unforgettable.
            </p>
            <div className="co-hero-cta-row">
              <a href="#contact-form" className="co-btn-gold">
                Send a Message <ArrowIcon />
              </a>
              <a href="tel:+256707097503" className="co-btn-outline">
                Call Us Now
              </a>
            </div>
          </div>

          <div className="co-hero-meta-col">
            {[
              { num:'24/7', label:'Support Available' },
              { num:'1h',   label:'Response Time' },
              { num:'100%', label:'Client Satisfaction' },
            ].map((s, i) => (
              <div key={i} className="co-hero-stat">
                <span className="co-hero-stat-num">{s.num}</span>
                <span className="co-hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="co-hero-scroll">
          <span>Scroll</span>
          <div className="co-scroll-line" />
        </div>
      </section>

      {/* ══ MARQUEE STRIP ════════════════════════════════ */}
      <div className="co-strip">
        {['Phone Support','Email Support','Fast Delivery','Kampala & Beyond','Fresh Daily'].map((t,i) => (
          <span key={i} className="co-strip-item">
            <span className="co-strip-dot" />{t}
          </span>
        ))}
      </div>

      {/* ══ INFO CARDS ═══════════════════════════════════ */}
      <section style={{ background:'#0a0a08' }}>
        <div className="co-wrap">

          <div
            data-reveal="cards-head"
            className={`co-section-head co-reveal ${visible['cards-head'] ? 'co-visible' : ''}`}
          >
            <p className="co-eyebrow co-eyebrow-center">Connect With Us</p>
            <h2 className="co-section-h2">Reach Out Anytime</h2>
            <div className="co-gold-rule" />
            <p className="co-section-body">
              We're always ready to answer your questions<br />
              and discuss your catering needs.
            </p>
          </div>

          <div className="co-cards">
            {INFO_CARDS.map((card, i) => (
              <div
                key={i}
                data-reveal={`card${i}`}
                className={`co-info-card co-reveal ${visible[`card${i}`] ? 'co-visible' : ''}`}
                style={{ transitionDelay:`${i * 90}ms` }}
              >
                <div className="co-info-card-icon" style={{ color: card.accent, borderColor: card.accent+'33' }}>
                  {card.icon}
                </div>
                <h3 className="co-info-card-title">{card.title}</h3>
                <p className="co-info-card-primary" style={{ color: card.accent }}>{card.primary}</p>
                <p className="co-info-card-secondary">{card.secondary}</p>
                <div className="co-info-card-bar" style={{ background: card.accent }} />
              </div>
            ))}
          </div>

          {/* ══ FORM + SIDEBAR ═════════════════════════ */}
          <div id="contact-form" className="co-main-row">

            {/* ── FORM ── */}
            <div
              data-reveal="form"
              className={`co-form-panel co-reveal ${visible.form ? 'co-visible' : ''}`}
            >
              <p className="co-eyebrow" style={{ color:'#C9A96E', marginBottom:8 }}>Direct Message</p>
              <h3 className="co-panel-title">Send Us a Message</h3>
              <p className="co-panel-sub">Fill the form and it will open on WhatsApp</p>

              {success && (
                <div className="co-success-bar">
                  <CheckIcon />
                  <span>Message prepared! Click Send on WhatsApp to complete.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="co-form">
                <div className="co-form-row">
                  <div className="co-field">
                    <label className="co-field-label">Your Name *</label>
                    <input
                      type="text" name="name" className="co-input"
                      value={formData.name} onChange={handleChange}
                      required placeholder="Aisha Nakato"
                    />
                  </div>
                  <div className="co-field">
                    <label className="co-field-label">Email Address *</label>
                    <input
                      type="email" name="email" className="co-input"
                      value={formData.email} onChange={handleChange}
                      required placeholder="hello@example.com"
                    />
                  </div>
                </div>
                <div className="co-field">
                  <label className="co-field-label">Subject *</label>
                  <input
                    type="text" name="subject" className="co-input"
                    value={formData.subject} onChange={handleChange}
                    required placeholder="Catering Inquiry for Wedding"
                  />
                </div>
                <div className="co-field">
                  <label className="co-field-label">Message *</label>
                  <textarea
                    rows={6} name="message" className="co-input co-textarea"
                    value={formData.message} onChange={handleChange}
                    required placeholder="Tell us about your event, guest count, preferences…"
                  />
                </div>
                <button type="submit" className="co-btn-gold co-btn-submit" disabled={loading}>
                  {loading ? (
                    <><span className="co-spin" /> Opening WhatsApp…</>
                  ) : (
                    <>Send via WhatsApp <ArrowIcon /></>
                  )}
                </button>
              </form>
            </div>

            {/* ── SIDEBAR ── */}
            <div
              data-reveal="sidebar"
              className={`co-sidebar co-reveal ${visible.sidebar ? 'co-visible' : ''}`}
            >
              {/* Sidebar food photo - using your WhatsApp image */}
              <div className="co-sidebar-photo-wrap">
                <img 
                  src={SIDEBAR_IMG} 
                  alt="Mutindo catering" 
                  className="co-sidebar-photo" 
                  onError={(e) => { 
                    console.error('Sidebar image failed to load:', SIDEBAR_IMG);
                    e.target.style.display = 'none'; 
                  }}
                />
                <div className="co-sidebar-photo-veil" />
                <div className="co-sidebar-photo-label">
                  <span>Fresh · Authentic · Delivered</span>
                </div>
              </div>

              {/* Hours */}
              <div className="co-sidebar-block">
                <h4 className="co-sidebar-title">Opening Hours</h4>
                <div className="co-hours">
                  {HOURS.map((h, i) => (
                    <div key={i} className="co-hours-row">
                      <div className="co-hours-day">
                        <span className="co-hours-clock"><ClockIcon /></span>
                        {h.day}
                      </div>
                      <span className="co-hours-time">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="co-sidebar-divider" />

              {/* Delivery */}
              <div className="co-sidebar-block">
                <h4 className="co-sidebar-title">Delivery Areas</h4>
                <div className="co-delivery-box">
                  <span style={{ color:'#FF6B35' }}><TruckIcon /></span>
                  <p>We deliver to all areas within Kampala and surrounding suburbs.</p>
                </div>
                <div className="co-pricing">
                  <div className="co-pricing-row">
                    <MapDotIcon />
                    <span>Minimum order: <strong>UGX 10,000</strong></span>
                  </div>
                  <div className="co-pricing-row">
                    <MapDotIcon />
                    <span>Free delivery above <strong>UGX 50,000</strong></span>
                  </div>
                </div>
              </div>

              <div className="co-sidebar-divider" />

              {/* Emergency */}
              <div className="co-emergency">
                <div className="co-emergency-left">
                  <div className="co-emergency-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.8">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                  </div>
                  <div>
                    <h5 className="co-emergency-title">Emergency Catering?</h5>
                    <p className="co-emergency-sub">Last-minute orders welcome</p>
                    <span className="co-emergency-phone">+256 707 097 503</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ MAP PLACEHOLDER ════════════════════════ */}
          <div
            data-reveal="map"
            className={`co-map co-reveal ${visible.map ? 'co-visible' : ''}`}
          >
            <div className="co-map-inner">
              <div className="co-map-text">
                <p className="co-eyebrow" style={{ color:'#C9A96E' }}>Our Location</p>
                <h3 className="co-map-title">Find Us in Kampala</h3>
                <p className="co-map-body">
                  Visit our headquarters for private consultations and food tastings.
                  Our team is ready to plan your perfect event.
                </p>
                <div className="co-map-tag">
                  <MapDotIcon />
                  Mutindo Catering, Kampala, Uganda
                </div>
              </div>
              <div className="co-map-grid">
                {[
                  '/liz.jpeg',
                  '/hero-image.jpeg',
                  '/tricia.jpeg',
                  '/WhatsApp Image 2026-04-27 at 11.34.05 PM.jpeg',
                ].map((src, i) => (
                  <div key={i} className="co-map-thumb">
                    <img src={src} alt="" loading="lazy" />
                    <div className="co-map-thumb-veil" />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

/* ════════════════════════════════════════════════════════════
   STYLES (same as before - omitted for brevity, but include from previous response)
════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Jost:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  :root {
    --gold:   #C9A96E;
    --orange: #FF6B35;
    --ink:    #0a0a08;
    --ink2:   #111110;
    --cream:  #f0ece4;
    --muted:  rgba(240,236,228,0.45);
    --border: rgba(201,169,110,0.15);
    --ff-d:   'Cormorant Garamond', serif;
    --ff-b:   'Jost', sans-serif;
  }

  .co-reveal  { opacity:0; transform:translateY(34px); transition:opacity .7s ease, transform .7s ease; }
  .co-visible { opacity:1; transform:translateY(0); }

  .co-hero {
    position:relative; height:100vh; min-height:620px;
    display:flex; align-items:center; overflow:hidden;
  }
  .co-hero-photo {
    position:absolute; inset:0;
    background-size:cover; background-position:center;
    transform:scale(1.06); transition:transform 10s ease;
  }
  .co-hero:hover .co-hero-photo { transform:scale(1); }
  .co-hero-veil {
    position:absolute; inset:0;
    background:linear-gradient(110deg,
      rgba(10,10,8,0.94) 0%,
      rgba(10,10,8,0.7) 55%,
      rgba(10,10,8,0.3) 100%);
  }
  .co-hero-bottom-rule {
    position:absolute; bottom:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg, transparent, var(--gold), transparent);
    opacity:.5;
  }
  .co-hero-inner {
    position:relative; z-index:2;
    width:100%; max-width:1280px; margin:0 auto;
    padding:0 7vw;
    display:flex; align-items:flex-end; justify-content:space-between;
    gap:40px; flex-wrap:wrap;
  }
  .co-hero-left { max-width:580px; }
  .co-eyebrow {
    font-family:var(--ff-b);
    font-size:11px; font-weight:500;
    letter-spacing:3.5px; text-transform:uppercase;
    color:var(--gold); display:flex; align-items:center; gap:10px;
    margin-bottom:18px;
  }
  .co-eyebrow-center { justify-content:center; }
  .co-eyebrow-line { width:28px; height:1px; background:var(--gold); display:inline-block; }
  .co-hero-h1 {
    font-family:var(--ff-d);
    font-size:clamp(3rem, 6vw, 5.4rem);
    font-weight:700; color:var(--cream); line-height:1.04;
    margin-bottom:22px;
  }
  .co-hero-h1 em { color:var(--gold); font-style:italic; }
  .co-hero-body {
    font-family:var(--ff-b); font-size:.97rem; font-weight:300;
    color:var(--muted); line-height:1.82; max-width:460px; margin-bottom:36px;
  }
  .co-hero-cta-row { display:flex; gap:14px; flex-wrap:wrap; }
  .co-hero-meta-col {
    display:flex; flex-direction:column; gap:26px;
    border-left:1px solid var(--border);
    padding-left:36px; padding-bottom:8px;
  }
  .co-hero-stat-num {
    display:block; font-family:var(--ff-d);
    font-size:2.4rem; font-weight:700; color:var(--gold); line-height:1;
  }
  .co-hero-stat-label {
    display:block; font-family:var(--ff-b);
    font-size:.67rem; letter-spacing:2px; text-transform:uppercase;
    color:rgba(240,236,228,0.32); margin-top:3px;
  }
  .co-hero-scroll {
    position:absolute; bottom:40px; left:7vw; z-index:2;
    display:flex; align-items:center; gap:12px;
    font-family:var(--ff-b); font-size:10px;
    letter-spacing:3px; text-transform:uppercase;
    color:rgba(240,236,228,0.28);
  }
  .co-scroll-line { width:48px; height:1px; background:rgba(240,236,228,0.22); }

  .co-strip {
    background:#0e0e0c;
    border-top:1px solid rgba(201,169,110,0.1);
    border-bottom:1px solid rgba(201,169,110,0.1);
    padding:15px 7vw;
    display:flex; gap:0; flex-wrap:wrap;
  }
  .co-strip-item {
    display:flex; align-items:center; gap:10px;
    font-family:var(--ff-b); font-size:.73rem;
    letter-spacing:2px; text-transform:uppercase;
    color:rgba(240,236,228,0.32);
    padding:0 28px; border-right:1px solid rgba(201,169,110,0.1);
  }
  .co-strip-item:last-child { border-right:none; }
  .co-strip-dot { width:4px; height:4px; border-radius:50%; background:var(--gold); flex-shrink:0; }

  .co-btn-gold {
    display:inline-flex; align-items:center; gap:8px;
    background:var(--gold); color:#0a0a08;
    border:none; border-radius:2px;
    padding:13px 26px; text-decoration:none;
    font-family:var(--ff-b); font-size:.85rem; font-weight:500;
    letter-spacing:.4px; cursor:pointer;
    transition:background .25s, transform .25s, box-shadow .25s;
  }
  .co-btn-gold:hover { background:#ddbf7e; transform:translateY(-2px); box-shadow:0 10px 28px rgba(201,169,110,0.28); color:#0a0a08; }
  .co-btn-gold:disabled { opacity:.5; cursor:not-allowed; transform:none; }
  .co-btn-submit { width:100%; justify-content:center; padding:14px; margin-top:6px; }

  .co-btn-outline {
    display:inline-flex; align-items:center; gap:8px;
    background:transparent; color:rgba(240,236,228,0.65);
    border:1px solid rgba(240,236,228,0.28); border-radius:2px;
    padding:13px 24px; text-decoration:none;
    font-family:var(--ff-b); font-size:.85rem; font-weight:400;
    cursor:pointer; transition:all .25s;
  }
  .co-btn-outline:hover { border-color:var(--gold); color:var(--gold); }

  .co-wrap { max-width:1280px; margin:0 auto; padding:88px 7vw 100px; }
  .co-section-head { text-align:center; margin-bottom:64px; }
  .co-section-h2 {
    font-family:var(--ff-d);
    font-size:clamp(2rem,3.8vw,3.4rem);
    font-weight:700; color:var(--cream); margin-bottom:18px;
  }
  .co-gold-rule { width:52px; height:2px; background:var(--gold); margin:0 auto 18px; }
  .co-section-body {
    font-family:var(--ff-b); font-size:.95rem; font-weight:300;
    color:var(--muted); line-height:1.78; max-width:460px; margin:0 auto;
  }

  .co-cards {
    display:grid;
    grid-template-columns:repeat(auto-fit, minmax(280px,1fr));
    gap:2px; margin-bottom:72px;
  }
  .co-info-card {
    background:#111110; padding:44px 32px 36px;
    text-align:center; position:relative; overflow:hidden;
    transition:opacity .7s ease, transform .7s ease, box-shadow .3s;
  }
  .co-info-card:hover { transform:translateY(-6px) !important; box-shadow:0 22px 50px rgba(0,0,0,0.6); }
  .co-info-card-icon {
    width:64px; height:64px; border-radius:50%;
    border:1px solid; display:flex; align-items:center; justify-content:center;
    margin:0 auto 22px;
    transition:transform .3s;
  }
  .co-info-card:hover .co-info-card-icon { transform:scale(1.08) rotate(-3deg); }
  .co-info-card-title {
    font-family:var(--ff-d); font-size:1.5rem; font-weight:700;
    color:var(--cream); margin-bottom:12px;
  }
  .co-info-card-primary {
    font-family:var(--ff-b); font-size:.92rem; font-weight:500;
    margin-bottom:6px;
  }
  .co-info-card-secondary {
    font-family:var(--ff-b); font-size:.8rem; font-weight:300;
    color:rgba(240,236,228,0.38);
  }
  .co-info-card-bar {
    position:absolute; bottom:0; left:0; right:0; height:2px;
    opacity:0; transform:scaleX(0); transform-origin:left;
    transition:opacity .3s, transform .4s ease;
  }
  .co-info-card:hover .co-info-card-bar { opacity:.6; transform:scaleX(1); }

  .co-main-row {
    display:grid; grid-template-columns:1fr 420px;
    gap:2px; margin-bottom:80px;
  }
  @media(max-width:900px){
    .co-main-row { grid-template-columns:1fr; }
  }

  .co-form-panel {
    background:#111110; padding:48px;
  }
  .co-panel-title {
    font-family:var(--ff-d); font-size:2rem; font-weight:700;
    color:var(--cream); margin-bottom:6px;
  }
  .co-panel-sub {
    font-family:var(--ff-b); font-size:.88rem; font-weight:300;
    color:rgba(240,236,228,0.4); margin-bottom:28px;
  }
  .co-success-bar {
    display:flex; align-items:center; gap:10px;
    background:rgba(201,169,110,0.08);
    border-left:2px solid var(--gold);
    padding:12px 16px; margin-bottom:22px;
    font-family:var(--ff-b); font-size:.85rem;
    color:rgba(240,236,228,0.65);
  }
  .co-form { display:flex; flex-direction:column; gap:18px; }
  .co-form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media(max-width:600px){ .co-form-row { grid-template-columns:1fr; } }
  .co-field { display:flex; flex-direction:column; gap:7px; }
  .co-field-label {
    font-family:var(--ff-b); font-size:10px; font-weight:500;
    letter-spacing:1.8px; text-transform:uppercase;
    color:rgba(240,236,228,0.36);
  }
  .co-input {
    background:rgba(255,255,255,0.03);
    border:1px solid rgba(255,255,255,0.07); border-radius:2px;
    padding:11px 14px;
    font-family:var(--ff-b); font-size:.87rem; font-weight:300;
    color:var(--cream); outline:none; width:100%;
    transition:border-color .2s, background .2s;
  }
  .co-input::placeholder { color:rgba(240,236,228,0.18); }
  .co-input:focus { border-color:rgba(201,169,110,0.42); background:rgba(201,169,110,0.04); }
  .co-textarea { resize:vertical; min-height:130px; }

  .co-sidebar { display:flex; flex-direction:column; }
  .co-sidebar-photo-wrap {
    position:relative; height:220px; overflow:hidden; flex-shrink:0;
  }
  .co-sidebar-photo { width:100%; height:100%; object-fit:cover; display:block; transition:transform .5s; }
  .co-sidebar:hover .co-sidebar-photo { transform:scale(1.04); }
  .co-sidebar-photo-veil {
    position:absolute; inset:0;
    background:linear-gradient(to top, rgba(17,17,16,0.85) 0%, transparent 55%);
  }
  .co-sidebar-photo-label {
    position:absolute; bottom:14px; left:18px; z-index:2;
    font-family:var(--ff-b); font-size:.68rem; letter-spacing:2.5px;
    text-transform:uppercase; color:rgba(240,236,228,0.55);
  }
  .co-sidebar-block { background:#111110; padding:28px; }
  .co-sidebar-title {
    font-family:var(--ff-d); font-size:1.25rem; font-weight:700;
    color:var(--cream); margin-bottom:18px;
  }
  .co-sidebar-divider { height:2px; background:var(--ink); flex-shrink:0; }

  .co-hours { display:flex; flex-direction:column; gap:12px; }
  .co-hours-row {
    display:flex; justify-content:space-between; align-items:center;
    font-family:var(--ff-b); font-size:.83rem;
  }
  .co-hours-day {
    display:flex; align-items:center; gap:8px;
    color:rgba(240,236,228,0.55); font-weight:300;
  }
  .co-hours-clock { color:var(--gold); display:flex; }
  .co-hours-time { color:var(--cream); font-weight:400; font-size:.8rem; }

  .co-delivery-box {
    display:flex; align-items:flex-start; gap:12px;
    background:rgba(255,107,53,0.07);
    border:1px solid rgba(255,107,53,0.12); padding:14px;
    margin-bottom:16px;
    font-family:var(--ff-b); font-size:.82rem; font-weight:300;
    color:rgba(240,236,228,0.55); line-height:1.6;
  }
  .co-pricing { display:flex; flex-direction:column; gap:10px; }
  .co-pricing-row {
    display:flex; align-items:center; gap:8px;
    font-family:var(--ff-b); font-size:.8rem; font-weight:300;
    color:rgba(240,236,228,0.5);
  }
  .co-pricing-row strong { color:var(--gold); font-weight:500; }

  .co-emergency {
    background:#111110;
    padding:24px 28px;
    border-top:1px solid rgba(201,169,110,0.1);
    margin-top:auto;
  }
  .co-emergency-left { display:flex; align-items:center; gap:16px; }
  .co-emergency-icon-wrap {
    width:46px; height:46px; border-radius:50%;
    background:rgba(201,169,110,0.08);
    border:1px solid rgba(201,169,110,0.25);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .co-emergency-title {
    font-family:var(--ff-d); font-size:1rem; font-weight:700;
    color:var(--cream); margin-bottom:2px;
  }
  .co-emergency-sub {
    font-family:var(--ff-b); font-size:.75rem; font-weight:300;
    color:rgba(240,236,228,0.38); margin-bottom:4px;
  }
  .co-emergency-phone {
    font-family:var(--ff-b); font-size:1rem; font-weight:500; color:var(--gold);
  }

  .co-map { overflow:hidden; }
  .co-map-inner {
    display:grid; grid-template-columns:1fr 1fr;
    gap:2px; background:#111110;
  }
  @media(max-width:768px){ .co-map-inner { grid-template-columns:1fr; } }
  .co-map-text {
    padding:52px 48px;
    display:flex; flex-direction:column; justify-content:center;
  }
  .co-map-title {
    font-family:var(--ff-d); font-size:clamp(1.8rem,3vw,2.8rem);
    font-weight:700; color:var(--cream);
    margin-bottom:16px; margin-top:8px;
  }
  .co-map-body {
    font-family:var(--ff-b); font-size:.9rem; font-weight:300;
    color:var(--muted); line-height:1.78; margin-bottom:24px;
  }
  .co-map-tag {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(201,169,110,0.1);
    border:1px solid rgba(201,169,110,0.2);
    padding:9px 18px;
    font-family:var(--ff-b); font-size:.78rem; font-weight:500;
    letter-spacing:.5px; color:var(--gold);
  }
  .co-map-grid {
    display:grid; grid-template-columns:1fr 1fr;
    grid-template-rows:1fr 1fr; gap:2px;
    min-height:320px;
  }
  .co-map-thumb { position:relative; overflow:hidden; }
  .co-map-thumb img {
    width:100%; height:100%; object-fit:cover; display:block;
    transition:transform .5s ease;
  }
  .co-map-thumb:hover img { transform:scale(1.07); }
  .co-map-thumb-veil {
    position:absolute; inset:0;
    background:rgba(10,10,8,0.25);
    transition:background .3s;
  }
  .co-map-thumb:hover .co-map-thumb-veil { background:rgba(10,10,8,0.1); }

  .co-spin {
    width:13px; height:13px;
    border:2px solid rgba(10,10,8,0.25);
    border-top-color:#0a0a08;
    border-radius:50%;
    animation:coSpin .7s linear infinite; display:inline-block; vertical-align:middle;
  }
  @keyframes coSpin { to { transform:rotate(360deg); } }

  @media(max-width:768px){
    .co-hero-meta-col { display:none; }
    .co-form-panel { padding:32px 22px; }
    .co-sidebar-block { padding:22px; }
    .co-map-text { padding:36px 28px; }
    .co-strip { display:none; }
    .co-cards { grid-template-columns:1fr; }
    .co-wrap { padding:60px 6vw 80px; }
  }
`;

export default Contact;