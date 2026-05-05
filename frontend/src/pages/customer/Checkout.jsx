import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaMapMarkerAlt, FaPhone, FaClock, FaMoneyBillWave,
  FaMobile, FaArrowRight, FaCheckCircle, FaTruck,
  FaBox, FaTrash, FaPlus, FaTimes
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import api from '../../services/api';
import { toast } from 'react-toastify';

/* ─────────────────────────────────────────
   STYLES — injected once into <head>
───────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600&display=swap');

:root {
  --ink:     #0C1410;
  --forest:  #143322;
  --forest2: #1B4230;
  --moss:    #2A5C42;
  --sage:    #4A7C5E;
  --mint:    #7EBD9A;
  --cream:   #F2EDE4;
  --cream2:  #E8E0D4;
  --warm:    #D4C9B8;
  --muted:   #8A9E94;
  --ember:   #E8622A;
  --ember2:  #FF8A5C;
  --gold:    #C9A45A;
  --white:   #FAFAF7;
}

/* ── Page ── */
.co-page {
  font-family: 'Outfit', sans-serif;
  background: var(--ink);
  min-height: 100vh;
  color: var(--cream);
}

/* ── Hero ── */
.co-hero {
  position: relative;
  background: var(--forest);
  padding: 80px 6vw 60px;
  overflow: hidden;
  border-bottom: 1px solid rgba(126,189,154,0.1);
}
.co-hero-mesh {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 55% 70% at 0% 50%, rgba(42,92,66,0.7) 0%, transparent 60%),
    radial-gradient(ellipse 40% 60% at 100% 0%, rgba(232,98,42,0.10) 0%, transparent 50%);
}
.co-eyebrow {
  font-size: 10px; font-weight: 600; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--mint);
  margin-bottom: 14px; display: flex; align-items: center; gap: 10px;
}
.co-eyebrow::before { content: ''; width: 28px; height: 1px; background: var(--mint); }
.co-hero-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2.6rem, 5vw, 4rem);
  font-weight: 700; color: var(--white);
  line-height: 1.04; margin-bottom: 14px; letter-spacing: -0.5px;
}
.co-hero-title em { color: var(--ember2); font-style: italic; }
.co-hero-sub {
  font-size: 0.95rem; font-weight: 300;
  color: var(--warm); line-height: 1.75; max-width: 480px;
}
.co-hero-orb {
  position: absolute; right: 7vw; top: 50%;
  transform: translateY(-50%);
  font-size: clamp(5rem, 10vw, 9rem);
  opacity: 0.07; pointer-events: none;
  animation: coFloat 6s ease-in-out infinite; filter: blur(1px);
}

/* Progress steps */
.co-steps {
  display: flex; align-items: center; margin-top: 36px; gap: 0;
}
.co-step {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 500; letter-spacing: 0.04em; color: var(--muted);
}
.co-step.done { color: var(--mint); }
.co-step-num {
  width: 22px; height: 22px; border-radius: 50%;
  border: 1.5px solid currentColor;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 600; flex-shrink: 0;
}
.co-step.done .co-step-num {
  background: var(--mint); border-color: var(--mint); color: var(--ink);
}
.co-step-sep { width: 28px; height: 1px; background: rgba(126,189,154,0.2); margin: 0 6px; }

/* ── Grid ── */
.co-main {
  max-width: 1200px; margin: 0 auto;
  padding: 44px 6vw 80px;
  display: grid; grid-template-columns: 1fr 360px;
  gap: 28px; align-items: start;
}
@media (max-width: 960px) {
  .co-main { grid-template-columns: 1fr; }
  .co-summary { position: static !important; }
}
@media (max-width: 640px) {
  .co-hero { padding: 60px 6vw 44px; }
  .co-hero-orb { display: none; }
}

/* ── Cards ── */
.co-card {
  background: var(--forest);
  border: 1px solid rgba(126,189,154,0.1);
  border-radius: 20px; overflow: hidden; margin-bottom: 20px;
  transition: box-shadow 0.3s;
}
.co-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
.co-card-head {
  display: flex; align-items: center; gap: 12px;
  padding: 22px 28px 18px;
  border-bottom: 1px solid rgba(126,189,154,0.08);
}
.co-card-head h3 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.15rem; font-weight: 600; color: var(--white); flex: 1; margin: 0;
}
.co-card-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: rgba(42,92,66,0.6);
  display: flex; align-items: center; justify-content: center;
  color: var(--mint); font-size: 14px; flex-shrink: 0;
}
.co-card-body { padding: 22px 28px; }

