import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

// ─── Pexels avatar pool (cycles for new submissions) ───────────────────────
const AVATAR_POOL = [
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
  'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
];

// ─── Star renderer ──────────────────────────────────────────────────────────
const StarIcon = ({ filled, size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? '#FFD700' : 'none'}
    stroke={filled ? '#FFD700' : 'rgba(240,236,228,0.25)'}
    strokeWidth="1.5"
    style={{ flexShrink: 0 }}
  >
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const Stars = ({ rating, size = 14 }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <StarIcon key={i} filled={i <= Math.round(rating)} size={size} />
    ))}
  </div>
);

// ─── Interactive star selector for the form ─────────────────────────────────
const StarSelector = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '28px',
            lineHeight: 1,
            padding: '2px',
            color: i <= display ? '#FFD700' : 'rgba(240,236,228,0.25)',
            transition: 'transform 0.15s, color 0.15s',
            transform: hovered === i ? 'scale(1.2)' : 'scale(1)',
          }}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
        >
          {i <= display ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visibleCards, setVisibleCards] = useState({});
  const [summaryVisible, setSummaryVisible] = useState(false);
  const summaryRef = useRef(null);
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({ name: '', rating: 5, comment: '', dish: '' });

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/testimonials');
      const list = res.data?.testimonials || (Array.isArray(res.data) ? res.data : []);
      setTestimonials(list);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Intersection observers ───────────────────────────────────────────────
  useEffect(() => {
    if (summaryRef.current) {
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setSummaryVisible(true); },
        { threshold: 0.1 }
      );
      obs.observe(summaryRef.current);
      return () => obs.disconnect();
    }
  }, [loading]);

  useEffect(() => {
    const cardObs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          setVisibleCards(v => ({ ...v, [e.target.dataset.cardId]: true }));
        }
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('[data-card-id]').forEach(el => cardObs.observe(el));
    return () => cardObs.disconnect();
  }, [testimonials]);

  // ── Form ─────────────────────────────────────────────────────────────────
  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to submit a testimonial'); return; }
    if (!formData.comment.trim()) { toast.error('Please write a review'); return; }

    setSubmitting(true);
    try {
      const payload = {
        name: user?.name || formData.name,
        rating: formData.rating,
        comment: formData.comment.trim(),
        dish: formData.dish || '',
      };
      const res = await api.post('/testimonials', payload);

      if (res.data.success) {
        toast.success('Thank you! Your testimonial has been submitted.');
        const newT = {
          id: res.data.testimonial?.id || Date.now(),
          name: payload.name,
          rating: payload.rating,
          comment: payload.comment,
          dish: payload.dish,
          verified: true,
          date: new Date().toISOString().split('T')[0],
          avatar: AVATAR_POOL[testimonials.length % AVATAR_POOL.length],
        };
        setTestimonials(prev => [newT, ...prev]);
        setFormData({ name: '', rating: 5, comment: '', dish: '' });
        setShowModal(false);
      } else {
        toast.error(res.data.message || 'Failed to submit testimonial');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Computed ─────────────────────────────────────────────────────────────
  const avgRating = testimonials.length
    ? (testimonials.reduce((s, t) => s + (t.rating || 0), 0) / testimonials.length).toFixed(1)
    : '0.0';

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: testimonials.filter(t => Math.floor(t.rating) === star).length,
    pct: testimonials.length
      ? (testimonials.filter(t => Math.floor(t.rating) === star).length / testimonials.length) * 100
      : 0,
  }));

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: '#0d0d0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@keyframes tspin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48,
            border: '2px solid rgba(255,107,53,0.2)',
            borderTopColor: '#FF6B35',
            borderRadius: '50%',
            animation: 'tspin 0.8s linear infinite',
            margin: '0 auto 20px',
          }} />
          <p style={{ color: 'rgba(240,236,228,0.45)', fontFamily: "'DM Sans', sans-serif" }}>
            Loading customer stories...
          </p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; }

        /* ── Animations ── */
        @keyframes tspin   { to { transform: rotate(360deg); } }
        @keyframes tfloat  { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-14px) rotate(2deg); } }
        @keyframes tFadeIn { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes modalIn { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes overlayIn { from { opacity:0; } to { opacity:1; } }

        /* ── Hero ── */
        .t-hero {
          position: relative;
          height: 540px;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
        }
        .t-hero-bg {
          position: absolute; inset: 0;
          background-image: url('https://images.pexels.com/photos/5638699/pexels-photo-5638699.jpeg?auto=compress&cs=tinysrgb&w=1400');
          background-size: cover;
          background-position: center;
          transform: scale(1.04);
          transition: transform 8s ease;
        }
        .t-hero:hover .t-hero-bg { transform: scale(1); }
        .t-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, #0d0d0d 0%, rgba(13,13,13,0.72) 55%, rgba(13,13,13,0.28) 100%);
        }
        .t-hero-content {
          position: relative; z-index: 2;
          padding: 0 6vw 64px;
          width: 100%;
        }
        .t-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
          color: #FF6B35; margin-bottom: 14px;
        }
        .t-eyebrow-line { width: 28px; height: 1px; background: #FF6B35; }
        .t-hero-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.4rem, 5.5vw, 4.4rem);
          font-weight: 900; color: #f0ece4; line-height: 1.06;
          margin-bottom: 16px;
        }
        .t-hero-h1 em { color: #FF6B35; font-style: italic; }
        .t-hero-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: .95rem; font-weight: 300;
          color: rgba(240,236,228,0.58); line-height: 1.78;
          max-width: 500px; margin-bottom: 38px;
        }
        .t-stats { display: flex; gap: 44px; flex-wrap: wrap; }
        .t-stat-num {
          display: block;
          font-family: 'Playfair Display', serif;
          font-size: 1.9rem; font-weight: 900; color: #FF6B35;
        }
        .t-stat-label {
          display: block;
          font-family: 'DM Sans', sans-serif;
          font-size: .68rem; letter-spacing: 1.5px; text-transform: uppercase;
          color: rgba(240,236,228,0.38); margin-top: 2px;
        }

        /* ── Body ── */
        .t-body {
          background: #0d0d0d;
          padding: 0 6vw 100px;
        }

        /* ── Summary block ── */
        .t-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 56px;
          opacity: 0; transform: translateY(24px);
          transition: opacity .65s ease, transform .65s ease;
        }
        .t-summary.visible { opacity: 1; transform: translateY(0); }
        .t-summary-left {
          padding: 44px 40px;
          border-right: 1px solid rgba(255,255,255,0.07);
          text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          background: #141414;
        }
        .t-avg-num {
          font-family: 'Playfair Display', serif;
          font-size: 4.8rem; font-weight: 900; color: #FF6B35; line-height: 1;
        }
        .t-avg-label {
          font-family: 'DM Sans', sans-serif;
          font-size: .72rem; letter-spacing: 1.5px; text-transform: uppercase;
          color: rgba(240,236,228,0.38);
        }
        .t-write-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #FF6B35; border: none;
          padding: 13px 28px; border-radius: 3px;
          font-family: 'DM Sans', sans-serif; font-size: .85rem; font-weight: 500;
          color: #fff; cursor: pointer;
          transition: background .25s, transform .25s, box-shadow .25s;
          margin-top: 4px;
        }
        .t-write-btn:hover {
          background: #ff7d4a;
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(255,107,53,0.35);
        }
        .t-summary-right {
          padding: 36px 44px;
          display: flex; flex-direction: column; justify-content: center; gap: 14px;
          background: #141414;
        }
        .t-dist-row { display: flex; align-items: center; gap: 12px; }
        .t-dist-label {
          min-width: 38px; font-size: .78rem;
          color: rgba(240,236,228,0.55);
          display: flex; align-items: center; gap: 3px;
        }
        .t-dist-track {
          flex: 1; height: 5px;
          background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;
        }
        .t-dist-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF6B35, #FFB347);
          border-radius: 3px;
          transition: width .7s ease;
        }
        .t-dist-count {
          min-width: 28px; text-align: right;
          font-size: .74rem; color: rgba(240,236,228,0.33);
        }

        /* ── Section header ── */
        .t-section-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px; padding-top: 8px;
        }
        .t-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem; font-weight: 700; color: #f0ece4;
        }
        .t-count-badge {
          background: rgba(255,107,53,0.1); color: #FF6B35;
          font-family: 'DM Sans', sans-serif;
          font-size: .74rem; padding: 4px 13px; border-radius: 20px;
        }

        /* ── Grid ── */
        .t-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2px;
        }

        /* ── Card ── */
        .t-card {
          background: #141414;
          opacity: 0; transform: translateY(24px);
          transition: opacity .55s ease, transform .55s ease, box-shadow .3s, transform .3s;
        }
        .t-card.visible { opacity: 1; transform: translateY(0); }
        .t-card:hover { transform: translateY(-5px) !important; box-shadow: 0 22px 44px rgba(0,0,0,0.6); }
        .t-card-inner { padding: 30px; }
        .t-card-head {
          display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px;
        }
        .t-avatar {
          width: 50px; height: 50px;
          border-radius: 50%; object-fit: cover; flex-shrink: 0;
          border: 2px solid rgba(255,107,53,0.28);
        }
        .t-avatar-fallback {
          width: 50px; height: 50px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #FF6B35, #FF8C42);
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif; font-weight: 600;
          font-size: 1rem; color: #fff;
          border: 2px solid rgba(255,107,53,0.28);
        }
        .t-card-meta { flex: 1; }
        .t-c-name {
          font-family: 'Playfair Display', serif;
          font-size: 1rem; font-weight: 700; color: #f0ece4; margin-bottom: 5px;
        }
        .t-verified {
          display: flex; align-items: center; gap: 4px;
          background: rgba(0,201,167,0.1);
          padding: 4px 9px; border-radius: 3px;
          font-family: 'DM Sans', sans-serif; font-size: .64rem; color: #00C9A7;
          flex-shrink: 0;
        }
        .t-quote { color: #FF6B35; opacity: .35; font-size: 2rem; line-height: 1; margin-bottom: 10px; font-family: 'Playfair Display', serif; }
        .t-comment {
          font-family: 'DM Sans', sans-serif;
          font-size: .875rem; font-weight: 300;
          color: rgba(240,236,228,0.68); line-height: 1.78;
          font-style: italic; margin-bottom: 18px;
        }
        .t-card-foot {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.06);
          font-family: 'DM Sans', sans-serif;
        }
        .t-dish { display: flex; align-items: center; gap: 5px; font-size: .7rem; color: rgba(240,236,228,0.38); }
        .t-date { font-size: .7rem; color: rgba(240,236,228,0.28); }

        /* ── Empty state ── */
        .t-empty { text-align: center; padding: 90px 20px; }
        .t-empty-img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto 24px; opacity: .45; display: block; }
        .t-empty h3 { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #f0ece4; margin-bottom: 10px; }
        .t-empty p { color: rgba(240,236,228,0.4); font-family: 'DM Sans', sans-serif; margin-bottom: 24px; }

        /* ── Modal overlay ── */
        .t-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.88);
          backdrop-filter: blur(10px);
          z-index: 2000;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: overlayIn .3s ease;
        }
        .t-modal {
          background: #141414;
          max-width: 520px; width: 100%;
          max-height: 90vh; overflow-y: auto;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 2px;
          position: relative;
          animation: modalIn .3s ease;
        }
        .t-modal-img { width: 100%; height: 190px; object-fit: cover; display: block; }
        .t-modal-close {
          position: absolute; top: 14px; right: 14px;
          width: 34px; height: 34px;
          background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 3px; color: rgba(240,236,228,0.7);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 18px; line-height: 1;
          transition: background .2s;
          z-index: 1;
        }
        .t-modal-close:hover { background: rgba(255,107,53,0.25); color: #fff; }
        .t-modal-header {
          text-align: center; padding: 32px 32px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .t-modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem; font-weight: 700; color: #f0ece4; margin-bottom: 6px;
        }
        .t-modal-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: .85rem; color: rgba(240,236,228,0.42); line-height: 1.6;
        }
        .t-modal-body { padding: 28px 32px 32px; }
        .t-form { display: flex; flex-direction: column; gap: 20px; }
        .t-fg { display: flex; flex-direction: column; gap: 7px; }
        .t-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px; letter-spacing: 1.8px; text-transform: uppercase;
          color: rgba(240,236,228,0.42);
        }
        .t-input, .t-textarea {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 3px;
          padding: 11px 14px;
          font-family: 'DM Sans', sans-serif; font-size: .85rem;
          color: #f0ece4;
          outline: none;
          transition: border-color .2s, background .2s;
          width: 100%;
        }
        .t-input:focus, .t-textarea:focus {
          border-color: rgba(255,107,53,0.45);
          background: rgba(255,107,53,0.04);
        }
        .t-input::placeholder, .t-textarea::placeholder { color: rgba(240,236,228,0.22); }
        .t-form-actions {
          display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px;
        }
        .t-cancel-btn {
          padding: 10px 22px; background: transparent;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 3px;
          font-family: 'DM Sans', sans-serif; font-size: .83rem;
          color: rgba(240,236,228,0.55); cursor: pointer;
          transition: border-color .2s;
        }
        .t-cancel-btn:hover { border-color: rgba(255,255,255,0.25); }
        .t-submit-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 28px; background: #FF6B35; border: none; border-radius: 3px;
          font-family: 'DM Sans', sans-serif; font-size: .85rem; font-weight: 500;
          color: #fff; cursor: pointer;
          transition: background .2s, transform .2s;
        }
        .t-submit-btn:hover:not(:disabled) { background: #ff7d4a; transform: translateY(-1px); }
        .t-submit-btn:disabled { opacity: .6; cursor: not-allowed; }
        .t-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: tspin .7s linear infinite;
        }
        .t-auth-warning {
          text-align: center; padding: 24px 0;
        }
        .t-auth-warning img {
          width: 80px; height: 80px; border-radius: 50%; object-fit: cover;
          margin: 0 auto 18px; display: block; opacity: .55;
        }
        .t-auth-warning h4 {
          font-family: 'Playfair Display', serif; font-size: 1.15rem; color: #f0ece4;
          margin-bottom: 8px;
        }
        .t-auth-warning p {
          font-family: 'DM Sans', sans-serif; font-size: .85rem;
          color: rgba(240,236,228,0.42); margin-bottom: 22px;
        }
        .t-login-link {
          display: inline-block; background: #FF6B35; color: #fff;
          text-decoration: none; padding: 12px 28px; border-radius: 3px;
          font-family: 'DM Sans', sans-serif; font-size: .85rem; font-weight: 500;
          transition: background .2s;
        }
        .t-login-link:hover { background: #ff7d4a; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .t-hero { height: 480px; }
          .t-summary { grid-template-columns: 1fr; }
          .t-summary-left { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.07); }
          .t-grid { grid-template-columns: 1fr; }
          .t-stats { gap: 24px; }
          .t-modal-body { padding: 22px 22px 28px; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="t-hero">
        <div className="t-hero-bg" />
        <div className="t-hero-overlay" />
        <div className="t-hero-content">
          <div className="t-eyebrow">
            <span className="t-eyebrow-line" />
            Client Stories
          </div>
          <h1 className="t-hero-h1">
            What Our <em>Customers</em><br />Say About Us
          </h1>
          <p className="t-hero-sub">
            Real experiences from real people. Discover why Mutindo Catering
            is the preferred choice for events and daily meals across Uganda.
          </p>
          <div className="t-stats">
            <div>
              <span className="t-stat-num">{testimonials.length}</span>
              <span className="t-stat-label">Happy Clients</span>
            </div>
            <div>
              <span className="t-stat-num">{avgRating}</span>
              <span className="t-stat-label">Avg Rating</span>
            </div>
            <div>
              <span className="t-stat-num">{testimonials.filter(t => t.verified).length}</span>
              <span className="t-stat-label">Verified Reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="t-body">

        {/* Summary block */}
        <div
          ref={summaryRef}
          className={`t-summary${summaryVisible ? ' visible' : ''}`}
        >
          {/* Left — average + write btn */}
          <div className="t-summary-left">
            <div className="t-avg-num">{avgRating}</div>
            <Stars rating={parseFloat(avgRating)} size={20} />
            <div className="t-avg-label">Based on {testimonials.length} reviews</div>
            <button className="t-write-btn" onClick={() => setShowModal(true)}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Write a Review
            </button>
          </div>

          {/* Right — distribution bars */}
          <div className="t-summary-right">
            {ratingDist.map(({ star, count, pct }) => (
              <div key={star} className="t-dist-row">
                <div className="t-dist-label">
                  {star}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="1.5">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                </div>
                <div className="t-dist-track">
                  <div className="t-dist-fill" style={{ width: `${pct.toFixed(1)}%` }} />
                </div>
                <div className="t-dist-count">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section header */}
        <div className="t-section-head">
          <div className="t-section-title">All Reviews</div>
          <div className="t-count-badge">{testimonials.length} review{testimonials.length !== 1 ? 's' : ''}</div>
        </div>

        {/* Grid */}
        {testimonials.length > 0 ? (
          <div className="t-grid">
            {testimonials.map((t, idx) => (
              <div
                key={t.id}
                data-card-id={t.id}
                className={`t-card${visibleCards[t.id] ? ' visible' : ''}`}
                style={{ transitionDelay: `${(idx % 9) * 55}ms` }}
              >
                <div className="t-card-inner">
                  <div className="t-card-head">
                    {t.avatar ? (
                      <img
                        className="t-avatar"
                        src={t.avatar}
                        alt={t.name}
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div
                      className="t-avatar-fallback"
                      style={{ display: t.avatar ? 'none' : 'flex' }}
                    >
                      {(t.name || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="t-card-meta">
                      <div className="t-c-name">{t.name}</div>
                      <Stars rating={t.rating} size={13} />
                    </div>
                    {t.verified && (
                      <div className="t-verified">
                        <svg width="11" height="11" fill="none" stroke="#00C9A7" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="t-quote">"</div>
                  <p className="t-comment">{t.comment}</p>
                  <div className="t-card-foot">
                    {t.dish ? (
                      <div className="t-dish">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path d="M3 11l19-9-9 19-2-8-8-2z" />
                        </svg>
                        {t.dish}
                      </div>
                    ) : <span />}
                    <div className="t-date">{t.date || new Date().toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="t-empty">
            <img
              className="t-empty-img"
              src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200"
              alt="No reviews yet"
            />
            <h3>No reviews yet</h3>
            <p>Be the first to share your experience with us!</p>
            <button className="t-write-btn" onClick={() => setShowModal(true)}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Write a Review
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL ────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="t-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="t-modal" onClick={e => e.stopPropagation()}>
            <button className="t-modal-close" onClick={() => setShowModal(false)}>✕</button>
            <img
              className="t-modal-img"
              src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Mutindo Catering food"
            />
            <div className="t-modal-header">
              <div className="t-modal-title">Share Your Experience</div>
              <p className="t-modal-sub">Tell us about your dining experience with Mutindo Catering</p>
            </div>

            <div className="t-modal-body">
              {!isAuthenticated ? (
                <div className="t-auth-warning">
                  <img
                    src="https://images.pexels.com/photos/5638699/pexels-photo-5638699.jpeg?auto=compress&cs=tinysrgb&w=200"
                    alt="Login to continue"
                  />
                  <h4>Please login to submit a testimonial</h4>
                  <p>Share your experience with our community</p>
                  <a href="/login" className="t-login-link">Login to continue</a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="t-form">
                  <div className="t-fg">
                    <label className="t-label">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      className="t-input"
                      value={formData.name || user?.name || ''}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="t-fg">
                    <label className="t-label">Dish You Ordered</label>
                    <input
                      type="text"
                      name="dish"
                      className="t-input"
                      value={formData.dish}
                      onChange={handleChange}
                      placeholder="e.g. Rolex, Matooke, Chicken Pilau..."
                    />
                  </div>

                  <div className="t-fg">
                    <label className="t-label">Your Rating</label>
                    <StarSelector
                      value={formData.rating}
                      onChange={rating => setFormData(p => ({ ...p, rating }))}
                    />
                  </div>

                  <div className="t-fg">
                    <label className="t-label">Your Review</label>
                    <textarea
                      rows={5}
                      name="comment"
                      className="t-textarea"
                      value={formData.comment}
                      onChange={handleChange}
                      placeholder="Tell us about your experience..."
                      required
                    />
                  </div>

                  <div className="t-form-actions">
                    <button type="button" className="t-cancel-btn" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="t-submit-btn" disabled={submitting}>
                      {submitting ? (
                        <><div className="t-spinner" /> Submitting...</>
                      ) : (
                        <>Submit Review
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Testimonials;