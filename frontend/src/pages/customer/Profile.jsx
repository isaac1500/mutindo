import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import api from '../../services/api';
import { toast } from 'react-toastify';


// ─── Icon primitives ──────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"
    strokeLinejoin="round" {...props}>
    <path d={d} />
  </svg>
);
const UserIcon   = p => <Icon {...p} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const LockIcon   = p => <Icon {...p} d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" />;
const BoxIcon    = p => <Icon {...p} d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />;
const StarIcon   = p => <Icon {...p} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
const LogOutIcon = p => <Icon {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />;
const TruckIcon  = p => <Icon {...p} d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />;
const EyeIcon    = p => <Icon {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />;
const EyeOffIcon = p => <Icon {...p} d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />;
const CheckIcon  = p => <Icon {...p} d="M20 6L9 17l-5-5" />;


// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  pending:    { label: 'Pending',    color: '#C8A96E', bg: 'rgba(200,169,110,.13)', border: 'rgba(200,169,110,.25)' },
  confirmed:  { label: 'Confirmed',  color: '#6EC8A9', bg: 'rgba(110,200,169,.13)', border: 'rgba(110,200,169,.25)' },
  preparing:  { label: 'Preparing',  color: '#C8A96E', bg: 'rgba(200,169,110,.10)', border: 'rgba(200,169,110,.20)' },
  ready:      { label: 'Ready',      color: '#A9C86E', bg: 'rgba(169,200,110,.13)', border: 'rgba(169,200,110,.25)' },
  picked_up:  { label: 'Picked Up',  color: '#6EA9C8', bg: 'rgba(110,169,200,.13)', border: 'rgba(110,169,200,.25)' },
  on_the_way: { label: 'On the Way', color: '#C8A96E', bg: 'rgba(200,169,110,.13)', border: 'rgba(200,169,110,.25)' },
  delivered:  { label: 'Delivered',  color: '#C8A96E', bg: 'rgba(200,169,110,.18)', border: 'rgba(200,169,110,.35)' },
  cancelled:  { label: 'Cancelled',  color: '#C86E6E', bg: 'rgba(200,110,110,.13)', border: 'rgba(200,110,110,.25)' },
};


// ─── Global styles ────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Jost:wght@300;400;500;600;700&display=swap');

  :root {
    --gold:          #C8A96E;
    --gold-dim:      #8a7249;
    --gold-glow:     rgba(200,169,110,0.18);
    --gold-pale:     rgba(200,169,110,0.07);
    --obsidian:      #080705;
    --surface:       #0f0d0a;
    --card:          #141009;
    --card-raised:   #1a1510;
    --border:        rgba(200,169,110,0.14);
    --border-hover:  rgba(200,169,110,0.38);
    --text:          #ede8df;
    --text-soft:     #b5a98e;
    --muted:         #6b6254;
    --danger:        #c86e6e;
    --input-bg:      rgba(200,169,110,0.05);
    --accent:        var(--gold);
    --accent-shadow: rgba(200,169,110,0.25);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .dxb-profile {
    font-family: 'Jost', sans-serif;
    font-weight: 300;
    min-height: 100vh;
    background: var(--obsidian);
    color: var(--text);
    padding: 40px 20px 60px;
    position: relative;
    overflow-x: hidden;
  }

  /* ambient radial glow */
  .dxb-profile::before {
    content: '';
    position: fixed;
    top: -15%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(ellipse, rgba(200,169,110,0.04) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }

  .dxb-inner {
    max-width: 1020px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
    animation: dxbFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }

  @keyframes dxbFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes dxbSpin {
    to { transform: rotate(360deg); }
  }

  @keyframes dxbTabIn {
    from { opacity: 0; transform: translateX(8px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* ── Page Header ── */
  .dxb-page-header {
    margin-bottom: 2.5rem;
    padding-bottom: 1.75rem;
    border-bottom: 1px solid var(--border);
  }

  .dxb-eyebrow {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 8px;
  }

  .dxb-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 300;
    color: var(--text);
    letter-spacing: -0.01em;
    line-height: 1.05;
  }

  .dxb-page-title em {
    font-style: italic;
    color: var(--gold);
  }

  .dxb-ornament {
    width: 48px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin: 10px 0;
  }

  /* ── Layout Grid ── */
  .dxb-grid {
    display: grid;
    grid-template-columns: 270px 1fr;
    gap: 20px;
    align-items: start;
  }

  @media (max-width: 740px) {
    .dxb-grid { grid-template-columns: 1fr; }
  }

  /* ── Cards ── */
  .dxb-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    transition: border-color 0.3s ease;
  }

  .dxb-card:hover {
    border-color: rgba(200,169,110,0.22);
  }

  /* ── Avatar Card ── */
  .dxb-avatar-card {
    padding: 32px 20px 24px;
    text-align: center;
  }

  .dxb-avatar {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    margin: 0 auto 16px;
    background: linear-gradient(135deg, #C8A96E 0%, #8a6830 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem;
    font-weight: 600;
    color: var(--obsidian);
    box-shadow: 0 0 0 3px rgba(200,169,110,0.15), 0 0 24px rgba(200,169,110,0.12);
  }

  .dxb-avatar-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.01em;
    margin-bottom: 3px;
  }

  .dxb-avatar-email {
    font-size: 12px;
    color: var(--muted);
    letter-spacing: 0.02em;
    margin-bottom: 12px;
  }

  .dxb-role-badge {
    display: inline-block;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 20px;
    background: var(--gold-pale);
    border: 1px solid var(--border);
    color: var(--gold);
  }

  .dxb-loyalty {
    margin-top: 14px;
    padding: 10px 14px;
    border-radius: 10px;
    background: rgba(200,169,110,0.07);
    border: 1px solid rgba(200,169,110,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 600;
    color: var(--gold);
  }

  /* ── Nav Card ── */
  .dxb-nav-card {
    padding: 8px;
  }

  .dxb-nav-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: 'Jost', sans-serif;
    font-weight: 500;
    font-size: 13px;
    letter-spacing: 0.03em;
    text-align: left;
    transition: all 0.18s ease;
    background: transparent;
    color: var(--muted);
    margin-bottom: 2px;
  }

  .dxb-nav-btn.active {
    background: var(--gold-pale);
    color: var(--gold);
    border: 1px solid var(--border);
  }

  .dxb-nav-btn:not(.active):hover {
    background: rgba(255,255,255,0.03);
    color: var(--text-soft);
  }

  .dxb-nav-dot {
    margin-left: auto;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--gold);
  }

  .dxb-nav-divider {
    height: 1px;
    background: var(--border);
    margin: 6px 0;
  }

  .dxb-signout-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: 'Jost', sans-serif;
    font-weight: 500;
    font-size: 13px;
    background: transparent;
    color: var(--danger);
    transition: background 0.18s ease;
  }

  .dxb-signout-btn:hover {
    background: rgba(200,110,110,0.08);
  }

  /* ── Main Panel ── */
  .dxb-main-card {
    padding: 28px 30px;
  }

  .dxb-panel-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }

  .dxb-panel-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.01em;
  }

  .dxb-tab-content {
    animation: dxbTabIn 0.3s ease both;
  }

  /* ── Form Fields ── */
  .dxb-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .dxb-field + .dxb-field {
    margin-top: 18px;
  }

  .dxb-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .dxb-helper {
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.02em;
  }

  .dxb-input-wrap {
    position: relative;
  }

  .dxb-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    pointer-events: none;
    display: flex;
  }

  .dxb-input {
    width: 100%;
    padding: 12px 14px 12px 42px;
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: 'Jost', sans-serif;
    font-size: 14px;
    font-weight: 400;
    outline: none;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .dxb-input.no-icon { padding-left: 14px; }

  .dxb-input::placeholder { color: var(--muted); opacity: 0.6; }

  .dxb-input:focus {
    border-color: var(--gold);
    background: rgba(200,169,110,0.08);
  }

  .dxb-input:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .dxb-input-right {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
  }

  .dxb-eye-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--muted);
    padding: 0;
    display: flex;
    align-items: center;
    transition: color 0.15s;
  }

  .dxb-eye-btn:hover { color: var(--gold); }

  /* ── Strength bar ── */
  .dxb-strength-bars {
    display: flex;
    gap: 4px;
    margin-top: 8px;
    margin-bottom: 4px;
  }

  .dxb-strength-bar {
    flex: 1;
    height: 3px;
    border-radius: 2px;
    transition: background 0.3s ease;
  }

  .dxb-strength-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
  }

  /* ── Buttons ── */
  .dxb-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: none;
    border-radius: 10px;
    font-family: 'Jost', sans-serif;
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.22s ease;
    outline: none;
  }

  .dxb-btn-md { padding: 12px 26px; }
  .dxb-btn-sm { padding: 8px 16px; font-size: 11px; }

  .dxb-btn-gold {
    background: linear-gradient(135deg, #C8A96E, #9a7a3f);
    color: var(--obsidian);
    box-shadow: 0 4px 16px rgba(200,169,110,0.22);
  }

  .dxb-btn-gold:hover {
    box-shadow: 0 6px 24px rgba(200,169,110,0.35);
    transform: translateY(-1px);
  }

  .dxb-btn-ghost {
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
  }

  .dxb-btn-ghost:hover {
    border-color: var(--gold);
    color: var(--gold);
    background: var(--gold-pale);
  }

  .dxb-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  /* ── Order rows ── */
  .dxb-order-row {
    padding: 16px 18px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.015);
    transition: border-color 0.2s ease, background 0.2s ease;
    margin-bottom: 10px;
  }

  .dxb-order-row:hover {
    border-color: var(--border-hover);
    background: var(--gold-pale);
  }

  .dxb-order-id {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.03em;
  }

  .dxb-order-id em { font-style: italic; color: var(--gold); }

  .dxb-order-date {
    font-size: 11px;
    color: var(--muted);
    margin-top: 2px;
    letter-spacing: 0.04em;
  }

  .dxb-status-pill {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
  }

  .dxb-order-total {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--gold);
    letter-spacing: -0.01em;
  }

  .dxb-show-more {
    width: 100%;
    padding: 11px;
    border-radius: 10px;
    border: 1px dashed var(--border);
    background: none;
    cursor: pointer;
    color: var(--muted);
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: all 0.2s ease;
    margin-top: 4px;
  }

  .dxb-show-more:hover {
    border-color: var(--gold);
    color: var(--gold);
    background: var(--gold-pale);
  }

  /* ── Empty / Loading ── */
  .dxb-empty {
    text-align: center;
    padding: 52px 24px;
    color: var(--muted);
  }

  .dxb-empty p.title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-soft);
    margin: 12px 0 6px;
  }

  .dxb-empty p.sub {
    font-size: 13px;
    margin-bottom: 20px;
    letter-spacing: 0.03em;
  }

  .dxb-spinner {
    animation: dxbSpin 0.8s linear infinite;
    color: var(--gold);
  }

  /* ── Save row ── */
  .dxb-save-row {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }

  /* Sidebar stack */
  .dxb-sidebar { display: flex; flex-direction: column; gap: 14px; }
