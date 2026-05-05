import React, { useState, useEffect, useRef } from 'react';
import { FaHeart, FaShare, FaTimes, FaChevronLeft, FaChevronRight, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

/* ─── FALLBACK IMAGES (if Firebase is empty) ──────────────────────────────── */
const FALLBACK_IMAGES = [
  {
    id: 1,
    title: 'Fresh Rolex Delight',
    description: 'Our signature Ugandan rolex with fresh vegetables and eggs',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=900',
    category: 'Food', likes: 145, views: 1200, date: '2024-01-15'
  },
  {
    id: 2,
    title: 'Matooke Feast',
    description: 'Traditional matooke served with beef stew and groundnuts',
    imageUrl: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=900',
    category: 'Food', likes: 267, views: 2300, date: '2024-01-20'
  },
  {
    id: 3,
    title: 'Elegant Wedding Setup',
    description: 'Beautiful wedding reception with our premium catering service',
    imageUrl: 'https://images.pexels.com/photos/1414235/pexels-photo-1414235.jpeg?auto=compress&cs=tinysrgb&w=900',
    category: 'Events', likes: 423, views: 3400, date: '2024-02-10'
  },
  {
    id: 4,
    title: 'Grilled Chicken Platter',
    description: 'Succulent grilled chicken with traditional Ugandan sides',
    imageUrl: 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=900',
    category: 'Food', likes: 189, views: 1500, date: '2024-02-15'
  },
  {
    id: 5,
    title: 'Corporate Event Catering',
    description: 'Professional setup for corporate gatherings and conferences',
    imageUrl: 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=900',
    category: 'Events', likes: 234, views: 2100, date: '2024-02-20'
  },
  {
    id: 6,
    title: 'Dessert Display',
    description: 'Exquisite desserts arranged for a special occasion',
    imageUrl: 'https://images.pexels.com/photos/1120462/pexels-photo-1120462.jpeg?auto=compress&cs=tinysrgb&w=900',
    category: 'Food', likes: 312, views: 2800, date: '2024-02-25'
  },
  {
    id: 7,
    title: 'Birthday Celebration',
    description: 'Colorful setup for a truly memorable birthday party',
    imageUrl: 'https://images.pexels.com/photos/3407777/pexels-photo-3407777.jpeg?auto=compress&cs=tinysrgb&w=900',
    category: 'Events', likes: 178, views: 1900, date: '2024-03-01'
  },
  {
    id: 8,
    title: 'Chef at Work',
    description: 'Behind the scenes — passion and precision in every dish',
    imageUrl: 'https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg?auto=compress&cs=tinysrgb&w=900',
    category: 'Kitchen', likes: 198, views: 1600, date: '2024-03-05'
  },
  {
    id: 9,
    title: 'Graduation Banquet',
    description: 'Celebrating academic achievements with great food',
    imageUrl: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=900',
    category: 'Events', likes: 156, views: 1400, date: '2024-03-10'
  },
  {
    id: 10,
    title: 'Kitchen Craft',
    description: 'Where flavour is born — our professional kitchen in action',
    imageUrl: 'https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=900',
    category: 'Kitchen', likes: 221, views: 1750, date: '2024-03-15'
  },
  {
    id: 11,
    title: 'Fresh Ingredients',
    description: 'Farm-fresh produce sourced daily from Ugandan farmers',
    imageUrl: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=900',
    category: 'Kitchen', likes: 302, views: 2450, date: '2024-03-20'
  },
  {
    id: 12,
    title: 'Outdoor Reception',
    description: 'Garden reception styled and catered by our team',
    imageUrl: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=900',
    category: 'Events', likes: 267, views: 2200, date: '2024-03-25'
  },
];

const DEFAULT_HERO_BG = 'https://images.pexels.com/photos/1414235/pexels-photo-1414235.jpeg?auto=compress&cs=tinysrgb&w=1600';
const DEFAULT_HERO_SIDE = 'https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg?auto=compress&cs=tinysrgb&w=900';

const CAT_CONFIG = {
  all:     { icon: '✦', label: 'All Moments' },
  Food:    { icon: '🍽️', label: 'Food'        },
  Events:  { icon: '🎉', label: 'Events'      },
  Kitchen: { icon: '👨‍🍳', label: 'Kitchen'     },
};
const getCat = k => CAT_CONFIG[k] || { icon: '✦', label: k };

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
const Gallery = () => {
  const [images, setImages]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedCat, setSelectedCat]   = useState('all');
  const [categories, setCategories]     = useState(['all']);
  const [visible, setVisible]           = useState({});
  const [likedImages, setLikedImages]   = useState({});
  const [lightbox, setLightbox]         = useState(null);
  const [lbClosing, setLbClosing]       = useState(false);
  const [heroLoaded, setHeroLoaded]     = useState(false);
  const [hoveredId, setHoveredId]       = useState(null);
  const [content, setContent]           = useState(null);
  
  // Hero images from CMS
  const [heroImage, setHeroImage] = useState(DEFAULT_HERO_BG);
  const [heroSideImage, setHeroSideImage] = useState(DEFAULT_HERO_SIDE);
  
  const gridRef = useRef(null);

  /* Hero entrance */
  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* Card reveal observer */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.dataset.id]: true }));
      }),
      { threshold: 0.07 }
    );
    document.querySelectorAll('[data-id]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [images, selectedCat]);

  /* Fetch from Firebase */
  useEffect(() => { fetchGallery(); }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/content/gallery');
      if (response.ok) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          setContent(data);
          // Load hero images from CMS
          if (data.heroImage) setHeroImage(data.heroImage);
          if (data.heroSideImage) setHeroSideImage(data.heroSideImage);
          if (data.images && data.images.length > 0) {
            setImages(data.images);
            setCategories(['all', ...new Set(data.images.map(i => i.category))]);
            return;
          }
        }
      }
      // Fallback to default images
      setImages(FALLBACK_IMAGES);
      setCategories(['all', ...new Set(FALLBACK_IMAGES.map(i => i.category))]);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setImages(FALLBACK_IMAGES);
      setCategories(['all', ...new Set(FALLBACK_IMAGES.map(i => i.category))]);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (image, index) => {
    setImages(prev => prev.map(i => i.id === image.id ? { ...i, views: (i.views || 0) + 1 } : i));
    setLightbox({ image, index });
  };

  const closeLightbox = () => {
    setLbClosing(true);
    setTimeout(() => { setLightbox(null); setLbClosing(false); }, 300);
  };

  const navigate = (dir) => {
    const next = lightbox.index + (dir === 'next' ? 1 : -1);
    if (next >= 0 && next < filtered.length) {
      setLightbox({ image: filtered[next], index: next });
    }
  };

  /* Keyboard nav */
  useEffect(() => {
    if (!lightbox) return;
    const fn = e => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') navigate('next');
      if (e.key === 'ArrowLeft')  navigate('prev');
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [lightbox]);

  const handleLike = async (imageId, e) => {
    e.stopPropagation();
    if (likedImages[imageId]) return;
    try { await api.post(`/gallery/${imageId}/like`); } catch {}
    setImages(prev => prev.map(i => i.id === imageId ? { ...i, likes: i.likes + 1 } : i));
    setLikedImages(prev => ({ ...prev, [imageId]: true }));
    if (lightbox?.image?.id === imageId) {
      setLightbox(lb => ({ ...lb, image: { ...lb.image, likes: lb.image.likes + 1 } }));
    }
    toast.success('❤️ Liked!');
  };

  const handleShare = async (image, e) => {
    e.stopPropagation();
    try { await navigator.share({ title: image.title, text: image.description, url: window.location.href }); }
    catch { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }
  };

  const filtered = selectedCat === 'all' ? images : images.filter(i => i.category === selectedCat);

  const totalLikes = images.reduce((s, i) => s + (i.likes || 0), 0);
  const totalViews = images.reduce((s, i) => s + (i.views || 0), 0);

  /* ── LOADING ── */
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="g-loading">
        <div className="g-loading-rig">
          <div className="g-ring" /><div className="g-ring r2" />
          <span className="g-loading-icon">📸</span>
        </div>
        <p className="g-loading-txt">Curating beautiful moments</p>
        <div className="g-dots"><span /><span /><span /></div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>

      {/* HERO - NOW USING CMS IMAGES */}
      <section className={`g-hero ${heroLoaded ? 'loaded' : ''}`}>
        <div className="g-hero-bg" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="g-hero-fog" />
        <div className="g-hero-grain" />

        <div className="g-hero-left">
          <div className="g-eyebrow-row">
            <span className="g-eyebrow-line" />
            <span className="g-eyebrow-txt">Visual Storytelling · Mutindo Catering</span>
            <span className="g-eyebrow-line" />
          </div>
          <h1 className="g-hero-h1">
            <span className="g-h1-a">{content?.heroTitle1 || 'Our'}</span>
            <em className="g-h1-b">{content?.heroTitle2 || 'Culinary'}</em>
            <span className="g-h1-c">{content?.heroTitle3 || 'Journey'}</span>
          </h1>
          <p className="g-hero-sub">
            {content?.heroSubtitle || 'Moments of joy, delicious creations, and unforgettable events — every frame tells a story of passion and craft.'}
          </p>
          <div className="g-hero-counters">
            {[
              { num: images.length,              suffix: '',  label: 'Moments'  },
              { num: totalLikes.toLocaleString(), suffix: '',  label: 'Likes'    },
              { num: totalViews.toLocaleString(), suffix: '',  label: 'Views'    },
            ].map((s, i) => (
              <div key={i} className="g-counter">
                <span className="g-counter-num">{s.num}{s.suffix}</span>
                <span className="g-counter-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating image stack - NOW USING CMS IMAGE */}
        <div className="g-hero-stack">
          <div className="g-stack-main">
            <img src={heroSideImage} alt="Catering" />
            <div className="g-stack-caption">Behind the Scenes ↗</div>
          </div>
          <div className="g-stack-pill">
            <span className="g-pill-num">{images.length}</span>
            <span className="g-pill-lbl">Photo stories</span>
          </div>
        </div>

        <div className="g-hero-scroll">
          <span>Browse Gallery</span>
          <div className="g-scroll-track"><div className="g-scroll-thumb" /></div>
        </div>
      </section>

      {/* STICKY FILTER BAR */}
      <div className="g-bar">
        <div className="g-bar-inner">
          <div className="g-cats">
            {categories.map(cat => {
              const c = getCat(cat);
              const active = selectedCat === cat;
              const count  = cat === 'all' ? images.length : images.filter(i => i.category === cat).length;
              return (
                <button key={cat} className={`g-cat ${active ? 'active' : ''}`} onClick={() => setSelectedCat(cat)}>
                  <span className="g-cat-icon">{c.icon}</span>
                  <span className="g-cat-lbl">{c.label}</span>
                  <span className="g-cat-count">{count}</span>
                  {active && <span className="g-cat-bar" />}
                </button>
              );
            })}
          </div>
          <div className="g-bar-meta">
            <span className="g-meta-n">{filtered.length}</span>
            <span className="g-meta-t">{filtered.length === 1 ? 'moment' : 'moments'}{selectedCat !== 'all' ? ` · ${selectedCat}` : ''}</span>
          </div>
        </div>
      </div>

      {/* MASONRY GRID */}
      <div className="g-page">
        {filtered.length > 0 ? (
          <div className="g-grid" ref={gridRef}>
            {filtered.map((img, idx) => {
              const cat    = getCat(img.category);
              const isVis  = visible[img.id];
              const liked  = likedImages[img.id];
              const hov    = hoveredId === img.id;
              const tall   = idx % 5 === 0 || idx % 7 === 0;
              return (
                <article key={img.id} data-id={img.id} className={`g-card ${isVis ? 'vis' : ''} ${tall ? 'tall' : ''}`} style={{ transitionDelay: `${(idx % 6) * 65}ms` }} onClick={() => openLightbox(img, idx)} onMouseEnter={() => setHoveredId(img.id)} onMouseLeave={() => setHoveredId(null)}>
                  <div className="g-card-img">
                    <img src={img.imageUrl} alt={img.title} loading="lazy" className="g-card-photo" onError={e => { e.target.src = FALLBACK_IMAGES[0]?.imageUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600'; }} />
                    <div className="g-card-scrim" />
                    <span className="g-card-cat">{cat.icon} {img.category}</span>
                    <div className={`g-card-overlay ${hov ? 'show' : ''}`}>
                      <div className="g-overlay-body">
                        <h3 className="g-overlay-title">{img.title}</h3>
                        <p className="g-overlay-desc">{img.description}</p>
                        <div className="g-overlay-stats">
                          <span><FaEye size={11} /> {(img.views || 0).toLocaleString()}</span>
                          <span><FaHeart size={11} /> {img.likes}</span>
                        </div>
                      </div>
                      <div className="g-overlay-cta">View Full Image →</div>
                    </div>
                  </div>
                  <div className="g-card-foot">
                    <div className="g-card-info">
                      <h4 className="g-card-title">{img.title}</h4>
                      <span className="g-card-date">{new Date(img.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="g-card-acts">
                      <button className={`g-act-btn ${liked ? 'liked' : ''}`} onClick={e => handleLike(img.id, e)} title="Like">
                        <FaHeart size={13} />
                        <span>{img.likes}</span>
                      </button>
                      <button className="g-act-btn" onClick={e => handleShare(img, e)} title="Share">
                        <FaShare size={13} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="g-empty">
            <div className="g-empty-icon">📷</div>
            <h3 className="g-empty-h">No moments here yet</h3>
            <p className="g-empty-p">Check back soon — we capture every great moment.</p>
            <button className="g-empty-btn" onClick={() => setSelectedCat('all')}>View All</button>
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className={`g-lb ${lbClosing ? 'closing' : ''}`} onClick={closeLightbox}>
          <div className="g-lb-wrap" onClick={e => e.stopPropagation()}>
            <button className="g-lb-close" onClick={closeLightbox}><FaTimes size={16} /></button>
            <div className="g-lb-counter">{lightbox.index + 1} / {filtered.length}</div>
            <button className="g-lb-nav prev" onClick={() => navigate('prev')} disabled={lightbox.index === 0}><FaChevronLeft size={18} /></button>
            <div className="g-lb-img-wrap">
              <img key={lightbox.image.id} src={lightbox.image.imageUrl} alt={lightbox.image.title} className="g-lb-img" onError={e => { e.target.src = FALLBACK_IMAGES[0]?.imageUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'; }} />
            </div>
            <div className="g-lb-panel">
              <div className="g-lb-panel-top">
                <span className="g-lb-eyebrow">{getCat(lightbox.image.category).icon} {lightbox.image.category}</span>
                <h2 className="g-lb-title">{lightbox.image.title}</h2>
                <p className="g-lb-desc">{lightbox.image.description}</p>
              </div>
              <div className="g-lb-divider" />
              <div className="g-lb-stats">
                <div className="g-lb-stat"><FaEye size={14} /><span>{(lightbox.image.views || 0).toLocaleString()}</span><small>Views</small></div>
                <div className="g-lb-stat"><FaHeart size={14} /><span>{lightbox.image.likes}</span><small>Likes</small></div>
                <div className="g-lb-stat g-lb-stat-date"><span>{new Date(lightbox.image.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span><small>Captured</small></div>
              </div>
              <div className="g-lb-divider" />
              <div className="g-lb-actions">
                <button className={`g-lb-btn like ${likedImages[lightbox.image.id] ? 'liked' : ''}`} onClick={e => handleLike(lightbox.image.id, e)}><FaHeart size={14} /> {likedImages[lightbox.image.id] ? 'Liked' : 'Like'}</button>
                <button className="g-lb-btn share" onClick={e => handleShare(lightbox.image, e)}><FaShare size={14} /> Share</button>
              </div>
              <div className="g-lb-strip">
                {filtered.slice(Math.max(0, lightbox.index - 2), lightbox.index + 5).map((img, i) => (
                  <div key={img.id} className={`g-lb-thumb ${img.id === lightbox.image.id ? 'active' : ''}`} onClick={() => setLightbox({ image: img, index: filtered.indexOf(img) })}>
                    <img src={img.imageUrl} alt={img.title} onError={e => { e.target.src = FALLBACK_IMAGES[0]?.imageUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200'; }} />
                  </div>
                ))}
              </div>
            </div>
            <button className="g-lb-nav next" onClick={() => navigate('next')} disabled={lightbox.index === filtered.length - 1}><FaChevronRight size={18} /></button>
          </div>
        </div>
      )}
    </>
  );
};

/* ─── STYLES (keep as is) ────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Outfit:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --serif: 'Cormorant Garamond', Georgia, serif;
  --sans:  'Outfit', sans-serif;
  --dark:  #0c0b09;
  --dark2: #141210;
  --dark3: #1c1a16;
  --cream: #f0ece4;
  --text:  #b8b3aa;
  --gold:  #c8a96e;
  --gold-l:#e2cfa4;
}

/* Loading */
.g-loading {
  min-height: 100vh; background: var(--dark);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 24px;
}
.g-loading-rig { position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
.g-ring {
  position: absolute; inset: 0; border-radius: 50%;
  border: 1.5px solid transparent;
  border-top-color: var(--gold);
  animation: gSpin 1.1s linear infinite;
}
.g-ring.r2 { inset: 10px; border-top-color: transparent; border-right-color: var(--gold); opacity: 0.4; animation-duration: 0.75s; animation-direction: reverse; }
.g-loading-icon { font-size: 1.8rem; }
.g-loading-txt {
  font-family: var(--sans); font-size: 0.75rem;
  letter-spacing: 3px; text-transform: uppercase;
  color: rgba(200,169,110,0.5);
}
.g-dots { display: flex; gap: 8px; }
.g-dots span {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--gold); opacity: 0.3;
  animation: gDot 1.2s ease-in-out infinite;
}
.g-dots span:nth-child(2) { animation-delay: 0.2s; }
.g-dots span:nth-child(3) { animation-delay: 0.4s; }

/* Hero */
.g-hero {
  position: relative; min-height: 100vh;
  display: flex; align-items: center;
  background: var(--dark); overflow: hidden; padding: 0 7vw;
}
.g-hero-bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center 40%;
  opacity: 0; transform: scale(1.06);
  transition: opacity 1.5s ease, transform 14s ease;
}
.g-hero.loaded .g-hero-bg { opacity: 1; transform: scale(1.0); }
.g-hero-fog {
  position: absolute; inset: 0;
  background: linear-gradient(110deg, rgba(12,11,9,0.96) 38%, rgba(12,11,9,0.7) 62%, rgba(12,11,9,0.35) 100%);
}
.g-hero-grain {
  position: absolute; inset: 0; pointer-events: none; opacity: 0.35;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
}
.g-hero-left {
  position: relative; z-index: 3; max-width: 640px;
  opacity: 0; transform: translateY(30px);
  transition: opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s;
}
.g-hero.loaded .g-hero-left { opacity: 1; transform: translateY(0); }
.g-eyebrow-row {
  display: flex; align-items: center; gap: 14px;
  margin-bottom: 28px;
}
.g-eyebrow-line { display: block; width: 30px; height: 1px; background: var(--gold); opacity: 0.5; }
.g-eyebrow-txt {
  font-family: var(--sans); font-size: 0.68rem; font-weight: 500;
  letter-spacing: 3px; text-transform: uppercase; color: var(--gold);
}
.g-hero-h1 { font-family: var(--serif); line-height: 1; margin-bottom: 24px; }
.g-h1-a, .g-h1-b, .g-h1-c { display: block; opacity: 0; transform: translateX(-20px); transition: opacity 0.7s ease, transform 0.7s ease; }
.g-hero.loaded .g-h1-a { opacity: 1; transform: translateX(0); transition-delay: 0.5s; }
.g-hero.loaded .g-h1-b { opacity: 1; transform: translateX(0); transition-delay: 0.65s; }
.g-hero.loaded .g-h1-c { opacity: 1; transform: translateX(0); transition-delay: 0.8s; }
.g-h1-a { font-size: clamp(2.5rem, 4.5vw, 4rem); font-weight: 400; color: var(--cream); }
.g-h1-b { font-size: clamp(4.5rem, 9vw, 8.5rem); font-weight: 700; color: var(--gold); font-style: italic; line-height: 0.9; }
.g-h1-c { font-size: clamp(2rem, 3.5vw, 3.5rem); font-weight: 400; color: var(--cream); }
.g-hero-sub {
  font-family: var(--sans); font-size: 0.95rem; font-weight: 300;
  color: rgba(200,195,184,0.6); line-height: 1.85; margin-bottom: 40px;
}
.g-hero-counters { display: flex; gap: 44px; flex-wrap: wrap; opacity: 0; transition: opacity 0.7s ease 1s; }
.g-hero.loaded .g-hero-counters { opacity: 1; }
.g-counter { display: flex; flex-direction: column; }
.g-counter-num { font-family: var(--serif); font-size: 2rem; font-weight: 700; color: var(--gold); }
.g-counter-lbl { font-family: var(--sans); font-size: 0.68rem; letter-spacing: 2px; text-transform: uppercase; color: rgba(200,195,184,0.35); margin-top: 4px; }

.g-hero-stack {
  position: absolute; right: 6vw; top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 14px; z-index: 3;
  opacity: 0; transition: opacity 0.9s ease 0.7s, transform 0.9s ease 0.7s;
  transform: translateY(-40%);
}
.g-hero.loaded .g-hero-stack { opacity: 1; transform: translateY(-50%); }
@media (max-width: 1000px) { .g-hero-stack { display: none; } }
.g-stack-main {
  position: relative; width: 260px; height: 340px; overflow: hidden;
  border: 2px solid rgba(200,169,110,0.15);
  box-shadow: 0 32px 72px rgba(0,0,0,0.7);
  border-radius: 3px;
  animation: gFloat 5s ease-in-out infinite;
}
.g-stack-main img { width: 100%; height: 100%; object-fit: cover; }
.g-stack-caption {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 10px 14px;
  background: rgba(12,11,9,0.78);
  font-family: var(--sans); font-size: 0.62rem;
  letter-spacing: 2px; text-transform: uppercase; color: var(--gold);
}
.g-stack-pill {
  background: var(--dark2);
  border: 1px solid rgba(200,169,110,0.2); border-radius: 3px;
  padding: 18px 24px;
  display: flex; flex-direction: column; align-items: center;
  animation: gFloat 7s ease-in-out infinite 0.8s;
}
.g-pill-num { font-family: var(--serif); font-size: 2.2rem; font-weight: 700; color: var(--gold); }
.g-pill-lbl { font-family: var(--sans); font-size: 0.6rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text); margin-top: 4px; }

.g-hero-scroll {
  position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  z-index: 3; opacity: 0; transition: opacity 0.6s ease 1.4s;
}
.g-hero.loaded .g-hero-scroll { opacity: 1; }
.g-hero-scroll span { font-family: var(--sans); font-size: 0.62rem; letter-spacing: 3px; text-transform: uppercase; color: rgba(200,169,110,0.4); }
.g-scroll-track { width: 1px; height: 50px; background: rgba(200,169,110,0.15); position: relative; overflow: hidden; }
.g-scroll-thumb { width: 100%; height: 40%; background: var(--gold); animation: gScrollDown 1.8s ease-in-out infinite; }

/* Filter Bar */
.g-bar {
  background: var(--dark2);
  border-top: 1px solid rgba(200,169,110,0.1);
  border-bottom: 1px solid rgba(200,169,110,0.1);
  position: sticky; top: 0; z-index: 100;
  backdrop-filter: blur(14px);
}
.g-bar-inner {
  max-width: 1400px; margin: 0 auto; padding: 0 6vw;
  display: flex; align-items: center; justify-content: space-between;
}
.g-cats { display: flex; overflow-x: auto; scrollbar-width: none; }
.g-cats::-webkit-scrollbar { display: none; }
.g-cat {
  position: relative;
  display: inline-flex; align-items: center; gap: 7px;
  padding: 20px 20px; background: none; border: none;
  font-family: var(--sans); font-size: 0.8rem; font-weight: 400;
  color: rgba(200,195,184,0.4); cursor: pointer; white-space: nowrap;
  transition: color 0.25s;
}
.g-cat:hover { color: var(--cream); }
.g-cat.active { color: var(--gold); }
.g-cat-icon { font-size: 1rem; }
.g-cat-count {
  font-size: 0.65rem; font-weight: 600;
  background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 10px;
  color: rgba(200,195,184,0.35);
}
.g-cat.active .g-cat-count { background: rgba(200,169,110,0.15); color: var(--gold); }
.g-cat-bar {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 2px; background: var(--gold); border-radius: 2px 2px 0 0;
}
.g-bar-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.g-meta-n { font-family: var(--serif); font-size: 1.1rem; font-weight: 700; color: var(--gold); }
.g-meta-t { font-family: var(--sans); font-size: 0.72rem; font-weight: 300; color: rgba(200,195,184,0.3); }

/* Page Grid */
.g-page {
  background: var(--dark); min-height: 60vh;
  padding: 40px 6vw 100px; max-width: 1400px; margin: 0 auto;
}
.g-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 3px;
  grid-auto-rows: 320px;
}
@media (min-width: 1200px) { .g-grid { grid-template-columns: repeat(3, 1fr); } }

/* Card */
.g-card {
  position: relative; background: var(--dark2); overflow: hidden;
  opacity: 0; transform: translateY(28px) scale(0.98);
  transition: opacity 0.55s ease, transform 0.55s ease, box-shadow 0.35s ease;
  cursor: pointer; display: flex; flex-direction: column;
}
.g-card.vis { opacity: 1; transform: translateY(0) scale(1); }
.g-card.tall { grid-row: span 2; }
.g-card:hover { z-index: 2; box-shadow: 0 28px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(200,169,110,0.15); transform: translateY(-6px) scale(1.01) !important; }
.g-card-img { position: relative; overflow: hidden; flex: 1; }
.g-card-photo { width: 100%; height: 100%; object-fit: cover; transition: transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94); }
.g-card:hover .g-card-photo { transform: scale(1.1); }
.g-card-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(12,11,9,0.65) 100%); pointer-events: none; }
.g-card-cat {
  position: absolute; top: 14px; left: 14px;
  padding: 4px 11px; border-radius: 2px;
  border: 1px solid rgba(200,169,110,0.35);
  background: rgba(200,169,110,0.12);
  font-family: var(--sans); font-size: 0.6rem; font-weight: 500;
  letter-spacing: 1.5px; text-transform: uppercase; color: var(--gold);
  backdrop-filter: blur(8px); z-index: 2;
}
.g-card-overlay {
  position: absolute; inset: 0; z-index: 3;
  background: linear-gradient(180deg, transparent 0%, rgba(12,11,9,0.92) 60%);
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: 28px 24px 20px;
  opacity: 0; transition: opacity 0.35s ease;
}
.g-card-overlay.show { opacity: 1; }
.g-overlay-body { transform: translateY(12px); transition: transform 0.35s ease; }
.g-card-overlay.show .g-overlay-body { transform: translateY(0); }
.g-overlay-title { font-family: var(--serif); font-size: 1.2rem; font-weight: 600; color: var(--cream); margin-bottom: 8px; }
.g-overlay-desc { font-family: var(--sans); font-size: 0.78rem; font-weight: 300; color: rgba(200,195,184,0.6); line-height: 1.6; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.g-overlay-stats { display: flex; gap: 16px; font-family: var(--sans); font-size: 0.7rem; color: rgba(200,169,110,0.7); }
.g-overlay-stats span { display: flex; align-items: center; gap: 5px; }
.g-overlay-cta { margin-top: 14px; font-family: var(--sans); font-size: 0.7rem; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--gold); transform: translateY(8px); transition: transform 0.35s ease 0.05s; }
.g-card-overlay.show .g-overlay-cta { transform: translateY(0); }
.g-card-foot {
  padding: 16px 18px;
  display: flex; align-items: center; justify-content: space-between;
  background: var(--dark2);
  border-top: 1px solid rgba(255,255,255,0.04);
  flex-shrink: 0;
}
.g-card-info { flex: 1; min-width: 0; }
.g-card-title { font-family: var(--serif); font-size: 1rem; font-weight: 600; color: var(--cream); margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.25s; }
.g-card:hover .g-card-title { color: var(--gold-l); }
.g-card-date { font-family: var(--sans); font-size: 0.65rem; font-weight: 300; color: rgba(200,195,184,0.3); }
.g-card-acts { display: flex; gap: 6px; }
.g-act-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 12px; border-radius: 2px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  color: rgba(200,195,184,0.4);
  font-family: var(--sans); font-size: 0.72rem;
  cursor: pointer; transition: all 0.2s;
}
.g-act-btn:hover { background: rgba(200,169,110,0.1); border-color: rgba(200,169,110,0.3); color: var(--gold); }
.g-act-btn.liked { background: rgba(200,169,110,0.12); border-color: rgba(200,169,110,0.35); color: var(--gold); }
.g-act-btn.liked svg { fill: var(--gold); }

/* Empty */
.g-empty { text-align: center; padding: 100px 20px; }
.g-empty-icon { font-size: 4rem; margin-bottom: 20px; }
.g-empty-h { font-family: var(--serif); font-size: 2rem; font-weight: 600; color: var(--cream); margin-bottom: 12px; }
.g-empty-p { font-family: var(--sans); font-size: 0.9rem; font-weight: 300; color: rgba(200,195,184,0.4); margin-bottom: 32px; }
.g-empty-btn {
  display: inline-flex; align-items: center;
  background: var(--gold); color: var(--dark);
  border: none; border-radius: 2px; padding: 13px 32px;
  font-family: var(--sans); font-size: 0.82rem; font-weight: 600;
  cursor: pointer; transition: all 0.3s;
}
.g-empty-btn:hover { background: var(--gold-l); transform: translateY(-2px); }

/* Lightbox */
.g-lb {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.94);
  backdrop-filter: blur(16px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  animation: gLbIn 0.3s ease;
}
.g-lb.closing { animation: gLbOut 0.3s ease forwards; }
.g-lb-wrap {
  position: relative;
  width: min(95vw, 1200px);
  max-height: 90vh;
  background: var(--dark2);
  border: 1px solid rgba(200,169,110,0.14);
  display: grid;
  grid-template-columns: 1fr 360px;
  grid-template-rows: 1fr;
  overflow: hidden;
  box-shadow: 0 48px 100px rgba(0,0,0,0.9);
  animation: gLbSlide 0.35s ease;
}
@media (max-width: 900px) {
  .g-lb-wrap { grid-template-columns: 1fr; grid-template-rows: 60vh auto; }
}
.g-lb-close {
  position: absolute; top: 16px; right: 16px; z-index: 10;
  width: 36px; height: 36px; background: rgba(12,11,9,0.7);
  border: 1px solid rgba(255,255,255,0.12);
  color: var(--cream); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; backdrop-filter: blur(6px);
}
.g-lb-close:hover { background: rgba(200,169,110,0.2); border-color: var(--gold); color: var(--gold); }
.g-lb-counter {
  position: absolute; top: 16px; left: 16px; z-index: 10;
  font-family: var(--sans); font-size: 0.7rem; font-weight: 500;
  letter-spacing: 2px; color: rgba(200,169,110,0.6);
  background: rgba(12,11,9,0.6); padding: 5px 12px;
}
.g-lb-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 44px; height: 44px; background: rgba(12,11,9,0.7);
  border: 1px solid rgba(255,255,255,0.12);
  color: var(--cream); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; z-index: 10;
  backdrop-filter: blur(6px);
}
.g-lb-nav:hover:not(:disabled) { background: rgba(200,169,110,0.2); border-color: var(--gold); color: var(--gold); }
.g-lb-nav:disabled { opacity: 0.2; cursor: not-allowed; }
.g-lb-nav.prev { left: 16px; }
.g-lb-nav.next { right: 380px; }
@media (max-width: 900px) { .g-lb-nav.next { right: 16px; } }
.g-lb-img-wrap { background: #050403; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.g-lb-img { width: 100%; height: 100%; object-fit: contain; animation: gImgIn 0.35s ease; }
.g-lb-panel { display: flex; flex-direction: column; padding: 32px 28px; border-left: 1px solid rgba(200,169,110,0.1); overflow-y: auto; }
.g-lb-panel-top { margin-bottom: 24px; }
.g-lb-eyebrow { display: block; font-family: var(--sans); font-size: 0.65rem; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; }
.g-lb-title { font-family: var(--serif); font-size: 1.7rem; font-weight: 700; color: var(--cream); margin-bottom: 12px; }
.g-lb-desc { font-family: var(--sans); font-size: 0.83rem; font-weight: 300; color: rgba(200,195,184,0.5); line-height: 1.7; }
.g-lb-divider { width: 100%; height: 1px; background: rgba(200,169,110,0.1); margin: 20px 0; }
.g-lb-stats { display: flex; gap: 0; margin-bottom: 0; }
.g-lb-stat { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 12px 0; border-right: 1px solid rgba(255,255,255,0.06); color: var(--gold); }
.g-lb-stat:last-child { border-right: none; }
.g-lb-stat span { font-family: var(--serif); font-size: 1.1rem; font-weight: 700; color: var(--cream); }
.g-lb-stat small { font-family: var(--sans); font-size: 0.6rem; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(200,195,184,0.3); }
.g-lb-actions { display: flex; gap: 10px; }
.g-lb-btn {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 11px 16px; border-radius: 2px;
  font-family: var(--sans); font-size: 0.78rem; font-weight: 600;
  cursor: pointer; transition: all 0.25s; text-transform: uppercase;
}
.g-lb-btn.like { background: rgba(200,169,110,0.1); border: 1px solid rgba(200,169,110,0.3); color: var(--gold); }
.g-lb-btn.like:hover, .g-lb-btn.like.liked { background: var(--gold); color: var(--dark); border-color: var(--gold); }
.g-lb-btn.share { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: rgba(200,195,184,0.5); }
.g-lb-btn.share:hover { background: rgba(255,255,255,0.09); color: var(--cream); }
.g-lb-strip { display: flex; gap: 6px; flex-wrap: wrap; margin-top: auto; padding-top: 20px; }
.g-lb-thumb {
  width: 54px; height: 54px; overflow: hidden; border-radius: 2px;
  border: 1.5px solid transparent; cursor: pointer; transition: all 0.2s;
  opacity: 0.5;
}
.g-lb-thumb:hover { opacity: 0.8; border-color: rgba(200,169,110,0.4); }
.g-lb-thumb.active { opacity: 1; border-color: var(--gold); }
.g-lb-thumb img { width: 100%; height: 100%; object-fit: cover; }

@keyframes gSpin { to { transform: rotate(360deg); } }
@keyframes gDot { 0%,80%,100% { opacity: 0.15; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1.2); } }
@keyframes gFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
@keyframes gScrollDown { 0% { transform: translateY(-100%); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(200%); opacity: 0; } }
@keyframes gLbIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes gLbOut { from { opacity: 1; } to { opacity: 0; } }
@keyframes gLbSlide { from { opacity: 0; transform: scale(0.96) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes gImgIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }

@media (max-width: 768px) {
  .g-hero { padding: 0 6vw; min-height: 90vh; }
  .g-grid { grid-template-columns: 1fr; grid-auto-rows: 280px; gap: 3px; }
  .g-card.tall { grid-row: span 1; }
  .g-lb-panel { padding: 20px; }
  .g-lb-nav.prev { left: 8px; }
}
@media (max-width: 480px) {
  .g-cat-lbl { display: none; }
}
`;

export default Gallery;