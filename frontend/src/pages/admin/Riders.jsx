import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

/* ─────────────────────────────────────────────────────────────
   Inject fonts + keyframes once on mount
───────────────────────────────────────────────────────────── */
const FONT_URL =
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap';

const KEYFRAMES = `
  @keyframes oa-pulse { 0%,100%{opacity:1} 50%{opacity:.25} }
  @keyframes oa-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes oa-slideup { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes oa-backdrop { from{opacity:0} to{opacity:1} }
`;

function injectStyles() {
  if (document.getElementById('riders-styles')) return;
  const s = document.createElement('style');
  s.id = 'riders-styles';
  s.textContent = KEYFRAMES;
  document.head.appendChild(s);
  const f = document.createElement('link');
  f.rel = 'stylesheet'; f.href = FONT_URL;
  document.head.appendChild(f);
}

/* ─── constants ───────────────────────────────────────────── */
const VEHICLE_TYPES = ['motorcycle', 'bicycle', 'car', 'scooter'];

const VEHICLE_ICONS = {
  motorcycle: '🏍',
  bicycle:    '🚲',
  car:        '🚗',
  scooter:    '🛵',
};

const VEHICLE_COLORS = {
  motorcycle: { bg: '#2a1a0a', border: '#5a3010', color: '#d47030' },
  bicycle:    { bg: '#0a2a1a', border: '#105a30', color: '#30d470' },
  car:        { bg: '#0a1a2a', border: '#10365a', color: '#3a90d4' },
  scooter:    { bg: '#1a0a2a', border: '#3a1060', color: '#9a50e4' },
};

const EMPTY_FORM = {
  name: '', email: '', phone: '', password: '',
  vehicleType: 'motorcycle', vehiclePlate: '',
  isActive: true, deliveryFee: 5000,
};

/* ─── tiny helpers ────────────────────────────────────────── */
function liveTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

/* ─── shared style tokens ─────────────────────────────────── */
const T = {
  bg0:     '#0f0d0b',
  bg1:     '#161210',
  bg2:     '#1e1a14',
  border:  '#2a2218',
  border2: '#2e2518',
  amber:   '#c97a2a',
  text:    '#f0e6d4',
  textMid: '#c8bca8',
  textDim: '#6b5e4a',
  textFaint:'#5a4e3e',
  mono:    "'DM Mono', monospace",
  sans:    "'Outfit', sans-serif",
  serif:   "'DM Serif Display', serif",
};

/* ─── sub-components ──────────────────────────────────────── */

function StatCard({ label, value, accentColor, delay = 0 }) {
  return (
    <div style={{
      background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 8,
      padding: '14px 16px', position: 'relative', overflow: 'hidden', flex: 1,
      animation: `oa-fadein 0.35s ease ${delay}s both`,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentColor }} />
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textDim, margin: '0 0 6px' }}>{label}</p>
      <p style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 500, color: T.text, margin: 0 }}>{value}</p>
    </div>
  );
}

function VehicleBadge({ type }) {
  const s = VEHICLE_COLORS[type] || VEHICLE_COLORS.motorcycle;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 4,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>
      {type}
    </span>
  );
}

function StatusToggle({ isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 5, cursor: 'pointer', border: 'none',
        background: isActive ? '#0a2a1a' : '#2a0a0a',
        color: isActive ? '#30d470' : '#d43030',
        fontFamily: T.sans, fontSize: 11, fontWeight: 600,
        letterSpacing: '0.04em', textTransform: 'uppercase',
        transition: 'all 0.15s',
      }}
    >
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: isActive ? '#30d470' : '#d43030',
        animation: isActive ? 'oa-pulse 2s ease-in-out infinite' : 'none',
      }} />
      {isActive ? 'Active' : 'Inactive'}
    </button>
  );
}