`;


// ─── Sub-components ───────────────────────────────────────────────────────────

const DxbSpinner = ({ size = 20 }) => (
  <svg className="dxb-spinner" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth={2.2}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const StatusPill = ({ status }) => {
  const cfg = STATUS[status] || { label: status, color: '#6b6254', bg: 'rgba(107,98,84,.12)', border: 'rgba(107,98,84,.2)' };
  return (
    <span className="dxb-status-pill"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
};

const Field = ({ label, helper, children }) => (
  <div className="dxb-field">
    <span className="dxb-label">{label}</span>
    {children}
    {helper && <span className="dxb-helper">{helper}</span>}
  </div>
);

const DxbInput = ({ icon: IconComp, right, disabled, className = '', ...props }) => (
  <div className="dxb-input-wrap">
    {IconComp && (
      <span className="dxb-input-icon"><IconComp size={15} /></span>
    )}
    <input
      {...props}
      disabled={disabled}
      className={`dxb-input ${!IconComp ? 'no-icon' : ''} ${className}`}
      style={{ paddingRight: right ? 44 : 14, ...(props.style || {}) }}
    />
    {right && <span className="dxb-input-right">{right}</span>}
  </div>
);

const DxbBtn = ({ children, variant = 'gold', size = 'md', loading, ...p }) => (
  <button
    className={`dxb-btn dxb-btn-${variant} dxb-btn-${size}`}
    disabled={loading || p.disabled}
    {...p}
  >
    {loading ? <DxbSpinner size={14} /> : children}
  </button>
);


// ─── Tab: Profile ─────────────────────────────────────────────────────────────
const ProfileTab = ({ user, updateProfile }) => {
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '' });
  const [loading, setLoading] = useState(false);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      <Field label="Full Name">
        <DxbInput icon={UserIcon} name="name" value={form.name} onChange={set} required placeholder="Your full name" />
      </Field>
      <Field label="Email Address" helper="Email address cannot be changed.">
        <DxbInput name="email" value={form.email} disabled />
      </Field>
      <Field label="Phone Number">
        <DxbInput icon={UserIcon} name="phone" value={form.phone} onChange={set} required placeholder="+971 50 000 0000" />
      </Field>
      <div className="dxb-save-row">
        <DxbBtn type="submit" loading={loading}>
          {!loading && <CheckIcon size={14} />} Save Changes
        </DxbBtn>
      </div>
    </form>
  );
};


// ─── Tab: Password ────────────────────────────────────────────────────────────
const PasswordTab = ({ changePassword }) => {
  const [form, setForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [show, setShow]   = useState({ current: false, new: false, confirm: false });

  const set    = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const toggle = key => setShow(s => ({ ...s, [key]: !s[key] }));

  const strength = pw => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)          s++;
    if (/[A-Z]/.test(pw))        s++;
    if (/[0-9]/.test(pw))        s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return s;
  };
  const str      = strength(form.newPassword);
  const strColor = ['#c86e6e','#C8A96E','#6EA9C8','#6EC8A9'][str - 1] || 'var(--border)';
  const strLabel = ['','Weak','Fair','Good','Strong'][str];

  const submit = async e => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.newPassword.length < 6)               return toast.error('Minimum 6 characters');
    setLoading(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  const eyeBtn = key => (
    <button type="button" className="dxb-eye-btn" onClick={() => toggle(key)}>
      {show[key] ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
    </button>
  );

  return (
    <form onSubmit={submit}>
      <Field label="Current Password">
        <DxbInput icon={LockIcon} name="currentPassword"
          type={show.current ? 'text' : 'password'}
          value={form.currentPassword} onChange={set} required right={eyeBtn('current')} />
      </Field>
      <Field label="New Password">
        <DxbInput icon={LockIcon} name="newPassword"
          type={show.new ? 'text' : 'password'}
          value={form.newPassword} onChange={set} required placeholder="Min. 6 characters" right={eyeBtn('new')} />
        {form.newPassword && (
          <div>
            <div className="dxb-strength-bars">
              {[1,2,3,4].map(i => (
                <div key={i} className="dxb-strength-bar"
                  style={{ background: i <= str ? strColor : 'var(--border)' }} />
              ))}
            </div>
            <span className="dxb-strength-label" style={{ color: strColor }}>{strLabel}</span>
          </div>
        )}
      </Field>
      <Field label="Confirm New Password">
        <DxbInput icon={LockIcon} name="confirmPassword"
          type={show.confirm ? 'text' : 'password'}
          value={form.confirmPassword} onChange={set} required right={eyeBtn('confirm')} />
      </Field>
      <div className="dxb-save-row">
        <DxbBtn type="submit" loading={loading}>
          {!loading && <LockIcon size={14} />} Update Password
        </DxbBtn>
      </div>
    </form>
  );
};


// ─── Tab: Orders ──────────────────────────────────────────────────────────────
const OrdersTab = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.orders || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 52 }}>
      <DxbSpinner size={28} />
    </div>
  );

  if (!orders.length) return (
    <div className="dxb-empty">
      <BoxIcon size={36} style={{ opacity: 0.3 }} />
      <p className="title">No orders yet</p>
      <p className="sub">Your culinary history will appear here.</p>
      <DxbBtn size="sm" onClick={() => window.location.href = '/menu'}>
        Explore the Menu
      </DxbBtn>
    </div>
  );

  const visible = showAll ? orders : orders.slice(0, 5);

  return (
    <div>
      {visible.map(order => (
        <div key={order.id} className="dxb-order-row">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div>
              <div className="dxb-order-id">
                Order <em>#{order.id?.slice(0, 8).toUpperCase()}</em>
              </div>
              <div className="dxb-order-date">
                {new Date(order.createdAt).toLocaleDateString('en-AE', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
            </div>
            <StatusPill status={order.status} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <span className="dxb-order-total">{formatCurrency(order.total)}</span>
            <DxbBtn variant="ghost" size="sm"
              onClick={() => window.location.href = `/tracking/${order.id}`}>
              <TruckIcon size={12} /> Track Order
            </DxbBtn>
          </div>
        </div>
      ))}

      {orders.length > 5 && (
        <button className="dxb-show-more" onClick={() => setShowAll(v => !v)}>
          {showAll ? 'Show Less' : `View All Orders (${orders.length})`}
        </button>
      )}
    </div>
  );
};


// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { key: 'profile',  label: 'Profile',  icon: UserIcon },
  { key: 'password', label: 'Security', icon: LockIcon },
  { key: 'orders',   label: 'Orders',   icon: BoxIcon  },
];


// ─── Main Profile ─────────────────────────────────────────────────────────────
const Profile = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <>
      <style>{STYLES}</style>

      <div className="dxb-profile">
        <div className="dxb-inner">

          {/* Page Header */}
          <div className="dxb-page-header">
            <p className="dxb-eyebrow">Mutindo catering Services · My Account</p>
            <div className="dxb-ornament" />
            <h1 className="dxb-page-title">Your <em>Profile</em></h1>
          </div>

          <div className="dxb-grid">

            {/* ── Sidebar ── */}
            <div className="dxb-sidebar">

              {/* Avatar Card */}
              <div className="dxb-card">
                <div className="dxb-avatar-card">
                  <div className="dxb-avatar">
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="dxb-avatar-name">{user?.name}</div>
                  <div className="dxb-avatar-email">{user?.email}</div>
                  <span className="dxb-role-badge">{user?.role || 'Guest'}</span>

                  {user?.loyaltyPoints > 0 && (
                    <div className="dxb-loyalty">
                      <StarIcon size={13} />
                      {user.loyaltyPoints.toLocaleString()} pts
                    </div>
                  )}
                </div>
              </div>

              {/* Nav Card */}
              <div className="dxb-card">
                <div className="dxb-nav-card">
                  {TABS.map(tab => {
                    const active = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        className={`dxb-nav-btn ${active ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        <tab.icon size={15} />
                        {tab.label}
                        {active && <span className="dxb-nav-dot" />}
                      </button>
                    );
                  })}

                  <div className="dxb-nav-divider" />

                  <button className="dxb-signout-btn" onClick={logout}>
                    <LogOutIcon size={15} /> Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* ── Main Panel ── */}
            <div className="dxb-card">
              <div className="dxb-main-card">

                {/* Panel Header */}
                <div className="dxb-panel-header">
                  {React.createElement(
                    TABS.find(t => t.key === activeTab).icon,
                    { size: 17, style: { color: 'var(--gold)' } }
                  )}
                  <h2 className="dxb-panel-title">
                    {TABS.find(t => t.key === activeTab)?.label}
                  </h2>
                </div>

                {/* Tab Content */}
                <div className="dxb-tab-content" key={activeTab}>
                  {activeTab === 'profile'  && <ProfileTab user={user} updateProfile={updateProfile} />}
                  {activeTab === 'password' && <PasswordTab changePassword={changePassword} />}
                  {activeTab === 'orders'   && <OrdersTab />}
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;