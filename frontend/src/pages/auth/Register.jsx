import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      toast.success('Registration successful!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Josefin+Sans:wght@300;400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --saffron:      #E8871A;
          --deep-saffron: #C96D08;
          --turmeric:     #D4A017;
          --paprika:      #B83A1B;
          --charcoal:     #1C1410;
          --espresso:     #2E1F0E;
          --cream:        #FAF3E8;
          --linen:        #F2E6D0;
          --ivory:        #FDF8F0;
          --gold:         #C8960C;
          --warm-gray:    #8A7560;
          --smoke:        #D6C9B4;
        }

        .reg-root {
          min-height: 100vh;
          display: flex;
          background-color: var(--charcoal);
          font-family: 'Josefin Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ── Left panel ── */
        .reg-left {
          flex: 1 1 45%;
          position: relative;
          overflow: hidden;
          display: none;
        }
        @media (min-width: 900px) { .reg-left { display: block; } }

        .reg-left-bg {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(160deg, rgba(28,20,16,.72) 0%, rgba(28,20,16,.1) 60%, rgba(28,20,16,.88) 100%),
            url('https://images.unsplash.com/photo-1555244162-803834f70033?w=900&q=80') center/cover no-repeat;
        }

        .reg-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, transparent 60%, var(--charcoal) 100%);
        }

        .reg-left-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 3rem;
        }

        .reg-brand-tag {
          display: inline-block;
          font-size: .63rem;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--saffron);
          border: 1px solid var(--saffron);
          padding: .35rem .8rem;
          border-radius: 2px;
          margin-bottom: 1.4rem;
          width: fit-content;
        }

        .reg-left-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.6rem, 4vw, 4rem);
          font-weight: 300;
          line-height: 1.1;
          color: var(--cream);
          margin-bottom: 1rem;
        }
        .reg-left-title em { font-style: italic; color: var(--saffron); }

        .reg-left-desc {
          font-size: .82rem;
          line-height: 1.75;
          color: var(--smoke);
          max-width: 280px;
          letter-spacing: .02em;
          margin-bottom: 2rem;
        }

        .reg-divider {
          width: 48px;
          height: 2px;
          background: linear-gradient(to right, var(--saffron), var(--turmeric));
          margin-bottom: 2rem;
          border-radius: 2px;
        }

        .reg-feature-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: .6rem;
          margin-bottom: 2.5rem;
        }
        .reg-feature-list li {
          display: flex;
          align-items: center;
          gap: .75rem;
          font-size: .73rem;
          letter-spacing: .08em;
          color: var(--smoke);
          text-transform: uppercase;
        }
        .reg-feature-list li::before {
          content: '';
          width: 6px; height: 6px;
          background: var(--saffron);
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ── Right panel ── */
        .reg-right {
          flex: 1 1 55%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          background: var(--ivory);
          position: relative;
          overflow: hidden;
        }
        .reg-right::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(232,135,26,.10) 0%, transparent 70%);
          pointer-events: none;
        }
        .reg-right::after {
          content: '';
          position: absolute;
          bottom: -100px; left: -80px;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(212,160,23,.09) 0%, transparent 70%);
          pointer-events: none;
        }

        .reg-card {
          width: 100%;
          max-width: 460px;
          position: relative;
          z-index: 1;
          animation: fadeSlideUp .55s cubic-bezier(.22,.68,0,1.2) both;
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Logo */
        .reg-logo {
          display: flex;
          align-items: center;
          gap: .75rem;
          margin-bottom: 2rem;
        }
        .reg-logo-img {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          object-fit: cover;
          border: 2px solid var(--linen);
          box-shadow: 0 4px 14px rgba(184,58,27,.18);
        }
        .reg-logo-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--espresso);
          letter-spacing: .04em;
          line-height: 1.1;
        }
        .reg-logo-sub {
          display: block;
          font-family: 'Josefin Sans', sans-serif;
          font-size: .6rem;
          letter-spacing: .18em;
          color: var(--warm-gray);
          text-transform: uppercase;
          margin-top: 1px;
        }

        /* Heading */
        .reg-header { margin-bottom: 2rem; }
        .reg-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3.5vw, 2.6rem);
          font-weight: 600;
          color: var(--espresso);
          line-height: 1.1;
          margin-bottom: .45rem;
        }
        .reg-title span { color: var(--saffron); font-style: italic; }
        .reg-subtitle {
          font-size: .72rem;
          letter-spacing: .12em;
          color: var(--warm-gray);
          text-transform: uppercase;
        }

        /* Error */
        .reg-error {
          background: linear-gradient(135deg, #fff0ee, #ffe4df);
          border-left: 3px solid var(--paprika);
          color: var(--paprika);
          font-size: .78rem;
          letter-spacing: .04em;
          padding: .85rem 1rem;
          border-radius: 0 8px 8px 0;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: .5rem;
        }

        /* Form */
        .reg-form { display: flex; flex-direction: column; }

        .reg-field { position: relative; margin-bottom: 1.1rem; }
        .reg-field-label {
          display: block;
          font-size: .63rem;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: var(--warm-gray);
          margin-bottom: .42rem;
          font-weight: 600;
          transition: color .2s;
        }
        .reg-field:focus-within .reg-field-label { color: var(--deep-saffron); }

        .reg-input-wrap { position: relative; display: flex; align-items: center; }
        .reg-input-icon {
          position: absolute;
          left: .95rem;
          font-size: .85rem;
          color: var(--smoke);
          pointer-events: none;
          transition: color .2s;
          z-index: 1;
        }
        .reg-field:focus-within .reg-input-icon { color: var(--saffron); }

        .reg-input {
          width: 100%;
          padding: .82rem 1rem .82rem 2.6rem;
          background: var(--cream);
          border: 1.5px solid var(--smoke);
          border-radius: 10px;
          font-family: 'Josefin Sans', sans-serif;
          font-size: .82rem;
          letter-spacing: .04em;
          color: var(--espresso);
          outline: none;
          transition: border-color .25s, background .25s, box-shadow .25s;
          -webkit-appearance: none;
        }
        .reg-input::placeholder { color: var(--smoke); }
        .reg-input:focus {
          border-color: var(--saffron);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(232,135,26,.12);
        }

        .reg-input-bar {
          position: absolute;
          bottom: 0; left: 10px; right: 10px;
          height: 2px;
          background: linear-gradient(to right, var(--saffron), var(--turmeric));
          border-radius: 2px;
          transform: scaleX(0);
          transition: transform .3s cubic-bezier(.22,.68,0,1.2);
          transform-origin: left;
        }
        .reg-field:focus-within .reg-input-bar { transform: scaleX(1); }

        .reg-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 480px) { .reg-row { grid-template-columns: 1fr; } }

        /* Submit */
        .reg-submit {
          margin-top: .6rem;
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, var(--saffron) 0%, var(--paprika) 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'Josefin Sans', sans-serif;
          font-size: .78rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform .2s, box-shadow .2s;
          box-shadow: 0 6px 24px rgba(184,58,27,.30);
        }
        .reg-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .reg-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(184,58,27,.42);
        }
        .reg-submit:active:not(:disabled) { transform: translateY(0); }
        .reg-submit:disabled { opacity: .7; cursor: not-allowed; }

        .reg-submit-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .6rem;
        }

        .reg-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer */
        .reg-footer { margin-top: 1.8rem; text-align: center; }
        .reg-footer-line {
          display: flex;
          align-items: center;
          gap: .75rem;
          color: var(--smoke);
          font-size: .68rem;
          letter-spacing: .06em;
          margin-bottom: 1rem;
        }
        .reg-footer-line::before,
        .reg-footer-line::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--smoke);
        }

        .reg-login-link {
          font-size: .75rem;
          color: var(--warm-gray);
          letter-spacing: .05em;
        }
        .reg-login-link a {
          color: var(--saffron);
          text-decoration: none;
          font-weight: 600;
          position: relative;
        }
        .reg-login-link a::after {
          content: '';
          position: absolute;
          left: 0; bottom: -1px;
          width: 100%; height: 1px;
          background: var(--saffron);
          transform: scaleX(0);
          transition: transform .25s;
          transform-origin: left;
        }
        .reg-login-link a:hover::after { transform: scaleX(1); }

        .reg-grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          opacity: .025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }
      `}</style>

      <div className="reg-grain" aria-hidden="true" />

      <div className="reg-root">

        {/* ── Left decorative panel ── */}
        <aside className="reg-left">
          <div className="reg-left-bg" />
          <div className="reg-left-overlay" />
          <div className="reg-left-content">
            <span className="reg-brand-tag">Est. Since 2010</span>
            <h1 className="reg-left-title">
              Food worth<br />
              <em>gathering</em><br />
              around.
            </h1>
            <div className="reg-divider" />
            <p className="reg-left-desc">
              Handcrafted menus rooted in bold flavour and honest ingredients —
              brought to your most treasured moments.
            </p>
            <ul className="reg-feature-list">
              <li>Custom event menus</li>
              <li>Live catering stations</li>
              <li>Farm-to-table sourcing</li>
              <li>White-glove service</li>
            </ul>
          </div>
        </aside>

        {/* ── Form panel ── */}
        <main className="reg-right">
          <div className="reg-card">

            {/* Logo — image from /public/mutindo.jpeg */}
            <div className="reg-logo">
              <img
                src="/mutindo.jpeg"
                alt="Mutindo Catering logo"
                className="reg-logo-img"
              />
              <div>
                <span className="reg-logo-text">Mutindo</span>
                <span className="reg-logo-sub">Catering &amp; Events</span>
              </div>
            </div>

            <div className="reg-header">
              <h2 className="reg-title">Create your<br /><span>account</span></h2>
              <p className="reg-subtitle">Join our table — it starts here</p>
            </div>

            {error && (
              <div className="reg-error" role="alert">
                <span>⚠</span> {error}
              </div>
            )}

            <form className="reg-form" onSubmit={handleSubmit} noValidate>

              {/* Full Name */}
              <div className="reg-field">
                <label className="reg-field-label" htmlFor="reg-name">Full Name</label>
                <div className="reg-input-wrap">
                  <span className="reg-input-icon">✦</span>
                  <input id="reg-name" className="reg-input" type="text" name="name"
                    value={formData.name} onChange={handleChange}
                    placeholder="Your full name" required autoComplete="name" />
                  <span className="reg-input-bar" />
                </div>
              </div>

              {/* Email */}
              <div className="reg-field">
                <label className="reg-field-label" htmlFor="reg-email">Email Address</label>
                <div className="reg-input-wrap">
                  <span className="reg-input-icon">✉</span>
                  <input id="reg-email" className="reg-input" type="email" name="email"
                    value={formData.email} onChange={handleChange}
                    placeholder="your@email.com" required autoComplete="email" />
                  <span className="reg-input-bar" />
                </div>
              </div>

              {/* Phone */}
              <div className="reg-field">
                <label className="reg-field-label" htmlFor="reg-phone">Phone Number</label>
                <div className="reg-input-wrap">
                  <span className="reg-input-icon">✆</span>
                  <input id="reg-phone" className="reg-input" type="tel" name="phone"
                    value={formData.phone} onChange={handleChange}
                    placeholder="+256 700 000 000" required autoComplete="tel" />
                  <span className="reg-input-bar" />
                </div>
              </div>

              {/* Passwords */}
              <div className="reg-row">
                <div className="reg-field">
                  <label className="reg-field-label" htmlFor="reg-password">Password</label>
                  <div className="reg-input-wrap">
                    <span className="reg-input-icon">◈</span>
                    <input id="reg-password" className="reg-input" type="password" name="password"
                      value={formData.password} onChange={handleChange}
                      placeholder="Create password" required autoComplete="new-password" />
                    <span className="reg-input-bar" />
                  </div>
                </div>
                <div className="reg-field">
                  <label className="reg-field-label" htmlFor="reg-confirm">Confirm</label>
                  <div className="reg-input-wrap">
                    <span className="reg-input-icon">◈</span>
                    <input id="reg-confirm" className="reg-input" type="password" name="confirmPassword"
                      value={formData.confirmPassword} onChange={handleChange}
                      placeholder="Repeat password" required autoComplete="new-password" />
                    <span className="reg-input-bar" />
                  </div>
                </div>
              </div>

              <button className="reg-submit" type="submit" disabled={loading}>
                <span className="reg-submit-inner">
                  {loading && <span className="reg-spinner" />}
                  {loading ? 'Creating your account…' : 'Join Mutindo Catering'}
                </span>
              </button>

            </form>

            <div className="reg-footer">
              <div className="reg-footer-line">or</div>
              <p className="reg-login-link">
                Already have an account? <Link to="/login">Sign in here</Link>
              </p>
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default Register;