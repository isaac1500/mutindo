import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaUtensils, FaStar, FaCalendarAlt, FaArrowRight, FaLeaf, FaFire } from 'react-icons/fa';

const ICON_MAP = {
  leaf: <FaLeaf />,
  fire: <FaFire />,
  truck: <FaTruck />,
  calendar: <FaCalendarAlt />,
  star: <FaStar />,
  utensils: <FaUtensils />,
};

const Home = () => {
  const [content, setContent] = useState(null);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const intervalRef = useRef(null);

  // Fetch content from Firebase - UPDATED (removed Authorization header)
  useEffect(() => {
    const fetchContent = async () => {
      try {
        // REMOVED the token and Authorization header
        const response = await fetch('http://localhost:3000/api/content/home');
        
        if (response.ok) {
          const data = await response.json();
          if (data && Object.keys(data).length > 0) {
            setContent(data);
            return;
          }
        }
        // Fallback to default content if nothing in Firebase
        setContent({
          hero: {
            primaryButtonText: "Order Now",
            primaryButtonLink: "/menu",
            secondaryButtonText: "Catering Services",
            secondaryButtonLink: "/catering",
            slides: [
              {
                id: 1,
                title: "Taste of Uganda",
                subtitle: "Luwombo & Matooke",
                desc: "Traditional banana-leaf steamed dishes, slow-cooked to perfection.",
                tag: "Local Special",
                accent: "#FF6B35",
                image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600"
              },
              {
                id: 2,
                title: "Grilled Perfection",
                subtitle: "Nile Perch & Tilapia",
                desc: "Fresh-caught fish from Lake Victoria, seasoned with Ugandan spices.",
                tag: "Chef's Pick",
                accent: "#00C9A7",
                image: "https://images.pexels.com/photos/1164717/pexels-photo-1164717.jpeg?auto=compress&cs=tinysrgb&w=1600"
              },
              {
                id: 3,
                title: "Street Food Royalty",
                subtitle: "Rolex & Samosas",
                desc: "Kampala's iconic street food elevated — crispy chapati rolls.",
                tag: "Fan Favourite",
                accent: "#FFD700",
                image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1600"
              }
            ]
          },
          stats: [
            { num: "2,400+", label: "Orders Delivered" },
            { num: "98%", label: "Happy Customers" },
            { num: "30min", label: "Avg. Delivery Time" },
            { num: "7", label: "Years Serving Kampala" }
          ],
          features: {
            sectionLabel: "Why Choose Us",
            sectionTitle: "Food that feels like home",
            items: [
              { icon: "leaf", title: "Farm-Fresh Ingredients", desc: "Locally-sourced, seasonal produce.", color: "#00C9A7" },
              { icon: "fire", title: "Cooked to Order", desc: "Fresh when you order — no shortcuts.", color: "#FF6B35" },
              { icon: "truck", title: "Real-Time Tracking", desc: "Live GPS tracking every step.", color: "#FFD700" },
              { icon: "calendar", title: "Catering Events", desc: "Events of all sizes with grace.", color: "#c97bff" }
            ]
          },
          menuPreview: {
            sectionLabel: "What We Serve",
            sectionTitle: "Signature Dishes",
            viewAllLink: "/menu",
            items: [
              { name: "Matooke & Beef", tag: "Local Special", desc: "Steamed green bananas with beef stew.", price: "UGX 12,000", image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800" },
              { name: "Grilled Tilapia", tag: "Chef's Pick", desc: "Fresh Nile perch with spices.", price: "UGX 25,000", image: "https://images.pexels.com/photos/1164717/pexels-photo-1164717.jpeg?auto=compress&cs=tinysrgb&w=800" },
              { name: "Super Rolex", tag: "Fan Favourite", desc: "Chapati with eggs, cheese, avocado.", price: "UGX 8,000", image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800" },
              { name: "Chicken Pilau", tag: "Best Seller", desc: "Spiced rice with tender chicken.", price: "UGX 15,000", image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800" }
            ]
          },
          testimonials: {
            sectionLabel: "What People Say",
            sectionTitle: "Loved across Kampala",
            items: [
              { name: "Amara N.", text: "Best catering in Kampala!", stars: 5 },
              { name: "David K.", text: "The Luwombo is exactly like my grandmother used to make it.", stars: 5 },
              { name: "Sarah M.", text: "Fast delivery and food was still piping hot!", stars: 5 }
            ]
          },
          cta: {
            title: "Ready to taste something unforgettable?",
            subtitle: "Order now and get your meal delivered in under 30 minutes anywhere in Kampala.",
            primaryButtonText: "Order Now",
            primaryButtonLink: "/menu",
            secondaryButtonText: "Contact Us",
            secondaryButtonLink: "/contact"
          },
          footer: {
            brand: "Mutindo Catering",
            tagline: "Prepared with love · Delivered with care",
            links: [
              { label: "Menu", to: "/menu" },
              { label: "About", to: "/about" },
              { label: "Catering", to: "/catering" },
              { label: "Contact", to: "/contact" }
            ]
          }
        });
      } catch (err) {
        console.error('Error loading content:', err);
      }
    };
    fetchContent();
  }, []);

  // Auto-play slides
  useEffect(() => {
    if (!content?.hero?.slides) return;
    const total = content.hero.slides.length;
    intervalRef.current = setInterval(() => goTo(c => (c + 1) % total), 5000);
    return () => clearInterval(intervalRef.current);
  }, [content]);

  // Intersection observer for scroll reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting)
          setVisibleSections(v => ({ ...v, [e.target.dataset.section]: true }));
      }),
      { threshold: 0.15 }
    );
    document.querySelectorAll('[data-section]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [content]);

  const goTo = (indexOrFn) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(prev => {
      const next = typeof indexOrFn === 'function' ? indexOrFn(prev) : indexOrFn;
      setPrev(prev);
      setTimeout(() => { setPrev(null); setAnimating(false); }, 700);
      return next;
    });
  };

  if (!content) {
    return (
      <div style={{ background: '#0d0d0d', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#FF6B35' }}>Loading...</p>
      </div>
    );
  }

  const slides = content.hero?.slides || [];
  const slide = slides[current] || {};
  const stats = content.stats || [];
  const features = content.features?.items || [];
  const menuItems = content.menuPreview?.items || [];
  const testimonials = content.testimonials?.items || [];
  const footerLinks = content.footer?.links || [];
  const cta = content.cta || {};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&display=swap');

        :root { --accent: ${slide.accent || '#FF6B35'}; --font-display: 'Playfair Display', Georgia, serif; --font-body: 'DM Sans', sans-serif; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-body); background: #0d0d0d; color: #f0ece4; }

        .hero-wrapper { position: relative; width: 100%; height: 100vh; min-height: 600px; overflow: hidden; perspective: 1200px; }
        .slide-bg { position: absolute; inset: 0; transition: opacity 0.7s ease, transform 0.7s ease; opacity: 0; transform: scale(1.08) translateZ(-60px); }
        .slide-bg.active { opacity: 1; transform: scale(1) translateZ(0); }
        .slide-bg.exiting { opacity: 0; transform: scale(0.94) translateZ(-80px); }
        .slide-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: brightness(0.45) contrast(1.1); }
        .slide-bg.active .slide-image { filter: brightness(0.5) contrast(1.15); }
        .slide-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, transparent 100%); z-index: 1; }
        .slide-pattern { position: absolute; inset: 0; background-image: radial-gradient(circle at 30% 40%, rgba(255,107,53,0.08) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; z-index: 2; }
        .slide-noise { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E"); pointer-events: none; z-index: 3; }
        .hero-content { position: relative; z-index: 20; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; height: 100%; padding: 0 8vw; max-width: 760px; }
        .slide-tag { display: inline-block; background: rgba(255,255,255,0.12); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.25); padding: 6px 18px; border-radius: 50px; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); margin-bottom: 24px; animation: fadeUp 0.6s ease both; animation-delay: 0.1s; }
        .hero-title { font-family: var(--font-display); font-size: clamp(3rem, 7vw, 6rem); font-weight: 900; line-height: 1.0; color: #fff; text-shadow: 0 2px 20px rgba(0,0,0,0.3); animation: fadeUp 0.6s ease both; animation-delay: 0.2s; }
        .hero-subtitle { font-family: var(--font-display); font-size: clamp(1.3rem, 3vw, 2rem); font-weight: 700; font-style: italic; color: var(--accent); margin-top: 8px; animation: fadeUp 0.6s ease both; animation-delay: 0.3s; }
        .hero-desc { font-size: 1.05rem; font-weight: 300; color: rgba(240,236,228,0.85); line-height: 1.7; margin-top: 20px; max-width: 480px; text-shadow: 0 1px 8px rgba(0,0,0,0.2); animation: fadeUp 0.6s ease both; animation-delay: 0.4s; }
        .hero-buttons { display: flex; gap: 16px; margin-top: 36px; flex-wrap: wrap; animation: fadeUp 0.6s ease both; animation-delay: 0.5s; }
        .btn-primary-custom { background: var(--accent); color: #fff; border: none; padding: 14px 32px; border-radius: 4px; font-weight: 500; font-size: 0.95rem; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; transition: transform 0.2s, box-shadow 0.2s; }
        .btn-primary-custom:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,0,0,0.4); color: #fff; }
        .btn-ghost-custom { background: transparent; color: rgba(255,255,255,0.9); border: 1px solid rgba(255,255,255,0.4); padding: 14px 32px; border-radius: 4px; font-weight: 400; font-size: 0.95rem; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; transition: all 0.2s; backdrop-filter: blur(8px); }
        .btn-ghost-custom:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-2px); }
        .slide-dots { position: absolute; bottom: 40px; left: 8vw; display: flex; gap: 12px; z-index: 20; }
        .dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.3s; border: none; padding: 0; }
        .dot.active { background: var(--accent); transform: scale(1.4); box-shadow: 0 0 10px var(--accent); }
        .scroll-indicator { position: absolute; bottom: 36px; right: 8vw; display: flex; flex-direction: column; align-items: center; gap: 8px; color: rgba(255,255,255,0.5); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; z-index: 20; }
        .scroll-line { width: 1px; height: 50px; background: linear-gradient(to bottom, rgba(255,255,255,0.6), transparent); animation: scrollPulse 2s ease-in-out infinite; }

        .section { padding: 100px 0; }
        .section-dark { background: #111; }
        .section-darker { background: #0d0d0d; }
        .section-warm { background: #130f0a; }
        .section-label { font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #FF6B35; margin-bottom: 16px; }
        .section-title { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 900; color: #f0ece4; line-height: 1.1; }

        .reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }

        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2px; margin-top: 60px; }
        .feature-card { background: #181818; padding: 48px 36px; position: relative; overflow: hidden; transition: background 0.3s; cursor: default; }
        .feature-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 0; background: var(--card-accent, #FF6B35); transition: height 0.4s ease; }
        .feature-card:hover::before { height: 100%; }
        .feature-card:hover { background: #1e1e1e; }
        .feature-icon { font-size: 2.2rem; margin-bottom: 24px; display: block; }
        .feature-title { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; color: #f0ece4; margin-bottom: 12px; }
        .feature-desc { font-size: 0.9rem; font-weight: 300; color: rgba(240,236,228,0.55); line-height: 1.7; }

        .menu-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 48px; }
        .menu-card { background: #161616; border-radius: 2px; overflow: hidden; transition: transform 0.3s, box-shadow 0.3s; cursor: pointer; }
        .menu-card:hover { transform: translateY(-8px); box-shadow: 0 24px 60px rgba(0,0,0,0.6); }
        .menu-card-img { height: 220px; position: relative; overflow: hidden; }
        .menu-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .menu-card:hover .menu-card-img img { transform: scale(1.08); }
        .menu-card-img::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, #161616, transparent); pointer-events: none; }
        .menu-card-body { padding: 24px; }
        .menu-card-tag { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #FF6B35; font-weight: 500; margin-bottom: 8px; }
        .menu-card-name { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; color: #f0ece4; margin-bottom: 6px; }
        .menu-card-desc { font-size: 0.82rem; color: rgba(240,236,228,0.5); line-height: 1.6; }
        .menu-card-price { margin-top: 16px; font-size: 1.1rem; font-weight: 500; color: #FF6B35; }

        .stats-bar { background: #FF6B35; padding: 48px 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
        .stat-item { text-align: center; padding: 16px; }
        .stat-num { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; color: #fff; display: block; }
        .stat-label { font-size: 0.8rem; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.75); margin-top: 4px; }

        .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; margin-top: 48px; }
        .testimonial-card { background: #181818; padding: 36px; border-bottom: 2px solid transparent; transition: border-color 0.3s, transform 0.3s; }
        .testimonial-card:hover { border-color: #FF6B35; transform: translateY(-4px); }
        .testimonial-stars { color: #FF6B35; font-size: 0.85rem; margin-bottom: 16px; }
        .testimonial-text { font-size: 0.95rem; font-style: italic; color: rgba(240,236,228,0.75); line-height: 1.7; margin-bottom: 20px; }
        .testimonial-author { font-weight: 500; color: #f0ece4; font-size: 0.85rem; letter-spacing: 0.5px; }

        .cta-section { background: linear-gradient(135deg, #1a0a00, #3d1a00); padding: 100px 0; text-align: center; position: relative; overflow: hidden; }
        .cta-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(255,107,53,0.2) 0%, transparent 70%); }
        .cta-title { font-family: var(--font-display); font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 900; color: #fff; line-height: 1.1; position: relative; z-index: 2; }
        .cta-sub { font-size: 1rem; font-weight: 300; color: rgba(255,255,255,0.65); margin: 20px auto 40px; max-width: 480px; line-height: 1.7; position: relative; z-index: 2; }
        .cta-buttons { position: relative; z-index: 2; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

        .bottom-nav { background: #080808; padding: 60px 0 40px; border-top: 1px solid rgba(255,255,255,0.06); }
        .bottom-brand { font-family: var(--font-display); font-size: 1.6rem; font-weight: 900; color: #f0ece4; }
        .bottom-tagline { font-size: 0.8rem; color: rgba(240,236,228,0.4); margin-top: 6px; letter-spacing: 1px; }
        .bottom-divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 40px 0 20px; }
        .bottom-copy { font-size: 0.78rem; color: rgba(240,236,228,0.3); text-align: center; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scrollPulse { 0%,100% { opacity:0.4; height:50px; } 50% { opacity:1; height:30px; } }
        @media (max-width: 768px) { .hero-content { align-items: center; text-align: center; padding: 0 6vw; } .hero-buttons { justify-content: center; } .section { padding: 72px 0; } .features-grid { grid-template-columns: 1fr; gap: 2px; } .menu-grid { grid-template-columns: 1fr; gap: 16px; } .slide-dots { left: 50%; transform: translateX(-50%); } }
      `}</style>

      {/* HERO */}
      <div className="hero-wrapper">
        {slides.map((s, i) => {
          const isActive = i === current;
          const isExiting = i === prev;
          return (
            <div key={s.id || i} className={`slide-bg ${isActive ? 'active' : ''} ${isExiting ? 'exiting' : ''}`}>
              {s.image && <img src={s.image} alt={s.title} className="slide-image" loading={i === 0 ? 'eager' : 'lazy'} />}
              <div className="slide-overlay" />
              <div className="slide-pattern" />
            </div>
          );
        })}
        <div className="slide-noise" />

        <div className="hero-content" key={`content-${current}`}>
          <span className="slide-tag">{slide.tag}</span>
          <h1 className="hero-title">{slide.title}</h1>
          <p className="hero-subtitle">{slide.subtitle}</p>
          <p className="hero-desc">{slide.desc}</p>
          <div className="hero-buttons">
            <Link to={content.hero?.primaryButtonLink || '/menu'} className="btn-primary-custom" style={{ background: slide.accent || '#FF6B35' }}>
              {content.hero?.primaryButtonText || 'Order Now'} <FaArrowRight size={14} />
            </Link>
            <Link to={content.hero?.secondaryButtonLink || '/catering'} className="btn-ghost-custom">
              {content.hero?.secondaryButtonText || 'Catering Services'}
            </Link>
          </div>
        </div>

        <div className="slide-dots">
          {slides.map((_, i) => (
            <button key={i} className={`dot ${i === current ? 'active' : ''}`} onClick={() => goTo(i)} />
          ))}
        </div>
        <div className="scroll-indicator"><div className="scroll-line" /><span>Scroll</span></div>
      </div>

      {/* STATS BAR */}
      <div className="stats-bar">
        {stats.map((s, i) => (
          <div className="stat-item" key={i}><span className="stat-num">{s.num}</span><span className="stat-label">{s.label}</span></div>
        ))}
      </div>

      {/* FEATURES */}
      <section className="section section-dark" data-section="features">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 6vw' }}>
          <div className={`reveal ${visibleSections.features ? 'visible' : ''}`}>
            <p className="section-label">{content.features?.sectionLabel}</p>
            <h2 className="section-title">{content.features?.sectionTitle}</h2>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className={`feature-card reveal ${visibleSections.features ? 'visible' : ''} reveal-delay-${i + 1}`} style={{ '--card-accent': f.color }}>
                <span className="feature-icon" style={{ color: f.color }}>{ICON_MAP[f.icon] || <FaStar />}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MENU PREVIEW */}
      <section className="section section-darker" data-section="menu">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 6vw' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
            <div className={`reveal ${visibleSections.menu ? 'visible' : ''}`}>
              <p className="section-label">{content.menuPreview?.sectionLabel}</p>
              <h2 className="section-title">{content.menuPreview?.sectionTitle}</h2>
            </div>
            <Link to={content.menuPreview?.viewAllLink || '/menu'} className={`btn-primary-custom reveal ${visibleSections.menu ? 'visible' : ''}`} style={{ background: '#FF6B35' }}>
              Full Menu <FaArrowRight size={12} />
            </Link>
          </div>
          <div className="menu-grid">
            {menuItems.map((item, i) => (
              <div key={i} className={`menu-card reveal ${visibleSections.menu ? 'visible' : ''} reveal-delay-${i + 1}`}>
                <div className="menu-card-img">
                  {item.image && <img src={item.image} alt={item.name} loading="lazy" />}
                </div>
                <div className="menu-card-body">
                  <p className="menu-card-tag">{item.tag}</p>
                  <h4 className="menu-card-name">{item.name}</h4>
                  <p className="menu-card-desc">{item.desc}</p>
                  <p className="menu-card-price">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section section-warm" data-section="testimonials">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 6vw' }}>
          <div className={`reveal ${visibleSections.testimonials ? 'visible' : ''}`} style={{ textAlign: 'center' }}>
            <p className="section-label">{content.testimonials?.sectionLabel}</p>
            <h2 className="section-title">{content.testimonials?.sectionTitle}</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className={`testimonial-card reveal ${visibleSections.testimonials ? 'visible' : ''} reveal-delay-${i + 1}`}>
                <div className="testimonial-stars">{'★'.repeat(t.stars)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <p className="testimonial-author">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" data-section="cta">
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 6vw' }}>
          <h2 className={`cta-title reveal ${visibleSections.cta ? 'visible' : ''}`}>{cta.title}</h2>
          <p className={`cta-sub reveal ${visibleSections.cta ? 'visible' : ''} reveal-delay-1`}>{cta.subtitle}</p>
          <div className={`cta-buttons reveal ${visibleSections.cta ? 'visible' : ''} reveal-delay-2`}>
            <Link to={cta.primaryButtonLink || '/menu'} className="btn-primary-custom" style={{ background: '#FF6B35', fontSize: '1rem', padding: '16px 40px' }}>
              {cta.primaryButtonText || 'Order Now'} <FaArrowRight size={14} />
            </Link>
            <Link to={cta.secondaryButtonLink || '/contact'} className="btn-ghost-custom" style={{ fontSize: '1rem', padding: '16px 40px' }}>
              {cta.secondaryButtonText || 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div className="bottom-nav">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 6vw' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40 }}>
            <div>
              <div className="bottom-brand">{content.footer?.brand}</div>
              <div className="bottom-tagline">{content.footer?.tagline}</div>
            </div>
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              {footerLinks.map((link, i) => (
                <Link key={i} to={link.to} style={{ color: 'rgba(240,236,228,0.5)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#FF6B35'}
                  onMouseLeave={e => e.target.style.color = 'rgba(240,236,228,0.5)'}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <hr className="bottom-divider" />
          <p className="bottom-copy">© {new Date().getFullYear()} {content.footer?.brand} · Kampala, Uganda</p>
        </div>
      </div>
    </>
  );
};

export default Home;