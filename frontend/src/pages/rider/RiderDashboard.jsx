import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────
   Design Tokens — Dark Luxury / Warm Industrial
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
  greenBdr: '#105a30',
  blue:     '#3a90d4',
  blueDim:  '#0a1a2a',
  blueBdr:  '#10365a',
  red:      '#d43030',
  redDim:   '#2a0a0a',
  redBdr:   '#5a1010',
  mono:     "'Space Mono', monospace",
  sans:     "'Inter', sans-serif",
  serif:    "'DM Serif Display', serif",
};

/* ─── Animations ───────────────────────────────────────────── */
const KEYFRAMES = `
  @keyframes nav-pulse  { 0%,100%{opacity:1} 50%{opacity:.25} }
  @keyframes nav-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes nav-spin   { to{transform:rotate(360deg)} }
  @keyframes nav-ping   { 0%{transform:scale(1);opacity:1} 70%,100%{transform:scale(2.2);opacity:0} }
  @keyframes slide-in   { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
`;

function injectStyles() {
  if (document.getElementById('rider-styles')) return;
  const s = document.createElement('style');
  s.id = 'rider-styles';
  s.textContent = KEYFRAMES;
  document.head.appendChild(s);
}

/* ─── Status Configuration ─────────────────────────────────── */
const STATUS_CONFIG = {
  ready:      { color: T.amber,   bg: T.amberDim, label: 'Ready',      icon: '📦' },
  picked_up:  { color: T.blue,    bg: T.blueDim,  label: 'Picked Up',   icon: '🚚' },
  on_the_way: { color: '#d47030', bg: '#2a1a0a',  label: 'On The Way',  icon: '🛵' },
  delivered:  { color: T.green,   bg: T.greenDim, label: 'Delivered',   icon: '✅' },
  cancelled:  { color: T.red,     bg: T.redDim,   label: 'Cancelled',   icon: '❌' }
};

const ORDER_STATUS_FLOW = {
  ready:     { next: 'picked_up',  label: 'Pick Up',        color: T.amber, icon: '📦' },
  picked_up: { next: 'on_the_way', label: 'Start Delivery', color: T.blue,  icon: '🚚' },
  on_the_way:{ next: 'delivered',  label: 'Mark Delivered', color: T.green, icon: '✅' }
};

/* ─── Custom Hook: Geolocation ────────────────────────────── */
const useGeolocation = (intervalMs = 10000, isActive = false) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState('prompt');

  const requestLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = 'Geolocation not supported';
        setError(msg);
        reject(msg);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          setError(null);
          setPermission('granted');
          resolve(loc);
        },
        (err) => {
          let msg = 'Location unavailable';
          if (err.code === 1) msg = 'Permission denied';
          setError(msg);
          setPermission(err.code === 1 ? 'denied' : 'error');
          reject({ code: err.code, message: msg });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => requestLocation().catch(() => {}), intervalMs);
    return () => clearInterval(interval);
  }, [isActive, intervalMs, requestLocation]);

  return { location, error, permission, requestLocation };
};

/* ─── Components ──────────────────────────────────────────── */

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ready;
  const pulse = ['on_the_way', 'ready'].includes(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 5,
      background: cfg.bg, border: `1px solid ${cfg.color}`, color: cfg.color,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: cfg.color,
        animation: pulse ? 'nav-pulse 1s ease-in-out infinite' : 'none',
      }} />
      {cfg.icon} {cfg.label}
    </span>
  );
}

function InfoRow({ icon, label, value, mono }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '9px 0', borderBottom: `1px solid ${T.border}`,
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.textFaint, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12 }}>{icon}</span> {label}
      </span>
      <span style={{ fontFamily: mono ? T.mono : T.sans, fontSize: 12, color: T.textMid, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>
        {value}
      </span>
    </div>
  );
}