/* ── Saved Addresses ── */
.co-addr-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
.co-addr-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 14px;
  background: rgba(12,20,16,0.4);
  border: 1.5px solid rgba(126,189,154,0.08);
  border-radius: 12px; cursor: pointer; transition: all 0.2s;
}
.co-addr-item:hover { border-color: rgba(126,189,154,0.25); background: rgba(42,92,66,0.2); }
.co-addr-item.selected { border-color: var(--mint); background: rgba(126,189,154,0.06); }
.co-addr-content {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.82rem; color: var(--warm);
}
.co-addr-content svg { color: var(--sage); flex-shrink: 0; }
.co-addr-del {
  background: none; border: none; color: rgba(232,98,42,0.4);
  cursor: pointer; font-size: 12px; padding: 4px 6px;
  border-radius: 6px; transition: color 0.2s;
}
.co-addr-del:hover { color: var(--ember); }

/* ── Form fields ── */
.co-field { margin-bottom: 18px; }
.co-label {
  display: block; font-size: 10px; font-weight: 600;
  letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--muted); margin-bottom: 8px;
}
.co-input-wrap { position: relative; }
.co-field-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: var(--sage); font-size: 13px; pointer-events: none;
}
.co-field-icon.top { top: 15px; transform: none; }

.co-input, .co-textarea {
  width: 100%; background: rgba(12,20,16,0.5);
  border: 1.5px solid rgba(126,189,154,0.1); border-radius: 12px;
  padding: 13px 14px 13px 42px;
  font-family: 'Outfit', sans-serif; font-size: 0.9rem; color: var(--cream);
  outline: none; transition: border-color 0.2s, background 0.2s;
}
.co-textarea { padding-top: 12px; resize: vertical; }
.co-input:focus, .co-textarea:focus {
  border-color: rgba(126,189,154,0.4); background: rgba(12,20,16,0.8);
}
.co-input::placeholder, .co-textarea::placeholder {
  color: var(--muted); font-size: 0.85rem;
}

/* ── Save address toggle ── */
.co-save-link {
  background: none; border: none; color: var(--muted);
  font-family: 'Outfit', sans-serif; font-size: 12px;
  cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
  margin-bottom: 16px; transition: color 0.2s; padding: 0;
}
.co-save-link:hover { color: var(--mint); }
.co-save-panel {
  background: rgba(12,20,16,0.4);
  border: 1.5px solid rgba(126,189,154,0.15);
  border-radius: 12px; padding: 16px; margin-bottom: 16px;
}
.co-save-submit {
  width: 100%; padding: 11px;
  background: rgba(126,189,154,0.1);
  border: 1.5px solid rgba(126,189,154,0.25);
  border-radius: 10px; color: var(--mint);
  font-family: 'Outfit', sans-serif; font-size: 13px;
  font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.co-save-submit:hover:not(:disabled) { background: rgba(126,189,154,0.2); }
.co-save-submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Payment Methods ── */
.co-pay-heading {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem; font-weight: 600; color: var(--white);
  margin-bottom: 14px; display: block;
}
.co-pay-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
.co-pay-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  background: rgba(12,20,16,0.4);
  border: 1.5px solid rgba(126,189,154,0.08);
  border-radius: 14px; cursor: pointer; transition: all 0.2s; position: relative;
}
.co-pay-card:hover { border-color: rgba(126,189,154,0.25); }
.co-pay-card.selected {
  border-color: var(--mint); background: rgba(126,189,154,0.06);
}
.co-pay-check {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  color: var(--mint); font-size: 1rem;
}
.co-pay-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.co-pay-icon.cash { background: rgba(42,92,66,0.5); color: var(--mint); font-size: 22px; }
.co-pay-icon.mtn  { background: #2A2200; color: #FFCB05;
  font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800; }
.co-pay-icon.air  { background: #1F0003; color: #FF4455;
  font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800; }
.co-pay-name {
  display: block; font-size: 0.88rem; color: var(--cream); margin-bottom: 3px; font-weight: 500;
}
.co-pay-desc { font-size: 11px; color: var(--muted); }

