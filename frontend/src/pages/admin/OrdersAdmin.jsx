import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import api from '../../services/api';
import { toast } from 'react-toastify';

/* ─────────────────────────────────────────────────────────────
   Inline styles — no extra CSS file needed.
   Uses Google Fonts loaded via a <link> injected once on mount.
───────────────────────────────────────────────────────────── */

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap';

const STATUS_OPTIONS = [
  { value: 'pending',    label: 'Pending' },
  { value: 'confirmed',  label: 'Confirmed' },
  { value: 'preparing',  label: 'Preparing' },
  { value: 'ready',      label: 'Ready' },
  { value: 'picked_up',  label: 'Picked Up' },
  { value: 'on_the_way', label: 'On The Way' },
  { value: 'delivered',  label: 'Delivered' },
  { value: 'cancelled',  label: 'Cancelled' },
];

const FILTER_OPTIONS = [
  { value: 'all',        label: 'All' },
  { value: 'pending',    label: 'Pending' },
  { value: 'preparing',  label: 'Preparing' },
  { value: 'ready',      label: 'Ready' },
  { value: 'on_the_way', label: 'On The Way' },
  { value: 'delivered',  label: 'Delivered' },
  { value: 'cancelled',  label: 'Cancelled' },
];

/* status → { bg, border, color } */
const BADGE_STYLES = {
  pending:    { bg: '#2a1f0a', border: '#5a3a10', color: '#d48a30' },
  confirmed:  { bg: '#0a1a2a', border: '#10365a', color: '#3a90d4' },
  preparing:  { bg: '#1a0a2a', border: '#3a1060', color: '#9a50e4' },
  ready:      { bg: '#0a2a1a', border: '#105a30', color: '#30d470' },
  picked_up:  { bg: '#1a1a0a', border: '#3a3a10', color: '#a0a030' },
  on_the_way: { bg: '#2a1a0a', border: '#5a3010', color: '#d47030' },
  delivered:  { bg: '#0e1f0e', border: '#1e4a1e', color: '#5a9a5a' },
  cancelled:  { bg: '#2a0a0a', border: '#5a1010', color: '#d43030' },
};

/* pulse animation injected once */
const KEYFRAMES = `
  @keyframes oa-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.25; }
  }
  @keyframes oa-fadein {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

function injectStyles() {
  if (document.getElementById('oa-styles')) return;
  const tag = document.createElement('style');
  tag.id = 'oa-styles';
  tag.textContent = KEYFRAMES;
  document.head.appendChild(tag);

  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = FONT_URL;
  document.head.appendChild(font);
}

/* ─── tiny helpers ───────────────────────────────────────── */

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1)  return 'just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`;
}

function liveTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

/* ─── sub-components ─────────────────────────────────────── */

function StatusBadge({ status }) {
  const s = BADGE_STYLES[status] || BADGE_STYLES.pending;
  const pulse = ['preparing', 'on_the_way'].includes(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 4,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0,
        animation: pulse ? 'oa-pulse 1s ease-in-out infinite' : 'none',
      }} />
      {STATUS_OPTIONS.find(o => o.value === status)?.label ?? status}
    </span>
  );
}

