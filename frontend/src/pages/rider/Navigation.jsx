import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import RealDeliveryMap from '../../components/RealDeliveryMap';
import { getRoute } from '../../services/routeService';

/* ─────────────────────────────────────────────────────────────
   Inject fonts + keyframes once
───────────────────────────────────────────────────────────── */
const FONT_URL =
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Mono:wght@400;500&family=Inter:wght@300;400;500;600;700&display=swap';

const KEYFRAMES = `
  @keyframes nav-pulse  { 0%,100%{opacity:1} 50%{opacity:.25} }
  @keyframes nav-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes nav-spin   { to{transform:rotate(360deg)} }
  @keyframes nav-ping   { 0%{transform:scale(1);opacity:1} 70%,100%{transform:scale(2.2);opacity:0} }
  @keyframes slide-up   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
`;

function injectStyles() {
  if (document.getElementById('nav-styles')) return;
  const s = document.createElement('style');
  s.id = 'nav-styles'; s.textContent = KEYFRAMES;
  document.head.appendChild(s);
  const f = document.createElement('link');
  f.rel = 'stylesheet'; f.href = FONT_URL;
  document.head.appendChild(f);
}

/* ─── design tokens ───────────────────────────────────────── */
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

/* ─── STATUS config ───────────────────────────────────────── */
const STATUS_META = {
  pending:    { label: 'Pending',     color: '#d48a30', bg: '#2a1f0a', border: '#5a3a10', icon: '⏳' },
  confirmed:  { label: 'Confirmed',   color: T.blue,    bg: T.blueDim, border: T.blueBdr, icon: '✓' },
  preparing:  { label: 'Preparing',   color: '#9a50e4', bg: '#1a0a2a', border: '#3a1060', icon: '👨‍🍳' },
  ready:      { label: 'Ready',       color: T.green,   bg: T.greenDim, border: T.greenBdr, icon: '📦' },
  picked_up:  { label: 'Picked Up',   color: '#a0a030', bg: '#1a1a0a', border: '#3a3a10', icon: '🚚' },
  on_the_way: { label: 'On the Way',  color: '#d47030', bg: '#2a1a0a', border: '#5a3010', icon: '🛵' },
  delivered:  { label: 'Delivered',   color: T.green,   bg: T.greenDim, border: T.greenBdr, icon: '✅' },
  cancelled:  { label: 'Cancelled',   color: T.red,     bg: T.redDim,  border: T.redBdr,  icon: '❌' },
};

/* ─── helpers ─────────────────────────────────────────────── */
function liveTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  const pulse = ['preparing', 'on_the_way'].includes(status);
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 6,
        background: m.bg, border: `1px solid ${m.border}`, color: m.color,
        fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase',
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: m.color, flexShrink: 0,
        animation: pulse ? 'nav-pulse 1s ease-in-out infinite' : 'none',
      }} />
      {m.icon} {m.label}
    </motion.span>
  );
}

function InfoRow({ icon, label, value, mono }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '9px 0', borderBottom: `1px solid ${T.border}`,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.textFaint, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13 }}>{icon}</span> {label}
      </span>
      <span style={{ fontFamily: mono ? T.mono : T.sans, fontSize: 12, color: T.textMid, textAlign: 'right', maxWidth: '60%', lineHeight: 1.4, wordBreak: 'break-word' }}>
        {value}
      </span>
    </motion.div>
  );
}

