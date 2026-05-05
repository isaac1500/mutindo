import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

/* ─── Inline styles ─── */
const S = {
  page: {
    minHeight: '100vh',
    background: '#0D0D0F',
    backgroundImage:
      'radial-gradient(ellipse 60% 40% at 20% 0%, rgba(201,168,76,0.08) 0%, transparent 60%),' +
      'radial-gradient(ellipse 50% 50% at 80% 100%, rgba(201,168,76,0.05) 0%, transparent 60%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    fontFamily: "'DM Sans', sans-serif",
  },
  wrap: { width: '100%', maxWidth: 460 },

  // Header
  brand: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.18em',
    color: '#C9A84C',
    textTransform: 'uppercase',
    marginBottom: '1rem',
    fontFamily: "'Syne', sans-serif",
  },
  orderBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: '#1A1A20',
    border: '1px solid rgba(201,168,76,0.2)',
    borderRadius: 40,
    padding: '6px 16px',
    marginBottom: '1.5rem',
  },
  orderDot: { width: 6, height: 6, borderRadius: '50%', background: '#C9A84C' },
  orderText: { fontSize: 12, color: '#A0A0B8', letterSpacing: '0.06em' },
  amount: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 50,
    fontWeight: 800,
    color: '#F5F4F0',
    lineHeight: 1,
    letterSpacing: '-2px',
  },
  amountCurrency: {
    fontSize: 20,
    fontWeight: 400,
    color: '#C9A84C',
    verticalAlign: 'super',
    letterSpacing: 0,
    marginRight: 4,
  },
  amountSub: {
    fontSize: 13,
    color: '#6E6E85',
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dotSep: { width: 3, height: 3, borderRadius: '50%', background: '#6E6E85' },

  // Card
  card: {
    background: '#1E1E28',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 24,
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
    marginTop: '1.5rem',
  },
  cardTopLine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)',
  },

  sectionLabel: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#6E6E85',
    marginBottom: 14,
  },

  // Methods
  methods: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '2rem' },
  methodCard: (active) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    background: active ? 'rgba(201,168,76,0.06)' : '#1A1A20',
    border: `1.5px solid ${active ? '#C9A84C' : 'rgba(255,255,255,0.07)'}`,
    borderRadius: 16,
    padding: '18px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
  }),
  activeDot: {
    position: 'absolute',
    top: 10, right: 10,
    width: 8, height: 8,
    borderRadius: '50%',
    background: '#C9A84C',
  },
  mtnIcon: {
    width: 42, height: 42, borderRadius: 12,
    background: '#2A2200', color: '#FFCB05',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif",
  },
  airtelIcon: {
    width: 42, height: 42, borderRadius: 12,
    background: '#1F0003', color: '#FF0015',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif",
  },
  methodName: { fontSize: 13, fontWeight: 500, color: '#F5F4F0', textAlign: 'center', lineHeight: 1.3 },
  methodSub: { fontSize: 11, color: '#6E6E85', textAlign: 'center' },

  // Input
  inputWrap: { marginBottom: '1.5rem', position: 'relative' },
  phoneInput: {
    width: '100%',
    background: '#1A1A20',
    border: '1.5px solid rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: '16px 16px 16px 46px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 16,
    color: '#F5F4F0',
    outline: 'none',
    letterSpacing: '0.05em',
    transition: 'border-color 0.2s',
  },
  inputHint: {
    fontSize: 12,
    color: '#6E6E85',
    marginTop: 8,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    paddingLeft: 4,
  },

  // Error
  errorBox: {
    background: 'rgba(220,50,50,0.06)',
    border: '1px solid rgba(220,50,50,0.2)',
    borderRadius: 16,
    padding: 16,
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    marginTop: '1rem',
  },
  errorText: { fontSize: 13, color: '#FF8A8A', lineHeight: 1.5 },

  // Divider
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '1.5rem 0' },
  dividerLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' },
  dividerText: { fontSize: 11, color: '#6E6E85', letterSpacing: '0.06em' },

  // Pay Button
  payBtn: (disabled) => ({
    width: '100%',
    padding: '18px',
    border: 'none',
    borderRadius: 14,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Syne', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '0.06em',
    background: disabled
      ? 'rgba(201,168,76,0.4)'
      : 'linear-gradient(135deg, #C9A84C, #E8C96E, #C9A84C)',
    color: '#0D0D0F',
    textTransform: 'uppercase',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.3s ease',
  }),

  // States
  processingBox: {
    background: '#1A1A20',
    border: '1px solid rgba(201,168,76,0.2)',
    borderRadius: 16,
    padding: 20,
    textAlign: 'center',
    marginTop: '1.5rem',
  },
  waitingBox: {
    background: 'rgba(46,204,113,0.05)',
    border: '1px solid rgba(46,204,113,0.2)',
    borderRadius: 16,
    padding: 20,
    textAlign: 'center',
    marginTop: '1.5rem',
  },

  // Trust
  trust: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: '#6E6E85', marginTop: '1.5rem' },
  trustDot: { width: 5, height: 5, borderRadius: '50%', background: '#2ECC71', flexShrink: 0 },
};