/* ── Submit Button ── */
.co-submit {
  width: 100%; padding: 17px; border: none; border-radius: 14px; cursor: pointer;
  font-family: 'Outfit', sans-serif; font-size: 0.95rem; font-weight: 600;
  background: linear-gradient(135deg, #E8622A, #FF8A5C);
  color: #fff; display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: all 0.3s; position: relative; overflow: hidden;
}
.co-submit:hover:not(:disabled) {
  transform: translateY(-2px); box-shadow: 0 10px 32px rgba(232,98,42,0.3);
}
.co-submit:disabled { opacity: 0.55; cursor: not-allowed; }
.co-submit-shimmer {
  position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%);
  animation: coShimmer 2.5s infinite;
}
.co-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: coSpin 0.7s linear infinite; flex-shrink: 0;
}

/* ── Summary Card ── */
.co-summary {
  background: var(--forest);
  border: 1px solid rgba(126,189,154,0.1);
  border-radius: 20px; overflow: hidden;
  position: sticky; top: 24px;
}
.co-sum-head {
  display: flex; align-items: center; gap: 12px;
  padding: 22px 24px 18px;
  border-bottom: 1px solid rgba(126,189,154,0.08);
}
.co-sum-head h3 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem; font-weight: 600; color: var(--white); flex: 1; margin: 0;
}
.co-count {
  font-size: 11px; padding: 4px 10px;
  background: rgba(126,189,154,0.1); border-radius: 20px;
  color: var(--mint); font-weight: 500;
}
.co-items { padding: 18px 24px; max-height: 260px; overflow-y: auto; }
.co-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
}
.co-item:last-child { border-bottom: none; }
.co-item-name { font-size: 0.85rem; color: var(--cream); }
.co-item-qty { font-size: 11px; color: var(--muted); margin-left: 6px; }
.co-item-price { font-size: 0.85rem; font-weight: 500; color: var(--ember2); }

.co-totals {
  padding: 18px 24px;
  border-top: 1px solid rgba(126,189,154,0.08);
  border-bottom: 1px solid rgba(126,189,154,0.08);
}
.co-total-row {
  display: flex; justify-content: space-between;
  padding: 7px 0; font-size: 0.85rem; color: var(--muted);
}
.co-free { color: var(--mint); font-weight: 500; }
.co-free-banner {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 14px; margin-top: 10px;
  background: rgba(126,189,154,0.06);
  border: 1px solid rgba(126,189,154,0.15);
  border-radius: 10px; font-size: 11px; color: var(--mint);
}
.co-divider { height: 1px; background: rgba(126,189,154,0.08); margin: 14px 0; }
.co-grand { display: flex; justify-content: space-between; align-items: baseline; }
.co-grand-label {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.05rem; font-weight: 600; color: var(--white);
}
.co-grand-amount {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.65rem; font-weight: 700; color: var(--ember2); letter-spacing: -0.5px;
}

.co-eta {
  display: flex; gap: 12px; align-items: center;
  margin: 16px 24px 20px;
  padding: 14px 16px;
  background: rgba(42,92,66,0.3);
  border: 1px solid rgba(126,189,154,0.15);
  border-radius: 12px;
}
.co-eta svg { color: var(--mint); flex-shrink: 0; }
.co-eta strong { display: block; font-size: 0.8rem; color: var(--cream); margin-bottom: 3px; }
.co-eta p { font-size: 11px; color: var(--muted); margin: 0; }

