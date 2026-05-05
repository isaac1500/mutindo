import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const num = parseInt(target.replace(/\D/g, ''), 10);
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(p * p * num));
      if (p < 1) requestAnimationFrame(step);
      else setCount(num);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function AnimStat({ number, label, suffix, started }) {
  const val = useCounter(number, 1800, started);
  return (
    <div className="as-stat">
      <span className="as-stat-num">{val}{suffix}</span>
      <span className="as-stat-label">{label}</span>
    </div>
  );
}

const About = () => {
  const [content, setContent] = useState(null);
  const [sectionsVisible, setSectionsVisible] = useState({});
  const statsRef = useRef(null);
  const [statsStarted, setStatsStarted] = useState(false);

  // Fallback images
  const FALLBACK_IMGS = {
    hero: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600',
    chef1: 'https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg?auto=compress&cs=tinysrgb&w=900',
    chef2: 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=900',
    kitchen: 'https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=900',
    event: 'https://images.pexels.com/photos/1414235/pexels-photo-1414235.jpeg?auto=compress&cs=tinysrgb&w=900',
    food1: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800',
    food2: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800',
    food3: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=800',
    team: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=900',
    delivery: 'https://images.pexels.com/photos/4393426/pexels-photo-4393426.jpeg?auto=compress&cs=tinysrgb&w=800',
    fresh: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=800',
    plating: 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=800',
  };

  // Fetch content from Firebase
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/content/about');
        const data = await res.json();
        console.log('About page data from Firebase:', data);
        if (data && Object.keys(data).length > 0) {
          setContent(data);
        } else {
          // If Firebase is empty, use default structure that matches your About page
          setContent({
            hero: {
              eyebrow: "Kampala's Premier Catering Service",
              titleTop: "Crafting",
              titleEm: "Unforgettable",
              titleBot: "Dining Experiences",
              subtitle: "From intimate family dinners to large-scale state events — we bring passion, precision, and Ugandan heart to every single plate.",
              pills: ["Since 2020", "1,000+ Happy Clients", "500+ Events Catered"],
              ctaText: "Work With Us",
              ctaLink: "/contact",
              satisfactionBadge: "98",
              backgroundImage: FALLBACK_IMGS.hero,
              floatImage1: FALLBACK_IMGS.chef2,
              floatImage2: FALLBACK_IMGS.food3
            },
            stats: [
              { number: "500", suffix: "+", label: "Events Catered" },
              { number: "98", suffix: "%", label: "Client Satisfaction" },
              { number: "24", suffix: "h", label: "Response Time" },
              { number: "50", suffix: "+", label: "Team Members" }
            ],
            story: {
              eyebrow: "Who We Are",
              titleMain: "More Than",
              titleEm: "Just Catering",
              body1: "Mutindo Catering Services was born from one simple belief: that a great meal can change the entire mood of a moment. What began as a small family kitchen has blossomed into Kampala's most trusted name in professional catering.",
              body2: "We partner with Ugandan farmers, source the freshest local produce, and put it in the hands of our professional culinary team — chefs who cook not just with skill, but with genuine love for the craft.",
              checks: ["Locally sourced, seasonally fresh ingredients", "Custom menus for every occasion", "Professional, stress-free event management", "Full-service from prep to clean-up"],
              ctaText: "Start Planning Your Event",
              ctaLink: "/contact",
              mainImage: FALLBACK_IMGS.chef1,
              mainImageCaption: "Our Head Chef — crafting since 2020",
              accentImage: FALLBACK_IMGS.kitchen,
              awardYear: "2024",
              awardTitle: "KAMPALA'S BEST CATERER"
            },
            features: {
              eyebrow: "Why Choose Us",
              titleMain: "What Makes Us",
              titleEm: "Different",
              items: [
                { tag: "Farm to Fork", title: "Locally Sourced Quality", body: "Every ingredient is hand-picked from Ugandan farms.", image: FALLBACK_IMGS.fresh },
                { tag: "Express Service", title: "On-Time Delivery", body: "Our logistics network ensures your meals arrive piping hot.", image: FALLBACK_IMGS.delivery },
                { tag: "Culinary Craft", title: "Chef-Level Presentation", body: "Professional plating that transforms every meal into a visual masterpiece.", image: FALLBACK_IMGS.plating },
                { tag: "Our People", title: "Expert Team", body: "Trained culinary professionals who treat every event with warm hospitality.", image: FALLBACK_IMGS.team }
              ]
            },
            timeline: {
              eyebrow: "Our Journey",
              titleMain: "Milestones That",
              titleEm: "Define Us",
              subtitle: "Five years of passion, one plate at a time.",
              milestones: [
                { year: "2020", title: "The Beginning", body: "Started as a family kitchen in Kampala.", image: FALLBACK_IMGS.kitchen },
                { year: "2021", title: "First Restaurant", body: "Opened our first physical location.", image: FALLBACK_IMGS.food1 },
                { year: "2022", title: "Catering Division", body: "Launched full-scale event catering.", image: FALLBACK_IMGS.event },
                { year: "2023", title: "Award Winning", body: "Recognized as Kampala's top caterer.", image: FALLBACK_IMGS.chef1 },
                { year: "2024", title: "Nationwide Reach", body: "Expanded services across Uganda.", image: FALLBACK_IMGS.food2 }
              ]
            },
            bento: {
              teamImage: FALLBACK_IMGS.team,
              teamTag: "The Team",
              teamTitle: "Passionate Professionals",
              teamBody: "50+ Chefs, planners & delivery crew.",
              menuImage: FALLBACK_IMGS.food2,
              menuTag: "Our Menu",
              menuTitle: "Pan-Ugandan Cuisine",
              eventsImage: FALLBACK_IMGS.event,
              eventsTag: "Events",
              eventsTitle: "Any Scale, Any Occasion",
              quoteText: "Every meal we serve carries our name.",
              quoteAuthor: "Founder, Mutindo Catering"
            },
            cta: {
              eyebrow: "Our Promise",
              titleMain: "Your Event Deserves",
              titleEm: "Nothing Less",
              titleEnd: "Than Perfect",
              subtitle: "Join thousands of satisfied clients across Uganda.",
              badges: ["Quality Guaranteed", "Excellence Focused", "Customer First"],
              ctaText: "Book a Consultation",
              ctaLink: "/contact",
              backgroundImage: FALLBACK_IMGS.chef2
            }
          });
        }
      } catch (err) {
        console.error('Error loading content:', err);
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    if (!content) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting && e.target.dataset.reveal) {
          setSectionsVisible(v => ({ ...v, [e.target.dataset.reveal]: true }));
        }
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));

    const statsObs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsStarted(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) statsObs.observe(statsRef.current);

    return () => { obs.disconnect(); statsObs.disconnect(); };
  }, [content]);

  if (!content) {
    return (
      <div style={{ background: '#0d0d0d', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#FF6B35' }}>Loading...</p>
      </div>
    );
  }

  const hero = content.hero || {};
  const stats = content.stats || [];
  const story = content.story || {};
  const features = content.features?.items || [];
  const milestones = content.timeline?.milestones || [];
  const bento = content.bento || {};
  const cta = content.cta || {};
  const isV = k => !!sectionsVisible[k];

  return (
    <>
      <style>{CSS}</style>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url(${hero.backgroundImage || FALLBACK_IMGS.hero})` }} />
        <div className="hero-vignette" />
        <div className="hero-grain" />

        <div className="hero-inner">
          <div className="hero-eyebrow">
            <span className="eyebrow-line" />
            <span>{hero.eyebrow || "Kampala's Premier Catering Service"}</span>
            <span className="eyebrow-line" />
          </div>

          <h1 className="hero-h1">
            <span className="hero-h1-top">{hero.titleTop || "Crafting"}</span>
            <em className="hero-h1-em">{hero.titleEm || "Unforgettable"}</em>
            <span className="hero-h1-bot">{hero.titleBot || "Dining Experiences"}</span>
          </h1>

          <p className="hero-sub">{hero.subtitle || ""}</p>

          <div className="hero-pills">
            {(hero.pills || ["Since 2020", "1,000+ Happy Clients", "500+ Events Catered"]).map((pill, i) => (
              <span key={i} className="hero-pill">✦ {pill}</span>
            ))}
          </div>

          <Link to={hero.ctaLink || "/contact"} className="hero-cta">
            {hero.ctaText || "Work With Us"}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        <div className="hero-float-stack">
          <img className="hero-float-img hfi-1" src={hero.floatImage1 || FALLBACK_IMGS.chef2} alt="Chef" />
          <img className="hero-float-img hfi-2" src={hero.floatImage2 || FALLBACK_IMGS.food3} alt="Dish" />
          <div className="hero-float-badge">
            <span className="hfb-num">{hero.satisfactionBadge || "98"}<sup>%</sup></span>
            <span className="hfb-txt">Client Satisfaction</span>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="stats-bar" ref={statsRef}>
        <div className="stats-bar-inner">
          {stats.map((s, i) => (
            <React.Fragment key={i}>
              <AnimStat {...s} started={statsStarted} />
              {i < stats.length - 1 && <div className="stats-divider" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* STORY SECTION */}
      <section className="story-section">
        <div data-reveal="story-imgs" className={`story-imgs reveal-left ${isV('story-imgs') ? 'visible' : ''}`}>
          <div className="story-img-main">
            <img src={story.mainImage || FALLBACK_IMGS.chef1} alt="Our Head Chef" />
            <div className="story-img-caption">{story.mainImageCaption || "Our Head Chef — crafting since 2020"}</div>
          </div>
          <div className="story-img-accent">
            <img src={story.accentImage || FALLBACK_IMGS.kitchen} alt="Our Kitchen" />
            <div className="story-img-tag">The Kitchen ↗</div>
          </div>
          <div className="story-award-badge">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="38" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeDasharray="4 3"/>
              <text x="40" y="33" textAnchor="middle" fill="#c8a96e" fontSize="9" fontFamily="serif">KAMPALA'S</text>
              <text x="40" y="44" textAnchor="middle" fill="#c8a96e" fontSize="11" fontFamily="serif" fontWeight="bold">BEST</text>
              <text x="40" y="55" textAnchor="middle" fill="#c8a96e" fontSize="9" fontFamily="serif">CATERER {story.awardYear || "2023"}</text>
            </svg>
          </div>
        </div>

        <div data-reveal="story-text" className={`story-text reveal-right ${isV('story-text') ? 'visible' : ''}`}>
          <p className="section-eyebrow">{story.eyebrow || "Who We Are"}</p>
          <h2 className="section-h2">{story.titleMain || "More Than"}<br />Just <em>{story.titleEm || "Catering"}</em></h2>
          <div className="story-divider" />
          <p className="story-body">{story.body1 || ""}</p>
          <p className="story-body">{story.body2 || ""}</p>

          <ul className="story-checks">
            {(story.checks || []).map((c, i) => (
              <li key={i}>
                <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                  <circle cx="10" cy="10" r="9" stroke="#c8a96e" strokeWidth="1.5"/>
                  <path d="M6 10l3 3 5-5" stroke="#c8a96e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {c}
              </li>
            ))}
          </ul>

          <Link to={story.ctaLink || "/contact"} className="story-btn">
            {story.ctaText || "Start Planning Your Event"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="features-head">
          <p className="section-eyebrow">{content.features?.eyebrow || "Why Choose Us"}</p>
          <h2 className="section-h2">{content.features?.titleMain || "What Makes Us"}<br /><em>{content.features?.titleEm || "Different"}</em></h2>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feat-card">
              <div className="feat-img-wrap">
                <img src={f.image} alt={f.title} className="feat-img" />
                <div className="feat-overlay" />
                <span className="feat-tag">{f.tag}</span>
              </div>
              <div className="feat-body">
                <h3 className="feat-title">{f.title}</h3>
                <p className="feat-text">{f.body}</p>
                <div className="feat-line" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TIMELINE SECTION */}
      <section className="timeline-section">
        <div className="timeline-head">
          <p className="section-eyebrow" style={{ color: '#c8a96e' }}>{content.timeline?.eyebrow || "Our Journey"}</p>
          <h2 className="section-h2 light">{content.timeline?.titleMain || "Milestones That"}<br /><em>{content.timeline?.titleEm || "Define Us"}</em></h2>
          <p className="timeline-sub">{content.timeline?.subtitle || "Five years of passion, one plate at a time."}</p>
        </div>

        <div className="tl-track">
          {milestones.map((m, i) => (
            <div key={i} className="tl-card">
              <div className="tl-img-wrap">
                <img src={m.image} alt={m.title} />
                <div className="tl-year-badge">{m.year}</div>
              </div>
              <div className="tl-card-body">
                <h4 className="tl-title">{m.title}</h4>
                <p className="tl-body">{m.body}</p>
              </div>
              {i < milestones.length - 1 && <div className="tl-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* BENTO SECTION */}
      <section className="bento-section">
        <div className="bento-grid">
          <div className="bento-cell bento-large">
            <img src={bento.teamImage || FALLBACK_IMGS.team} alt="Our Team" />
            <div className="bento-label">
              <span className="bento-tag">{bento.teamTag || "The Team"}</span>
              <h3>{bento.teamTitle || "Passionate Professionals"}</h3>
              <p>{bento.teamBody || "50+ Chefs, planners & delivery crew."}</p>
            </div>
          </div>
          <div className="bento-cell bento-sm">
            <img src={bento.menuImage || FALLBACK_IMGS.food2} alt="Cuisine" />
            <div className="bento-label">
              <span className="bento-tag">{bento.menuTag || "Our Menu"}</span>
              <h3>{bento.menuTitle || "Pan-Ugandan Cuisine"}</h3>
            </div>
          </div>
          <div className="bento-cell bento-sm">
            <img src={bento.eventsImage || FALLBACK_IMGS.event} alt="Events" />
            <div className="bento-label">
              <span className="bento-tag">{bento.eventsTag || "Events"}</span>
              <h3>{bento.eventsTitle || "Any Scale, Any Occasion"}</h3>
            </div>
          </div>
          <div className="bento-quote">
            <div className="bq-mark">"</div>
            <p className="bq-text">{bento.quoteText || "Every meal we serve carries our name."}</p>
            <span className="bq-author">— {bento.quoteAuthor || "Founder, Mutindo Catering"}</span>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-bg" style={{ backgroundImage: `url(${cta.backgroundImage || FALLBACK_IMGS.chef2})` }} />
        <div className="cta-overlay" />
        <div className="cta-inner">
          <p className="section-eyebrow" style={{ color: '#c8a96e', textAlign: 'center' }}>{cta.eyebrow || "Our Promise"}</p>
          <h2 className="cta-h2">{cta.titleMain || "Your Event Deserves"}<br /><em>{cta.titleEm || "Nothing Less"}</em> {cta.titleEnd || "Than Perfect"}</h2>
          <p className="cta-sub">{cta.subtitle || "Join thousands of satisfied clients across Uganda."}</p>
          <div className="cta-badges">
            {(cta.badges || ["Quality Guaranteed", "Excellence Focused", "Customer First"]).map((badge, i) => (
              <span key={i}>✦ {badge}</span>
            ))}
          </div>
          <Link to={cta.ctaLink || "/contact"} className="cta-btn">{cta.ctaText || "Book a Consultation"}</Link>
        </div>
      </section>
    </>
  );
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Outfit:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --gold: #c8a96e;
  --gold-light: #e2cfa4;
  --cream: #f5f0e8;
  --dark: #0e0d0b;
  --dark2: #181714;
  --dark3: #221f1a;
  --text: #c8c3b8;
  --serif: 'Cormorant Garamond', Georgia, serif;
  --sans: 'Outfit', sans-serif;
}

.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: var(--dark);
}
.hero-bg {
  position: absolute; inset: 0;
  background-size: cover;
  background-position: center 30%;
  transform: scale(1.04);
  animation: heroKen 18s ease-in-out infinite alternate;
}
@keyframes heroKen {
  from { transform: scale(1.04) translateX(0); }
  to   { transform: scale(1.08) translateX(-2%); }
}
.hero-vignette {
  position: absolute; inset: 0;
  background: linear-gradient(105deg, rgba(14,13,11,0.93) 38%, rgba(14,13,11,0.5) 65%, rgba(14,13,11,0.3) 100%);
}
.hero-grain {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  opacity: 0.4;
  pointer-events: none;
}
.hero-inner {
  position: relative; z-index: 2;
  padding: 140px 7vw 100px;
  max-width: 700px;
}
.hero-eyebrow {
  display: flex; align-items: center; gap: 14px;
  font-family: var(--sans); font-size: 0.7rem; font-weight: 500;
  letter-spacing: 3px; text-transform: uppercase;
  color: var(--gold); margin-bottom: 28px;
}
.eyebrow-line {
  display: block; width: 36px; height: 1px;
  background: var(--gold); opacity: 0.6;
}
.hero-h1 {
  font-family: var(--serif);
  line-height: 1.0;
  color: var(--cream);
  margin-bottom: 24px;
}
.hero-h1-top {
  display: block;
  font-size: clamp(2.5rem, 5.5vw, 4.8rem);
  font-weight: 400;
  letter-spacing: -1px;
}
.hero-h1-em {
  display: block;
  font-size: clamp(3.5rem, 8vw, 7rem);
  font-weight: 700;
  font-style: italic;
  color: var(--gold);
  line-height: 1;
}
.hero-h1-bot {
  display: block;
  font-size: clamp(2rem, 4vw, 3.8rem);
  font-weight: 400;
  letter-spacing: -0.5px;
}
.hero-sub {
  font-family: var(--sans); font-size: 1rem; font-weight: 300;
  color: rgba(200,195,184,0.7); line-height: 1.8;
  margin-bottom: 32px;
}
.hero-pills {
  display: flex; gap: 10px; flex-wrap: wrap;
  margin-bottom: 40px;
}
.hero-pill {
  padding: 6px 16px;
  border: 1px solid rgba(200,169,110,0.3);
  border-radius: 100px;
  font-family: var(--sans); font-size: 0.72rem;
  color: var(--gold);
}
.hero-cta {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--gold); color: var(--dark);
  padding: 14px 32px; border-radius: 2px;
  font-family: var(--sans); font-size: 0.85rem; font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}
.hero-cta:hover {
  background: var(--gold-light);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(200,169,110,0.3);
  color: var(--dark);
}
.hero-float-stack {
  position: absolute;
  right: 6vw; top: 50%; transform: translateY(-50%);
  z-index: 3;
  display: grid;
  grid-template-columns: 200px 140px;
  grid-template-rows: auto auto;
  gap: 16px;
}
@media (max-width: 1024px) { .hero-float-stack { display: none; } }
.hero-float-img {
  object-fit: cover; display: block;
  border: 3px solid rgba(200,169,110,0.2);
  box-shadow: 0 24px 60px rgba(0,0,0,0.6);
}
.hfi-1 { width: 200px; height: 280px; grid-column: 1; grid-row: 1/3; border-radius: 4px; }
.hfi-2 { width: 140px; height: 130px; grid-column: 2; grid-row: 1; border-radius: 4px; margin-top: 40px; }
.hero-float-badge {
  grid-column: 2; grid-row: 2;
  background: var(--dark2);
  border: 1px solid rgba(200,169,110,0.3);
  padding: 16px; border-radius: 4px;
  display: flex; flex-direction: column; align-items: center;
}
.hfb-num {
  font-family: var(--serif); font-size: 2rem; font-weight: 700; color: var(--gold);
}
.hfb-txt {
  font-family: var(--sans); font-size: 0.65rem;
  color: var(--text); text-align: center; margin-top: 4px;
  text-transform: uppercase; letter-spacing: 0.5px;
}

.stats-bar {
  background: var(--dark2);
  border-top: 1px solid rgba(200,169,110,0.15);
  border-bottom: 1px solid rgba(200,169,110,0.15);
  padding: 0;
}
.stats-bar-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: stretch;
}
@media (max-width: 640px) {
  .stats-bar-inner { flex-wrap: wrap; }
}
.as-stat {
  flex: 1; padding: 44px 32px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.as-stat-num {
  font-family: var(--serif); font-size: 3rem; font-weight: 700;
  color: var(--gold); line-height: 1;
}
.as-stat-label {
  font-family: var(--sans); font-size: 0.7rem; font-weight: 500;
  letter-spacing: 2px; text-transform: uppercase;
  color: rgba(200,195,184,0.45);
}
.stats-divider {
  width: 1px; background: rgba(200,169,110,0.15);
  align-self: stretch;
}

.section-eyebrow {
  font-family: var(--sans); font-size: 0.68rem; font-weight: 500;
  letter-spacing: 3px; text-transform: uppercase; color: var(--gold);
  display: block; margin-bottom: 14px;
}
.section-h2 {
  font-family: var(--serif); font-size: clamp(2rem, 3.5vw, 3.4rem);
  font-weight: 600; color: var(--dark); line-height: 1.08;
}
.section-h2 em { color: #b06a2a; font-style: italic; font-weight: 700; }
.section-h2.light { color: var(--cream); }
.section-h2.light em { color: var(--gold); }

.reveal-left  { opacity: 0; transform: translateX(-40px); transition: opacity 0.75s ease, transform 0.75s ease; }
.reveal-right { opacity: 0; transform: translateX(40px);  transition: opacity 0.75s ease, transform 0.75s ease; }
.reveal-up    { opacity: 0; transform: translateY(36px);  transition: opacity 0.65s ease, transform 0.65s ease; }
.reveal-left.visible, .reveal-right.visible, .reveal-up.visible {
  opacity: 1; transform: translate(0);
}

.story-section {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 0; align-items: stretch;
  background: var(--cream); overflow: hidden;
}
@media (max-width: 860px) { .story-section { grid-template-columns: 1fr; } }
.story-imgs {
  position: relative;
  display: grid;
  grid-template-columns: 3fr 2fr;
  grid-template-rows: 1fr auto;
  gap: 4px; min-height: 600px;
  background: var(--dark3);
}
.story-img-main {
  grid-column: 1; grid-row: 1/3;
  position: relative; overflow: hidden;
}
.story-img-main img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; }
.story-img-caption {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 12px 16px;
  background: rgba(14,13,11,0.75);
  font-family: var(--sans); font-size: 0.72rem;
  color: var(--gold);
}
.story-img-accent {
  grid-column: 2; grid-row: 1;
  position: relative; overflow: hidden;
}
.story-img-accent img { width: 100%; height: 100%; object-fit: cover; }
.story-img-tag {
  position: absolute; bottom: 10px; right: 10px;
  font-family: var(--sans); font-size: 0.65rem; font-weight: 600;
  color: var(--gold); background: rgba(14,13,11,0.7);
  padding: 4px 10px;
}
.story-award-badge {
  grid-column: 2; grid-row: 2;
  display: flex; align-items: center; justify-content: center;
  background: var(--dark2); padding: 20px;
}
.story-text {
  padding: 80px 64px;
  display: flex; flex-direction: column; justify-content: center;
  background: var(--cream);
}
@media (max-width: 1024px) { .story-text { padding: 60px 40px; } }
.story-divider {
  width: 48px; height: 2px;
  background: var(--gold); margin: 20px 0 24px;
}
.story-body {
  font-family: var(--sans); font-size: 0.95rem; font-weight: 300;
  color: var(--dark2); line-height: 1.6; margin-bottom: 20px;
}
.story-checks {
  list-style: none; margin: 28px 0 32px;
}
.story-checks li {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--sans); font-size: 0.85rem;
  margin-bottom: 12px; color: var(--dark2);
}
.story-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--dark); color: var(--gold);
  padding: 12px 28px; text-decoration: none;
  font-family: var(--sans); font-size: 0.8rem; font-weight: 500;
  letter-spacing: 1px; width: fit-content;
  transition: all 0.3s ease;
}
.story-btn:hover {
  background: var(--gold); color: var(--dark);
}

.features-section {
  background: var(--cream);
  padding: 100px 7vw;
}
.features-head {
  text-align: center;
  margin-bottom: 64px;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
}
.feat-card {
  background: white;
  box-shadow: 0 8px 24px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}
.feat-card:hover {
  transform: translateY(-6px);
}
.feat-img-wrap {
  position: relative;
  height: 240px;
  overflow: hidden;
}
.feat-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.feat-card:hover .feat-img {
  transform: scale(1.05);
}
.feat-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
}
.feat-tag {
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--gold);
  color: var(--dark);
  padding: 4px 12px;
  font-family: var(--sans);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 1px;
}
.feat-body {
  padding: 28px;
}
.feat-title {
  font-family: var(--serif);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--dark);
}
.feat-text {
  font-family: var(--sans);
  font-size: 0.85rem;
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
}
.feat-line {
  width: 40px;
  height: 2px;
  background: var(--gold);
}

.timeline-section {
  background: var(--dark2);
  padding: 100px 7vw;
}
.timeline-head {
  text-align: center;
  margin-bottom: 64px;
}
.timeline-sub {
  font-family: var(--sans);
  font-size: 1rem;
  color: var(--text);
  margin-top: 16px;
}
.tl-track {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}
.tl-card {
  flex: 1;
  min-width: 200px;
  background: var(--dark3);
  border: 1px solid rgba(200,169,110,0.2);
  transition: all 0.3s ease;
}
.tl-card:hover {
  transform: translateY(-8px);
  border-color: var(--gold);
}
.tl-img-wrap {
  position: relative;
  height: 200px;
  overflow: hidden;
}
.tl-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tl-year-badge {
  position: absolute;
  bottom: -12px;
  left: 16px;
  background: var(--gold);
  color: var(--dark);
  font-family: var(--serif);
  font-weight: 700;
  font-size: 1.2rem;
  padding: 6px 14px;
}
.tl-card-body {
  padding: 28px 20px;
}
.tl-title {
  font-family: var(--serif);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--gold);
  margin-bottom: 12px;
}
.tl-body {
  font-family: var(--sans);
  font-size: 0.85rem;
  color: var(--text);
  line-height: 1.5;
}
.tl-arrow {
  display: flex;
  align-items: center;
  font-size: 2rem;
  color: var(--gold);
  opacity: 0.5;
}
@media (max-width: 768px) {
  .tl-arrow { display: none; }
}

.bento-section {
  background: var(--cream);
  padding: 100px 7vw;
}
.bento-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}
.bento-cell {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1;
}
.bento-cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.bento-cell:hover img {
  transform: scale(1.05);
}
.bento-large {
  grid-row: span 2;
  aspect-ratio: auto;
}
.bento-large img {
  height: 100%;
}
.bento-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
}
.bento-tag {
  display: inline-block;
  font-family: var(--sans);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--gold);
  margin-bottom: 8px;
}
.bento-label h3 {
  font-family: var(--serif);
  font-size: 1.2rem;
  margin-bottom: 6px;
}
.bento-label p {
  font-family: var(--sans);
  font-size: 0.8rem;
  opacity: 0.9;
}
.bento-quote {
  background: var(--dark);
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid rgba(200,169,110,0.2);
}
.bq-mark {
  font-family: var(--serif);
  font-size: 4rem;
  color: var(--gold);
  line-height: 1;
  margin-bottom: 16px;
}
.bq-text {
  font-family: var(--serif);
  font-size: 1.3rem;
  font-style: italic;
  color: var(--cream);
  margin-bottom: 16px;
  line-height: 1.4;
}
.bq-author {
  font-family: var(--sans);
  font-size: 0.8rem;
  color: var(--gold);
}
@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
  .bento-large {
    grid-row: auto;
  }
}

.cta-section {
  position: relative;
  padding: 120px 7vw;
  text-align: center;
  overflow: hidden;
}
.cta-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: brightness(0.3);
}
.cta-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6));
}
.cta-inner {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}
.cta-h2 {
  font-family: var(--serif);
  font-size: clamp(2rem, 4vw, 3.5rem);
  color: var(--cream);
  margin-bottom: 24px;
  line-height: 1.2;
}
.cta-h2 em {
  color: var(--gold);
  font-style: italic;
}
.cta-sub {
  font-family: var(--sans);
  font-size: 1.1rem;
  color: var(--text);
  margin-bottom: 32px;
}
.cta-badges {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}
.cta-badges span {
  font-family: var(--sans);
  font-size: 0.8rem;
  color: var(--gold);
  letter-spacing: 1px;
}
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--gold);
  color: var(--dark);
  padding: 16px 40px;
  text-decoration: none;
  font-family: var(--sans);
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}
.cta-btn:hover {
  background: var(--gold-light);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(200,169,110,0.4);
}
`;

export default About;