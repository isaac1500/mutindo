import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────
   Design Tokens — Matching RiderDashboard
───────────────────────────────────────────────────────────── */
const T = {
  bg0:      '#0f0d0b',
  bg1:      '#161210',
  bg2:      '#1e1a14',
  bg3:      '#26201a',
  border:   '#2a2218',
  border2:  '#2e2518',
  amber:    '#c97a2a',
  amberDim: '#7a4a1a',
  text:     '#f0e6d4',
  textMid:  '#c8bca8',
  textDim:  '#6b5e4a',
  textFaint:'#5a4e3e',
  green:    '#30d470',
  greenDim: '#0a2a1a',
  blue:     '#3a90d4',
  mono:     "'Space Mono', monospace",
  sans:     "'Inter', sans-serif",
  serif:    "'DM Serif Display', serif",
};

const KEYFRAMES = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;

function injectStyles() {
  if (document.getElementById('earnings-styles')) return;
  const s = document.createElement('style');
  s.id = 'earnings-styles';
  s.textContent = KEYFRAMES;
  document.head.appendChild(s);
}

/* ─── Components ──────────────────────────────────────────── */

function StatCard({ icon, label, value, subValue, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: T.bg1,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: '20px 16px',
        textAlign: 'center',
        flex: 1,
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.textDim, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color: color || T.amber }}>
        {value}
      </div>
      {subValue && (
        <div style={{ fontSize: 11, color: T.textFaint, marginTop: 8 }}>{subValue}</div>
      )}
    </motion.div>
  );
}

function DeliveryItem({ delivery, index }) {
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
      transition={{ delay: index * 0.05 }}
      style={{
        background: T.bg2,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 600, color: T.green }}>
            #{delivery.id?.slice(0, 8).toUpperCase()}
          </span>
          <div style={{ fontSize: 11, color: T.textFaint, marginTop: 4 }}>
            {formattedDate} at {formattedTime}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.amber }}>
            {formatCurrency(delivery.deliveryFee || 5000)}
          </div>
          <div style={{ fontSize: 10, color: T.textFaint }}>
            Order total: {formatCurrency(delivery.total)}
          </div>
        </div>
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: 8,
        borderTop: `1px solid ${T.border}`,
        marginTop: 8,
      }}>
        <div style={{ fontSize: 11, color: T.textDim, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>📍</span> {delivery.deliveryAddress?.substring(0, 40)}
          {delivery.deliveryAddress?.length > 40 && '…'}
        </div>
        <span style={{ 
          background: T.greenDim, 
          padding: '2px 10px', 
          borderRadius: 20, 
          fontSize: 9, 
          fontWeight: 600, 
          color: T.green,
          textTransform: 'uppercase',
        }}>
          Completed
        </span>
      </div>
    </motion.div>
  );
}