function IconButton({ onClick, color, hoverColor, title, children, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? (danger ? '#2a0a0a' : T.bg2) : 'transparent',
        border: `1px solid ${hov ? (danger ? '#5a1010' : T.amber) : T.border2}`,
        color: hov ? (danger ? '#d43030' : T.amber) : T.textDim,
        width: 30, height: 30, borderRadius: 5, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, transition: 'all 0.15s', flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

/* ── Modal shell ── */
function Modal({ show, onClose, title, children, width = 680 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (show) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16, animation: 'oa-backdrop 0.2s ease',
      }}
    >
      <div style={{
        background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12,
        width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto',
        animation: 'oa-slideup 0.25s ease',
      }}>
        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 22px', borderBottom: `1px solid ${T.border}`,
        }}>
          <span style={{ fontFamily: T.serif, fontSize: 18, color: T.text }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: `1px solid ${T.border2}`,
              color: T.textDim, width: 28, height: 28, borderRadius: 5,
              cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>
        <div style={{ padding: '20px 22px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ── form field ── */
function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.textDim }}>
        {label}{required && <span style={{ color: T.amber, marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: T.bg0, border: `1px solid ${T.border2}`, color: T.textMid,
  fontFamily: T.sans, fontSize: 13, padding: '9px 12px', borderRadius: 6,
  outline: 'none', width: '100%', transition: 'border-color 0.15s',
};

function Input({ ...props }) {
  const [foc, setFoc] = useState(false);
  return (
    <input
      {...props}
      style={{ ...inputStyle, borderColor: foc ? T.amber : T.border2 }}
      onFocus={() => setFoc(true)}
      onBlur={() => setFoc(false)}
    />
  );
}

function Select({ children, ...props }) {
  const [foc, setFoc] = useState(false);
  return (
    <select
      {...props}
      style={{ ...inputStyle, borderColor: foc ? T.amber : T.border2, cursor: 'pointer' }}
      onFocus={() => setFoc(true)}
      onBlur={() => setFoc(false)}
    >
      {children}
    </select>
  );
}

/* ─── main component ─────────────────────────────────────── */

const Riders = () => {
  const [riders, setRiders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [editingRider, setEditingRider] = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const [showLocModal, setShowLocModal] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [formData, setFormData]       = useState(EMPTY_FORM);
  const [clock, setClock]             = useState(liveTime());
  const [deleteConfirm, setDeleteConfirm] = useState(null); // rider to delete

  useEffect(() => {
    injectStyles();
    const id = setInterval(() => setClock(liveTime()), 30_000);
    return () => clearInterval(id);
  }, []);

  /* ── fetch ── */
  const fetchRiders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users?role=rider');
      const list = res.data?.users ?? (Array.isArray(res.data) ? res.data : []);
      setRiders(list.filter(u => u.role === 'rider'));
    } catch {
      toast.error('Failed to load riders');
      setRiders([{
        id: '1', name: 'John Doe', email: 'rider@example.com',
        phone: '+256700000002', vehicleType: 'motorcycle', vehiclePlate: 'UBA 123K',
        isActive: true, deliveryFee: 5000, totalDeliveries: 45, totalEarnings: 225000,
      }]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRiders(); }, [fetchRiders]);

  /* ── modal open ── */
  const handleOpenModal = (rider = null) => {
    setEditingRider(rider);
    setFormData(rider ? {
      name: rider.name || '', email: rider.email || '', phone: rider.phone || '',
      password: '', vehicleType: rider.vehicleType || 'motorcycle',
      vehiclePlate: rider.vehiclePlate || '',
      isActive: rider.isActive ?? true, deliveryFee: rider.deliveryFee || 5000,
    } : EMPTY_FORM);
    setShowModal(true);
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingRider && !formData.password) {
      toast.error('Password is required for new riders');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...formData, role: 'rider' };
      if (editingRider) {
        await api.put(`/users/${editingRider.id}`, payload);
        toast.success('Rider updated successfully!');
      } else {
        await api.post('/auth/register', payload);
        toast.success('Rider added successfully!');
      }
      setShowModal(false);
      fetchRiders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save rider');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async (rider) => {
    try {
      await api.delete(`/users/${rider.id}`);
      toast.success('Rider deleted');
      setDeleteConfirm(null);
      fetchRiders();
    } catch {
      toast.error('Failed to delete rider');
    }
  };

  /* ── toggle status ── */
  const handleToggleStatus = async (rider) => {
    try {
      await api.put(`/users/${rider.id}/toggle-status`, { isActive: !rider.isActive });
      setRiders(prev => prev.map(r => r.id === rider.id ? { ...r, isActive: !r.isActive } : r));
      toast.success(`${rider.name} is now ${!rider.isActive ? 'active' : 'inactive'}`);
    } catch {
      toast.error('Failed to update rider status');
    }
  };

  /* ── view location ── */
  const handleViewLocation = async (rider) => {
    setSelectedRider(rider);
    setShowLocModal(true);
    try {
      const res = await api.get(`/riders/location/${rider.id}`);
      if (res.data?.location) setSelectedRider({ ...rider, currentLocation: res.data.location });
    } catch { /* no location */ }
  };

  /* ── derived stats ── */
  const totalRiders     = riders.length;
  const activeRiders    = riders.filter(r => r.isActive).length;
  const totalDeliveries = riders.reduce((s, r) => s + (r.totalDeliveries || 0), 0);
  const totalEarnings   = riders.reduce((s, r) => s + (r.totalEarnings   || 0), 0);

  /* ── root styles ── */
  const root = { fontFamily: T.sans, background: T.bg0, minHeight: '100vh', color: T.textMid };

  if (loading) return (
    <div style={{ ...root, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: `2px solid ${T.border}`, borderTopColor: T.amber,
        animation: 'oa-pulse 0.7s linear infinite',
      }} />
      <p style={{ fontSize: 13, color: T.textDim, letterSpacing: '0.04em' }}>Loading riders…</p>
    </div>
  );

  return (
    <div style={root}>

      {/* ── Top bar ── */}
      <div style={{ background: T.bg1, borderBottom: `1px solid ${T.border}`, padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: T.amber, flexShrink: 0 }} />
          <span style={{ fontFamily: T.serif, fontSize: 17, color: T.text, letterSpacing: '0.02em' }}>
            Mutindo<em style={{ color: T.amber }}>Kitchen</em> — Riders
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: T.mono, fontSize: 13, color: '#7a6e5e', letterSpacing: '0.05em' }}>{clock}</span>
          <button
            onClick={() => handleOpenModal()}
            style={{
              background: T.amber, border: 'none', color: T.bg0,
              fontFamily: T.sans, fontSize: 12, fontWeight: 600,
              padding: '7px 16px', borderRadius: 6, cursor: 'pointer',
              letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> Add Rider
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ padding: '24px 28px' }}>
        <h1 style={{ fontFamily: T.serif, fontSize: 30, color: T.text, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Rider Management</h1>
        <p style={{ fontSize: 13, color: T.textDim, fontWeight: 300, margin: '0 0 22px' }}>Manage your delivery fleet — add, edit, track and toggle riders</p>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
          <StatCard label="Total Riders"      value={totalRiders}                accentColor={T.amber}    delay={0} />
          <StatCard label="Active Riders"     value={activeRiders}               accentColor="#30d470"    delay={0.05} />
          <StatCard label="Total Deliveries"  value={totalDeliveries}            accentColor="#3a90d4"    delay={0.1} />
          <StatCard label="Total Earnings"    value={formatCurrency(totalEarnings)} accentColor="#9a50e4" delay={0.15} />
        </div>

        {/* Table */}
        {riders.length === 0 ? (
          <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 10, padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 28, opacity: 0.3, marginBottom: 10 }}>◎</p>
            <p style={{ fontSize: 13, color: '#4a3e2e', fontWeight: 300 }}>No riders yet. Click <strong style={{ color: T.amber }}>Add Rider</strong> to get started.</p>
          </div>
        ) : (
          <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 820 }}>
                <thead>
                  <tr style={{ background: '#1a1610', borderBottom: `1px solid ${T.border}` }}>
                    {['Rider', 'Contact', 'Vehicle', 'Plate', 'Deliveries', 'Earnings', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{
                        padding: '10px 14px', textAlign: 'left',
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: T.textFaint, whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {riders.map((rider, idx) => (
                    <tr
                      key={rider.id}
                      style={{
                        borderBottom: idx < riders.length - 1 ? `1px solid #1e1a14` : 'none',
                        animation: `oa-fadein 0.25s ease ${idx * 0.04}s both`,
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#1a1610'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Rider name + avatar */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: T.bg2, border: `1px solid ${T.border2}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: T.mono, fontSize: 12, color: T.amber, fontWeight: 500, flexShrink: 0,
                          }}>
                            {rider.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500, color: '#e0d4c0', fontSize: 13 }}>{rider.name}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <div style={{ fontSize: 13, color: T.textMid }}>{rider.email}</div>
                        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textFaint, marginTop: 2 }}>{rider.phone}</div>
                      </td>

                      {/* Vehicle */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <VehicleBadge type={rider.vehicleType || 'motorcycle'} />
                      </td>

                      {/* Plate */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <span style={{ fontFamily: T.mono, fontSize: 12, color: T.textDim }}>
                          {rider.vehiclePlate || '—'}
                        </span>
                      </td>

                      {/* Deliveries */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <span style={{ fontFamily: T.mono, fontSize: 13, color: T.textMid }}>
                          {rider.totalDeliveries || 0}
                        </span>
                      </td>

                      {/* Earnings */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 500, color: '#e0d4c0' }}>
                          {formatCurrency(rider.totalEarnings || 0)}
                        </span>
                      </td>

                      {/* Status toggle */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <StatusToggle isActive={rider.isActive} onClick={() => handleToggleStatus(rider)} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <IconButton title="View location" onClick={() => handleViewLocation(rider)}>📍</IconButton>
                          <IconButton title="Edit rider"    onClick={() => handleOpenModal(rider)}>✏️</IconButton>
                          <IconButton title="Delete rider"  onClick={() => setDeleteConfirm(rider)} danger>🗑</IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* footer count */}
            <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.border}` }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textFaint }}>
                {riders.length} rider{riders.length !== 1 ? 's' : ''} total · {activeRiders} active
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          Add / Edit Rider Modal
      ══════════════════════════════════════ */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingRider ? `Edit Rider — ${editingRider.name}` : 'Add New Rider'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>

            <Field label="Full Name" required>
              <Input
                type="text" name="name" value={formData.name} required
                placeholder="Rider's full name"
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </Field>

            <Field label="Email Address" required>
              <Input
                type="email" name="email" value={formData.email} required
                placeholder="rider@example.com"
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </Field>

            <Field label="Phone Number" required>
              <Input
                type="tel" name="phone" value={formData.phone} required
                placeholder="+256700000000"
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </Field>

            {!editingRider && (
              <Field label="Password" required>
                <Input
                  type="password" name="password" value={formData.password} required
                  placeholder="Create a password"
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </Field>
            )}

            <Field label="Vehicle Type">
              <Select
                name="vehicleType" value={formData.vehicleType}
                onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
              >
                {VEHICLE_TYPES.map(t => (
                  <option key={t} value={t} style={{ background: T.bg2 }}>
                    {VEHICLE_ICONS[t]}  {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Plate Number">
              <Input
                type="text" name="vehiclePlate" value={formData.vehiclePlate}
                placeholder="e.g., UBA 123K"
                onChange={e => setFormData({ ...formData, vehiclePlate: e.target.value })}
              />
            </Field>

            <Field label="Delivery Fee (UGX)">
              <Input
                type="number" name="deliveryFee" value={formData.deliveryFee}
                placeholder="5000"
                onChange={e => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
              />
            </Field>

            <Field label="Availability">
              <div
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 6, cursor: 'pointer',
                  background: formData.isActive ? '#0a2a1a' : T.bg0,
                  border: `1px solid ${formData.isActive ? '#105a30' : T.border2}`,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 36, height: 20, borderRadius: 10, position: 'relative',
                  background: formData.isActive ? '#30d470' : T.border2,
                  transition: 'background 0.2s', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: 3, left: formData.isActive ? 18 : 3,
                    width: 14, height: 14, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s',
                  }} />
                </div>
                <span style={{ fontSize: 13, color: formData.isActive ? '#30d470' : T.textDim }}>
                  {formData.isActive ? 'Active & available' : 'Inactive'}
                </span>
              </div>
            </Field>
          </div>

          {/* form actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
            <button
              type="button" onClick={() => setShowModal(false)}
              style={{
                background: 'transparent', border: `1px solid ${T.border2}`, color: T.textDim,
                fontFamily: T.sans, fontSize: 13, fontWeight: 500,
                padding: '8px 18px', borderRadius: 6, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={submitting}
              style={{
                background: submitting ? '#7a4a1a' : T.amber, border: 'none', color: T.bg0,
                fontFamily: T.sans, fontSize: 13, fontWeight: 600,
                padding: '8px 22px', borderRadius: 6, cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {submitting ? 'Saving…' : (editingRider ? 'Update Rider' : 'Add Rider')}
            </button>
          </div>
        </form>
      </Modal>

      {/* ══════════════════════════════════════
          Location Modal
      ══════════════════════════════════════ */}
      <Modal show={showLocModal} onClose={() => setShowLocModal(false)} title={`Location — ${selectedRider?.name}`} width={420}>
        {selectedRider?.currentLocation ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📍</div>
            <div style={{ background: T.bg0, border: `1px solid ${T.border}`, borderRadius: 8, padding: '14px 18px', marginBottom: 14, textAlign: 'left' }}>
              {[
                ['Latitude',     selectedRider.currentLocation.lat],
                ['Longitude',    selectedRider.currentLocation.lng],
                ['Last Updated', new Date(selectedRider.currentLocation.updatedAt).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 12, color: T.textDim }}>{k}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: T.textMid }}>{v}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: T.textDim }}>Location updates automatically when the rider is online.</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 36, opacity: 0.3, marginBottom: 12 }}>◎</div>
            <p style={{ fontSize: 13, color: T.textDim }}>Location unavailable. The rider may be offline or hasn't shared their location yet.</p>
          </div>
        )}
      </Modal>

      {/* ══════════════════════════════════════
          Delete Confirm Modal
      ══════════════════════════════════════ */}
      <Modal show={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Rider" width={400}>
        <p style={{ fontSize: 14, color: T.textMid, marginBottom: 20, lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: T.text }}>{deleteConfirm?.name}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={() => setDeleteConfirm(null)}
            style={{
              background: 'transparent', border: `1px solid ${T.border2}`, color: T.textDim,
              fontFamily: T.sans, fontSize: 13, fontWeight: 500,
              padding: '8px 18px', borderRadius: 6, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => handleDelete(deleteConfirm)}
            style={{
              background: '#2a0a0a', border: '1px solid #5a1010', color: '#d43030',
              fontFamily: T.sans, fontSize: 13, fontWeight: 600,
              padding: '8px 18px', borderRadius: 6, cursor: 'pointer',
            }}
          >
            Delete Rider
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default Riders;