function MetricCard({ icon, label, value, loading, trend }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      style={{
        flex: 1, background: T.bg1, border: `1px solid ${T.border}`,
        borderRadius: 10, padding: '12px 14px', textAlign: 'center',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 6, opacity: 0.8 }}>{icon}</div>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.textDim, marginBottom: 6 }}>{label}</div>
      {loading ? (
        <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${T.border}`, borderTopColor: T.amber, animation: 'nav-spin 0.8s linear infinite', margin: '0 auto' }} />
      ) : (
        <>
          <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 600, color: T.text }}>{value}</div>
          {trend && <div style={{ fontSize: 9, color: T.textFaint, marginTop: 4 }}>{trend}</div>}
        </>
      )}
    </motion.div>
  );
}

function ActionButton({ label, onClick, color, icon, loading, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      disabled={loading || disabled}
      style={{
        flex: 1, padding: '10px 14px', borderRadius: 8, border: 'none',
        background: hov && !disabled ? color : disabled ? T.textFaint : color,
        opacity: loading ? 0.7 : (disabled ? 0.5 : 1),
        color: T.bg0, fontFamily: T.sans, fontSize: 12, fontWeight: 700,
        letterSpacing: '0.04em', textTransform: 'uppercase',
        cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
    >
      {loading ? (
        <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${T.bg0}`, borderTopColor: 'transparent', animation: 'nav-spin 0.6s linear infinite' }} />
      ) : (
        <>{icon} {label}</>
      )}
    </button>
  );
}

