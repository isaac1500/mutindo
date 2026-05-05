import React, { useState, useEffect } from 'react';
import {
  FaEye, FaCheck, FaTimes, FaEnvelope, FaCalendarAlt,
  FaUsers, FaMoneyBillWave, FaPhone, FaSyncAlt, FaChevronRight,
  FaClock, FaMapMarkerAlt, FaFileInvoiceDollar
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';

/* ─── Styles ────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg:         #0f0f0f;
    --surface:    #181818;
    --surface2:   #212121;
    --surface3:   #2a2a2a;
    --border:     #2e2e2e;
    --gold:       #c9a84c;
    --gold-dim:   #8a6d2a;
    --gold-glow:  rgba(201,168,76,0.12);
    --text:       #f0ece4;
    --text-dim:   #7a7468;
    --text-mid:   #b0a898;
    --red:        #e05252;
    --green:      #4caf82;
    --amber:      #e09a3a;
    --blue:       #5b8dee;
    --teal:       #38b2a0;
    --radius:     12px;
    --radius-sm:  8px;
    --transition: 0.2s cubic-bezier(0.4,0,0.2,1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .cb-root {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    padding: 32px 40px;
  }

  /* ─── Header ─── */
  .cb-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
    padding-bottom: 28px;
    margin-bottom: 32px;
  }
  .cb-eyebrow {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 500;
    margin-bottom: 6px;
  }
  .cb-title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .cb-subtitle { color: var(--text-dim); font-size: 13px; margin-top: 4px; }

  .cb-header-right { display: flex; align-items: center; gap: 16px; }

  /* ─── Stat Strips ─── */
  .cb-stats {
    display: flex;
    gap: 12px;
  }
  .cb-stat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 10px 18px;
    text-align: center;
    min-width: 86px;
  }
  .cb-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    line-height: 1;
  }
  .cb-stat-label {
    font-size: 10px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 3px;
  }

  /* ─── Pipeline / Filter Row ─── */
  .cb-pipeline {
    display: flex;
    gap: 0;
    margin-bottom: 28px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .cb-pipe-btn {
    flex: 1;
    padding: 12px 8px;
    background: transparent;
    border: none;
    border-right: 1px solid var(--border);
    color: var(--text-dim);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    transition: all var(--transition);
  }
  .cb-pipe-btn:last-child { border-right: none; }
  .cb-pipe-btn:hover { background: var(--surface2); color: var(--text); }
  .cb-pipe-btn.active { background: var(--surface2); color: var(--text); }
  .cb-pipe-btn.active .cb-pipe-dot { box-shadow: 0 0 6px currentColor; }
  .cb-pipe-label { text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; }
  .cb-pipe-count {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    line-height: 1;
  }
  .cb-pipe-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    margin-top: 2px;
  }

  /* ─── Layout: List + Detail Panel ─── */
  .cb-layout {
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 24px;
    align-items: start;
  }
  .cb-layout.no-panel {
    grid-template-columns: 1fr;
  }

  /* ─── Booking List ─── */
  .cb-list { display: flex; flex-direction: column; gap: 12px; }

  .cb-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    cursor: pointer;
    transition: all var(--transition);
    display: flex;
    position: relative;
  }
  .cb-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    border-radius: 3px 0 0 3px;
  }
  .cb-card:hover { border-color: var(--gold-dim); transform: translateX(2px); }
  .cb-card.active { border-color: var(--gold-dim); background: var(--surface2); }

  .cb-card-inner {
    padding: 18px 20px 18px 26px;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .cb-card-main { flex: 1; min-width: 0; }
  .cb-card-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }
  .cb-card-name {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cb-status-pill {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border-radius: 100px;
    padding: 3px 9px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .cb-card-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    color: var(--text-dim);
    font-size: 12px;
  }
  .cb-meta-item { display: flex; align-items: center; gap: 5px; }

  .cb-card-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }
  .cb-card-budget {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    color: var(--gold);
  }
  .cb-card-pkg {
    font-size: 11px;
    color: var(--text-dim);
    text-align: right;
  }
  .cb-card-arrow { color: var(--text-dim); font-size: 11px; margin-top: 4px; }

  /* ─── Detail Panel ─── */
  .cb-panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    position: sticky;
    top: 24px;
    animation: panelIn 0.22s cubic-bezier(0.4,0,0.2,1);
  }
  @keyframes panelIn {
    from { opacity: 0; transform: translateX(12px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .cb-panel-head {
    padding: 22px 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .cb-panel-name {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    line-height: 1.2;
  }
  .cb-panel-close {
    width: 30px; height: 30px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-dim);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
    transition: all var(--transition);
  }
  .cb-panel-close:hover { border-color: var(--red); color: var(--red); }

  .cb-panel-body { padding: 24px; display: flex; flex-direction: column; gap: 22px; }

  .cb-section-title {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gold-dim);
    margin-bottom: 10px;
  }
  .cb-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .cb-info-item {}
  .cb-info-label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 3px; }
  .cb-info-value { font-size: 13px; color: var(--text); font-weight: 500; }
  .cb-info-value.highlight { color: var(--gold); font-family: 'Playfair Display', serif; font-size: 16px; }
  .cb-info-full { grid-column: 1 / -1; }

  .cb-special-box {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    font-size: 13px;
    color: var(--text-mid);
    line-height: 1.6;
  }

  /* ─── Panel Actions ─── */
  .cb-panel-actions {
    padding: 20px 24px;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .cb-action-row { display: flex; gap: 8px; }

  /* ─── Quote Form ─── */
  .cb-quote-form {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: panelIn 0.18s ease;
  }
  .cb-quote-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--gold);
  }

  /* ─── Buttons ─── */
  .cb-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    padding: 9px 16px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all var(--transition);
    display: flex; align-items: center; gap: 6px;
    white-space: nowrap;
  }
  .cb-btn.primary { background: var(--gold); color: #0f0f0f; border-color: var(--gold); }
  .cb-btn.primary:hover { background: #e0bc5e; }
  .cb-btn.primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .cb-btn.success { background: rgba(76,175,130,0.12); color: var(--green); border-color: var(--green); }
  .cb-btn.success:hover { background: rgba(76,175,130,0.22); }
  .cb-btn.danger  { background: rgba(224,82,82,0.1);  color: var(--red);   border-color: var(--red); }
  .cb-btn.danger:hover  { background: rgba(224,82,82,0.2); }
  .cb-btn.ghost   { background: transparent; color: var(--text-mid); border-color: var(--border); }
  .cb-btn.ghost:hover { border-color: var(--text-mid); color: var(--text); }
  .cb-btn.full    { width: 100%; justify-content: center; }
  .cb-btn.icon-only { padding: 9px 10px; }

  /* ─── Inputs ─── */
  .cb-input, .cb-textarea {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    padding: 9px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    outline: none;
    width: 100%;
    transition: border-color var(--transition);
  }
  .cb-input:focus, .cb-textarea:focus { border-color: var(--gold-dim); box-shadow: 0 0 0 3px var(--gold-glow); }
  .cb-input::placeholder, .cb-textarea::placeholder { color: var(--text-dim); }
  .cb-textarea { resize: vertical; min-height: 70px; }
  .cb-field { display: flex; flex-direction: column; gap: 5px; }
  .cb-field label { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-dim); }

  /* ─── Refresh Button ─── */
  .cb-refresh {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-dim);
    padding: 9px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    transition: all var(--transition);
  }
  .cb-refresh:hover { border-color: var(--gold-dim); color: var(--gold); }
  .cb-refresh.spinning svg { animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ─── Empty State ─── */
  .cb-empty {
    text-align: center;
    padding: 80px 20px;
    color: var(--text-dim);
  }
  .cb-empty-icon { font-size: 52px; opacity: 0.12; margin-bottom: 16px; }
  .cb-empty h3 { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--text-mid); margin-bottom: 8px; }
  .cb-empty p { font-size: 13px; }

  /* ─── Loading ─── */
  .cb-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 60vh; gap: 16px; color: var(--text-dim);
  }
  .cb-spinner {
    width: 36px; height: 36px;
    border: 2px solid var(--border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  /* Scrollbar */
  .cb-panel-body::-webkit-scrollbar { width: 4px; }
  .cb-panel-body::-webkit-scrollbar-track { background: transparent; }
  .cb-panel-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
`;

/* ─── Constants ─────────────────────────────────────────────────────────── */
const STATUSES = [
  { key: 'all',       label: 'All',       color: 'var(--text-mid)' },
  { key: 'pending',   label: 'Pending',   color: 'var(--amber)'    },
  { key: 'quoted',    label: 'Quoted',    color: 'var(--blue)'     },
  { key: 'confirmed', label: 'Confirmed', color: 'var(--green)'    },
  { key: 'completed', label: 'Completed', color: 'var(--teal)'     },
  { key: 'cancelled', label: 'Cancelled', color: 'var(--red)'      },
];

const PACKAGES = {
  1: 'Basic Package',
  2: 'Standard Package',
  3: 'Premium Package',
  4: 'Wedding Special',
};

const statusColor = (s) => ({
  pending:   'var(--amber)',
  quoted:    'var(--blue)',
  confirmed: 'var(--green)',
  completed: 'var(--teal)',
  cancelled: 'var(--red)',
}[s] || 'var(--text-dim)');

const statusBg = (s) => ({
  pending:   'rgba(224,154,58,0.12)',
  quoted:    'rgba(91,141,238,0.12)',
  confirmed: 'rgba(76,175,130,0.12)',
  completed: 'rgba(56,178,160,0.12)',
  cancelled: 'rgba(224,82,82,0.12)',
}[s] || 'rgba(255,255,255,0.06)');

/* ─── Component ──────────────────────────────────────────────────────────── */
const CateringBookings = () => {
  const [bookings,     setBookings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [filter,       setFilter]       = useState('all');
  const [selected,     setSelected]     = useState(null);   // booking object
  const [showQuote,    setShowQuote]    = useState(false);
  const [quoteAmount,  setQuoteAmount]  = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [updating,     setUpdating]     = useState(false);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async (soft = false) => {
    try {
      soft ? setRefreshing(true) : setLoading(true);
      const res = await api.get('/catering/admin/bookings');
      setBookings(res.data.bookings || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    setUpdating(true);
    try {
      await api.put(`/catering/admin/bookings/${bookingId}/status`, { status });
      toast.success(`Booking ${status}`);
      // Update in place
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      if (selected?.id === bookingId) setSelected(s => ({ ...s, status }));
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendQuote = async () => {
    if (!quoteAmount) { toast.error('Enter a quote amount'); return; }
    setUpdating(true);
    try {
      await api.post(`/catering/admin/bookings/${selected.id}/quote`, {
        amount: parseFloat(quoteAmount),
        message: quoteMessage,
      });
      toast.success('Quote sent!');
      setShowQuote(false); setQuoteAmount(''); setQuoteMessage('');
      handleUpdateStatus(selected.id, 'quoted');
    } catch {
      toast.error('Failed to send quote');
    } finally {
      setUpdating(false);
    }
  };

  /* ─── Derived ─── */
  const filtered = bookings.filter(b => filter === 'all' || b.status === filter);
  const countBy  = (k) => bookings.filter(b => b.status === k).length;

  /* ─── Render ─── */
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="cb-root">
        <div className="cb-loading">
          <div className="cb-spinner" />
          <span>Fetching catering requests…</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="cb-root">

        {/* ── Header ── */}
        <div className="cb-header">
          <div>
            <div className="cb-eyebrow">Event Operations</div>
            <h1 className="cb-title">Catering Bookings</h1>
            <p className="cb-subtitle">Mutindo Catering Services · Outside Catering Requests</p>
          </div>
          <div className="cb-header-right">
            <div className="cb-stats">
              <div className="cb-stat">
                <div className="cb-stat-num" style={{ color: 'var(--gold)' }}>{bookings.length}</div>
                <div className="cb-stat-label">Total</div>
              </div>
              <div className="cb-stat">
                <div className="cb-stat-num" style={{ color: 'var(--amber)' }}>{countBy('pending')}</div>
                <div className="cb-stat-label">Pending</div>
              </div>
              <div className="cb-stat">
                <div className="cb-stat-num" style={{ color: 'var(--green)' }}>{countBy('confirmed')}</div>
                <div className="cb-stat-label">Confirmed</div>
              </div>
            </div>
            <button
              className={`cb-refresh ${refreshing ? 'spinning' : ''}`}
              onClick={() => fetchBookings(true)}
            >
              <FaSyncAlt size={11} /> Refresh
            </button>
          </div>
        </div>

        {/* ── Status Pipeline ── */}
        <div className="cb-pipeline">
          {STATUSES.map(s => (
            <button
              key={s.key}
              className={`cb-pipe-btn ${filter === s.key ? 'active' : ''}`}
              style={{ color: filter === s.key ? s.color : undefined }}
              onClick={() => setFilter(s.key)}
            >
              <span className="cb-pipe-count">
                {s.key === 'all' ? bookings.length : countBy(s.key)}
              </span>
              <span className="cb-pipe-label">{s.label}</span>
              <div className="cb-pipe-dot" style={{ background: s.color, opacity: filter === s.key ? 1 : 0.3 }} />
            </button>
          ))}
        </div>

        {/* ── Main Layout ── */}
        <div className={`cb-layout ${!selected ? 'no-panel' : ''}`}>

          {/* Booking List */}
          <div>
            {filtered.length === 0 ? (
              <div className="cb-empty">
                <div className="cb-empty-icon">📋</div>
                <h3>No bookings here</h3>
                <p>{filter === 'all' ? 'Catering requests will appear here once submitted.' : `No ${filter} bookings at the moment.`}</p>
              </div>
            ) : (
              <div className="cb-list">
                {filtered.map((b, i) => (
                  <div
                    key={b.id}
                    className={`cb-card ${selected?.id === b.id ? 'active' : ''}`}
                    style={{ '--accent': statusColor(b.status), animationDelay: `${i * 40}ms` }}
                    onClick={() => { setSelected(b); setShowQuote(false); }}
                  >
                    {/* Status stripe */}
                    <div style={{ width: 3, background: statusColor(b.status), flexShrink: 0 }} />

                    <div className="cb-card-inner">
                      <div className="cb-card-main">
                        <div className="cb-card-top">
                          <span className="cb-card-name">{b.customerName}</span>
                          <span
                            className="cb-status-pill"
                            style={{ color: statusColor(b.status), background: statusBg(b.status) }}
                          >
                            {b.status}
                          </span>
                        </div>
                        <div className="cb-card-meta">
                          <span className="cb-meta-item">
                            <FaCalendarAlt size={10} /> {formatDate(b.eventDate)}
                          </span>
                          <span className="cb-meta-item">
                            <FaUsers size={10} /> {b.guestCount} guests
                          </span>
                          {b.eventType && (
                            <span className="cb-meta-item">
                              <FaMapMarkerAlt size={10} /> {b.eventType}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="cb-card-right">
                        {b.budget && (
                          <span className="cb-card-budget">{formatCurrency(b.budget)}</span>
                        )}
                        <span className="cb-card-pkg">{PACKAGES[b.packageId] || 'Custom'}</span>
                        <FaChevronRight className="cb-card-arrow" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Detail Panel ── */}
          {selected && (
            <div className="cb-panel">
              <div className="cb-panel-head">
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: statusColor(selected.status), marginBottom: 6 }}>
                    {selected.status}
                  </div>
                  <div className="cb-panel-name">{selected.customerName}</div>
                </div>
                <button className="cb-panel-close" onClick={() => { setSelected(null); setShowQuote(false); }}>
                  <FaTimes />
                </button>
              </div>

              <div className="cb-panel-body" style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>

                {/* Contact */}
                <div>
                  <div className="cb-section-title">Contact</div>
                  <div className="cb-info-grid">
                    <div className="cb-info-item">
                      <div className="cb-info-label">Phone</div>
                      <div className="cb-info-value">{selected.phone || '—'}</div>
                    </div>
                    <div className="cb-info-item">
                      <div className="cb-info-label">Email</div>
                      <div className="cb-info-value" style={{ fontSize: 12, wordBreak: 'break-all' }}>{selected.email || '—'}</div>
                    </div>
                  </div>
                </div>

                {/* Event */}
                <div>
                  <div className="cb-section-title">Event Details</div>
                  <div className="cb-info-grid">
                    <div className="cb-info-item">
                      <div className="cb-info-label">Date</div>
                      <div className="cb-info-value">{formatDate(selected.eventDate)}</div>
                    </div>
                    <div className="cb-info-item">
                      <div className="cb-info-label">Time</div>
                      <div className="cb-info-value">{selected.eventTime || '—'}</div>
                    </div>
                    <div className="cb-info-item">
                      <div className="cb-info-label">Event Type</div>
                      <div className="cb-info-value">{selected.eventType || '—'}</div>
                    </div>
                    <div className="cb-info-item">
                      <div className="cb-info-label">Guests</div>
                      <div className="cb-info-value">{selected.guestCount}</div>
                    </div>
                    <div className="cb-info-item">
                      <div className="cb-info-label">Package</div>
                      <div className="cb-info-value">{PACKAGES[selected.packageId] || 'Custom'}</div>
                    </div>
                    <div className="cb-info-item">
                      <div className="cb-info-label">Budget</div>
                      <div className="cb-info-value highlight">{selected.budget ? formatCurrency(selected.budget) : '—'}</div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {selected.specialRequests && (
                  <div>
                    <div className="cb-section-title">Special Requests</div>
                    <div className="cb-special-box">{selected.specialRequests}</div>
                  </div>
                )}

                {/* Quote Form (inline) */}
                {showQuote && (
                  <div className="cb-quote-form">
                    <div className="cb-quote-title">📄 Send a Quote</div>
                    <div className="cb-field">
                      <label>Quote Amount (UGX)</label>
                      <input
                        className="cb-input"
                        type="number"
                        placeholder="e.g. 1500000"
                        value={quoteAmount}
                        onChange={e => setQuoteAmount(e.target.value)}
                      />
                    </div>
                    <div className="cb-field">
                      <label>Message (Optional)</label>
                      <textarea
                        className="cb-textarea"
                        placeholder="Any notes for the customer…"
                        value={quoteMessage}
                        onChange={e => setQuoteMessage(e.target.value)}
                      />
                    </div>
                    <div className="cb-action-row">
                      <button className="cb-btn ghost" onClick={() => setShowQuote(false)}>Cancel</button>
                      <button className="cb-btn primary" style={{ flex: 1 }} onClick={handleSendQuote} disabled={updating}>
                        {updating ? 'Sending…' : <><FaEnvelope size={10} /> Send Quote</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="cb-panel-actions">
                {selected.status === 'pending' && !showQuote && (
                  <div className="cb-action-row">
                    <button className="cb-btn primary full" onClick={() => setShowQuote(true)}>
                      <FaFileInvoiceDollar size={11} /> Send Quote
                    </button>
                    <button className="cb-btn danger" onClick={() => handleUpdateStatus(selected.id, 'cancelled')} disabled={updating}>
                      <FaTimes size={10} /> Decline
                    </button>
                  </div>
                )}
                {selected.status === 'quoted' && (
                  <button
                    className="cb-btn success full"
                    onClick={() => handleUpdateStatus(selected.id, 'confirmed')}
                    disabled={updating}
                  >
                    <FaCheck size={10} /> Confirm Booking
                  </button>
                )}
                {selected.status === 'confirmed' && (
                  <button
                    className="cb-btn ghost full"
                    onClick={() => handleUpdateStatus(selected.id, 'completed')}
                    disabled={updating}
                  >
                    <FaCheck size={10} /> Mark as Completed
                  </button>
                )}
                {(selected.status === 'cancelled' || selected.status === 'completed') && (
                  <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 12 }}>
                    This booking is {selected.status}. No further actions available.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CateringBookings;