function PeriodFilter({ active, onChange }) {
  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <div style={{ display: 'flex', gap: 8, background: T.bg2, padding: 6, borderRadius: 40, border: `1px solid ${T.border}` }}>
      {periods.map(period => (
        <button
          key={period.key}
          onClick={() => onChange(period.key)}
          style={{
            padding: '6px 18px',
            borderRadius: 30,
            border: 'none',
            background: active === period.key ? T.amber : 'transparent',
            color: active === period.key ? T.bg0 : T.textDim,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Main Earnings Component ─────────────────────────────── */
const Earnings = () => {
  injectStyles();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [earnings, setEarnings] = useState({
    total: 0,
    today: 0,
    week: 0,
    month: 0,
    deliveries: [],
    counts: {
      today: 0,
      week: 0,
      month: 0,
      total: 0,
    },
  });

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all delivered orders for this rider
      const response = await api.get('/riders/earnings');
      
      if (response.data?.success) {
        const allDeliveries = response.data.deliveries || [];
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Filter and calculate by period
        const filterByDate = (date, startDate) => new Date(date) >= startDate;
        
        const todayDeliveries = allDeliveries.filter(d => filterByDate(d.date, todayStart));
        const weekDeliveries = allDeliveries.filter(d => filterByDate(d.date, weekStart));
        const monthDeliveries = allDeliveries.filter(d => filterByDate(d.date, monthStart));

        const calculateTotal = (deliveries) => deliveries.reduce((sum, d) => sum + (d.amount || 5000), 0);

        setEarnings({
          total: response.data.totalEarnings || 0,
          today: calculateTotal(todayDeliveries),
          week: calculateTotal(weekDeliveries),
          month: calculateTotal(monthDeliveries),
          deliveries: allDeliveries,
          counts: {
            today: todayDeliveries.length,
            week: weekDeliveries.length,
            month: monthDeliveries.length,
            total: allDeliveries.length,
          },
        });
      } else {
        // Fallback if endpoint structure different
        const historyRes = await api.get('/riders/history');
        const allOrders = historyRes.data?.deliveries || [];
        const deliveredOrders = allOrders.filter(o => o.status === 'delivered');
        
        const total = deliveredOrders.reduce((sum, o) => sum + (o.deliveryFee || 5000), 0);
        setEarnings({
          total,
          today: 0,
          week: 0,
          month: 0,
          deliveries: deliveredOrders,
          counts: { today: 0, week: 0, month: 0, total: deliveredOrders.length },
        });
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const getDisplayValue = () => {
    switch (period) {
      case 'today': return earnings.today;
      case 'week': return earnings.week;
      case 'month': return earnings.month;
      default: return earnings.total;
    }
  };

  const getDeliveryCount = () => {
    switch (period) {
      case 'today': return earnings.counts.today;
      case 'week': return earnings.counts.week;
      case 'month': return earnings.counts.month;
      default: return earnings.counts.total;
    }
  };

  const getFilteredDeliveries = () => {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (period) {
      case 'today':
        return earnings.deliveries.filter(d => new Date(d.date) >= todayStart);
      case 'week':
        return earnings.deliveries.filter(d => new Date(d.date) >= weekStart);
      case 'month':
        return earnings.deliveries.filter(d => new Date(d.date) >= monthStart);
      default:
        return earnings.deliveries;
    }
  };

  if (loading) {
    return (
      <div style={{ background: T.bg0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${T.border}`, borderTopColor: T.amber, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontFamily: T.sans, fontSize: 13, color: T.textDim }}>Loading earnings...</p>
        </div>
      </div>
    );
  }

  const filteredDeliveries = getFilteredDeliveries();

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
            <p style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>Earnings Report</p>
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
        {/* Period Filter */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <PeriodFilter active={period} onChange={setPeriod} />
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard 
            icon="💰" 
            label="Total Earnings" 
            value={formatCurrency(getDisplayValue())} 
            subValue={`${getDeliveryCount()} deliveries`}
            color={T.amber}
          />
          <StatCard 
            icon="📦" 
            label="Deliveries" 
            value={getDeliveryCount()} 
            subValue={period === 'today' ? 'Completed today' : period === 'week' ? 'This week' : period === 'month' ? 'This month' : 'All time'}
            color={T.green}
          />
          <StatCard 
            icon="⭐" 
            label="Avg. Per Delivery" 
            value={formatCurrency(getDeliveryCount() > 0 ? getDisplayValue() / getDeliveryCount() : 0)}
            subValue="Delivery fee"
            color={T.blue}
          />
        </div>

        {/* Delivery History */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}
        >
          <div style={{ background: T.bg2, borderBottom: `1px solid ${T.border}`, padding: '14px 20px' }}>
            <span style={{ fontWeight: 600, color: T.text, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              📋 Delivery History
              <span style={{ background: T.amberDim, padding: '2px 10px', borderRadius: 30, fontSize: 11, color: T.amber }}>
                {filteredDeliveries.length} deliveries
              </span>
            </span>
          </div>
          <div style={{ padding: 16, maxHeight: 500, overflowY: 'auto' }}>
            <AnimatePresence>
              {filteredDeliveries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: T.textDim, fontSize: 13 }}>
                  <span style={{ fontSize: 48, opacity: 0.3, display: 'block', marginBottom: 12 }}>📭</span>
                  No deliveries found for this period
                </div>
              ) : (
                filteredDeliveries.map((delivery, idx) => (
                  <DeliveryItem key={delivery.id || idx} delivery={delivery} index={idx} />
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Earnings;