function LocationModal({ show, onAllow, onDismiss, isLoading, permissionDenied }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 20,
          maxWidth: 420, width: '90%', padding: '32px 28px', textAlign: 'center',
        }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: T.bg2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          border: `1px solid ${T.amber}`,
        }}>
          <span style={{ fontSize: 32 }}>📍</span>
        </div>
        {permissionDenied ? (
          <>
            <h3 style={{ fontFamily: T.sans, fontSize: 20, fontWeight: 600, color: T.text, marginBottom: 12 }}>Location Blocked</h3>
            <p style={{ fontSize: 13, color: T.textDim, marginBottom: 20, lineHeight: 1.5 }}>
              Allow location access in your browser settings to go online and receive orders.
            </p>
            <div style={{ background: T.bg2, padding: 14, borderRadius: 10, textAlign: 'left', marginBottom: 24, border: `1px solid ${T.border}` }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: T.amber, marginBottom: 8 }}>How to enable:</p>
              <ol style={{ fontSize: 11, color: T.textMid, paddingLeft: 20, lineHeight: 1.7, margin: 0 }}>
                <li>Click the lock icon in your browser's address bar</li>
                <li>Find "Location" and set it to "Allow"</li>
                <li>Refresh the page and try again</li>
              </ol>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={onDismiss} style={{ background: 'transparent', border: `1px solid ${T.border}`, padding: '10px 22px', borderRadius: 40, color: T.textDim, cursor: 'pointer', fontWeight: 500 }}>
                Cancel
              </button>
              <button onClick={() => window.location.reload()} style={{ background: T.amber, border: 'none', padding: '10px 22px', borderRadius: 40, color: T.bg0, fontWeight: 600, cursor: 'pointer' }}>
                Reload Page
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 style={{ fontFamily: T.sans, fontSize: 20, fontWeight: 600, color: T.text, marginBottom: 12 }}>Enable Location</h3>
            <p style={{ fontSize: 13, color: T.textDim, marginBottom: 24, lineHeight: 1.5 }}>
              We need your location to find nearby orders and provide real-time navigation updates.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={onDismiss} style={{ background: 'transparent', border: `1px solid ${T.border}`, padding: '10px 24px', borderRadius: 40, color: T.textDim, cursor: 'pointer', fontWeight: 500 }}>
                Not Now
              </button>
              <button 
                onClick={onAllow} 
                disabled={isLoading} 
                style={{ 
                  background: T.amber, border: 'none', padding: '10px 28px', borderRadius: 40, 
                  color: T.bg0, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? 'Requesting...' : 'Allow Location'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Order Card Component ───────────────────────────────── */
const OrderCard = ({ order, type, onAction, onNavigate, isOnline, actionLoading }) => {
  const flow = ORDER_STATUS_FLOW[order.status];
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.ready;
  const isLoading = actionLoading === order.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.2 }}
      style={{ marginBottom: 12 }}
    >
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s' }}>
        <div style={{ height: 3, background: cfg.color }} />
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <StatusBadge status={order.status} />
            <span style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 600, color: T.green }}>
              {formatCurrency(order.total)}
            </span>
          </div>
          <p style={{ fontFamily: T.mono, fontSize: 11, color: T.textFaint, marginBottom: 10, letterSpacing: '0.02em' }}>
            #{order.id?.slice(0, 8).toUpperCase()}
          </p>
          <InfoRow icon="📍" label="Address" value={order.deliveryAddress?.substring(0, 50)} />
          
          {type === 'available' && order.customerName && (
            <InfoRow icon="👤" label="Customer" value={order.customerName} />
          )}
          
          {type === 'assigned' && order.items?.length > 0 && (
            <div style={{ marginTop: 8, marginBottom: 10 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {order.items.slice(0, 2).map((item, i) => (
                  <span key={i} style={{ background: T.bg2, padding: '3px 10px', borderRadius: 20, fontSize: 10, color: T.textDim }}>
                    {item.name} ×{item.quantity}
                  </span>
                ))}
                {order.items.length > 2 && (
                  <span style={{ fontSize: 10, color: T.textFaint, padding: '3px 8px' }}>
                    +{order.items.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {type === 'assigned' && (
              <>
                <button 
                  onClick={() => onNavigate(order.id)} 
                  style={{ 
                    flex: 1, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, 
                    padding: '9px 0', fontSize: 12, fontWeight: 600, color: T.textMid, 
                    cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.bg0; e.currentTarget.style.borderColor = T.amberDim; }}
                  onMouseLeave={e => { e.currentTarget.style.background = T.bg2; e.currentTarget.style.borderColor = T.border; }}
                >
                  🗺️ Navigate
                </button>
                {flow && (
                  <ActionButton 
                    label={flow.label} 
                    onClick={() => onAction(order.id, flow.next)} 
                    color={flow.color} 
                    icon={flow.icon}
                    loading={isLoading}
                  />
                )}
              </>
            )}
            {type === 'available' && (
              <ActionButton 
                label={isOnline ? 'Accept Order' : 'Go Online First'} 
                onClick={() => isOnline && onAction(order.id)} 
                color={isOnline ? T.green : T.textDim} 
                icon="✓" 
                disabled={!isOnline}
                loading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Main RiderDashboard Component ───────────────────────── */
const RiderDashboard = () => {
  injectStyles();
  const navigate = useNavigate();

  const [state, setState] = useState({
    assignedOrders: [],
    availableOrders: [],
    earnings: { today: 0, week: 0, month: 0 },
    metrics: { deliveriesToday: 0, distance: 0, rating: 5.0 },
    loading: true,
    online: false,
  });
  const [locationModal, setLocationModal] = useState({ show: false, loading: false, denied: false });
  const [actionLoading, setActionLoading] = useState(null); // stores order id being processed

  const { location, permission, requestLocation } = useGeolocation(15000, state.online);

  const fetchOrders = useCallback(async () => {
    try {
      const [assignedRes, availableRes, earningsRes] = await Promise.allSettled([
        api.get('/riders/orders'),
        api.get('/riders/available-orders'),
        api.get('/riders/earnings/today')
      ]);
      setState(prev => ({
        ...prev,
        assignedOrders: assignedRes.status === 'fulfilled' ? assignedRes.value.data?.orders || [] : [],
        availableOrders: availableRes.status === 'fulfilled' ? availableRes.value.data?.orders || [] : [],
        earnings: earningsRes.status === 'fulfilled' ? earningsRes.value.data : prev.earnings,
        loading: false,
      }));
    } catch (err) {
      console.error('Fetch error:', err);
      setState(prev => ({ ...prev, loading: false }));
      toast.error('Failed to load dashboard');
    }
  }, []);

  const pushLocation = useCallback(async () => {
    if (!state.online || !location) return;
    try { 
      await api.post('/riders/location', { lat: location.lat, lng: location.lng }); 
    } catch (err) {
      console.error('Location push failed:', err);
    }
  }, [state.online, location]);

  const handleGoOnline = async () => {
    if (state.online) {
      setState(prev => ({ ...prev, online: false }));
      await api.post('/riders/status', { online: false }).catch(() => {});
      toast.info('You are now offline');
      return;
    }
    if (permission === 'denied') {
      setLocationModal({ show: true, loading: false, denied: true });
      return;
    }
    setLocationModal({ show: true, loading: false, denied: false });
  };

  const handleAllowLocation = async () => {
    setLocationModal(prev => ({ ...prev, loading: true }));
    try {
      await requestLocation();
      setLocationModal({ show: false, loading: false, denied: false });
      setState(prev => ({ ...prev, online: true }));
      await api.post('/riders/status', { online: true });
      await fetchOrders();
      toast.success('You are now online and receiving orders');
    } catch (err) {
      const denied = err?.code === 1;
      setLocationModal({ show: true, loading: false, denied });
      if (!denied) toast.error('Could not get location. Please check your GPS.');
    }
  };

  const acceptOrder = async (orderId) => {
    setActionLoading(orderId);
    const toastId = toast.loading('Accepting order...');
    try {
      await api.put(`/orders/${orderId}/assign`, { riderId: 'current' });
      await api.put(`/orders/${orderId}/status`, { status: 'confirmed' });
      toast.update(toastId, { render: '✅ Order accepted successfully!', type: 'success', isLoading: false, autoClose: 3000 });
      await fetchOrders();
    } catch (err) {
      toast.update(toastId, { render: '❌ Failed to accept order', type: 'error', isLoading: false, autoClose: 4000 });
    } finally {
      setActionLoading(null);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setActionLoading(orderId);
    const toastId = toast.loading('Updating order status...');
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      const message = status === 'delivered' ? '🎉 Order delivered! Great job!' : `✅ Order status updated to ${status.replace('_', ' ')}`;
      toast.update(toastId, { render: message, type: 'success', isLoading: false, autoClose: 3000 });
      await fetchOrders();
    } catch (err) {
      toast.update(toastId, { render: '❌ Failed to update status', type: 'error', isLoading: false, autoClose: 4000 });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  
  useEffect(() => {
    if (!state.online || !location) return;
    pushLocation();
    const interval = setInterval(pushLocation, 15000);
    return () => clearInterval(interval);
  }, [state.online, location, pushLocation]);

  if (state.loading) {
    return (
      <div style={{ background: T.bg0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${T.border}`, borderTopColor: T.amber, animation: 'nav-spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontFamily: T.sans, fontSize: 13, color: T.textDim }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: '💰', label: "Today's Earnings", value: formatCurrency(state.earnings.today || 0), trend: `Week: ${formatCurrency(state.earnings.week || 0)}` },
    { icon: '✅', label: 'Deliveries', value: state.metrics.deliveriesToday, trend: 'Completed today' },
    { icon: '📏', label: 'Distance', value: `${state.metrics.distance || 0} km`, trend: 'Covered today' },
    { icon: '⭐', label: 'Rating', value: state.metrics.rating?.toFixed(1) || '5.0', trend: 'Average score' }
  ];

  return (
    <div style={{ background: T.bg0, minHeight: '100vh', fontFamily: T.sans }}>
      <AnimatePresence>
        {locationModal.show && (
          <LocationModal 
            show={locationModal.show} 
            onAllow={handleAllowLocation} 
            onDismiss={() => setLocationModal({ show: false, loading: false, denied: false })} 
            isLoading={locationModal.loading} 
            permissionDenied={locationModal.denied} 
          />
        )}
      </AnimatePresence>

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
            <p style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>Rider Delivery Portal</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {state.online && location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.bg2, padding: '6px 14px', borderRadius: 40, border: `1px solid ${T.border}` }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, animation: 'nav-pulse 1s infinite' }} />
                <span style={{ fontSize: 11, fontFamily: T.mono, color: T.textMid }}>GPS Active</span>
              </div>
            )}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoOnline} 
              style={{
                background: state.online ? T.redDim : T.greenDim,
                border: `1px solid ${state.online ? T.red : T.green}`,
                color: state.online ? T.red : T.green,
                padding: '8px 22px', borderRadius: 40, fontWeight: 600, fontSize: 13, 
                cursor: 'pointer', fontFamily: T.sans, transition: 'all 0.15s',
              }}
            >
              {state.online ? '🔴 Go Offline' : '🟢 Go Online'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}
        >
          {stats.map((s, i) => (
            <MetricCard key={i} icon={s.icon} label={s.label} value={s.value} trend={s.trend} />
          ))}
        </motion.div>

        {/* Two Column Orders */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Active Deliveries Column */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}
          >
            <div style={{ background: T.bg2, borderBottom: `1px solid ${T.border}`, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: T.text, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                🚚 Active Deliveries
              </span>
              <span style={{ background: T.amberDim, padding: '2px 12px', borderRadius: 30, fontSize: 12, fontWeight: 600, color: T.amber }}>
                {state.assignedOrders.length}
              </span>
            </div>
            <div style={{ padding: 16, maxHeight: 540, overflowY: 'auto' }}>
              <AnimatePresence>
                {state.assignedOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: T.textDim, fontSize: 13 }}>
                    <span style={{ fontSize: 40, opacity: 0.3, display: 'block', marginBottom: 12 }}>📭</span>
                    No active deliveries
                  </div>
                ) : (
                  state.assignedOrders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      type="assigned" 
                      onAction={updateOrderStatus} 
                      onNavigate={id => navigate(`/rider/navigation/${id}`)} 
                      isOnline={state.online}
                      actionLoading={actionLoading}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Available Orders Column */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}
          >
            <div style={{ background: T.bg2, borderBottom: `1px solid ${T.border}`, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: T.text, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⏳ Available Orders
              </span>
              <span style={{ background: T.greenDim, padding: '2px 12px', borderRadius: 30, fontSize: 12, fontWeight: 600, color: T.green }}>
                {state.availableOrders.length}
              </span>
            </div>
            <div style={{ padding: 16, maxHeight: 540, overflowY: 'auto' }}>
              <AnimatePresence>
                {state.availableOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: T.textDim, fontSize: 13 }}>
                    <span style={{ fontSize: 40, opacity: 0.3, display: 'block', marginBottom: 12 }}>🕐</span>
                    No orders available
                  </div>
                ) : (
                  state.availableOrders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      type="available" 
                      onAction={acceptOrder} 
                      isOnline={state.online}
                      actionLoading={actionLoading}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Quick Links Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: 28, display: 'flex', gap: 14, justifyContent: 'flex-end', borderTop: `1px solid ${T.border}`, paddingTop: 24 }}
        >
          {[
            { path: '/rider/history', label: '📜 Delivery History', icon: '📜' },
            { path: '/rider/earnings', label: '💰 Earnings Report', icon: '💰' },
            { path: '/rider/support', label: '📞 Support Center', icon: '📞' },
          ].map(link => (
            <motion.button
              key={link.path}
              whileHover={{ y: -2 }}
              onClick={() => navigate(link.path)}
              style={{ background: T.bg2, border: `1px solid ${T.border}`, padding: '8px 22px', borderRadius: 40, color: T.textMid, fontSize: 12, cursor: 'pointer', fontFamily: T.sans, transition: 'all 0.15s' }}
            >
              {link.label}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default RiderDashboard;