/* ── Animations ── */
@keyframes coFloat {
  0%, 100% { transform: translateY(-50%) rotate(-4deg); }
  50%       { transform: translateY(calc(-50% - 18px)) rotate(4deg); }
}
@keyframes coShimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
@keyframes coSpin { to { transform: rotate(360deg); } }
`;

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
const paymentMethods = [
  {
    id: 'cash',
    name: 'Cash on Delivery',
    desc: 'Pay when your order arrives',
    iconClass: 'cash',
    Icon: FaMoneyBillWave,
  },
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    desc: '077 · 078 — MoMo push prompt',
    iconClass: 'mtn',
    label: 'M',
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    desc: '070 · 075 — Airtel push prompt',
    iconClass: 'air',
    label: 'A',
  },
];

const STEPS = ['Cart', 'Checkout', 'Payment', 'Tracking'];

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    deliveryAddress: '',
    phone: user?.phone || '',
    instructions: '',
    paymentMethod: 'cash',
  });
  const [loading, setLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showSavePanel, setShowSavePanel] = useState(false);

  /* Inject styles once */
  useEffect(() => {
    const el = document.createElement('style');
    el.innerHTML = STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) {
      toast.info('Your cart is empty');
      navigate('/menu');
    }
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (Array.isArray(res.data)) setAddresses(res.data);
    } catch { /* no saved addresses yet */ }
  };

  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAddressSelect = (addressId) => {
    const addr = addresses.find((a) => a.id === addressId);
    if (!addr) return;
    setSelectedAddressId(addressId);
    setFormData((f) => ({ ...f, deliveryAddress: addr.fullAddress, phone: addr.phone }));
    setShowSavePanel(false);
  };

  const handleSaveAddress = async () => {
    if (!formData.deliveryAddress) { toast.error('Enter an address first'); return; }
    setSavingAddress(true);
    try {
      await api.post('/addresses', { fullAddress: formData.deliveryAddress, phone: formData.phone });
      toast.success('Address saved!');
      fetchAddresses();
      setShowSavePanel(false);
    } catch { toast.error('Failed to save address'); }
    finally { setSavingAddress(false); }
  };

  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/addresses/${id}`);
      toast.success('Address removed');
      fetchAddresses();
      if (selectedAddressId === id) {
        setSelectedAddressId('');
        setFormData((f) => ({ ...f, deliveryAddress: '', phone: user?.phone || '' }));
      }
    } catch { toast.error('Failed to delete address'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deliveryAddress) { toast.error('Please enter a delivery address'); return; }
    setLoading(true);
    try {
      const deliveryFee = cartTotal > 50000 ? 0 : 5000;
      const orderData = {
        items: cartItems.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
        subtotal: cartTotal,
        deliveryFee,
        total: cartTotal + deliveryFee,
        deliveryAddress: formData.deliveryAddress,
        phone: formData.phone,
        instructions: formData.instructions,
        paymentMethod: formData.paymentMethod,
      };
      const res = await api.post('/orders', orderData);
      toast.success('Order placed!');
      clearCart();
      formData.paymentMethod === 'cash'
        ? navigate(`/tracking/${res.data.order.id}`)
        : navigate(`/payment/${res.data.order.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  const deliveryFee = cartTotal > 50000 ? 0 : 5000;
  const total = cartTotal + deliveryFee;
  const freeNeeded = cartTotal < 50000 ? 50000 - cartTotal : 0;

  return (
    <div className="co-page">
      {/* ── Hero ── */}
      <div className="co-hero">
        <div className="co-hero-mesh" />
        <div className="co-eyebrow">Secure Checkout</div>
        <h1 className="co-hero-title">
          Complete Your <em>Order</em>
        </h1>
        <p className="co-hero-sub">
          Review your items and provide delivery details to finalize your order.
        </p>
        <div className="co-steps">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <div className="co-step-sep" />}
              <div className={`co-step${i <= 1 ? ' done' : ''}`}>
                <div className="co-step-num">{i < 1 ? '✓' : i + 1}</div>
                <span>{s}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="co-hero-orb">📦</div>
      </div>

      {/* ── Main grid ── */}
      <div className="co-main">

        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Delivery Card */}
          <div className="co-card">
            <div className="co-card-head">
              <div className="co-card-icon"><FaMapMarkerAlt /></div>
              <h3>Delivery Information</h3>
            </div>
            <form className="co-card-body" onSubmit={handleSubmit}>

              {/* Saved addresses */}
              {addresses.length > 0 && (
                <>
                  <div className="co-label">Saved Addresses</div>
                  <div className="co-addr-list">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`co-addr-item${selectedAddressId === addr.id ? ' selected' : ''}`}
                        onClick={() => handleAddressSelect(addr.id)}
                      >
                        <div className="co-addr-content">
                          <FaMapMarkerAlt size={12} />
                          <span>{addr.fullAddress}</span>
                        </div>
                        <button
                          type="button"
                          className="co-addr-del"
                          onClick={(e) => handleDeleteAddress(addr.id, e)}
                        >
                          <FaTrash size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Address textarea */}
              <div className="co-field">
                <label className="co-label">Delivery Address *</label>
                <div className="co-input-wrap">
                  <FaMapMarkerAlt className="co-field-icon top" />
                  <textarea
                    rows={3}
                    name="deliveryAddress"
                    className="co-textarea"
                    value={formData.deliveryAddress}
                    onChange={handleChange}
                    placeholder="Full address — street, building, landmark…"
                    required
                  />
                </div>
              </div>

              {/* Save toggle */}
              <button
                type="button"
                className="co-save-link"
                onClick={() => setShowSavePanel((v) => !v)}
              >
                {showSavePanel ? <FaTimes size={11} /> : <FaPlus size={11} />}
                {showSavePanel ? 'Cancel' : 'Save this address'}
              </button>

              {showSavePanel && (
                <div className="co-save-panel">
                  <div className="co-field">
                    <label className="co-label">Phone for this address</label>
                    <div className="co-input-wrap">
                      <FaPhone className="co-field-icon" />
                      <input
                        type="tel"
                        name="phone"
                        className="co-input"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="077 XXX XXXX"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="co-save-submit"
                    onClick={handleSaveAddress}
                    disabled={savingAddress}
                  >
                    {savingAddress ? 'Saving…' : 'Save Address'}
                  </button>
                </div>
              )}

              {/* Phone (when panel closed) */}
              {!showSavePanel && (
                <div className="co-field">
                  <label className="co-label">Phone Number *</label>
                  <div className="co-input-wrap">
                    <FaPhone className="co-field-icon" />
                    <input
                      type="tel"
                      name="phone"
                      className="co-input"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="077 XXX XXXX"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="co-field">
                <label className="co-label">Delivery Instructions</label>
                <div className="co-input-wrap">
                  <FaClock className="co-field-icon top" />
                  <textarea
                    rows={2}
                    name="instructions"
                    className="co-textarea"
                    value={formData.instructions}
                    onChange={handleChange}
                    placeholder="Gate code, landmarks, preferred delivery time…"
                  />
                </div>
              </div>

              {/* ── Payment Methods ── */}
              <span className="co-pay-heading">Payment Method</span>
              <div className="co-pay-grid">
                {paymentMethods.map((m) => {
                  const isSelected = formData.paymentMethod === m.id;
                  return (
                    <div
                      key={m.id}
                      className={`co-pay-card${isSelected ? ' selected' : ''}`}
                      onClick={() => setFormData((f) => ({ ...f, paymentMethod: m.id }))}
                    >
                      <div className={`co-pay-icon ${m.iconClass}`}>
                        {m.Icon ? <m.Icon size={22} /> : m.label}
                      </div>
                      <div>
                        <span className="co-pay-name">{m.name}</span>
                        <span className="co-pay-desc">{m.desc}</span>
                      </div>
                      {isSelected && <FaCheckCircle className="co-pay-check" />}
                    </div>
                  );
                })}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="co-submit"
                disabled={loading || cartItems.length === 0}
              >
                <div className="co-submit-shimmer" />
                {loading ? (
                  <>
                    <span className="co-spinner" />
                    Placing Order…
                  </>
                ) : (
                  <>
                    <span>Place Order · {formatCurrency(total)}</span>
                    <FaArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── RIGHT — Summary ── */}
        <div className="co-summary">
          <div className="co-sum-head">
            <div className="co-card-icon"><FaBox /></div>
            <h3>Order Summary</h3>
            <span className="co-count">{cartItems.length} item{cartItems.length !== 1 && 's'}</span>
          </div>

          <div className="co-items">
            {cartItems.map((item) => (
              <div key={item.id} className="co-item">
                <div>
                  <span className="co-item-name">{item.name}</span>
                  <span className="co-item-qty">×{item.quantity}</span>
                </div>
                <span className="co-item-price">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="co-totals">
            <div className="co-total-row">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="co-total-row">
              <span>Delivery Fee</span>
              {deliveryFee === 0
                ? <span className="co-free">Free 🎉</span>
                : <span>{formatCurrency(deliveryFee)}</span>
              }
            </div>
            {freeNeeded > 0 && (
              <div className="co-free-banner">
                <FaTruck size={12} />
                Add {formatCurrency(freeNeeded)} more for free delivery!
              </div>
            )}
            <div className="co-divider" />
            <div className="co-grand">
              <span className="co-grand-label">Total</span>
              <span className="co-grand-amount">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="co-eta">
            <FaTruck size={18} />
            <div>
              <strong>Estimated Delivery</strong>
              <p>30–45 minutes after preparation begins</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;