import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaImage, FaCheck, FaFire } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

/* ─── Inline Styles (no Bootstrap dependency) ─────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg:        #0f0f0f;
    --surface:   #181818;
    --surface2:  #222222;
    --border:    #2e2e2e;
    --gold:      #c9a84c;
    --gold-dim:  #8a6d2a;
    --gold-glow: rgba(201,168,76,0.15);
    --text:      #f0ece4;
    --text-dim:  #7a7468;
    --text-mid:  #b0a898;
    --red:       #e05252;
    --green:     #4caf82;
    --amber:     #e09a3a;
    --radius:    12px;
    --radius-sm: 8px;
    --transition: 0.2s cubic-bezier(0.4,0,0.2,1);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ma-root {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    padding: 32px 40px;
  }

  /* ─── Header ─── */
  .ma-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 36px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 28px;
  }
  .ma-header-left {}
  .ma-eyebrow {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 500;
    margin-bottom: 6px;
  }
  .ma-title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.5px;
  }
  .ma-subtitle {
    color: var(--text-dim);
    margin-top: 4px;
    font-size: 13px;
  }

  /* ─── Stat Pills ─── */
  .ma-stats {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .ma-stat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 10px 18px;
    text-align: center;
    min-width: 90px;
  }
  .ma-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: var(--gold);
    line-height: 1;
  }
  .ma-stat-label {
    font-size: 11px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 3px;
  }

  /* ─── Toolbar ─── */
  .ma-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }
  .ma-search-wrap {
    position: relative;
    flex: 1;
    max-width: 360px;
  }
  .ma-search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-dim);
    font-size: 13px;
    pointer-events: none;
  }
  .ma-search {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    padding: 10px 14px 10px 38px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    outline: none;
    transition: border-color var(--transition);
  }
  .ma-search:focus { border-color: var(--gold-dim); }
  .ma-search::placeholder { color: var(--text-dim); }

  .ma-filters {
    display: flex;
    gap: 6px;
  }
  .ma-filter-btn {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-mid);
    border-radius: 100px;
    padding: 7px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition);
    white-space: nowrap;
  }
  .ma-filter-btn:hover,
  .ma-filter-btn.active {
    background: var(--gold);
    border-color: var(--gold);
    color: #0f0f0f;
  }

  /* ─── Add Button ─── */
  .ma-add-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--gold);
    color: #0f0f0f;
    border: none;
    border-radius: var(--radius-sm);
    padding: 10px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition);
    white-space: nowrap;
  }
  .ma-add-btn:hover {
    background: #e0bc5e;
    transform: translateY(-1px);
    box-shadow: 0 4px 20px var(--gold-glow);
  }

  /* ─── Grid ─── */
  .ma-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  /* ─── Item Card ─── */
  .ma-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all var(--transition);
    position: relative;
  }
  .ma-card:hover {
    border-color: var(--gold-dim);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.4);
  }

  .ma-card-img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    display: block;
    background: var(--surface2);
  }
  .ma-card-img-placeholder {
    width: 100%;
    height: 180px;
    background: var(--surface2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--text-dim);
    font-size: 13px;
  }
  .ma-card-img-placeholder svg { font-size: 28px; opacity: 0.3; }

  .ma-card-status-bar {
    height: 3px;
    width: 100%;
    background: var(--border);
  }
  .ma-card-status-bar.available { background: var(--green); }
  .ma-card-status-bar.unavailable { background: var(--border); }

  .ma-card-body {
    padding: 18px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ma-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }
  .ma-card-name {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 500;
    color: var(--text);
    line-height: 1.3;
  }
  .ma-card-price {
    font-weight: 600;
    color: var(--gold);
    font-size: 15px;
    white-space: nowrap;
  }
  .ma-card-cat {
    display: inline-block;
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--text-dim);
    border-radius: 100px;
    padding: 3px 10px;
    font-size: 11px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-weight: 500;
    align-self: flex-start;
  }
  .ma-card-desc {
    color: var(--text-dim);
    font-size: 12.5px;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .ma-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-top: 1px solid var(--border);
    background: var(--surface2);
  }
  .ma-card-meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* Stock Badge */
  .ma-stock {
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .ma-stock-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .ma-stock-dot.high  { background: var(--green); }
  .ma-stock-dot.mid   { background: var(--amber); }
  .ma-stock-dot.low   { background: var(--red); }

  /* Toggle Switch */
  .ma-toggle {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
    cursor: pointer;
  }
  .ma-toggle input { display: none; }
  .ma-toggle-track {
    position: absolute;
    inset: 0;
    background: var(--border);
    border-radius: 100px;
    transition: background var(--transition);
  }
  .ma-toggle input:checked + .ma-toggle-track { background: var(--green); }
  .ma-toggle-thumb {
    position: absolute;
    left: 3px; top: 3px;
    width: 14px; height: 14px;
    background: #fff;
    border-radius: 50%;
    transition: transform var(--transition);
    pointer-events: none;
  }
  .ma-toggle input:checked ~ .ma-toggle-thumb { transform: translateX(16px); }

  /* Action Buttons */
  .ma-card-actions { display: flex; gap: 8px; }
  .ma-icon-btn {
    width: 32px; height: 32px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-dim);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 12px;
    transition: all var(--transition);
  }
  .ma-icon-btn:hover.edit   { background: rgba(201,168,76,0.12); border-color: var(--gold-dim); color: var(--gold); }
  .ma-icon-btn:hover.delete { background: rgba(224,82,82,0.12);  border-color: var(--red);       color: var(--red); }

  /* ─── Empty State ─── */
  .ma-empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 80px 20px;
    color: var(--text-dim);
  }
  .ma-empty-icon {
    font-size: 52px;
    opacity: 0.15;
    margin-bottom: 16px;
  }
  .ma-empty h3 {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: var(--text-mid);
    margin-bottom: 8px;
  }
  .ma-empty p { font-size: 13px; }

  /* ─── Overlay / Drawer ─── */
  .ma-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .ma-drawer {
    width: 520px;
    max-width: 100vw;
    height: 100vh;
    background: var(--surface);
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    animation: slideIn 0.25s cubic-bezier(0.4,0,0.2,1);
    overflow: hidden;
  }
  @keyframes slideIn {
    from { transform: translateX(40px); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }

  .ma-drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 28px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .ma-drawer-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: var(--text);
  }
  .ma-drawer-close {
    width: 32px; height: 32px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-dim);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 14px;
    transition: all var(--transition);
  }
  .ma-drawer-close:hover { border-color: var(--red); color: var(--red); }

  .ma-drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .ma-drawer-body::-webkit-scrollbar { width: 4px; }
  .ma-drawer-body::-webkit-scrollbar-track { background: transparent; }
  .ma-drawer-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .ma-drawer-footer {
    padding: 20px 28px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  /* ─── Form Fields ─── */
  .ma-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .ma-field { display: flex; flex-direction: column; gap: 6px; }
  .ma-field label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-dim);
  }
  .ma-field label span { color: var(--gold); margin-left: 2px; }

  .ma-input, .ma-select, .ma-textarea {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    padding: 10px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color var(--transition);
    width: 100%;
    appearance: none;
  }
  .ma-input:focus, .ma-select:focus, .ma-textarea:focus {
    border-color: var(--gold-dim);
    box-shadow: 0 0 0 3px var(--gold-glow);
  }
  .ma-input::placeholder, .ma-textarea::placeholder { color: var(--text-dim); }
  .ma-textarea { resize: vertical; min-height: 80px; }

  /* Image Upload Zone */
  .ma-upload-zone {
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: all var(--transition);
    position: relative;
    background: var(--surface2);
  }
  .ma-upload-zone:hover { border-color: var(--gold-dim); background: rgba(201,168,76,0.05); }
  .ma-upload-zone input {
    position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
  }
  .ma-upload-icon { font-size: 28px; color: var(--text-dim); margin-bottom: 8px; opacity: 0.4; }
  .ma-upload-text { font-size: 13px; color: var(--text-dim); }
  .ma-upload-preview {
    width: 100%; height: 160px; object-fit: cover;
    border-radius: var(--radius-sm); display: block;
  }

  /* Availability Toggle in Drawer */
  .ma-avail-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px 16px;
  }
  .ma-avail-label { font-size: 13px; font-weight: 500; }
  .ma-avail-sub   { font-size: 12px; color: var(--text-dim); margin-top: 2px; }

  /* Buttons */
  .ma-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    padding: 10px 22px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all var(--transition);
    display: flex; align-items: center; gap: 7px;
  }
  .ma-btn.primary {
    background: var(--gold);
    color: #0f0f0f;
    border-color: var(--gold);
  }
  .ma-btn.primary:hover { background: #e0bc5e; transform: translateY(-1px); }
  .ma-btn.primary:disabled { opacity: 0.5; transform: none; cursor: not-allowed; }
  .ma-btn.ghost {
    background: transparent;
    color: var(--text-mid);
    border-color: var(--border);
  }
  .ma-btn.ghost:hover { border-color: var(--text-mid); color: var(--text); }

  /* Loading */
  .ma-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 60vh; gap: 16px; color: var(--text-dim);
  }
  .ma-spinner {
    width: 36px; height: 36px;
    border: 2px solid var(--border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Confirm Dialog */
  .ma-confirm-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.8);
    z-index: 200;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.15s ease;
  }
  .ma-confirm-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 32px;
    max-width: 380px;
    width: 90%;
    text-align: center;
    animation: scaleIn 0.2s cubic-bezier(0.4,0,0.2,1);
  }
  @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .ma-confirm-icon { font-size: 36px; color: var(--red); margin-bottom: 16px; }
  .ma-confirm-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px; margin-bottom: 8px;
  }
  .ma-confirm-sub { color: var(--text-dim); font-size: 13px; margin-bottom: 24px; }
  .ma-confirm-actions { display: flex; gap: 10px; justify-content: center; }
  .ma-btn.danger { background: var(--red); color: #fff; border-color: var(--red); }
  .ma-btn.danger:hover { background: #c44040; }
`;

/* ─── Constants ────────────────────────────────────────────────────────── */
const CATEGORIES = ['All', 'Mains', 'Local Specials', 'Starters', 'Grill', 'Breads', 'Appetizers', 'Rice Dishes', 'Seafood'];

const EMPTY_FORM = {
  name: '', description: '', price: '', category: 'Mains',
  isAvailable: true, stockQuantity: 0, imageUrl: ''
};

/* ─── Helpers ──────────────────────────────────────────────────────────── */
const stockInfo = (qty) => {
  if (qty > 10) return { cls: 'high', label: `${qty} in stock` };
  if (qty > 0)  return { cls: 'mid',  label: `${qty} left` };
  return              { cls: 'low',   label: 'Out of stock' };
};

/* ─── Component ────────────────────────────────────────────────────────── */
const MenuAdmin = () => {
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [catFilter,   setCatFilter]   = useState('All');
  const [drawer,      setDrawer]      = useState(false);   // form drawer open
  const [editing,     setEditing]     = useState(null);    // item being edited
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [submitting,  setSubmitting]  = useState(false);
  const [confirm,     setConfirm]     = useState(null);    // { id, name }

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/menu');
      const data = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
      setItems(data);
    } catch {
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (item = null) => {
    setEditing(item);
    setForm(item
      ? { name: item.name||'', description: item.description||'', price: item.price||'',
          category: item.category||'Mains', isAvailable: item.isAvailable??true,
          stockQuantity: item.stockQuantity||0, imageUrl: item.imageUrl||'' }
      : EMPTY_FORM
    );
    setDrawer(true);
  };

  const closeDrawer = () => { setDrawer(false); setEditing(null); };

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setForm(f => ({ ...f, imageUrl: localUrl }));
    toast.info('Using local preview — Cloudinary upload coming soon');
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category) {
      toast.error('Please fill in all required fields'); return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity) };
      if (editing) {
        await api.put(`/menu/${editing.id}`, payload);
        toast.success('Item updated successfully');
      } else {
        await api.post('/menu', payload);
        toast.success('Item added successfully');
      }
      closeDrawer(); fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (item) => setConfirm({ id: item.id, name: item.name });

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await api.delete(`/menu/${confirm.id}`);
      toast.success('Item removed');
      fetchItems();
    } catch {
      toast.error('Failed to delete item');
    } finally {
      setConfirm(null);
    }
  };

  const toggleAvail = async (item) => {
    try {
      await api.put(`/menu/${item.id}`, { ...item, isAvailable: !item.isAvailable });
      toast.success(`${item.name} marked as ${!item.isAvailable ? 'available' : 'unavailable'}`);
      fetchItems();
    } catch {
      toast.error('Failed to update availability');
    }
  };

  /* ─── Derived ─── */
  const filtered = items.filter(it => {
    const matchCat = catFilter === 'All' || it.category === catFilter;
    const matchQ   = it.name?.toLowerCase().includes(search.toLowerCase())
                  || it.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  const totalAvail = items.filter(i => i.isAvailable).length;
  const lowStock   = items.filter(i => (i.stockQuantity||0) <= 5).length;

  /* ─── Render ─── */
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="ma-root">
        <div className="ma-loading">
          <div className="ma-spinner" />
          <span>Loading kitchen inventory…</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="ma-root">

        {/* Header */}
        <div className="ma-header">
          <div className="ma-header-left">
            <div className="ma-eyebrow">Kitchen Command</div>
            <h1 className="ma-title">Menu Management</h1>
            <p className="ma-subtitle">Mutindo Catering Services · Kalerwe, Kampala</p>
          </div>
          <div className="ma-stats">
            <div className="ma-stat">
              <div className="ma-stat-num">{items.length}</div>
              <div className="ma-stat-label">Total Items</div>
            </div>
            <div className="ma-stat">
              <div className="ma-stat-num">{totalAvail}</div>
              <div className="ma-stat-label">Available</div>
            </div>
            {lowStock > 0 && (
              <div className="ma-stat" style={{ borderColor: 'var(--amber)' }}>
                <div className="ma-stat-num" style={{ color: 'var(--amber)' }}>{lowStock}</div>
                <div className="ma-stat-label">Low Stock</div>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="ma-toolbar">
          <div className="ma-search-wrap">
            <FaSearch className="ma-search-icon" />
            <input
              className="ma-search"
              placeholder="Search dishes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="ma-filters">
            {CATEGORIES.slice(0, 6).map(cat => (
              <button
                key={cat}
                className={`ma-filter-btn ${catFilter === cat ? 'active' : ''}`}
                onClick={() => setCatFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <button className="ma-add-btn" onClick={() => openDrawer()}>
            <FaPlus size={11} /> New Item
          </button>
        </div>

        {/* Grid */}
        <div className="ma-grid">
          {filtered.length === 0 ? (
            <div className="ma-empty">
              <div className="ma-empty-icon">🍽</div>
              <h3>{search ? 'No dishes match your search' : 'No menu items yet'}</h3>
              <p>{search ? 'Try a different keyword or category.' : 'Click "New Item" to add your first dish.'}</p>
            </div>
          ) : filtered.map(item => {
            const stock = stockInfo(item.stockQuantity || 0);
            return (
              <div key={item.id} className="ma-card">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} className="ma-card-img" />
                  : <div className="ma-card-img-placeholder">
                      <FaImage /><span>No image</span>
                    </div>
                }

                <div className={`ma-card-status-bar ${item.isAvailable ? 'available' : 'unavailable'}`} />

                <div className="ma-card-body">
                  <div className="ma-card-top">
                    <span className="ma-card-name">{item.name}</span>
                    <span className="ma-card-price">{formatCurrency(item.price)}</span>
                  </div>
                  <span className="ma-card-cat">{item.category}</span>
                  {item.description && (
                    <p className="ma-card-desc">{item.description}</p>
                  )}
                </div>

                <div className="ma-card-footer">
                  <div className="ma-card-meta">
                    <div className="ma-stock" style={{ color: stock.cls === 'high' ? 'var(--green)' : stock.cls === 'mid' ? 'var(--amber)' : 'var(--red)' }}>
                      <div className={`ma-stock-dot ${stock.cls}`} />
                      {stock.label}
                    </div>
                    <label className="ma-toggle" title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}>
                      <input type="checkbox" checked={item.isAvailable} onChange={() => toggleAvail(item)} />
                      <div className="ma-toggle-track" />
                      <div className="ma-toggle-thumb" />
                    </label>
                  </div>

                  <div className="ma-card-actions">
                    <button className="ma-icon-btn edit" onClick={() => openDrawer(item)} title="Edit">
                      <FaEdit />
                    </button>
                    <button className="ma-icon-btn delete" onClick={() => confirmDelete(item)} title="Delete">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Drawer ─── */}
      {drawer && (
        <div className="ma-overlay" onClick={e => e.target === e.currentTarget && closeDrawer()}>
          <div className="ma-drawer">
            <div className="ma-drawer-header">
              <h2 className="ma-drawer-title">{editing ? 'Edit Dish' : 'Add New Dish'}</h2>
              <button className="ma-drawer-close" onClick={closeDrawer}><FaTimes /></button>
            </div>

            <div className="ma-drawer-body">

              {/* Image */}
              <div className="ma-field">
                <label>Dish Photo</label>
                <div className="ma-upload-zone">
                  <input type="file" accept="image/*" onChange={handleImage} />
                  {form.imageUrl
                    ? <img src={form.imageUrl} alt="preview" className="ma-upload-preview" />
                    : <>
                        <div className="ma-upload-icon"><FaImage /></div>
                        <p className="ma-upload-text">Click to upload an image</p>
                      </>
                  }
                </div>
              </div>

              {/* Name + Category */}
              <div className="ma-row">
                <div className="ma-field">
                  <label>Dish Name <span>*</span></label>
                  <input className="ma-input" name="name" value={form.name}
                    onChange={handleField} placeholder="e.g. Grilled Tilapia" />
                </div>
                <div className="ma-field">
                  <label>Category <span>*</span></label>
                  <select className="ma-select" name="category" value={form.category} onChange={handleField}>
                    {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="ma-field">
                <label>Description</label>
                <textarea className="ma-textarea" name="description" value={form.description}
                  onChange={handleField} placeholder="What makes this dish special?" />
              </div>

              {/* Price + Stock */}
              <div className="ma-row">
                <div className="ma-field">
                  <label>Price (UGX) <span>*</span></label>
                  <input className="ma-input" name="price" type="number" value={form.price}
                    onChange={handleField} placeholder="e.g. 15000" />
                </div>
                <div className="ma-field">
                  <label>Stock Quantity</label>
                  <input className="ma-input" name="stockQuantity" type="number" value={form.stockQuantity}
                    onChange={handleField} placeholder="e.g. 50" />
                </div>
              </div>

              {/* Availability */}
              <div className="ma-avail-row">
                <div>
                  <div className="ma-avail-label">Available for orders</div>
                  <div className="ma-avail-sub">Customers can add this dish to their cart</div>
                </div>
                <label className="ma-toggle">
                  <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleField} />
                  <div className="ma-toggle-track" />
                  <div className="ma-toggle-thumb" />
                </label>
              </div>

            </div>

            <div className="ma-drawer-footer">
              <button className="ma-btn ghost" onClick={closeDrawer}>Cancel</button>
              <button className="ma-btn primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving…' : <><FaCheck size={11} /> {editing ? 'Update Dish' : 'Add to Menu'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirm Delete ─── */}
      {confirm && (
        <div className="ma-confirm-overlay">
          <div className="ma-confirm-box">
            <div className="ma-confirm-icon"><FaTrash /></div>
            <h3 className="ma-confirm-title">Remove this dish?</h3>
            <p className="ma-confirm-sub">
              "<strong>{confirm.name}</strong>" will be permanently removed from your menu. This cannot be undone.
            </p>
            <div className="ma-confirm-actions">
              <button className="ma-btn ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="ma-btn danger" onClick={handleDelete}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuAdmin;