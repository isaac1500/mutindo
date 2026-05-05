import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaSearch, FaTimes } from 'react-icons/fa';

/* ─── PEXELS IMAGES PER CATEGORY ────────────────────────────────────────── */
const CATEGORY_IMAGES = {
  'Starters': [
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=700',
    'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=700',
    'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=700',
  ],
  'Mains': [
    'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=700',
    'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=700',
    'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=700',
  ],
  'Local Specials': [
    'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=700',
    'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=700',
    'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=700',
  ],
  'Drinks': [
    'https://images.pexels.com/photos/109275/pexels-photo-109275.jpeg?auto=compress&cs=tinysrgb&w=700',
    'https://images.pexels.com/photos/1194030/pexels-photo-1194030.jpeg?auto=compress&cs=tinysrgb&w=700',
    'https://images.pexels.com/photos/3407777/pexels-photo-3407777.jpeg?auto=compress&cs=tinysrgb&w=700',
  ],
  'Desserts': [
    'https://images.pexels.com/photos/1120462/pexels-photo-1120462.jpeg?auto=compress&cs=tinysrgb&w=700',
    'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=700',
    'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=700',
  ],
};

const HERO_IMG = '/WhatsApp%20Image%202026-04-27%20at%2011.31.32%20PM.jpeg';
const HERO_IMG2 = '/WhatsApp Image 2026-04-27 at 11.31.32 PM.jpeg';
const HERO_IMG3 = '/WhatsApp Image 2026-04-27 at 11.34.05 PM (1).jpeg';

function getDefaultImage(category, seed = 0) {
  const arr = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Mains'];
  return arr[seed % arr.length];
}

/* ─── CATEGORY CONFIG ────────────────────────────────────────────────────── */
const CATS = {
  'all':            { label: 'All Items',      color: '#c8a96e', icon: '✦' },
  'Starters':       { label: 'Starters',       color: '#00C9A7', icon: '🥗' },
  'Mains':          { label: 'Mains',          color: '#e8724a', icon: '🍽️' },
  'Local Specials': { label: 'Local Specials', color: '#FFD700', icon: '🍌' },
  'Drinks':         { label: 'Drinks',         color: '#4fc3f7', icon: '🥤' },
  'Desserts':       { label: 'Desserts',       color: '#f48fb1', icon: '🍮' },
};

const getCat = (key) => CATS[key] || { label: key, color: '#c8a96e', icon: '🍴' };

/* ─── MOCK DATA ──────────────────────────────────────────────────────────── */
const MOCK = [
  { id: 1, name: 'Matooke & Beef', description: 'Steamed green bananas with slow-cooked beef stew and groundnut sauce', price: 12000, category: 'Local Specials', available: true },
  { id: 2, name: 'Grilled Tilapia', description: 'Fresh Nile perch seasoned with Ugandan spices, served with chips and salad', price: 25000, category: 'Mains', available: true },
  { id: 3, name: 'Super Rolex', description: 'Chapati rolled with eggs, fresh vegetables, and our signature chilli sauce', price: 8000, category: 'Starters', available: true },
  { id: 4, name: 'Chicken Pilau', description: 'Fragrant spiced basmati rice with tender slow-cooked chicken', price: 15000, category: 'Mains', available: true },
  { id: 5, name: 'Beef Samosa', description: 'Crispy golden pastry filled with spiced minced beef and herbs', price: 5000, category: 'Starters', available: true },
  { id: 6, name: 'Fresh Passion Juice', description: 'Freshly squeezed passion fruit — cold and perfectly balanced', price: 4000, category: 'Drinks', available: true },
  { id: 7, name: 'Matoke Posho', description: 'Traditional Ugandan staple — soft posho with groundnut stew', price: 9000, category: 'Local Specials', available: true },
  { id: 8, name: 'Mandazi', description: 'Soft East African doughnuts with a hint of cardamom and coconut', price: 3000, category: 'Desserts', available: true },
];

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
const Menu = () => {
  const [menuItems, setMenuItems]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch]           = useState('');
  const [addedIds, setAddedIds]       = useState({});
  const [visible, setVisible]         = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [imageUrl, setImageUrl]       = useState('');
  const [previewUrl, setPreviewUrl]   = useState('');
  const [heroLoaded, setHeroLoaded]   = useState(false);
  const { addToCart } = useCart();
  const gridRef = useRef(null);
  const searchRef = useRef(null);

  /* Fetch menu */
  useEffect(() => { fetchMenu(); }, []);

  /* Card reveal observer */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.dataset.id]: true }));
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('[data-id]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [menuItems, selectedCat, search]);

  /* Hero entrance */
  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get('/menu');
      let items = Array.isArray(res.data) ? res.data
        : Array.isArray(res.data?.data) ? res.data.data
        : Array.isArray(res.data?.items) ? res.data.items : [];

      const saved = JSON.parse(localStorage.getItem('menu_images') || '{}');
      setMenuItems(items.map((item, i) => ({
        id: item.id || item.itemId,
        name: item.name,
        description: item.description || 'A delicious Ugandan dish',
        price: item.price,
        category: item.category,
        available: item.isAvailable !== undefined ? item.isAvailable : true,
        image: saved[item.id] || item.imageUrl || getDefaultImage(item.category, i),
      })));
    } catch {
      const saved = JSON.parse(localStorage.getItem('menu_images') || '{}');
      setMenuItems(MOCK.map((item, i) => ({
        ...item,
        image: saved[item.id] || getDefaultImage(item.category, i),
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item, 1);
    setAddedIds(v => ({ ...v, [item.id]: true }));
    setTimeout(() => setAddedIds(v => ({ ...v, [item.id]: false })), 1600);
    toast.success(`${item.name} added to cart!`);
  };

  const handleUpdateImage = async (item, url) => {
    try {
      await api.put(`/menu/${item.id}`, { ...item, imageUrl: url });
    } catch {}
    setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, image: url } : i));
    const s = JSON.parse(localStorage.getItem('menu_images') || '{}');
    s[item.id] = url;
    localStorage.setItem('menu_images', JSON.stringify(s));
    toast.success('Image updated!');
    setEditingItem(null);
  };

  const handleResetImage = async (item) => {
    const def = getDefaultImage(item.category);
    try { await api.put(`/menu/${item.id}`, { ...item, imageUrl: def }); } catch {}
    setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, image: def } : i));
    const s = JSON.parse(localStorage.getItem('menu_images') || '{}');
    delete s[item.id];
    localStorage.setItem('menu_images', JSON.stringify(s));
    toast.success('Image reset!');
  };

  const categories = menuItems.length > 0
    ? ['all', ...new Set(menuItems.map(i => i.category).filter(Boolean))]
    : ['all'];

  const filtered = menuItems.filter(item => {
    const mc = selectedCat === 'all' || item.category === selectedCat;
    const ms = item.name.toLowerCase().includes(search.toLowerCase())
            || item.description.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  const activeCat = getCat(selectedCat);

  /* ── LOADING ── */
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="m-loading">
        <div className="m-loading-plate">
          <div className="m-loading-ring" />
          <div className="m-loading-ring r2" />
          <span className="m-loading-icon">🍽️</span>
        </div>
        <p className="m-loading-txt">Preparing your menu</p>
        <div className="m-loading-dots">
          <span /><span /><span />
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>

      {/* ═══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className={`m-hero ${heroLoaded ? 'loaded' : ''}`}>
        {/* Background */}
        <div className="m-hero-bg" style={{ backgroundImage: `url(${HERO_IMG})` }} />
        <div className="m-hero-fog" />
        <div className="m-hero-grain" />

        {/* Left text */}
        <div className="m-hero-left">
          <div className="m-hero-eyebrow">
            <span className="m-eyebrow-line" />
            <span>Mutindo Catering · Kampala</span>
            <span className="m-eyebrow-line" />
          </div>
          <h1 className="m-hero-h1">
            <span className="m-h1-line line1">Our</span>
            <em className="m-h1-line line2">Menu</em>
          </h1>
          <p className="m-hero-sub">
            Fresh Ugandan cuisine, cooked with passion<br />
            and delivered right to your door.
          </p>
          <div className="m-hero-chips">
            <span className="m-hero-chip">🌿 Locally Sourced</span>
            <span className="m-hero-chip">🔥 Cooked Fresh Daily</span>
            <span className="m-hero-chip">⚡ Fast Delivery</span>
          </div>
        </div>

        {/* Right floating photo stack */}
        <div className="m-hero-stack">
          <div className="m-stack-card sc1">
            <img src={HERO_IMG2} alt="Chef" />
            <span className="m-stack-label">Our Chefs</span>
          </div>
          <div className="m-stack-card sc2">
            <img src={HERO_IMG3} alt="Dish" />
          </div>
          <div className="m-stack-stat">
            <span className="m-stat-n">500<sup>+</sup></span>
            <span className="m-stat-l">Events catered</span>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="m-hero-scroll">
          <span>Explore Menu</span>
          <div className="m-scroll-track"><div className="m-scroll-thumb" /></div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FILTER & SEARCH BAR
      ══════════════════════════════════════════════ */}
      <div className="m-bar" style={{ '--bar-accent': activeCat.color }}>
        <div className="m-bar-inner">

          {/* Category tabs */}
          <div className="m-cats">
            {categories.map(cat => {
              const c = getCat(cat);
              const active = selectedCat === cat;
              const count = cat === 'all' ? menuItems.length : menuItems.filter(i => i.category === cat).length;
              return (
                <button
                  key={cat}
                  className={`m-cat ${active ? 'active' : ''}`}
                  style={{ '--c': c.color }}
                  onClick={() => setSelectedCat(cat)}
                >
                  <span className="m-cat-icon">{c.icon}</span>
                  <span className="m-cat-label">{c.label}</span>
                  <span className="m-cat-count">{count}</span>
                  {active && <span className="m-cat-underline" style={{ background: c.color }} />}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="m-search" ref={searchRef}>
            <FaSearch className="m-search-ico" size={12} />
            <input
              className="m-search-inp"
              placeholder="Search dishes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="m-search-x" onClick={() => setSearch('')}>
                <FaTimes size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Results meta */}
        <div className="m-meta">
          <span className="m-meta-count" style={{ color: activeCat.color }}>{filtered.length}</span>
          <span className="m-meta-txt">
            {filtered.length === 1 ? 'dish' : 'dishes'}
            {selectedCat !== 'all' && ` · ${selectedCat}`}
            {search && ` · "${search}"`}
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          GRID
      ══════════════════════════════════════════════ */}
      <div className="m-page">
        {filtered.length > 0 ? (
          <div className="m-grid" ref={gridRef}>
            {filtered.map((item, idx) => {
              const cat   = getCat(item.category);
              const isVis = visible[item.id];
              const added = addedIds[item.id];
              return (
                <article
                  key={item.id}
                  data-id={item.id}
                  className={`m-card ${isVis ? 'vis' : ''} ${!item.available ? 'unavail' : ''}`}
                  style={{
                    '--cc': cat.color,
                    transitionDelay: `${(idx % 4) * 70}ms`,
                  }}
                >
                  {/* Image */}
                  <div className="m-card-img">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="m-card-photo"
                      onError={e => { e.target.src = getDefaultImage(item.category); }}
                    />
                    <div className="m-card-scrim" />

                    {/* Category badge */}
                    <span className="m-card-badge" style={{ color: cat.color, borderColor: cat.color + '55', background: cat.color + '18' }}>
                      {cat.icon} {item.category}
                    </span>

                    {/* Unavailable */}
                    {!item.available && (
                      <div className="m-card-unavail">
                        <span>Unavailable Today</span>
                      </div>
                    )}

                    {/* Price ribbon on image */}
                    <div className="m-card-price-ribbon" style={{ color: cat.color }}>
                      {formatCurrency(item.price)}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="m-card-body">
                    <h3 className="m-card-name">{item.name}</h3>
                    <p className="m-card-desc">{item.description}</p>
                    <div className="m-card-foot">
                      <div className="m-card-divider" style={{ background: cat.color }} />
                      <button
                        className={`m-card-btn ${added ? 'added' : ''}`}
                        style={{ '--cc': cat.color }}
                        disabled={!item.available}
                        onClick={() => item.available && handleAddToCart(item)}
                      >
                        {added ? (
                          <><span className="m-btn-check">✓</span> Added!</>
                        ) : (
                          <><FaShoppingCart size={12} /> Add to Cart</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Hover shimmer */}
                  <div className="m-card-shimmer" style={{ background: `linear-gradient(135deg, ${cat.color}10, ${cat.color}00)` }} />
                </article>
              );
            })}
          </div>
        ) : (
          <div className="m-empty">
            <div className="m-empty-icon">🔍</div>
            <h3 className="m-empty-h">Nothing found</h3>
            <p className="m-empty-p">Try a different category or clear your search</p>
            <button className="m-empty-btn" onClick={() => { setSelectedCat('all'); setSearch(''); }}>
              Show All Dishes
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          IMAGE EDIT MODAL (ADMIN)
      ══════════════════════════════════════════════ */}
      {editingItem && (
        <div className="m-modal-bg" onClick={() => setEditingItem(null)}>
          <div className="m-modal" onClick={e => e.stopPropagation()}>
            <button className="m-modal-x" onClick={() => setEditingItem(null)}><FaTimes /></button>
            <p className="m-modal-eyebrow">Edit Image</p>
            <h3 className="m-modal-title">{editingItem.name}</h3>
            <div className="m-modal-preview">
              <img src={previewUrl || editingItem.image} alt="Preview"
                onError={e => { e.target.src = getDefaultImage(editingItem.category); }} />
            </div>
            <input
              className="m-modal-input"
              placeholder="Paste image URL (Pexels, Unsplash…)"
              value={imageUrl}
              onChange={e => { setImageUrl(e.target.value); setPreviewUrl(e.target.value); }}
            />
            <p className="m-modal-hint">Use any direct image URL. Recommended: images.pexels.com</p>
            <div className="m-modal-actions">
              <button className="m-modal-cancel" onClick={() => setEditingItem(null)}>Cancel</button>
              <button className="m-modal-save" onClick={() => handleUpdateImage(editingItem, imageUrl)}>Save Image</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ─── STYLES ─────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Outfit:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --serif: 'Cormorant Garamond', Georgia, serif;
  --sans: 'Outfit', sans-serif;
  --dark: #0c0b09;
  --dark2: #141210;
  --dark3: #1c1a16;
  --cream: #f0ece4;
  --text: #b8b3aa;
  --gold: #c8a96e;
  --gold-l: #e2cfa4;
}

/* ── LOADING ─────────────────────────────────────────────────── */
.m-loading {
  min-height: 100vh;
  background: var(--dark);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 24px;
}
.m-loading-plate {
  position: relative;
  width: 80px; height: 80px;
  display: flex; align-items: center; justify-content: center;
}
.m-loading-ring {
  position: absolute; inset: 0;
  border-radius: 50%;
  border: 1.5px solid transparent;
  border-top-color: var(--gold);
  animation: mSpin 1.1s linear infinite;
}
.m-loading-ring.r2 {
  inset: 10px;
  border-top-color: transparent;
  border-right-color: var(--gold);
  opacity: 0.4;
  animation-duration: 0.75s;
  animation-direction: reverse;
}
.m-loading-icon { font-size: 1.8rem; }
.m-loading-txt {
  font-family: var(--sans); font-size: 0.75rem;
  letter-spacing: 3px; text-transform: uppercase;
  color: rgba(200,169,110,0.5);
}
.m-loading-dots { display: flex; gap: 8px; }
.m-loading-dots span {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--gold); opacity: 0.3;
  animation: mDot 1.2s ease-in-out infinite;
}
.m-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.m-loading-dots span:nth-child(3) { animation-delay: 0.4s; }

/* ── HERO ─────────────────────────────────────────────────────── */
.m-hero {
  position: relative;
  min-height: 100vh;
  display: flex; align-items: center;
  background: var(--dark);
  overflow: hidden;
  padding: 0 7vw;
}
.m-hero-bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center 35%;
  opacity: 0;
  transform: scale(1.06);
  transition: opacity 1.4s ease, transform 14s ease;
}
.m-hero.loaded .m-hero-bg { opacity: 1; transform: scale(1.0); }
.m-hero-fog {
  position: absolute; inset: 0;
  background: linear-gradient(110deg, rgba(12,11,9,0.95) 40%, rgba(12,11,9,0.65) 65%, rgba(12,11,9,0.3) 100%);
}
.m-hero-grain {
  position: absolute; inset: 0;
  opacity: 0.35; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
}
.m-hero-left {
  position: relative; z-index: 3;
  max-width: 620px;
  opacity: 0; transform: translateY(28px);
  transition: opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s;
}
.m-hero.loaded .m-hero-left { opacity: 1; transform: translateY(0); }
.m-hero-eyebrow {
  display: flex; align-items: center; gap: 14px;
  font-family: var(--sans); font-size: 0.68rem;
  letter-spacing: 3px; text-transform: uppercase;
  color: var(--gold); margin-bottom: 28px;
}
.m-eyebrow-line {
  display: block; width: 30px; height: 1px;
  background: var(--gold); opacity: 0.5;
}
.m-hero-h1 { font-family: var(--serif); line-height: 1; margin-bottom: 22px; }
.m-h1-line {
  display: block;
  opacity: 0; transform: translateX(-20px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.m-hero.loaded .m-h1-line { opacity: 1; transform: translateX(0); }
.m-h1-line.line1 {
  font-size: clamp(3rem, 5.5vw, 5rem); font-weight: 400;
  color: var(--cream); letter-spacing: -1px;
  transition-delay: 0.5s;
}
.m-h1-line.line2 {
  font-size: clamp(5rem, 10vw, 9.5rem); font-weight: 700;
  color: var(--gold); font-style: italic;
  letter-spacing: -3px; line-height: 0.9;
  transition-delay: 0.65s;
}
.m-hero-sub {
  font-family: var(--sans); font-size: 1rem; font-weight: 300;
  color: rgba(200,195,184,0.6); line-height: 1.8;
  margin-bottom: 32px;
}
.m-hero-chips { display: flex; gap: 10px; flex-wrap: wrap; }
.m-hero-chip {
  padding: 7px 18px;
  border: 1px solid rgba(200,169,110,0.25);
  border-radius: 100px;
  font-family: var(--sans); font-size: 0.72rem; font-weight: 400;
  color: var(--gold); letter-spacing: 0.3px;
  background: rgba(200,169,110,0.06);
  opacity: 0;
  animation: mChipIn 0.5s ease forwards;
}
.m-hero.loaded .m-hero-chip:nth-child(1) { animation-delay: 0.9s; }
.m-hero.loaded .m-hero-chip:nth-child(2) { animation-delay: 1.0s; }
.m-hero.loaded .m-hero-chip:nth-child(3) { animation-delay: 1.1s; }

/* Hero photo stack */
.m-hero-stack {
  position: absolute; right: 6vw; top: 50%;
  transform: translateY(-50%);
  display: grid;
  grid-template-columns: 170px 130px;
  grid-template-rows: auto auto;
  gap: 14px;
  z-index: 3;
  opacity: 0;
  transition: opacity 0.9s ease 0.6s, transform 0.9s ease 0.6s;
  transform: translateY(-40%);
}
.m-hero.loaded .m-hero-stack { opacity: 1; transform: translateY(-50%); }
@media (max-width: 1000px) { .m-hero-stack { display: none; } }

.m-stack-card {
  position: relative; overflow: hidden;
  border: 2px solid rgba(200,169,110,0.15);
  box-shadow: 0 28px 64px rgba(0,0,0,0.7);
}
.m-stack-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
.m-stack-card.sc1 {
  grid-column: 1; grid-row: 1 / 3;
  height: 300px; border-radius: 4px;
  animation: mFloat 5s ease-in-out infinite;
}
.m-stack-card.sc2 {
  grid-column: 2; grid-row: 1;
  height: 140px; border-radius: 4px;
  margin-top: 48px;
  animation: mFloat 6s ease-in-out infinite 0.5s;
}
.m-stack-label {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 8px 12px;
  background: rgba(12,11,9,0.75);
  font-family: var(--sans); font-size: 0.62rem;
  letter-spacing: 2px; text-transform: uppercase; color: var(--gold);
}
.m-stack-stat {
  grid-column: 2; grid-row: 2;
  background: var(--dark2);
  border: 1px solid rgba(200,169,110,0.2);
  border-radius: 4px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 16px 12px;
  animation: mFloat 7s ease-in-out infinite 1s;
}
.m-stat-n {
  font-family: var(--serif); font-size: 2rem; font-weight: 700;
  color: var(--gold); line-height: 1;
}
.m-stat-n sup { font-size: 1rem; }
.m-stat-l {
  font-family: var(--sans); font-size: 0.6rem; font-weight: 400;
  color: var(--text); text-align: center; margin-top: 4px;
  text-transform: uppercase; letter-spacing: 1px;
}

/* Scroll hint */
.m-hero-scroll {
  position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  z-index: 3;
  opacity: 0;
  transition: opacity 0.6s ease 1.4s;
}
.m-hero.loaded .m-hero-scroll { opacity: 1; }
.m-hero-scroll span {
  font-family: var(--sans); font-size: 0.62rem;
  letter-spacing: 3px; text-transform: uppercase; color: rgba(200,169,110,0.4);
}
.m-scroll-track {
  width: 1px; height: 50px;
  background: rgba(200,169,110,0.15);
  position: relative; overflow: hidden;
}
.m-scroll-thumb {
  width: 100%; height: 40%;
  background: var(--gold);
  animation: mScrollDown 1.8s ease-in-out infinite;
}

/* ── FILTER BAR ─────────────────────────────────────────────── */
.m-bar {
  background: var(--dark2);
  border-top: 1px solid rgba(200,169,110,0.1);
  border-bottom: 1px solid rgba(200,169,110,0.1);
  position: sticky; top: 0; z-index: 100;
  backdrop-filter: blur(12px);
}
.m-bar-inner {
  max-width: 1280px; margin: 0 auto;
  padding: 0 6vw;
  display: flex; align-items: center; justify-content: space-between;
  gap: 20px; flex-wrap: wrap;
}
.m-cats {
  display: flex; gap: 0; overflow-x: auto; scrollbar-width: none;
}
.m-cats::-webkit-scrollbar { display: none; }
.m-cat {
  position: relative;
  display: inline-flex; align-items: center; gap: 7px;
  padding: 20px 20px;
  background: none; border: none;
  font-family: var(--sans); font-size: 0.8rem; font-weight: 400;
  color: rgba(200,195,184,0.45);
  cursor: pointer; white-space: nowrap;
  transition: color 0.25s;
}
.m-cat:hover { color: var(--cream); }
.m-cat.active { color: var(--c); }
.m-cat-icon { font-size: 1rem; }
.m-cat-count {
  font-size: 0.65rem; font-weight: 600;
  background: rgba(255,255,255,0.07);
  padding: 1px 6px; border-radius: 10px;
  color: rgba(200,195,184,0.4);
}
.m-cat.active .m-cat-count { background: color-mix(in srgb, var(--c) 15%, transparent); color: var(--c); }
.m-cat-underline {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 2px; border-radius: 2px 2px 0 0;
  transition: transform 0.25s ease;
}

/* Search */
.m-search {
  position: relative; width: 200px; flex-shrink: 0;
}
.m-search-ico {
  position: absolute; left: 12px; top: 50%;
  transform: translateY(-50%);
  color: rgba(200,169,110,0.35); pointer-events: none;
}
.m-search-inp {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 3px;
  padding: 9px 34px 9px 32px;
  font-family: var(--sans); font-size: 0.83rem; font-weight: 300;
  color: var(--cream); outline: none;
  transition: border-color 0.2s, background 0.2s;
}
.m-search-inp::placeholder { color: rgba(200,169,110,0.25); }
.m-search-inp:focus { border-color: rgba(200,169,110,0.4); background: rgba(200,169,110,0.04); }
.m-search-x {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: rgba(200,169,110,0.35);
  cursor: pointer; padding: 4px; display: flex; align-items: center;
  transition: color 0.2s;
}
.m-search-x:hover { color: var(--gold); }

/* Meta */
.m-meta {
  max-width: 1280px; margin: 0 auto;
  padding: 12px 6vw;
  border-top: 1px solid rgba(255,255,255,0.04);
  display: flex; align-items: center; gap: 8px;
}
.m-meta-count {
  font-family: var(--serif); font-size: 1.1rem; font-weight: 700;
}
.m-meta-txt {
  font-family: var(--sans); font-size: 0.75rem; font-weight: 300;
  color: rgba(200,195,184,0.35); letter-spacing: 0.3px;
}

/* ── PAGE / GRID ─────────────────────────────────────────────── */
.m-page {
  background: var(--dark);
  min-height: 60vh;
  padding: 40px 6vw 100px;
  max-width: 1280px; margin: 0 auto;
}

.m-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 3px;
}

/* ── CARD ─────────────────────────────────────────────────────── */
.m-card {
  position: relative;
  background: var(--dark2);
  overflow: hidden;
  opacity: 0; transform: translateY(32px) scale(0.98);
  transition: opacity 0.55s ease, transform 0.55s ease, box-shadow 0.35s ease;
  cursor: default;
}
.m-card.vis { opacity: 1; transform: translateY(0) scale(1); }
.m-card:hover {
  z-index: 2;
  box-shadow: 0 24px 72px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,169,110,0.12);
  transform: translateY(-8px) scale(1.01) !important;
}
.m-card.unavail { opacity: 0.55; }

/* Image */
.m-card-img {
  position: relative; overflow: hidden;
  height: 230px;
}
.m-card-photo {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.m-card:hover .m-card-photo { transform: scale(1.1); }
.m-card-scrim {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(12,11,9,0.7) 100%);
  pointer-events: none;
}
.m-card-badge {
  position: absolute; top: 14px; left: 14px;
  padding: 4px 10px; border-radius: 2px;
  border: 1px solid;
  font-family: var(--sans); font-size: 0.62rem; font-weight: 500;
  letter-spacing: 1.5px; text-transform: uppercase;
  backdrop-filter: blur(8px);
  z-index: 2;
}
.m-card-price-ribbon {
  position: absolute; bottom: 14px; right: 14px;
  font-family: var(--serif); font-size: 1.25rem; font-weight: 700;
  text-shadow: 0 2px 12px rgba(0,0,0,0.7);
  z-index: 2;
}
.m-card-unavail {
  position: absolute; inset: 0; z-index: 3;
  background: rgba(12,11,9,0.72);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
}
.m-card-unavail span {
  font-family: var(--sans); font-size: 0.72rem; font-weight: 500;
  letter-spacing: 2.5px; text-transform: uppercase;
  color: rgba(200,195,184,0.5);
  border: 1px solid rgba(200,195,184,0.2);
  padding: 8px 20px; border-radius: 2px;
}

/* Card body */
.m-card-body { padding: 22px 22px 24px; }
.m-card-name {
  font-family: var(--serif); font-size: 1.25rem; font-weight: 600;
  color: var(--cream); margin-bottom: 9px; line-height: 1.2;
  transition: color 0.25s;
}
.m-card:hover .m-card-name { color: var(--gold-l); }
.m-card-desc {
  font-family: var(--sans); font-size: 0.8rem; font-weight: 300;
  color: rgba(200,195,184,0.45); line-height: 1.65; margin-bottom: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.m-card-foot { display: flex; align-items: center; gap: 14px; }
.m-card-divider { width: 28px; height: 2px; flex-shrink: 0; transition: width 0.3s; border-radius: 2px; }
.m-card:hover .m-card-divider { width: 44px; }
.m-card-btn {
  flex: 1;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 16px; border-radius: 2px;
  border: 1px solid color-mix(in srgb, var(--cc) 40%, transparent);
  background: color-mix(in srgb, var(--cc) 8%, transparent);
  color: var(--cc);
  font-family: var(--sans); font-size: 0.78rem; font-weight: 500;
  cursor: pointer; transition: all 0.25s; white-space: nowrap;
  letter-spacing: 0.3px;
}
.m-card-btn:hover:not(:disabled) {
  background: var(--cc); color: var(--dark);
  border-color: var(--cc);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.m-card-btn:disabled { opacity: 0.25; cursor: not-allowed; }
.m-card-btn.added {
  background: rgba(0,201,167,0.12) !important;
  border-color: rgba(0,201,167,0.4) !important;
  color: #00C9A7 !important;
  animation: mBtnPop 0.35s ease;
}
.m-btn-check { font-size: 0.9rem; }
.m-card-shimmer {
  position: absolute; inset: 0;
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
.m-card:hover .m-card-shimmer { opacity: 1; }

/* ── EMPTY STATE ─────────────────────────────────────────────── */
.m-empty {
  text-align: center; padding: 100px 20px;
}
.m-empty-icon { font-size: 4rem; margin-bottom: 20px; }
.m-empty-h {
  font-family: var(--serif); font-size: 2rem; font-weight: 600;
  color: var(--cream); margin-bottom: 12px;
}
.m-empty-p {
  font-family: var(--sans); font-size: 0.9rem; font-weight: 300;
  color: rgba(200,195,184,0.4); margin-bottom: 32px;
}
.m-empty-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--gold); color: var(--dark);
  border: none; border-radius: 2px;
  padding: 13px 32px;
  font-family: var(--sans); font-size: 0.82rem; font-weight: 600;
  cursor: pointer; letter-spacing: 1px; text-transform: uppercase;
  transition: all 0.3s;
}
.m-empty-btn:hover { background: var(--gold-l); transform: translateY(-2px); }

/* ── MODAL ───────────────────────────────────────────────────── */
.m-modal-bg {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.88);
  backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  animation: mModalIn 0.25s ease;
}
.m-modal {
  background: var(--dark2);
  max-width: 480px; width: 100%;
  border: 1px solid rgba(200,169,110,0.18);
  border-radius: 4px; padding: 32px;
  position: relative;
  box-shadow: 0 40px 80px rgba(0,0,0,0.8);
  animation: mModalSlide 0.3s ease;
}
.m-modal-x {
  position: absolute; top: 16px; right: 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 3px;
  color: rgba(200,195,184,0.5); width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.m-modal-x:hover { background: rgba(200,169,110,0.15); color: var(--gold); }
.m-modal-eyebrow {
  font-family: var(--sans); font-size: 0.65rem;
  letter-spacing: 3px; text-transform: uppercase; color: var(--gold);
  margin-bottom: 8px;
}
.m-modal-title {
  font-family: var(--serif); font-size: 1.5rem; font-weight: 600;
  color: var(--cream); margin-bottom: 20px;
}
.m-modal-preview {
  width: 100%; height: 190px;
  background: var(--dark3); overflow: hidden; border-radius: 3px;
  margin-bottom: 16px;
}
.m-modal-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
.m-modal-input {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 3px;
  padding: 11px 14px; color: var(--cream);
  font-family: var(--sans); font-size: 0.83rem;
  outline: none; margin-bottom: 10px; transition: border-color 0.2s;
}
.m-modal-input::placeholder { color: rgba(200,169,110,0.3); }
.m-modal-input:focus { border-color: var(--gold); }
.m-modal-hint {
  font-family: var(--sans); font-size: 0.7rem; font-weight: 300;
  color: rgba(200,195,184,0.35); line-height: 1.5; margin-bottom: 24px;
}
.m-modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
.m-modal-cancel, .m-modal-save {
  padding: 10px 22px; border-radius: 2px;
  font-family: var(--sans); font-size: 0.8rem; font-weight: 500;
  cursor: pointer; transition: all 0.2s; letter-spacing: 0.5px;
}
.m-modal-cancel {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(200,195,184,0.5);
}
.m-modal-cancel:hover { background: rgba(255,255,255,0.05); color: var(--cream); }
.m-modal-save {
  background: var(--gold); border: none; color: var(--dark); font-weight: 600;
}
.m-modal-save:hover { background: var(--gold-l); transform: translateY(-1px); }

/* ── KEYFRAMES ───────────────────────────────────────────────── */
@keyframes mSpin { to { transform: rotate(360deg); } }
@keyframes mDot {
  0%, 80%, 100% { opacity: 0.15; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1.2); }
}
@keyframes mFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@keyframes mScrollDown {
  0% { transform: translateY(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(200%); opacity: 0; }
}
@keyframes mChipIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes mBtnPop {
  0% { transform: scale(0.92); }
  60% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
@keyframes mModalIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes mModalSlide {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── RESPONSIVE ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .m-hero { padding: 0 6vw; min-height: 90vh; }
  .m-bar-inner { flex-direction: column; align-items: stretch; gap: 0; }
  .m-search { width: 100%; padding: 12px 0; border-top: 1px solid rgba(255,255,255,0.05); }
  .m-grid { grid-template-columns: 1fr; gap: 2px; }
  .m-page { padding: 32px 4vw 80px; }
}
@media (max-width: 480px) {
  .m-h1-line.line2 { letter-spacing: -2px; }
  .m-cats { padding: 0; }
  .m-cat { padding: 18px 14px; font-size: 0.75rem; }
  .m-cat-label { display: none; }
}
`;

export default Menu;