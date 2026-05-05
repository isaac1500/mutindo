import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────
   Design Tokens
───────────────────────────────────────────────────────────── */
const T = {
  bg0:      '#0f0d0b',
  bg1:      '#161210',
  bg2:      '#1e1a14',
  bg3:      '#26201a',
  border:   '#2a2218',
  amber:    '#c97a2a',
  amberDim: '#7a4a1a',
  text:     '#f0e6d4',
  textMid:  '#c8bca8',
  textDim:  '#6b5e4a',
  textFaint:'#5a4e3e',
  green:    '#30d470',
  greenDim: '#0a2a1a',
  red:      '#d43030',
  redDim:   '#2a0a0a',
  mono:     "'Space Mono', monospace",
  sans:     "'Inter', sans-serif",
  serif:    "'DM Serif Display', serif",
};

const KEYFRAMES = `
  @keyframes spin { to { transform: rotate(360deg); } }
`;

function injectStyles() {
  if (document.getElementById('history-styles')) return;
  const s = document.createElement('style');
  s.id = 'history-styles';
  s.textContent = KEYFRAMES;
  document.head.appendChild(s);
}

const STATUS_CONFIG = {
  delivered:  { color: T.green, bg: T.greenDim, label: 'Delivered', icon: '✅' },
  cancelled:  { color: T.red,   bg: T.redDim,   label: 'Cancelled', icon: '❌' },
  on_the_way: { color: T.amber, bg: T.amberDim, label: 'On The Way', icon: '🚚' },
  picked_up:  { color: T.amber, bg: T.amberDim, label: 'Picked Up',  icon: '📦' },
  confirmed:  { color: '#3a90d4', bg: '#0a1a2a', label: 'Confirmed',  icon: '✓' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.delivered;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 20,
      background: cfg.bg, border: `1px solid ${cfg.color}`, color: cfg.color,
      fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function HistoryCard({ delivery, index }) {
  const date = new Date(delivery.deliveredAt || delivery.updatedAt || delivery.createdAt);
  const formattedDate = date.toLocaleDateString('en-UG', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  const formattedTime = date.toLocaleTimeString('en-UG', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      style={{
        background: T.bg2,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.text }}>
              #{delivery.id?.slice(0, 8).toUpperCase()}
            </span>
            <StatusBadge status={delivery.status} />
          </div>
          <div style={{ fontSize: 11, color: T.textFaint, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>📅 {formattedDate} at {formattedTime}</span>
            <span>👤 {delivery.customerName || 'Customer'}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: T.mono, fontSize: 17, fontWeight: 700, color: T.amber }}>
            {formatCurrency(delivery.total)}
          </div>
          <div style={{ fontSize: 10, color: T.textFaint }}>
            Fee: {formatCurrency(delivery.deliveryFee || 5000)}
          </div>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: 10,
        borderTop: `1px solid ${T.border}`,
        marginTop: 6,
      }}>
        <div style={{ fontSize: 10, color: T.textDim, display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <span>📍</span> 
          <span style={{ flex: 1 }}>
            {delivery.deliveryAddress?.substring(0, 50)}
            {delivery.deliveryAddress?.length > 50 && '…'}
          </span>
        </div>
        <div style={{ fontSize: 10, color: T.textFaint, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🍽️</span> {delivery.items?.length || 0} items
        </div>
      </div>
      
      <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {delivery.items?.slice(0, 3).map((item, i) => (
          <span key={i} style={{ 
            background: T.bg3, 
            padding: '2px 8px', 
            borderRadius: 20, 
            fontSize: 9, 
            color: T.textMid 
          }}>
            {item.name} ×{item.quantity}
          </span>
        ))}
        {delivery.items?.length > 3 && (
          <span style={{ fontSize: 9, color: T.textFaint, padding: '2px 6px' }}>
            +{delivery.items.length - 3} more
          </span>
        )}
      </div>
    </motion.div>
  );
}

function FilterButtons({ active, onChange }) {
  const filters = [
    { key: 'all', label: 'All', icon: '📋' },
    { key: 'delivered', label: 'Delivered', icon: '✅' },
    { key: 'cancelled', label: 'Cancelled', icon: '❌' },
    { key: 'on_the_way', label: 'In Progress', icon: '🚚' },
  ];

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {filters.map(filter => (
        <button
          key={filter.key}
          onClick={() => onChange(filter.key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px',
            borderRadius: 40,
            border: `1px solid ${active === filter.key ? T.amber : T.border}`,
            background: active === filter.key ? T.amberDim : T.bg2,
            color: active === filter.key ? T.amber : T.textDim,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {filter.icon} {filter.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Main History Component ──────────────────────────────── */
const History = () => {
  injectStyles();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    cancelled: 0,
    inProgress: 0,
    totalEarnings: 0,
  });

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/riders/history');
      const allDeliveries = response.data?.deliveries || [];
      
      // Calculate stats
      const delivered = allDeliveries.filter(d => d.status === 'delivered');
      const cancelled = allDeliveries.filter(d => d.status === 'cancelled');
      const inProgress = allDeliveries.filter(d => d.status !== 'delivered' && d.status !== 'cancelled');
      const totalEarnings = delivered.reduce((sum, d) => sum + (d.deliveryFee || 5000), 0);
      
      setDeliveries(allDeliveries);
      setStats({
        total: allDeliveries.length,
        delivered: delivered.length,
        cancelled: cancelled.length,
        inProgress: inProgress.length,
        totalEarnings: totalEarnings,
      });
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load delivery history');
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getFilteredDeliveries = () => {
    if (filter === 'all') return deliveries;
    if (filter === 'on_the_way') {
      return deliveries.filter(d => d.status !== 'delivered' && d.status !== 'cancelled');
    }
    return deliveries.filter(d => d.status === filter);
  };

  const filtered = getFilteredDeliveries();

  if (loading) {
    return (
      <div style={{ background: T.bg0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${T.border}`, borderTopColor: T.amber, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontFamily: T.sans, fontSize: 13, color: T.textDim }}>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: T.bg0, minHeight: '100vh', fontFamily: T.sans }}>
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ borderBottom: `1px solid ${T.border}`, background: T.bg1, padding: '16px 24px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.text, margin: 0 }}>
              Mutindo<span style={{ color: T.amber }}>Kitchen</span>
            </h1>
            <p style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>Delivery History</p>
          </div>
          <button
            onClick={() => navigate('/rider/dashboard')}
            style={{
              background: T.bg2,
              border: `1px solid ${T.border}`,
              padding: '8px 20px',
              borderRadius: 40,
              color: T.textMid,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: T.sans,
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </motion.div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        {/* Stats Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: 14, 
            marginBottom: 28 
          }}
        >
          <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: T.textFaint, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Total Deliveries</div>
            <div style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color: T.text }}>{stats.total}</div>
          </div>
          <div style={{ background: T.bg1, border: `1px solid ${T.green}40`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: T.green, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Completed</div>
            <div style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color: T.green }}>{stats.delivered}</div>
          </div>
          <div style={{ background: T.bg1, border: `1px solid ${T.red}40`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: T.red, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Cancelled</div>
            <div style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color: T.red }}>{stats.cancelled}</div>
          </div>
          <div style={{ background: T.bg1, border: `1px solid ${T.amber}40`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: T.amber, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Total Earnings</div>
            <div style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color: T.amber }}>{formatCurrency(stats.totalEarnings)}</div>
          </div>
        </motion.div>

        {/* Filter and List */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <FilterButtons active={filter} onChange={setFilter} />
          <div style={{ fontSize: 11, color: T.textFaint }}>
            Showing {filtered.length} of {deliveries.length} deliveries
          </div>
        </div>

        {/* Delivery List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}
        >
          <div style={{ background: T.bg2, borderBottom: `1px solid ${T.border}`, padding: '14px 20px' }}>
            <span style={{ fontWeight: 600, color: T.text, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              📦 Delivery History
            </span>
          </div>
          <div style={{ padding: 16, maxHeight: 550, overflowY: 'auto' }}>
            <AnimatePresence>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: T.textDim, fontSize: 13 }}>
                  <span style={{ fontSize: 48, opacity: 0.3, display: 'block', marginBottom: 12 }}>📭</span>
                  No deliveries found
                  {filter !== 'all' && <span style={{ display: 'block', marginTop: 8 }}>Try changing the filter</span>}
                </div>
              ) : (
                filtered.map((delivery, idx) => (
                  <HistoryCard key={delivery.id || idx} delivery={delivery} index={idx} />
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default History;