/* ─── Keyframe injection ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes pulsering {
    0%   { box-shadow: 0 0 0 0 rgba(46,204,113,0.4); }
    70%  { box-shadow: 0 0 0 12px transparent; }
    100% { box-shadow: 0 0 0 0 transparent; }
  }
  .phone-focus:focus { border-color: #C9A84C !important; }
`;

const PhoneIcon = () => (
  <svg style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'#6E6E85', pointerEvents:'none' }}
    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="2" width="14" height="20" rx="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);

const Spinner = ({ color = '#C9A84C', size = 36 }) => (
  <div style={{
    width: size, height: size,
    border: `2.5px solid rgba(201,168,76,0.15)`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 12px',
  }} />
);

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    fetchOrderDetails();
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch {
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!phoneNumber.trim()) { setError('Please enter your mobile money number.'); return; }
    if (phoneNumber.replace(/\s/g, '').length < 10) { setError('Enter a valid 10-digit phone number.'); return; }
    setProcessing(true);
    setError('');
    try {
      const endpoint = paymentMethod === 'mtn' ? '/payments/mtn/initiate' : '/payments/airtel/initiate';
      const response = await api.post(endpoint, { orderId, phoneNumber, amount: order.total });
      setPaymentId(response.data.paymentId);
      toast.success(response.data.message);
      startPolling(response.data.paymentId);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment initiation failed. Please try again.');
      setProcessing(false);
    }
  };

  const startPolling = (pid) => {
    setCheckingStatus(true);
    intervalRef.current = setInterval(async () => {
      try {
        const response = await api.get(`/payments/status/${pid}`);
        if (response.data.status === 'completed') {
          clearInterval(intervalRef.current);
          toast.success('Payment successful!');
          navigate(`/tracking/${orderId}`);
        } else if (response.data.status === 'failed') {
          clearInterval(intervalRef.current);
          toast.error('Payment failed. Please try again.');
          setProcessing(false);
          setCheckingStatus(false);
          setPaymentId(null);
        }
      } catch { /* silent */ }
    }, 3000);
    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      setCheckingStatus(false);
      toast.info('Payment confirmation is taking longer. Check your order status later.');
      navigate('/orders');
    }, 300000);
  };

  if (loading) {
    return (
      <div style={S.page}>
        <div style={{ textAlign: 'center' }}>
          <Spinner />
          <p style={{ color: '#6E6E85', marginTop: 8, fontSize: 14 }}>Loading order details…</p>
        </div>
      </div>
    );
  }

  const providerName = paymentMethod === 'mtn' ? 'MTN Mobile Money' : 'Airtel Money';

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center' }}>
          <div style={S.brand}>Secure Checkout</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={S.orderBadge}>
              <div style={S.orderDot} />
              <span style={S.orderText}>Order #{orderId?.slice(0, 8)} · Ready to pay</span>
            </div>
          </div>
          <div style={S.amount}>
            <span style={S.amountCurrency}>UGX</span>
            {order?.total?.toLocaleString()}
          </div>
          <div style={S.amountSub}>
            <span>Food: {formatCurrency(order?.subtotal)}</span>
            <div style={S.dotSep} />
            <span>Delivery: {formatCurrency(order?.deliveryFee)}</span>
          </div>
        </div>

        {/* ── Card ── */}
        <div style={S.card}>
          <div style={S.cardTopLine} />

          {/* Method picker */}
          <div style={S.sectionLabel}>Choose payment method</div>
          <div style={S.methods}>
            {[
              { id: 'mtn', label: 'MTN Mobile Money', sub: '077 · 078', iconStyle: S.mtnIcon, letter: 'M' },
              { id: 'airtel', label: 'Airtel Money', sub: '070 · 075', iconStyle: S.airtelIcon, letter: 'A' },
            ].map(m => {
              const active = paymentMethod === m.id;
              return (
                <div key={m.id} style={S.methodCard(active)} onClick={() => !processing && setPaymentMethod(m.id)}>
                  {active && <div style={S.activeDot} />}
                  <div style={m.iconStyle}>{m.letter}</div>
                  <div style={S.methodName}>{m.label}</div>
                  <div style={S.methodSub}>{m.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Phone input */}
          <div style={S.sectionLabel}>Mobile money number</div>
          <div style={S.inputWrap}>
            <PhoneIcon />
            <input
              className="phone-focus"
              type="tel"
              style={S.phoneInput}
              placeholder="077 XXX XXX (e.g. 0771234567)"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              disabled={processing}
              maxLength={13}
            />
          </div>
          <div style={S.inputHint}>
            <span style={{ flexShrink: 0, marginTop: 1, color: '#6E6E85' }}>ℹ</span>
            <span>You'll receive a push prompt on this number to approve the payment</span>
          </div>

          {/* Error */}
          {error && (
            <div style={S.errorBox}>
              <span style={{ color: '#FF8A8A', fontSize: 14, flexShrink: 0 }}>✕</span>
              <div style={S.errorText}>{error}</div>
            </div>
          )}

          {/* Divider */}
          <div style={S.divider}>
            <div style={S.dividerLine} />
            <span style={S.dividerText}>256-bit Encrypted · Safe</span>
            <div style={S.dividerLine} />
          </div>

          {/* Pay button — hidden once payment is initiated */}
          {!paymentId && (
            <button style={S.payBtn(processing)} onClick={handlePayment} disabled={processing}>
              {processing ? 'Initiating…' : `Pay UGX ${order?.total?.toLocaleString()}`}
            </button>
          )}

          {/* Processing state */}
          {processing && !checkingStatus && (
            <div style={S.processingBox}>
              <Spinner />
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: '#F5F4F0', marginBottom: 6 }}>
                Initiating payment…
              </div>
              <div style={{ fontSize: 13, color: '#6E6E85' }}>Connecting to {providerName}</div>
            </div>
          )}

          {/* Waiting for confirmation */}
          {paymentId && checkingStatus && (
            <div style={S.waitingBox}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(46,204,113,0.1)', border: '2px solid #2ECC71',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', animation: 'pulsering 1.5s ease-out infinite',
                fontSize: 20,
              }}>📲</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: '#2ECC71', marginBottom: 6 }}>
                Check your phone
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#F5F4F0', margin: '8px 0 4px' }}>
                {phoneNumber}
              </div>
              <div style={{ fontSize: 13, color: '#A0A0B8' }}>
                Approve the payment request on your phone to complete this order
              </div>
            </div>
          )}

          {/* Trust row */}
          <div style={S.trust}>
            <div style={S.trustDot} />
            <span>No card data stored · Powered by MoMo API</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;