function MetricCard({ icon, label, value, loading }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      style={{
        flex: 1, background: T.bg1, border: `1px solid ${T.border}`,
        borderRadius: 10, padding: '10px 12px', textAlign: 'center',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 4, opacity: 0.8 }}>{icon}</div>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.textDim, marginBottom: 4 }}>{label}</div>
      {loading ? (
        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${T.border}`, borderTopColor: T.amber, animation: 'nav-spin 0.8s linear infinite', margin: '0 auto' }} />
      ) : (
        <div style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 500, color: T.text }}>{value}</div>
      )}
    </motion.div>
  );
}

function ActionButton({ label, onClick, variant = 'primary', icon, loading }) {
  const [hov, setHov] = useState(false);
  const styles = {
    primary: { bg: T.amber,    hov: '#b06820', color: T.bg0 },
    success: { bg: T.green,    hov: '#20b050', color: T.bg0 },
    warning: { bg: '#d48a30',  hov: '#b06820', color: T.bg0 },
  };
  const s = styles[variant] || styles.primary;
  return (
    <motion.button
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      disabled={loading}
      style={{
        width: '100%', padding: '12px 16px', borderRadius: 8, border: 'none',
        background: hov && !loading ? s.hov : s.bg, color: s.color,
        fontFamily: T.sans, fontSize: 13, fontWeight: 700,
        letterSpacing: '0.04em', textTransform: 'uppercase',
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        transition: 'all 0.15s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
    >
      {loading ? (
        <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${s.color}`, borderTopColor: 'transparent', animation: 'nav-spin 0.6s linear infinite' }} />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {label}
        </>
      )}
    </motion.button>
  );
}

/* ─── main component ─────────────────────────────────────── */
const RESTAURANT = { lat: 0.3476, lng: 32.5825 };

