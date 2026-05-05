import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

/* ─── Pexels fallback images ────────────────────────────────────────────── */
const FALLBACK_PACKAGES = [
  {
    id: 1, name: 'Basic Package', price: 50000, guests: '10–20',
    description: 'Perfect for intimate gatherings and small celebrations.',
    includes: ['2 main dishes', '1 side dish', 'Soft drinks', 'Basic setup'],
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: 2, name: 'Standard Package', price: 120000, guests: '30–50',
    description: 'Ideal for birthday parties and family celebrations.',
    includes: ['3 main dishes', '2 side dishes', 'Dessert', 'Soft drinks', 'Full setup'],
    image: 'https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: 3, name: 'Premium Package', price: 250000, guests: '70–100',
    description: 'Complete catering experience for larger events.',
    includes: ['5 main dishes', '3 side dishes', 'Dessert bar', 'Full drinks', 'Staff service', 'Decorations'],
    image: 'https://images.pexels.com/photos/5638699/pexels-photo-5638699.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: 4, name: 'Wedding Special', price: 500000, guests: '150+',
    description: 'All-inclusive wedding catering — your perfect day, handled.',
    includes: ['7 main dishes', '5 side dishes', 'Wedding cake', 'Full bar', 'Wait staff', 'Decorations', 'Tents & chairs'],
    image: 'https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
];

const DEFAULT_HOW_IT_WORKS = [
  { n: '01', title: 'Choose Your Package', desc: 'Browse our tiers and select the one that fits your occasion, guest count and appetite.', img: 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { n: '02', title: 'Submit Your Request', desc: 'Complete a short booking form with your event details. We confirm within 24 hours.', img: 'https://images.pexels.com/photos/4551832/pexels-photo-4551832.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { n: '03', title: 'We Handle Everything', desc: 'Our team arrives early, prepares everything fresh on-site, and delivers a seamless experience.', img: 'https://images.pexels.com/photos/2290070/pexels-photo-2290070.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

const HERO_BG = 'https://images.pexels.com/photos/2290070/pexels-photo-2290070.jpeg?auto=compress&cs=tinysrgb&w=1600';
const CUSTOM_BG = 'https://images.pexels.com/photos/1581554/pexels-photo-1581554.jpeg?auto=compress&cs=tinysrgb&w=1200';

const PACKAGE_META = [
  { tier: 'I',   accent: '#C9A96E', label: 'Intimate'  },
  { tier: 'II',  accent: '#FF6B35', label: 'Signature' },
  { tier: 'III', accent: '#C9A96E', label: 'Grand'     },
  { tier: 'IV',  accent: '#f0ece4', label: 'Prestige'  },
];

const EVENT_TYPES = [
  { value: 'birthday',   label: 'Birthday',   icon: '🎂' },
  { value: 'wedding',    label: 'Wedding',     icon: '💍' },
  { value: 'corporate',  label: 'Corporate',   icon: '🏢' },
  { value: 'graduation', label: 'Graduation',  icon: '🎓' },
  { value: 'other',      label: 'Other',       icon: '✨' },
];

const CheckIcon = ({ color = '#C9A96E' }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" style={{ flexShrink: 0 }}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const Catering = () => {
  const [content, setContent] = useState(null);
  const [packages, setPackages] = useState([]);
  const [howItWorks, setHowItWorks] = useState(DEFAULT_HOW_IT_WORKS);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState({});
  const [formData, setFormData] = useState({
    eventType: '', eventDate: '', eventTime: '',
    guestCount: '', budget: '', specialRequests: '', phone: '', email: '',
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/content/catering');
        if (response.ok) {
          const data = await response.json();
          if (data && Object.keys(data).length > 0) {
            setContent(data);
            
            // Load packages from CMS
            if (data.packages && data.packages.length > 0) {
              setPackages(data.packages);
            } else {
              setPackages(FALLBACK_PACKAGES);
            }
            
            // Load How It Works from CMS
            if (data.howItWorks && data.howItWorks.length > 0) {
              setHowItWorks(data.howItWorks);
            } else {
              setHowItWorks(DEFAULT_HOW_IT_WORKS);
            }
            return;
          }
        }
        // Fallback to default
        setContent({
          hero: { title: 'Catering Services', subtitle: 'Make your event unforgettable with our premium catering', image: HERO_BG },
          sectionTitle: 'Catering Packages',
          ctaText: 'Book Your Event Today',
          bannerEyebrow: 'Bespoke Service',
          bannerTitle: 'Need something beyond the menu?',
          bannerBody: 'Tell us your vision. We\'ll craft a package around your exact event, guest count, cultural preferences, and budget.',
          bannerButtonText: 'Request a Custom Quote',
          customBannerImage: CUSTOM_BG,
          howItWorksEyebrow: 'The Experience',
          howItWorksTitle: 'How It Works',
          packages: FALLBACK_PACKAGES,
          howItWorks: DEFAULT_HOW_IT_WORKS
        });
        setPackages(FALLBACK_PACKAGES);
        setHowItWorks(DEFAULT_HOW_IT_WORKS);
      } catch (err) {
        console.error('Error loading content:', err);
        setPackages(FALLBACK_PACKAGES);
        setHowItWorks(DEFAULT_HOW_IT_WORKS);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.dataset.reveal]: true }));
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [packages]);

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  const handleChange = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleBook = pkg => {
    setSelectedPkg(pkg);
    setSubmitted(false);
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/catering/bookings', {
        ...formData,
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        packagePrice: selectedPkg.price,
      });
      setSubmitted(true);
      toast.success("Booking request sent! We'll contact you within 24 hours.");
    } catch {
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (submitted) setFormData({ eventType:'', eventDate:'', eventTime:'', guestCount:'', budget:'', specialRequests:'', phone:'', email:'' });
  };

  const hero = content?.hero || { title: 'Catering Services', subtitle: 'Make your event unforgettable', image: HERO_BG };
  const pkgMeta = idx => PACKAGE_META[idx % PACKAGE_META.length];
  
  // Get hero background image from CMS or fallback
  const heroBgImage = hero.image || HERO_BG;
  const customBannerImage = content?.customBannerImage || CUSTOM_BG;
  
  // Get How It Works data from state
  const howItWorksSteps = howItWorks.length > 0 ? howItWorks : DEFAULT_HOW_IT_WORKS;
  const howItWorksEyebrow = content?.howItWorksEyebrow || 'The Experience';
  const howItWorksTitle = content?.howItWorksTitle || 'How It Works';

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0a0a08', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:40, height:40, border:'2px solid rgba(201,169,110,0.15)', borderTopColor:'#C9A96E', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ background:'#0a0a08', minHeight:'100vh' }}>
      {/* HERO SECTION */}
      <div style={{ position:'relative', height:'100vh', minHeight:640, display:'flex', alignItems:'center', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`url(${heroBgImage})`, backgroundSize:'cover', backgroundPosition:'center', transform:'scale(1.06)', transition:'transform 10s ease' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(105deg, rgba(10,10,8,0.92) 0%, rgba(10,10,8,0.65) 55%, rgba(10,10,8,0.3) 100%)' }} />
        <div style={{ position:'relative', zIndex:2, width:'100%', maxWidth:1280, margin:'0 auto', padding:'0 7vw', display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:40, flexWrap:'wrap' }}>
          <div style={{ maxWidth:600 }}>
            <p style={{ fontFamily:'Jost, sans-serif', fontSize:11, fontWeight:500, letterSpacing:3.5, textTransform:'uppercase', color:'#C9A96E', marginBottom:18 }}>Outside Catering · Uganda</p>
            <h1 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'clamp(3rem, 6.5vw, 5.5rem)', fontWeight:700, color:'#f0ece4', lineHeight:1.02, marginBottom:22 }}>We bring the<br /><em style={{ color:'#C9A96E', fontStyle:'italic' }}>feast to you.</em></h1>
            <p style={{ fontFamily:'Jost, sans-serif', fontSize:'0.98rem', fontWeight:300, color:'rgba(240,236,228,0.45)', lineHeight:1.82, maxWidth:480, marginBottom:36 }}>{hero.subtitle}</p>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
              <a href="#packages" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#C9A96E', color:'#0a0a08', textDecoration:'none', padding:'13px 28px', fontFamily:'Jost, sans-serif', fontSize:'0.85rem', fontWeight:500, borderRadius:2 }}>View Packages <ArrowIcon /></a>
              <Link to="/contact" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'transparent', border:'1px solid rgba(240,236,228,0.3)', padding:'13px 24px', fontFamily:'Jost, sans-serif', fontSize:'0.85rem', fontWeight:400, color:'rgba(240,236,228,0.7)', textDecoration:'none', borderRadius:2 }}>Custom Quote</Link>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:24, borderLeft:'1px solid rgba(201,169,110,0.18)', paddingLeft:36 }}>
            {[
              { num: '500+', label: 'Events Catered' },
              { num: '98%',  label: 'Satisfaction Rate' },
              { num: '24h',  label: 'Response Time' },
            ].map((s, i) => (
              <div key={i}>
                <span style={{ display:'block', fontFamily:'Cormorant Garamond, serif', fontSize:'2.4rem', fontWeight:700, color:'#C9A96E' }}>{s.num}</span>
                <span style={{ display:'block', fontFamily:'Jost, sans-serif', fontSize:'0.68rem', letterSpacing:2, textTransform:'uppercase', color:'rgba(240,236,228,0.35)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INTRO STRIP */}
      <div style={{ background:'#111110', borderTop:'1px solid rgba(201,169,110,0.12)', borderBottom:'1px solid rgba(201,169,110,0.12)', padding:'16px 7vw', display:'flex', flexWrap:'wrap' }}>
        {['Authentic Ugandan Cuisine', 'Fresh Ingredients Daily', 'Professional Staff', 'Any Location'].map((t, i) => (
          <span key={i} style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'Jost, sans-serif', fontSize:'0.75rem', letterSpacing:2, textTransform:'uppercase', color:'rgba(240,236,228,0.35)', padding:'0 28px', borderRight:'1px solid rgba(201,169,110,0.1)' }}>
            <span style={{ width:4, height:4, borderRadius:'50%', background:'#C9A96E' }} />
            {t}
          </span>
        ))}
      </div>

      {/* PACKAGES SECTION */}
      <section id="packages" style={{ maxWidth:1280, margin:'0 auto', padding:'88px 7vw 100px' }}>
        <div style={{ textAlign:'center', marginBottom:64 }}>
          <p style={{ fontFamily:'Jost, sans-serif', fontSize:11, fontWeight:500, letterSpacing:3.5, textTransform:'uppercase', color:'#C9A96E', marginBottom:18 }}>Our Offerings</p>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'clamp(2rem,3.8vw,3.5rem)', fontWeight:700, color:'#f0ece4', marginBottom:20 }}>{content?.sectionTitle || "Catering Packages"}</h2>
          <div style={{ width:56, height:2, background:'#C9A96E', margin:'0 auto 20px' }} />
          <p style={{ fontFamily:'Jost, sans-serif', fontSize:'0.95rem', fontWeight:300, color:'rgba(240,236,228,0.45)', lineHeight:1.78, maxWidth:480, margin:'0 auto' }}>Transparent pricing, zero hidden fees.<br />Every package celebrates authentic Ugandan flavour.</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:2, marginBottom:56 }}>
          {packages.map((pkg, idx) => {
            const meta = PACKAGE_META[idx % PACKAGE_META.length];
            const img = pkg.image || (FALLBACK_PACKAGES[idx % FALLBACK_PACKAGES.length]?.image) || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600';
            return (
              <div key={pkg.id || idx} style={{ background:'#111110', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', transition:'box-shadow 0.3s, transform 0.3s' }} onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 28px 60px rgba(0,0,0,0.7)'; e.currentTarget.style.transform = 'translateY(-7px)'; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ position:'relative', height:210, overflow:'hidden' }}>
                  <img src={img} alt={pkg.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(17,17,16,0.85) 0%, transparent 60%)' }} />
                  <div style={{ position:'absolute', bottom:14, right:16, fontFamily:'Cormorant Garamond, serif', fontSize:'1.8rem', fontWeight:700, border:`1px solid ${meta.accent}`, width:44, height:44, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(10,10,8,0.6)', backdropFilter:'blur(4px)', color:meta.accent }}>{meta.tier}</div>
                </div>
                <div style={{ padding:'28px 26px 30px', display:'flex', flexDirection:'column', flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <span style={{ fontFamily:'Jost, sans-serif', fontSize:10, fontWeight:500, letterSpacing:2.5, textTransform:'uppercase', color:meta.accent }}>{meta.label}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:5, fontFamily:'Jost, sans-serif', fontSize:'0.72rem', fontWeight:300, color:'rgba(240,236,228,0.35)' }}>👥 {pkg.guests} guests</span>
                  </div>
                  <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.55rem', fontWeight:700, color:'#f0ece4', marginBottom:10 }}>{pkg.name}</h3>
                  <p style={{ fontFamily:'Jost, sans-serif', fontSize:'0.83rem', fontWeight:300, color:'rgba(240,236,228,0.45)', lineHeight:1.65, marginBottom:18 }}>{pkg.description}</p>
                  <span style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.6rem', fontWeight:700, color:meta.accent }}>UGX {pkg.price?.toLocaleString()}</span>
                  <div style={{ height:1, background:meta.accent, opacity:0.25, margin:'18px 0' }} />
                  <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:9, marginBottom:26, flex:1 }}>
                    {pkg.includes && pkg.includes.map((item, itemIdx) => (
                      <li key={itemIdx} style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'Jost, sans-serif', fontSize:'0.82rem', fontWeight:300, color:'rgba(240,236,228,0.6)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={meta.accent} strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleBook(pkg)} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:13, background:`${meta.accent}10`, border:`1px solid ${meta.accent}40`, color:meta.accent, fontFamily:'Jost, sans-serif', fontSize:'0.84rem', fontWeight:500, borderRadius:2, cursor:'pointer', transition:'all 0.25s', marginTop:'auto' }} onMouseEnter={e => { e.currentTarget.style.background = meta.accent; e.currentTarget.style.color = '#0a0a08'; }} onMouseLeave={e => { e.currentTarget.style.background = `${meta.accent}10`; e.currentTarget.style.color = meta.accent; }}>Reserve This Package <ArrowIcon /></button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CUSTOM BANNER */}
        <div style={{ position:'relative', overflow:'hidden', minHeight:280, display:'flex', alignItems:'center', marginBottom:80 }}>
          <img src={customBannerImage} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(105deg, rgba(10,10,8,0.92) 0%, rgba(10,10,8,0.6) 100%)' }} />
          <div style={{ position:'relative', zIndex:2, display:'flex', alignItems:'center', justifyContent:'space-between', gap:32, flexWrap:'wrap', width:'100%', padding:'52px 48px' }}>
            <div>
              <p style={{ fontFamily:'Jost, sans-serif', fontSize:11, fontWeight:500, letterSpacing:3.5, textTransform:'uppercase', color:'#C9A96E', marginBottom:18 }}>{content?.bannerEyebrow || 'Bespoke Service'}</p>
              <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'clamp(1.6rem,2.8vw,2.4rem)', fontWeight:700, color:'#f0ece4', marginBottom:12 }}>{content?.bannerTitle || 'Need something beyond the menu?'}</h3>
              <p style={{ fontFamily:'Jost, sans-serif', fontSize:'0.9rem', fontWeight:300, color:'rgba(240,236,228,0.45)', lineHeight:1.72, maxWidth:460 }}>{content?.bannerBody || 'Tell us your vision. We\'ll craft a package around your exact event, guest count, cultural preferences, and budget.'}</p>
            </div>
            <Link to="/contact" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#C9A96E', color:'#0a0a08', textDecoration:'none', padding:'16px 36px', fontFamily:'Jost, sans-serif', fontSize:'0.9rem', fontWeight:500, borderRadius:2 }}>{content?.bannerButtonText || 'Request a Custom Quote'} <ArrowIcon /></Link>
          </div>
        </div>

        {/* HOW IT WORKS SECTION - FIXED DUPLICATE KEY ERROR */}
        <div>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <p style={{ fontFamily:'Jost, sans-serif', fontSize:11, fontWeight:500, letterSpacing:3.5, textTransform:'uppercase', color:'#C9A96E', marginBottom:18 }}>{howItWorksEyebrow}</p>
            <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'clamp(2rem,3.8vw,3.5rem)', fontWeight:700, color:'#f0ece4', marginBottom:20 }}>{howItWorksTitle}</h2>
            <div style={{ width:56, height:2, background:'#C9A96E', margin:'0 auto' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:2 }}>
            {/* FIXED: Changed key from {i} to {`step-${i}-${step.n}`} to prevent duplicate keys */}
            {howItWorksSteps.map((step, i) => (
              <div key={`step-${i}-${step.n}`} style={{ background:'#111110' }}>
                <div style={{ position:'relative', height:190, overflow:'hidden' }}>
                  <img 
                    src={step.img} 
                    alt={step.title} 
                    style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s' }} 
                    onError={(e) => { e.target.src = 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400'; }}
                  />
                  <div style={{ position:'absolute', bottom:14, left:18, fontFamily:'Cormorant Garamond, serif', fontSize:'2.6rem', fontWeight:700, color:'#C9A96E', textShadow:'0 2px 12px rgba(0,0,0,0.8)' }}>{step.n}</div>
                </div>
                <h4 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.25rem', fontWeight:700, color:'#f0ece4', margin:'24px 24px 10px' }}>{step.title}</h4>
                <p style={{ fontFamily:'Jost, sans-serif', fontSize:'0.83rem', fontWeight:300, color:'rgba(240,236,228,0.45)', lineHeight:1.72, padding:'0 24px 28px' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.88)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={{ background:'#111110', width:'100%', maxWidth:620, maxHeight:'92vh', overflowY:'auto', border:'1px solid rgba(201,169,110,0.18)' }}>
            {selectedPkg && (
              <div style={{ position:'relative', height:180, overflow:'hidden' }}>
                <img src={selectedPkg.image || (FALLBACK_PACKAGES[packages.indexOf(selectedPkg) % FALLBACK_PACKAGES.length]?.image) || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600'} alt={selectedPkg.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(17,17,16,0.95) 0%, rgba(17,17,16,0.45) 100%)' }} />
                <div style={{ position:'absolute', bottom:20, left:28 }}>
                  <p style={{ fontFamily:'Jost, sans-serif', fontSize:11, fontWeight:500, letterSpacing:3.5, textTransform:'uppercase', color:'#C9A96E' }}>{PACKAGE_META[packages.indexOf(selectedPkg) % PACKAGE_META.length]?.label || 'Package'}</p>
                  <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.5rem', fontWeight:700, color:'#f0ece4', marginBottom:4 }}>{selectedPkg.name}</h3>
                  <span style={{ fontFamily:'Jost, sans-serif', fontSize:'0.78rem', fontWeight:300, color:'rgba(240,236,228,0.5)' }}>UGX {selectedPkg.price?.toLocaleString()} · {selectedPkg.guests} guests</span>
                </div>
                <button onClick={closeModal} style={{ position:'absolute', top:14, right:14, width:36, height:36, background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(240,236,228,0.7)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', borderRadius:2 }}>✕</button>
              </div>
            )}
            <div style={{ padding:'28px 28px 32px' }}>
              {submitted ? (
                <div style={{ textAlign:'center', padding:'16px 0 8px' }}>
                  <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(201,169,110,0.08)', border:'1px solid rgba(201,169,110,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                  <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'2rem', fontWeight:700, color:'#f0ece4', marginBottom:14 }}>Reservation Received</h3>
                  <p style={{ fontFamily:'Jost, sans-serif', fontSize:'0.9rem', fontWeight:300, color:'rgba(240,236,228,0.45)', lineHeight:1.78, maxWidth:380, margin:'0 auto' }}>Your booking for <em style={{ color:'#C9A96E' }}>{selectedPkg?.name}</em> has been submitted. Our team will reach out within 24 hours to confirm every detail.</p>
                  <button onClick={closeModal} style={{ marginTop:28, display:'inline-flex', alignItems:'center', gap:8, background:'#C9A96E', color:'#0a0a08', border:'none', padding:'13px 28px', fontFamily:'Jost, sans-serif', fontSize:'0.85rem', fontWeight:500, borderRadius:2, cursor:'pointer' }}>Close</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h4 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'1.2rem', fontWeight:600, color:'#f0ece4', marginBottom:22, paddingBottom:14, borderBottom:'1px solid rgba(201,169,110,0.12)' }}>Event Details</h4>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', fontFamily:'Jost, sans-serif', fontSize:10, fontWeight:500, letterSpacing:1.8, textTransform:'uppercase', color:'rgba(240,236,228,0.38)', marginBottom:7 }}>Event Type *</label>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {EVENT_TYPES.map(et => (
                        <button key={et.value} type="button" onClick={() => setFormData(f => ({ ...f, eventType: et.value }))} style={{ padding:'8px 15px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', color:'rgba(240,236,228,0.45)', fontFamily:'Jost, sans-serif', fontSize:'0.8rem', borderRadius:2, cursor:'pointer', ...(formData.eventType === et.value && { background:'rgba(201,169,110,0.1)', borderColor:'rgba(201,169,110,0.45)', color:'#C9A96E' }) }}>{et.icon} {et.label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:18 }}>
                    <div><label style={{ display:'block', fontFamily:'Jost, sans-serif', fontSize:10, fontWeight:500, letterSpacing:1.8, textTransform:'uppercase', color:'rgba(240,236,228,0.38)', marginBottom:7 }}>Event Date *</label><input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:2, padding:'11px 14px', fontFamily:'Jost, sans-serif', fontSize:'0.85rem', color:'#f0ece4', outline:'none' }} /></div>
                    <div><label style={{ display:'block', fontFamily:'Jost, sans-serif', fontSize:10, fontWeight:500, letterSpacing:1.8, textTransform:'uppercase', color:'rgba(240,236,228,0.38)', marginBottom:7 }}>Event Time *</label><input type="time" name="eventTime" value={formData.eventTime} onChange={handleChange} required style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:2, padding:'11px 14px', fontFamily:'Jost, sans-serif', fontSize:'0.85rem', color:'#f0ece4', outline:'none' }} /></div>
                    <div><label style={{ display:'block', fontFamily:'Jost, sans-serif', fontSize:10, fontWeight:500, letterSpacing:1.8, textTransform:'uppercase', color:'rgba(240,236,228,0.38)', marginBottom:7 }}>Number of Guests *</label><input type="number" name="guestCount" placeholder="e.g. 50" value={formData.guestCount} onChange={handleChange} required min="1" style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:2, padding:'11px 14px', fontFamily:'Jost, sans-serif', fontSize:'0.85rem', color:'#f0ece4', outline:'none' }} /></div>
                    <div><label style={{ display:'block', fontFamily:'Jost, sans-serif', fontSize:10, fontWeight:500, letterSpacing:1.8, textTransform:'uppercase', color:'rgba(240,236,228,0.38)', marginBottom:7 }}>Your Budget (UGX)</label><input type="number" name="budget" placeholder="Optional" value={formData.budget} onChange={handleChange} style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:2, padding:'11px 14px', fontFamily:'Jost, sans-serif', fontSize:'0.85rem', color:'#f0ece4', outline:'none' }} /></div>
                    <div><label style={{ display:'block', fontFamily:'Jost, sans-serif', fontSize:10, fontWeight:500, letterSpacing:1.8, textTransform:'uppercase', color:'rgba(240,236,228,0.38)', marginBottom:7 }}>Phone Number *</label><input type="tel" name="phone" placeholder="+256 7XX XXX XXX" value={formData.phone} onChange={handleChange} required style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:2, padding:'11px 14px', fontFamily:'Jost, sans-serif', fontSize:'0.85rem', color:'#f0ece4', outline:'none' }} /></div>
                    <div><label style={{ display:'block', fontFamily:'Jost, sans-serif', fontSize:10, fontWeight:500, letterSpacing:1.8, textTransform:'uppercase', color:'rgba(240,236,228,0.38)', marginBottom:7 }}>Email Address *</label><input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:2, padding:'11px 14px', fontFamily:'Jost, sans-serif', fontSize:'0.85rem', color:'#f0ece4', outline:'none' }} /></div>
                    <div style={{ gridColumn:'span 2' }}><label style={{ display:'block', fontFamily:'Jost, sans-serif', fontSize:10, fontWeight:500, letterSpacing:1.8, textTransform:'uppercase', color:'rgba(240,236,228,0.38)', marginBottom:7 }}>Special Requests</label><textarea name="specialRequests" rows={3} placeholder="Dietary restrictions, cultural preferences, décor themes…" value={formData.specialRequests} onChange={handleChange} style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:2, padding:'11px 14px', fontFamily:'Jost, sans-serif', fontSize:'0.85rem', color:'#f0ece4', outline:'none', resize:'vertical' }} /></div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:28, paddingTop:22, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    <button type="button" onClick={closeModal} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', padding:'12px 22px', fontFamily:'Jost, sans-serif', fontSize:'0.85rem', fontWeight:300, color:'rgba(240,236,228,0.45)', cursor:'pointer', borderRadius:2 }}>Cancel</button>
                    <button type="submit" disabled={submitting || !formData.eventType} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#C9A96E', color:'#0a0a08', border:'none', padding:'12px 22px', fontFamily:'Jost, sans-serif', fontSize:'0.85rem', fontWeight:500, cursor:'pointer', borderRadius:2, opacity: (submitting || !formData.eventType) ? 0.5 : 1 }}>{submitting ? 'Submitting...' : 'Confirm Reservation'} <ArrowIcon /></button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catering;