function StatCard({ label, value, accentColor, sub }) {
  return (
    <div style={{
      background: '#161210', border: '1px solid #2a2218', borderRadius: 8,
      padding: '14px 16px', position: 'relative', overflow: 'hidden',
      animation: 'oa-fadein 0.35s ease both',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: accentColor,
      }} />
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b5e4a', margin: '0 0 6px' }}>{label}</p>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 500, color: '#f0e6d4', margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#5a7a3a', marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? '#c97a2a' : '#1e1a14',
        border: `1px solid ${active ? '#c97a2a' : '#2e2518'}`,
        color: active ? '#0f0d0b' : '#a89070',
        fontFamily: "'Outfit', sans-serif",
        fontSize: 12, fontWeight: 500, padding: '5px 14px',
        borderRadius: 20, cursor: 'pointer', transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

/* ─── main component ─────────────────────────────────────── */

const OrdersAdmin = () => {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [filter, setFilter]         = useState('all');
  const [clock, setClock]           = useState(liveTime());
  const [lastRefresh, setLastRefresh] = useState('');
  const navigate = useNavigate();

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    const id = setInterval(() => setClock(liveTime()), 30_000);
    return () => clearInterval(id);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data.orders || []);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Check your connection and try again.');
    } finally {
      setLoading(false);
      const now = new Date();
      setLastRefresh(
        `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
      );
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );
      toast.success(`Order updated → ${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}`);
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  /* ── derived stats ── */
  const totalOrders  = orders.length;
  const inKitchen    = orders.filter(o => ['confirmed','preparing','ready'].includes(o.status)).length;
  const delivered    = orders.filter(o => o.status === 'delivered').length;
  const revenue      = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  /* ── root styles ── */
  const root = {
    fontFamily: "'Outfit', sans-serif",
    background: '#0f0d0b',
    minHeight: '100vh',
    color: '#e8e0d4',
  };

  if (loading) return (
    <div style={{ ...root, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '2px solid #2a2218', borderTopColor: '#c97a2a',
        animation: 'oa-pulse 0.7s linear infinite',
      }} />
      <p style={{ fontSize: 13, color: '#6b5e4a', letterSpacing: '0.04em' }}>Loading orders…</p>
    </div>
  );

  if (error) return (
    <div style={{ ...root, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
      <p style={{ color: '#d43030', fontSize: 14 }}>{error}</p>
      <button
        onClick={fetchOrders}
        style={{
          background: '#1e1a14', border: '1px solid #c97a2a', color: '#c97a2a',
          fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500,
          padding: '8px 20px', borderRadius: 6, cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div style={root}>

      {/* ── Top bar ── */}
      <div style={{
        background: '#161210', borderBottom: '1px solid #2a2218',
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            background: '#c97a2a', flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "'DM Serif Display', serif", fontSize: 17, color: '#f0e6d4', letterSpacing: '0.02em',
          }}>
            Mutindo<em style={{ color: '#c97a2a' }}>Kitchen</em> — Orders
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#7a6e5e', letterSpacing: '0.05em',
          }}>
            {clock}
          </span>
          <button
            onClick={fetchOrders}
            style={{
              background: '#1e1a14', border: '1px solid #2e2518', color: '#c97a2a',
              fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
              padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
              letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#261f15'; e.currentTarget.style.borderColor = '#c97a2a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1e1a14'; e.currentTarget.style.borderColor = '#2e2518'; }}
          >
            ↺ Refresh
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ padding: '24px 28px' }}>

        {/* Page heading */}
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: '#f0e6d4', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
          Order Management
        </h1>
        <p style={{ fontSize: 13, color: '#6b5e4a', fontWeight: 300, margin: '0 0 22px' }}>
          Live queue — update status directly from the table
        </p>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 22 }}>
          <StatCard label="Total Orders"  value={totalOrders}                    accentColor="#c97a2a" sub="today" />
          <StatCard label="In Kitchen"    value={inKitchen}                      accentColor="#9a50e4" sub="active" />
          <StatCard label="Delivered"     value={delivered}                      accentColor="#30d470" sub="completed" />
          <StatCard label="Revenue"       value={formatCurrency(revenue)}        accentColor="#3a90d4" sub="excl. cancelled" />
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b5e4a', marginRight: 4 }}>
            Filter
          </span>
          {FILTER_OPTIONS.map(opt => (
            <FilterChip
              key={opt.value}
              label={opt.label}
              active={filter === opt.value}
              onClick={() => setFilter(opt.value)}
            />
          ))}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div style={{
            background: '#161210', border: '1px solid #2a2218', borderRadius: 10,
            padding: '48px 24px', textAlign: 'center',
          }}>
            <p style={{ fontSize: 28, opacity: 0.3, marginBottom: 10 }}>◎</p>
            <p style={{ fontSize: 13, color: '#4a3e2e', fontWeight: 300 }}>No orders match this filter</p>
          </div>
        ) : (
          <div style={{ background: '#161210', border: '1px solid #2a2218', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 720 }}>
                <thead>
                  <tr style={{ background: '#1a1610', borderBottom: '1px solid #2a2218' }}>
                    {['Order ID','Customer','Items','Total','Status','Date','Actions'].map(h => (
                      <th key={h} style={{
                        padding: '10px 14px', textAlign: 'left',
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: '#5a4e3e', whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order, idx) => (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: idx < filtered.length - 1 ? '1px solid #1e1a14' : 'none',
                        animation: `oa-fadein 0.25s ease ${idx * 0.04}s both`,
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#1a1610'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Order ID */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <span style={{
                          fontFamily: "'DM Mono', monospace", fontSize: 12,
                          color: '#c97a2a', fontWeight: 500,
                        }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 500, color: '#e0d4c0', fontSize: 13 }}>{order.customerName}</div>
                        <div style={{
                          fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#5a4e3e', marginTop: 2,
                        }}>
                          {order.customerPhone}
                        </div>
                      </td>

                      {/* Items */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <span style={{
                          background: '#1e1a14', border: '1px solid #2e2518', color: '#7a6e5e',
                          fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500,
                          padding: '2px 8px', borderRadius: 10,
                        }}>
                          {order.items?.length ?? 0} items
                        </span>
                      </td>

                      {/* Total */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <span style={{
                          fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500, color: '#e0d4c0',
                        }}>
                          {formatCurrency(order.total)}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Date */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <span style={{
                          fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#5a4e3e',
                        }}>
                          {timeAgo(order.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            onClick={() => navigate(`/tracking/${order.id}`)}
                            style={{
                              background: 'transparent', border: '1px solid #2e2518', color: '#a89070',
                              fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 500,
                              padding: '5px 10px', borderRadius: 5, cursor: 'pointer',
                              letterSpacing: '0.02em', transition: 'all 0.15s', whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c97a2a'; e.currentTarget.style.color = '#c97a2a'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2e2518'; e.currentTarget.style.color = '#a89070'; }}
                          >
                            View
                          </button>

                          <select
                            value={order.status}
                            onChange={e => updateStatus(order.id, e.target.value)}
                            style={{
                              background: '#1e1a14', border: '1px solid #2e2518', color: '#a89070',
                              fontFamily: "'Outfit', sans-serif", fontSize: 11,
                              padding: '5px 8px', borderRadius: 5, cursor: 'pointer', outline: 'none',
                              transition: 'border-color 0.15s',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#c97a2a'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = '#2e2518'; }}
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}
                                style={{ background: '#1e1a14', color: '#e8e0d4' }}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 10, padding: '8px 2px',
        }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#5a4e3e' }}>
            {filtered.length} order{filtered.length !== 1 ? 's' : ''} shown
          </span>
          {lastRefresh && (
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#5a4e3e' }}>
              Last refreshed: {lastRefresh}
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default OrdersAdmin;