const Navigation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [riderLocation, setRiderLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ distance: null, duration: null });
  const [routeLoading, setRouteLoading] = useState(false);
  const [clock, setClock] = useState(liveTime());
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const riderLocRef = useRef(null);

  useEffect(() => {
    injectStyles();
    const id = setInterval(() => setClock(liveTime()), 30000);
    return () => clearInterval(id);
  }, []);

  /* ── geolocation ── */
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc = { lat: coords.latitude, lng: coords.longitude };
        setRiderLocation(loc);
        riderLocRef.current = loc;
      },
      (err) => console.error('Geolocation error:', err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const updateLocationOnServer = useCallback(async () => {
    const loc = riderLocRef.current;
    if (!loc || !orderId) return;
    try {
      await api.post(`/orders/${orderId}/location`, { lat: loc.lat, lng: loc.lng });
    } catch (err) {
      console.error('Failed to update location:', err);
    }
  }, [orderId]);

  /* ── route calc ── */
  const calculateRoute = useCallback(async (from, to) => {
    if (!from || !to) return;
    setRouteLoading(true);
    try {
      const route = await getRoute(from, to);
      if (route.success) {
        setRouteInfo({
          distance: route.distance?.toFixed(1) ?? null,
          duration: route.eta ?? null,
        });
      }
    } catch (err) {
      console.error('Route error:', err);
    } finally {
      setRouteLoading(false);
    }
  }, []);

  useEffect(() => {
    if (riderLocation && destination) calculateRoute(riderLocation, destination);
  }, [riderLocation, destination, calculateRoute]);

  /* ── fetch order ── */
  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/orders/${orderId}`);
      const data = res.data;
      setOrder(data);

      /* resolve destination */
      if (data.deliveryCoordinates?.lat) {
        setDestination({ lat: data.deliveryCoordinates.lat, lng: data.deliveryCoordinates.lng });
      } else if (['picked_up', 'on_the_way'].includes(data.status) && data.deliveryAddress) {
        try {
          const cr = await api.get(`/orders/${orderId}/delivery-coordinates`);
          if (cr.data.success && cr.data.coordinates) {
            setDestination({ lat: cr.data.coordinates.lat, lng: cr.data.coordinates.lng });
          } else {
            setDestination({ lat: RESTAURANT.lat + 0.015, lng: RESTAURANT.lng + 0.008 });
          }
        } catch {
          setDestination({ lat: RESTAURANT.lat + 0.015, lng: RESTAURANT.lng + 0.008 });
        }
      } else if (data.status === 'ready') {
        setDestination(RESTAURANT);
      } else if (data.deliveryCoordinates) {
        setDestination({ lat: data.deliveryCoordinates.lat, lng: data.deliveryCoordinates.lng });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load order';
      setError(msg);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  /* ── bootstrap ── */
  useEffect(() => {
    fetchOrder();
    getCurrentLocation();
    const interval = setInterval(() => {
      getCurrentLocation();
      updateLocationOnServer();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchOrder, getCurrentLocation, updateLocationOnServer]);

  /* ── update status ── */
  const updateStatus = async (status) => {
    setUpdatingStatus(true);
    const toastId = toast.loading(`Updating order status...`);
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      const message = status === 'delivered' 
        ? '🎉 Order delivered! Great job!' 
        : `Order marked as ${status.replace('_', ' ')}`;
      toast.update(toastId, { render: message, type: 'success', isLoading: false, autoClose: 3000 });
      if (status === 'delivered') {
        navigate('/rider/dashboard');
      } else {
        await fetchOrder();
      }
    } catch (err) {
      toast.update(toastId, { render: 'Failed to update status', type: 'error', isLoading: false, autoClose: 4000 });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRouteCalculated = ({ distance, duration }) => setRouteInfo({ distance, duration });

  const getDestLabel = () => {
    if (order?.status === 'ready') return 'Restaurant';
    if (['picked_up', 'on_the_way'].includes(order?.status)) return 'Customer';
    return 'Destination';
  };

  /* ── loading state ── */
  if (loading) return (
    <div style={{ fontFamily: T.sans, background: T.bg0, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${T.border}`, borderTopColor: T.amber, animation: 'nav-spin 0.8s linear infinite' }} />
      <p style={{ fontSize: 13, color: T.textDim, letterSpacing: '0.04em' }}>Loading navigation...</p>
    </div>
  );

  /* ── error state ── */
  if (error || !order) return (
    <div style={{ fontFamily: T.sans, background: T.bg0, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
      <div style={{ fontSize: 48, opacity: 0.3 }}>⚠️</div>
      <p style={{ fontSize: 14, color: T.red }}>{error || 'Order not found'}</p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/rider/dashboard')}
        style={{
          background: T.bg2, border: `1px solid ${T.amber}`, color: T.amber,
          fontFamily: T.sans, fontSize: 13, fontWeight: 500,
          padding: '8px 24px', borderRadius: 40, cursor: 'pointer',
        }}
      >
        ← Back to Dashboard
      </motion.button>
    </div>
  );

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: T.sans, background: T.bg0, minHeight: '100vh', color: T.textMid }}>

      {/* ── Top bar ── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ background: T.bg1, borderBottom: `1px solid ${T.border}`, padding: '13px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: T.amber, flexShrink: 0 }} />
          <span style={{ fontFamily: T.serif, fontSize: 18, color: T.text, letterSpacing: '0.02em' }}>
            Ember<span style={{ color: T.amber }}>Kitchen</span>
          </span>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textFaint, background: T.bg2, padding: '2px 8px', borderRadius: 4, marginLeft: 4 }}>
            Navigation
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontFamily: T.mono, fontSize: 13, color: T.textDim, background: T.bg2, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.05em' }}>
            {clock}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/rider/dashboard')}
            style={{
              background: T.bg2, border: `1px solid ${T.border2}`, color: T.textDim,
              fontFamily: T.sans, fontSize: 11, fontWeight: 600,
              padding: '6px 16px', borderRadius: 40, cursor: 'pointer',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            ← Dashboard
          </motion.button>
        </div>
      </motion.div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, padding: 24, minHeight: 'calc(100vh - 60px)', alignItems: 'start' }}>

        {/* ── LEFT — Map ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16,
            overflow: 'hidden', height: 580, position: 'relative',
          }}
        >
          {/* map header */}
          <div style={{
            position: 'absolute', top: 14, left: 14, zIndex: 10,
            background: 'rgba(15,13,11,0.9)', backdropFilter: 'blur(12px)',
            border: `1px solid ${T.border}`, borderRadius: 40,
            padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ position: 'relative', width: 10, height: 10 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: T.green, animation: 'nav-ping 1.4s ease-in-out infinite' }} />
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: T.green }} />
            </div>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textMid, letterSpacing: '0.04em' }}>
              LIVE · {getDestLabel().toUpperCase()}
            </span>
          </div>

          <RealDeliveryMap
            riderLocation={riderLocation}
            destinationLocation={destination}
            onRouteCalculated={handleRouteCalculated}
          />

          {/* no location warning */}
          <AnimatePresence>
            {!riderLocation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
                  background: T.redDim, border: `1px solid ${T.redBdr}`,
                  borderRadius: 40, padding: '8px 20px',
                  fontFamily: T.mono, fontSize: 11, color: T.red, letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}
              >
                ⚠️ GPS signal not found
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── RIGHT — Order panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Order header card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: '18px 20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <p style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint, margin: '0 0 6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Order ID</p>
                <p style={{ fontFamily: T.mono, fontSize: 20, color: T.amber, fontWeight: 600, margin: 0 }}>
                  #{orderId?.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <InfoRow icon="👤" label="Customer" value={order.customerName} />
            {order.customerPhone && (
              <InfoRow icon="📞" label="Phone" value={order.customerPhone} mono />
            )}
            <InfoRow icon="📍" label="Address" value={order.deliveryAddress} />
          </motion.div>

          {/* Route metrics card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 18px' }}
          >
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textDim, margin: '0 0 14px' }}>Route Information</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <MetricCard icon="📏" label="Distance" value={routeInfo.distance ? `${routeInfo.distance} km` : '—'} loading={routeLoading} />
              <MetricCard icon="⏱️" label="Est. Time" value={routeInfo.duration ? `${routeInfo.duration} min` : '—'} loading={routeLoading} />
              <MetricCard icon="🏁" label="Go to" value={getDestLabel()} />
            </div>
          </motion.div>

          {/* Items card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 18px' }}
          >
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textDim, margin: '0 0 12px' }}>
              Order Items
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {order.items?.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: idx < order.items.length - 1 ? `1px solid ${T.border}` : 'none',
                }}>
                  <span style={{ fontSize: 13, color: T.textMid }}>
                    {item.name}
                    <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textFaint, marginLeft: 8 }}>×{item.quantity}</span>
                  </span>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: T.textMid }}>
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}`,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.textDim }}>Total</span>
              <span style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 600, color: T.amber }}>
                {formatCurrency(order.total)}
              </span>
            </div>
          </motion.div>

          {/* Action button card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 18px' }}
          >
            {updatingStatus ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 0' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${T.border}`, borderTopColor: T.amber, animation: 'nav-spin 0.7s linear infinite' }} />
                <span style={{ fontSize: 13, color: T.textDim }}>Updating status...</span>
              </div>
            ) : (
              <>
                {order.status === 'ready' && (
                  <ActionButton
                    icon="✓" label="Confirm Pickup"
                    variant="warning"
                    onClick={() => updateStatus('picked_up')}
                  />
                )}
                {order.status === 'picked_up' && (
                  <ActionButton
                    icon="🚚" label="Start Delivery"
                    variant="primary"
                    onClick={() => updateStatus('on_the_way')}
                  />
                )}
                {order.status === 'on_the_way' && (
                  <ActionButton
                    icon="✅" label="Mark Delivered"
                    variant="success"
                    onClick={() => updateStatus('delivered')}
                  />
                )}
                {!['ready', 'picked_up', 'on_the_way'].includes(order.status) && (
                  <p style={{ fontSize: 13, color: T.textDim, textAlign: 'center', margin: 0, padding: '8px 0' }}>
                    No action required for current status.
                  </p>
                )}
              </>
            )}
          </motion.div>

          {/* Debug info — dev only */}
          {process.env.NODE_ENV === 'development' && destination && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px' }}
            >
              <p style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint, margin: 0, letterSpacing: '0.04em' }}>
                🛠️ DEV · dest {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                {riderLocation && ` · rider ${riderLocation.lat.toFixed(4)}, ${riderLocation.lng.toFixed(4)}`}
              </p>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Navigation;