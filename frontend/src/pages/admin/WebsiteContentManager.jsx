import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Form, Tabs, Tab,
  Spinner, Alert, Modal, Image, Badge
} from 'react-bootstrap';
import { 
  FaSave, FaUndo, FaImage, FaUpload, FaTrash, FaPlus, 
  FaHome, FaInfoCircle, FaImages, FaConciergeBell, 
  FaStar, FaTruck, FaLeaf, FaFire, FaCalendarAlt, FaUtensils,
  FaArrowRight, FaEdit, FaCheck, FaEye, FaHeart, FaShare,
  FaGripVertical, FaEyeSlash
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

const PAGES = [
  { id: 'home', name: 'Home', icon: <FaHome /> },
  { id: 'about', name: 'About', icon: <FaInfoCircle /> },
  { id: 'gallery', name: 'Gallery', icon: <FaImages /> },
  { id: 'catering', name: 'Catering', icon: <FaConciergeBell /> }
];

// ================= HOME VISUAL EDITOR =================
const HomeVisualEditor = ({ content, updateField, openImagePicker }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = content.hero?.slides || [];
  const slide = slides[currentSlide] || {};
  const stats = content.stats || [];
  const features = content.features?.items || [];
  const menuItems = content.menuPreview?.items || [];
  const testimonials = content.testimonials?.items || [];
  const footerLinks = content.footer?.links || [];
  const cta = content.cta || {};

  return (
    <div style={{ background: '#0d0d0d', color: '#f0ece4', fontFamily: "'DM Sans', sans-serif", padding: '30px' }}>
      <style>{`
        .cms-section { margin-bottom: 40px; border: 1px solid #333; border-radius: 12px; overflow: hidden; }
        .cms-section-header { background: #1a1a1a; padding: 15px 20px; border-bottom: 1px solid #333; font-weight: bold; color: #FF6B35; }
        .cms-section-body { padding: 20px; background: #141414; }
        .cms-input { background: #0d0d0d !important; border: 1px solid #333 !important; color: #f0ece4 !important; border-radius: 8px; padding: 10px 14px; width: 100%; }
        .cms-input:focus { border-color: #FF6B35 !important; outline: none; }
        .cms-textarea { background: #0d0d0d !important; border: 1px solid #333 !important; color: #f0ece4 !important; border-radius: 8px; padding: 10px 14px; width: 100%; min-height: 80px; }
        .cms-label { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(240,236,228,0.5); margin-bottom: 8px; display: block; }
        .cms-preview-img { width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; }
        .slide-preview { background: #1a1a1a; border-radius: 12px; padding: 10px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; }
        .slide-preview.active { border-color: #FF6B35; background: #222; }
        .slide-preview img { width: 100%; height: 80px; object-fit: cover; border-radius: 8px; }
        .feature-item { background: #1a1a1a; border-radius: 12px; padding: 15px; margin-bottom: 15px; }
      `}</style>

      {/* Hero Slides */}
      <div className="cms-section">
        <div className="cms-section-header">🎬 Hero Slideshow</div>
        <div className="cms-section-body">
          <div className="row mb-4">
            <div className="col-md-6"><label className="cms-label">Primary Button Text</label><input className="cms-input" value={content.hero?.primaryButtonText || 'Order Now'} onChange={e => updateField('hero.primaryButtonText', e.target.value)} /></div>
            <div className="col-md-6"><label className="cms-label">Primary Button Link</label><input className="cms-input" value={content.hero?.primaryButtonLink || '/menu'} onChange={e => updateField('hero.primaryButtonLink', e.target.value)} /></div>
            <div className="col-md-6 mt-2"><label className="cms-label">Secondary Button Text</label><input className="cms-input" value={content.hero?.secondaryButtonText || 'Catering Services'} onChange={e => updateField('hero.secondaryButtonText', e.target.value)} /></div>
            <div className="col-md-6 mt-2"><label className="cms-label">Secondary Button Link</label><input className="cms-input" value={content.hero?.secondaryButtonLink || '/catering'} onChange={e => updateField('hero.secondaryButtonLink', e.target.value)} /></div>
          </div>
          
          <div className="row">
            <div className="col-md-4">
              {(slides || []).map((s, idx) => (
                <div key={idx} className={`slide-preview ${currentSlide === idx ? 'active' : ''}`} onClick={() => setCurrentSlide(idx)}>
                  {s.image && <img src={s.image} alt={s.title} />}
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>{s.title || `Slide ${idx + 1}`}</div>
                  <Button size="sm" variant="outline-danger" className="mt-2 w-100" onClick={(e) => { e.stopPropagation(); updateField('hero.slides', slides.filter((_, i) => i !== idx)); setCurrentSlide(0); }}>Remove</Button>
                </div>
              ))}
              <Button variant="outline-light" size="sm" className="w-100" onClick={() => updateField('hero.slides', [...slides, { id: Date.now(), title: 'New Slide', subtitle: '', desc: '', tag: '', accent: '#FF6B35', image: '' }])}><FaPlus /> Add Slide</Button>
            </div>
            <div className="col-md-8">
              {slide && (<>
                {slide.image && <img src={slide.image} className="cms-preview-img" alt="preview" />}
                <Button size="sm" variant="warning" className="mb-2" onClick={() => openImagePicker(`hero.slides.${currentSlide}.image`)}><FaImage /> {slide.image ? 'Change Image' : 'Upload Image'}</Button>
                <label className="cms-label mt-2">Tag</label><input className="cms-input" value={slide.tag || ''} onChange={e => { const ns = [...slides]; ns[currentSlide] = { ...ns[currentSlide], tag: e.target.value }; updateField('hero.slides', ns); }} />
                <label className="cms-label mt-2">Title</label><input className="cms-input" value={slide.title || ''} onChange={e => { const ns = [...slides]; ns[currentSlide] = { ...ns[currentSlide], title: e.target.value }; updateField('hero.slides', ns); }} />
                <label className="cms-label mt-2">Subtitle</label><input className="cms-input" value={slide.subtitle || ''} onChange={e => { const ns = [...slides]; ns[currentSlide] = { ...ns[currentSlide], subtitle: e.target.value }; updateField('hero.slides', ns); }} />
                <label className="cms-label mt-2">Description</label><textarea className="cms-textarea" rows={2} value={slide.desc || ''} onChange={e => { const ns = [...slides]; ns[currentSlide] = { ...ns[currentSlide], desc: e.target.value }; updateField('hero.slides', ns); }} />
                <label className="cms-label mt-2">Accent Color</label><input type="color" className="form-control w-25" value={slide.accent || '#FF6B35'} onChange={e => { const ns = [...slides]; ns[currentSlide] = { ...ns[currentSlide], accent: e.target.value }; updateField('hero.slides', ns); }} />
              </>)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="cms-section">
        <div className="cms-section-header">📊 Stats Bar</div>
        <div className="cms-section-body">
          <div className="row">
            {(stats || []).map((stat, idx) => (
              <div key={idx} className="col-md-3 mb-3">
                <div className="feature-item">
                  <input className="cms-input mb-2" placeholder="Number" value={stat.num || ''} onChange={e => { const ns = [...stats]; ns[idx].num = e.target.value; updateField('stats', ns); }} />
                  <input className="cms-input" placeholder="Label" value={stat.label || ''} onChange={e => { const ns = [...stats]; ns[idx].label = e.target.value; updateField('stats', ns); }} />
                  <Button size="sm" variant="outline-danger" className="mt-2 w-100" onClick={() => updateField('stats', stats.filter((_, i) => i !== idx))}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline-light" size="sm" onClick={() => updateField('stats', [...stats, { num: '0', label: 'New Stat' }])}><FaPlus /> Add Stat</Button>
        </div>
      </div>

      {/* Features */}
      <div className="cms-section">
        <div className="cms-section-header">✨ Features Section</div>
        <div className="cms-section-body">
          <label className="cms-label">Section Label</label><input className="cms-input mb-3" value={content.features?.sectionLabel || 'Why Choose Us'} onChange={e => updateField('features.sectionLabel', e.target.value)} />
          <label className="cms-label">Section Title</label><input className="cms-input mb-4" value={content.features?.sectionTitle || 'Food that feels like home'} onChange={e => updateField('features.sectionTitle', e.target.value)} />
          {(features || []).map((feature, idx) => (
            <div key={idx} className="feature-item">
              <div className="row">
                <div className="col-md-3"><label className="cms-label">Icon (leaf/fire/truck/calendar/star/utensils)</label><input className="cms-input" value={feature.icon || 'leaf'} onChange={e => { const nf = [...features]; nf[idx].icon = e.target.value; updateField('features.items', nf); }} /></div>
                <div className="col-md-5"><label className="cms-label">Title</label><input className="cms-input" value={feature.title || ''} onChange={e => { const nf = [...features]; nf[idx].title = e.target.value; updateField('features.items', nf); }} /></div>
                <div className="col-md-4"><label className="cms-label">Color</label><input type="color" className="form-control w-100" value={feature.color || '#FF6B35'} onChange={e => { const nf = [...features]; nf[idx].color = e.target.value; updateField('features.items', nf); }} /></div>
                <div className="col-md-12 mt-2"><label className="cms-label">Description</label><input className="cms-input" value={feature.desc || ''} onChange={e => { const nf = [...features]; nf[idx].desc = e.target.value; updateField('features.items', nf); }} /></div>
              </div>
              <Button size="sm" variant="outline-danger" className="mt-2" onClick={() => updateField('features.items', features.filter((_, i) => i !== idx))}>Remove</Button>
            </div>
          ))}
          <Button variant="outline-light" size="sm" onClick={() => updateField('features.items', [...features, { icon: 'leaf', title: 'New Feature', desc: '', color: '#FF6B35' }])}><FaPlus /> Add Feature</Button>
        </div>
      </div>

      {/* Menu Preview */}
      <div className="cms-section">
        <div className="cms-section-header">🍽️ Menu Preview</div>
        <div className="cms-section-body">
          <label className="cms-label">Section Label</label><input className="cms-input mb-3" value={content.menuPreview?.sectionLabel || 'What We Serve'} onChange={e => updateField('menuPreview.sectionLabel', e.target.value)} />
          <label className="cms-label">Section Title</label><input className="cms-input mb-3" value={content.menuPreview?.sectionTitle || 'Signature Dishes'} onChange={e => updateField('menuPreview.sectionTitle', e.target.value)} />
          <label className="cms-label">View All Link</label><input className="cms-input mb-4" value={content.menuPreview?.viewAllLink || '/menu'} onChange={e => updateField('menuPreview.viewAllLink', e.target.value)} />
          {(menuItems || []).map((item, idx) => (
            <div key={idx} className="feature-item">
              <div className="row">
                <div className="col-md-3">
                  {item.image && <img src={item.image} className="cms-preview-img" style={{ height: '100px' }} alt="preview" />}
                  <Button size="sm" variant="warning" className="w-100" onClick={() => openImagePicker(`menuPreview.items.${idx}.image`)}><FaImage /> {item.image ? 'Change' : 'Upload'}</Button>
                </div>
                <div className="col-md-9">
                  <div className="row">
                    <div className="col-md-6"><label className="cms-label">Name</label><input className="cms-input" value={item.name || ''} onChange={e => { const ni = [...menuItems]; ni[idx].name = e.target.value; updateField('menuPreview.items', ni); }} /></div>
                    <div className="col-md-6"><label className="cms-label">Tag</label><input className="cms-input" value={item.tag || ''} onChange={e => { const ni = [...menuItems]; ni[idx].tag = e.target.value; updateField('menuPreview.items', ni); }} /></div>
                    <div className="col-md-12 mt-2"><label className="cms-label">Description</label><textarea className="cms-textarea" rows={2} value={item.desc || ''} onChange={e => { const ni = [...menuItems]; ni[idx].desc = e.target.value; updateField('menuPreview.items', ni); }} /></div>
                    <div className="col-md-6 mt-2"><label className="cms-label">Price</label><input className="cms-input" value={item.price || ''} onChange={e => { const ni = [...menuItems]; ni[idx].price = e.target.value; updateField('menuPreview.items', ni); }} /></div>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline-danger" className="mt-2" onClick={() => updateField('menuPreview.items', menuItems.filter((_, i) => i !== idx))}>Remove</Button>
            </div>
          ))}
          <Button variant="outline-light" size="sm" onClick={() => updateField('menuPreview.items', [...menuItems, { name: 'New Dish', tag: 'New', desc: '', price: 'UGX 0', image: '' }])}><FaPlus /> Add Menu Item</Button>
        </div>
      </div>

      {/* Testimonials */}
      <div className="cms-section">
        <div className="cms-section-header">⭐ Testimonials</div>
        <div className="cms-section-body">
          <label className="cms-label">Section Label</label><input className="cms-input mb-3" value={content.testimonials?.sectionLabel || 'What People Say'} onChange={e => updateField('testimonials.sectionLabel', e.target.value)} />
          <label className="cms-label">Section Title</label><input className="cms-input mb-4" value={content.testimonials?.sectionTitle || 'Loved across Kampala'} onChange={e => updateField('testimonials.sectionTitle', e.target.value)} />
          {(testimonials || []).map((t, idx) => (
            <div key={idx} className="feature-item">
              <label className="cms-label">Name</label><input className="cms-input mb-2" value={t.name || ''} onChange={e => { const nt = [...testimonials]; nt[idx].name = e.target.value; updateField('testimonials.items', nt); }} />
              <label className="cms-label">Text</label><textarea className="cms-textarea mb-2" rows={2} value={t.text || ''} onChange={e => { const nt = [...testimonials]; nt[idx].text = e.target.value; updateField('testimonials.items', nt); }} />
              <label className="cms-label">Stars (1-5)</label><input type="number" className="cms-input" min="1" max="5" value={t.stars || 5} onChange={e => { const nt = [...testimonials]; nt[idx].stars = parseInt(e.target.value); updateField('testimonials.items', nt); }} />
              <Button size="sm" variant="outline-danger" className="mt-2" onClick={() => updateField('testimonials.items', testimonials.filter((_, i) => i !== idx))}>Remove</Button>
            </div>
          ))}
          <Button variant="outline-light" size="sm" onClick={() => updateField('testimonials.items', [...testimonials, { name: 'New Customer', text: '', stars: 5 }])}><FaPlus /> Add Testimonial</Button>
        </div>
      </div>

      {/* CTA */}
      <div className="cms-section">
        <div className="cms-section-header">🎯 Call to Action</div>
        <div className="cms-section-body">
          <label className="cms-label">Title</label><input className="cms-input mb-3" value={cta.title || 'Ready to taste something unforgettable?'} onChange={e => updateField('cta.title', e.target.value)} />
          <label className="cms-label">Subtitle</label><textarea className="cms-textarea mb-3" rows={2} value={cta.subtitle || ''} onChange={e => updateField('cta.subtitle', e.target.value)} />
          <div className="row">
            <div className="col-md-6"><label className="cms-label">Primary Button</label><input className="cms-input" value={cta.primaryButtonText || 'Order Now'} onChange={e => updateField('cta.primaryButtonText', e.target.value)} /></div>
            <div className="col-md-6"><label className="cms-label">Primary Link</label><input className="cms-input" value={cta.primaryButtonLink || '/menu'} onChange={e => updateField('cta.primaryButtonLink', e.target.value)} /></div>
            <div className="col-md-6 mt-2"><label className="cms-label">Secondary Button</label><input className="cms-input" value={cta.secondaryButtonText || 'Contact Us'} onChange={e => updateField('cta.secondaryButtonText', e.target.value)} /></div>
            <div className="col-md-6 mt-2"><label className="cms-label">Secondary Link</label><input className="cms-input" value={cta.secondaryButtonLink || '/contact'} onChange={e => updateField('cta.secondaryButtonLink', e.target.value)} /></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="cms-section">
        <div className="cms-section-header">📱 Footer</div>
        <div className="cms-section-body">
          <label className="cms-label">Brand Name</label><input className="cms-input mb-3" value={content.footer?.brand || 'Mutindo Catering'} onChange={e => updateField('footer.brand', e.target.value)} />
          <label className="cms-label">Tagline</label><input className="cms-input mb-4" value={content.footer?.tagline || 'Prepared with love · Delivered with care'} onChange={e => updateField('footer.tagline', e.target.value)} />
          {(footerLinks || []).map((link, idx) => (
            <div key={idx} className="row mb-2">
              <div className="col-md-5"><input className="cms-input" placeholder="Label" value={link.label || ''} onChange={e => { const nl = [...footerLinks]; nl[idx].label = e.target.value; updateField('footer.links', nl); }} /></div>
              <div className="col-md-5"><input className="cms-input" placeholder="Link" value={link.to || ''} onChange={e => { const nl = [...footerLinks]; nl[idx].to = e.target.value; updateField('footer.links', nl); }} /></div>
              <div className="col-md-2"><Button size="sm" variant="outline-danger" onClick={() => updateField('footer.links', footerLinks.filter((_, i) => i !== idx))}>Del</Button></div>
            </div>
          ))}
          <Button variant="outline-light" size="sm" onClick={() => updateField('footer.links', [...footerLinks, { label: 'New Link', to: '/' }])}><FaPlus /> Add Link</Button>
        </div>
      </div>
    </div>
  );
};

// ================= ABOUT VISUAL EDITOR =================
const AboutVisualEditor = ({ content, updateField, openImagePicker }) => {
  const stats = content.stats || [];
  const story = content.story || {};
  const hero = content.hero || {};
  const cta = content.cta || {};
  const features = content.features?.items || [];
  const milestones = content.timeline?.milestones || [];

  return (
    <div style={{ background: '#0d0d0d', color: '#f0ece4', padding: '30px' }}>
      <style>{`.cms-section { margin-bottom: 40px; border: 1px solid #333; border-radius: 12px; overflow: hidden; }
        .cms-section-header { background: #1a1a1a; padding: 15px 20px; border-bottom: 1px solid #333; font-weight: bold; color: #c8a96e; }
        .cms-section-body { padding: 20px; background: #141414; }
        .cms-input { background: #0d0d0d !important; border: 1px solid #333 !important; color: #f0ece4 !important; border-radius: 8px; padding: 10px 14px; width: 100%; }
        .cms-textarea { background: #0d0d0d !important; border: 1px solid #333 !important; color: #f0ece4 !important; border-radius: 8px; padding: 10px 14px; width: 100%; min-height: 80px; }
        .cms-label { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(240,236,228,0.5); margin-bottom: 8px; display: block; }
        .cms-preview-img { width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; }
        .feature-item { background: #1a1a1a; border-radius: 12px; padding: 15px; margin-bottom: 15px; }
      `}</style>

      {/* Hero Section with Floating Images */}
      <div className="cms-section">
        <div className="cms-section-header">📖 Hero Section</div>
        <div className="cms-section-body">
          {hero.backgroundImage && <img src={hero.backgroundImage} className="cms-preview-img" alt="hero" />}
          <Button size="sm" variant="warning" className="mb-3" onClick={() => openImagePicker('hero.backgroundImage')}><FaImage /> Upload Background Image</Button>
          
          <label className="cms-label">Left Floating Image (Chef photo)</label>
          {hero.floatImage1 && <img src={hero.floatImage1} className="cms-preview-img" alt="float 1" />}
          <Button size="sm" variant="warning" className="mb-3" onClick={() => openImagePicker('hero.floatImage1')}><FaImage /> Upload Left Floating Image</Button>
          
          <label className="cms-label">Right Floating Image (Dish photo)</label>
          {hero.floatImage2 && <img src={hero.floatImage2} className="cms-preview-img" alt="float 2" />}
          <Button size="sm" variant="warning" className="mb-3" onClick={() => openImagePicker('hero.floatImage2')}><FaImage /> Upload Right Floating Image</Button>

          <label className="cms-label">Eyebrow</label><input className="cms-input mb-2" value={hero.eyebrow || "Kampala's Premier Catering Service"} onChange={e => updateField('hero.eyebrow', e.target.value)} />
          <label className="cms-label">Title Top</label><input className="cms-input mb-2" value={hero.titleTop || 'Crafting'} onChange={e => updateField('hero.titleTop', e.target.value)} />
          <label className="cms-label">Title Emphasized</label><input className="cms-input mb-2" value={hero.titleEm || 'Unforgettable'} onChange={e => updateField('hero.titleEm', e.target.value)} />
          <label className="cms-label">Title Bottom</label><input className="cms-input mb-2" value={hero.titleBot || 'Dining Experiences'} onChange={e => updateField('hero.titleBot', e.target.value)} />
          <label className="cms-label">Subtitle</label><textarea className="cms-textarea mb-2" rows={3} value={hero.subtitle || ''} onChange={e => updateField('hero.subtitle', e.target.value)} />
          <label className="cms-label">CTA Text</label><input className="cms-input mb-2" value={hero.ctaText || 'Work With Us'} onChange={e => updateField('hero.ctaText', e.target.value)} />
          <label className="cms-label">CTA Link</label><input className="cms-input" value={hero.ctaLink || '/contact'} onChange={e => updateField('hero.ctaLink', e.target.value)} />
        </div>
      </div>

      {/* Stats */}
      <div className="cms-section">
        <div className="cms-section-header">📊 Stats</div>
        <div className="cms-section-body">
          <div className="row">
            {(stats || []).map((stat, idx) => (
              <div key={idx} className="col-md-3 mb-3">
                <div className="feature-item">
                  <input className="cms-input mb-2" placeholder="Number" value={stat.number || ''} onChange={e => { const ns = [...stats]; ns[idx].number = e.target.value; updateField('stats', ns); }} />
                  <input className="cms-input" placeholder="Label" value={stat.label || ''} onChange={e => { const ns = [...stats]; ns[idx].label = e.target.value; updateField('stats', ns); }} />
                  <Button size="sm" variant="outline-danger" className="mt-2 w-100" onClick={() => updateField('stats', stats.filter((_, i) => i !== idx))}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline-light" size="sm" onClick={() => updateField('stats', [...stats, { number: '0', label: 'New Stat' }])}><FaPlus /> Add Stat</Button>
        </div>
      </div>

      {/* Story */}
      <div className="cms-section">
        <div className="cms-section-header">📝 Story Section</div>
        <div className="cms-section-body">
          {story.mainImage && <img src={story.mainImage} className="cms-preview-img" alt="story main" />}
          <Button size="sm" variant="warning" className="mb-3" onClick={() => openImagePicker('story.mainImage')}><FaImage /> Upload Main Image</Button>
          {story.accentImage && <img src={story.accentImage} className="cms-preview-img" alt="story accent" />}
          <Button size="sm" variant="warning" className="mb-3" onClick={() => openImagePicker('story.accentImage')}><FaImage /> Upload Accent Image</Button>
          <label className="cms-label">Eyebrow</label><input className="cms-input mb-2" value={story.eyebrow || 'Who We Are'} onChange={e => updateField('story.eyebrow', e.target.value)} />
          <label className="cms-label">Title Main</label><input className="cms-input mb-2" value={story.titleMain || 'More Than'} onChange={e => updateField('story.titleMain', e.target.value)} />
          <label className="cms-label">Title Emphasized</label><input className="cms-input mb-2" value={story.titleEm || 'Just Catering'} onChange={e => updateField('story.titleEm', e.target.value)} />
          <label className="cms-label">Body 1</label><textarea className="cms-textarea mb-2" rows={3} value={story.body1 || ''} onChange={e => updateField('story.body1', e.target.value)} />
          <label className="cms-label">Body 2</label><textarea className="cms-textarea mb-2" rows={3} value={story.body2 || ''} onChange={e => updateField('story.body2', e.target.value)} />
          <label className="cms-label">CTA Text</label><input className="cms-input mb-2" value={story.ctaText || 'Start Planning Your Event'} onChange={e => updateField('story.ctaText', e.target.value)} />
          <label className="cms-label">CTA Link</label><input className="cms-input" value={story.ctaLink || '/contact'} onChange={e => updateField('story.ctaLink', e.target.value)} />
        </div>
      </div>

      {/* Features */}
      <div className="cms-section">
        <div className="cms-section-header">✨ Features</div>
        <div className="cms-section-body">
          {(features || []).map((f, idx) => (
            <div key={idx} className="feature-item">
              <div className="row">
                <div className="col-md-3">{f.image && <img src={f.image} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} alt="feature" />}<Button size="sm" variant="warning" className="mt-1 w-100" onClick={() => openImagePicker(`features.items.${idx}.image`)}>Upload</Button></div>
                <div className="col-md-9"><label className="cms-label">Tag</label><input className="cms-input mb-2" value={f.tag || ''} onChange={e => { const nf = [...features]; nf[idx].tag = e.target.value; updateField('features.items', nf); }} />
                <label className="cms-label">Title</label><input className="cms-input mb-2" value={f.title || ''} onChange={e => { const nf = [...features]; nf[idx].title = e.target.value; updateField('features.items', nf); }} />
                <label className="cms-label">Body</label><textarea className="cms-textarea" rows={2} value={f.body || ''} onChange={e => { const nf = [...features]; nf[idx].body = e.target.value; updateField('features.items', nf); }} /></div>
              </div>
              <Button size="sm" variant="outline-danger" className="mt-2" onClick={() => updateField('features.items', features.filter((_, i) => i !== idx))}>Remove</Button>
            </div>
          ))}
          <Button variant="outline-light" size="sm" onClick={() => updateField('features.items', [...features, { tag: 'New', title: '', body: '', image: '' }])}><FaPlus /> Add Feature</Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="cms-section">
        <div className="cms-section-header">📅 Timeline</div>
        <div className="cms-section-body">
          {(milestones || []).map((m, idx) => (
            <div key={idx} className="feature-item">
              <div className="row">
                <div className="col-md-3">{m.image && <img src={m.image} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} alt="milestone" />}<Button size="sm" variant="warning" className="mt-1 w-100" onClick={() => openImagePicker(`timeline.milestones.${idx}.image`)}>Upload</Button></div>
                <div className="col-md-9"><label className="cms-label">Year</label><input className="cms-input mb-2" value={m.year || ''} onChange={e => { const nm = [...milestones]; nm[idx].year = e.target.value; updateField('timeline.milestones', nm); }} />
                <label className="cms-label">Title</label><input className="cms-input mb-2" value={m.title || ''} onChange={e => { const nm = [...milestones]; nm[idx].title = e.target.value; updateField('timeline.milestones', nm); }} />
                <label className="cms-label">Body</label><textarea className="cms-textarea" rows={2} value={m.body || ''} onChange={e => { const nm = [...milestones]; nm[idx].body = e.target.value; updateField('timeline.milestones', nm); }} /></div>
              </div>
              <Button size="sm" variant="outline-danger" className="mt-2" onClick={() => updateField('timeline.milestones', milestones.filter((_, i) => i !== idx))}>Remove</Button>
            </div>
          ))}
          <Button variant="outline-light" size="sm" onClick={() => updateField('timeline.milestones', [...milestones, { year: '2024', title: 'New Milestone', body: '', image: '' }])}><FaPlus /> Add Milestone</Button>
        </div>
      </div>

      {/* CTA */}
      <div className="cms-section">
        <div className="cms-section-header">🎯 Call to Action</div>
        <div className="cms-section-body">
          {cta.backgroundImage && <img src={cta.backgroundImage} className="cms-preview-img" alt="cta bg" />}
          <Button size="sm" variant="warning" className="mb-3" onClick={() => openImagePicker('cta.backgroundImage')}><FaImage /> Upload Background</Button>
          <label className="cms-label">Eyebrow</label><input className="cms-input mb-2" value={cta.eyebrow || 'Our Promise'} onChange={e => updateField('cta.eyebrow', e.target.value)} />
          <label className="cms-label">Title Main</label><input className="cms-input mb-2" value={cta.titleMain || 'Your Event Deserves'} onChange={e => updateField('cta.titleMain', e.target.value)} />
          <label className="cms-label">Title Em</label><input className="cms-input mb-2" value={cta.titleEm || 'Nothing Less'} onChange={e => updateField('cta.titleEm', e.target.value)} />
          <label className="cms-label">Title End</label><input className="cms-input mb-2" value={cta.titleEnd || 'Than Perfect'} onChange={e => updateField('cta.titleEnd', e.target.value)} />
          <label className="cms-label">Subtitle</label><textarea className="cms-textarea mb-2" rows={2} value={cta.subtitle || ''} onChange={e => updateField('cta.subtitle', e.target.value)} />
          <label className="cms-label">CTA Text</label><input className="cms-input" value={cta.ctaText || 'Book a Consultation'} onChange={e => updateField('cta.ctaText', e.target.value)} />
        </div>
      </div>
    </div>
  );
};

// ================= GALLERY VISUAL EDITOR =================
const GalleryVisualEditor = ({ content, updateField, openImagePicker }) => {
  const images = content.images || [];

  return (
    <div style={{ background: '#0d0d0d', color: '#f0ece4', padding: '30px' }}>
      <style>{`.cms-section { margin-bottom: 40px; border: 1px solid #333; border-radius: 12px; overflow: hidden; }
        .cms-section-header { background: #1a1a1a; padding: 15px 20px; border-bottom: 1px solid #333; font-weight: bold; color: #c8a96e; }
        .cms-section-body { padding: 20px; background: #141414; }
        .cms-input { background: #0d0d0d !important; border: 1px solid #333 !important; color: #f0ece4 !important; border-radius: 8px; padding: 10px 14px; width: 100%; }
        .cms-preview-img { width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; }
        .cms-label { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(240,236,228,0.5); margin-bottom: 8px; display: block; }
        .gallery-item { background: #1a1a1a; border-radius: 12px; padding: 15px; margin-bottom: 15px; }
      `}</style>

      {/* Hero Section for Gallery */}
      <div className="cms-section">
        <div className="cms-section-header">🎬 Hero Section</div>
        <div className="cms-section-body">
          <label className="cms-label">Hero Title Line 1 (Our)</label>
          <input className="cms-input mb-2" value={content.heroTitle1 || 'Our'} onChange={e => updateField('heroTitle1', e.target.value)} />
          
          <label className="cms-label">Hero Title Line 2 (Culinary)</label>
          <input className="cms-input mb-2" value={content.heroTitle2 || 'Culinary'} onChange={e => updateField('heroTitle2', e.target.value)} />
          
          <label className="cms-label">Hero Title Line 3 (Journey)</label>
          <input className="cms-input mb-2" value={content.heroTitle3 || 'Journey'} onChange={e => updateField('heroTitle3', e.target.value)} />
          
          <label className="cms-label">Hero Subtitle</label>
          <textarea className="cms-textarea mb-2" rows={2} value={content.heroSubtitle || ''} onChange={e => updateField('heroSubtitle', e.target.value)} />
          
          <label className="cms-label">Hero Background Image</label>
          {content.heroImage && <img src={content.heroImage} className="cms-preview-img" alt="hero" />}
          <Button size="sm" variant="warning" className="mb-3" onClick={() => openImagePicker('heroImage')}><FaImage /> Upload Hero Background</Button>
          
          <label className="cms-label">Side Stack Image (right side floating image)</label>
          {content.heroSideImage && <img src={content.heroSideImage} className="cms-preview-img" alt="side" />}
          <Button size="sm" variant="warning" onClick={() => openImagePicker('heroSideImage')}><FaImage /> Upload Side Stack Image</Button>
        </div>
      </div>

      {/* Gallery Images Section */}
      <div className="cms-section">
        <div className="cms-section-header">🖼️ Gallery Images</div>
        <div className="cms-section-body">
          <div className="row">
            {(images || []).map((img, idx) => (
              <div key={idx} className="col-md-4 mb-3">
                <div className="gallery-item">
                  {img.imageUrl && <img src={img.imageUrl} className="cms-preview-img" alt="gallery" />}
                  <Button size="sm" variant="warning" className="w-100 mb-2" onClick={() => openImagePicker(`images.${idx}.imageUrl`)}><FaImage /> {img.imageUrl ? 'Change Image' : 'Upload Image'}</Button>
                  <label className="cms-label">Title</label><input className="cms-input mb-2" value={img.title || ''} onChange={e => { const ni = [...images]; ni[idx].title = e.target.value; updateField('images', ni); }} />
                  <label className="cms-label">Description</label><textarea className="cms-textarea mb-2" rows={2} value={img.description || ''} onChange={e => { const ni = [...images]; ni[idx].description = e.target.value; updateField('images', ni); }} />
                  <label className="cms-label">Category (Food/Events/Kitchen)</label><input className="cms-input mb-2" value={img.category || 'Food'} onChange={e => { const ni = [...images]; ni[idx].category = e.target.value; updateField('images', ni); }} />
                  <Button size="sm" variant="outline-danger" className="w-100" onClick={() => updateField('images', images.filter((_, i) => i !== idx))}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline-light" size="sm" onClick={() => updateField('images', [...images, { id: Date.now(), title: 'New Image', description: '', category: 'Food', imageUrl: '', likes: 0, views: 0, date: new Date().toISOString().split('T')[0] }])}><FaPlus /> Add Gallery Image</Button>
        </div>
      </div>
    </div>
  );
};



































// ================= CATERING VISUAL EDITOR (FIXED - How It Works Images Working) =================
const CateringVisualEditor = ({ content, updateField, openImagePicker }) => {
  const packages = content.packages || [];
  const howItWorks = content.howItWorks || [];
  const hero = content.hero || {};

  // Default how it works steps
  const defaultSteps = [
    { n: '01', title: 'Choose Your Package', desc: 'Browse our tiers and select the one that fits your occasion, guest count and appetite.', img: 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { n: '02', title: 'Submit Your Request', desc: 'Complete a short booking form with your event details. We confirm within 24 hours.', img: 'https://images.pexels.com/photos/4551832/pexels-photo-4551832.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { n: '03', title: 'We Handle Everything', desc: 'Our team arrives early, prepares everything fresh on-site, and delivers a seamless experience.', img: 'https://images.pexels.com/photos/2290070/pexels-photo-2290070.jpeg?auto=compress&cs=tinysrgb&w=400' },
  ];

  const steps = howItWorks && howItWorks.length > 0 ? howItWorks : defaultSteps;

  // Function to update a specific step's image
  const updateStepImage = (idx, imageUrl) => {
    const newSteps = [...steps];
    newSteps[idx] = { ...newSteps[idx], img: imageUrl };
    updateField('howItWorks', newSteps);
  };

  // Function to update a specific step's field
  const updateStepField = (idx, field, value) => {
    const newSteps = [...steps];
    newSteps[idx] = { ...newSteps[idx], [field]: value };
    updateField('howItWorks', newSteps);
  };

  return (
    <div style={{ background: '#0d0d0d', color: '#f0ece4', padding: '30px' }}>
      <style>{`.cms-section { margin-bottom: 40px; border: 1px solid #333; border-radius: 12px; overflow: hidden; }
        .cms-section-header { background: #1a1a1a; padding: 15px 20px; border-bottom: 1px solid #333; font-weight: bold; color: #C9A96E; }
        .cms-section-body { padding: 20px; background: #141414; }
        .cms-input { background: #0d0d0d !important; border: 1px solid #333 !important; color: #f0ece4 !important; border-radius: 8px; padding: 10px 14px; width: 100%; }
        .cms-textarea { background: #0d0d0d !important; border: 1px solid #333 !important; color: #f0ece4 !important; border-radius: 8px; padding: 10px 14px; width: 100%; min-height: 80px; }
        .cms-label { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(240,236,228,0.5); margin-bottom: 8px; display: block; }
        .cms-preview-img { width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; }
        .package-item { background: #1a1a1a; border-radius: 12px; padding: 15px; margin-bottom: 15px; }
        .step-item { background: #1a1a1a; border-radius: 12px; padding: 15px; margin-bottom: 15px; }
      `}</style>

      {/* Hero Section */}
      <div className="cms-section">
        <div className="cms-section-header">🍽️ Hero Section</div>
        <div className="cms-section-body">
          <label className="cms-label">Hero Background Image</label>
          {hero.image && <img src={hero.image} className="cms-preview-img" alt="hero" />}
          <Button size="sm" variant="warning" className="mb-3" onClick={() => openImagePicker('hero.image')}><FaImage /> Upload Hero Background</Button>
          
          <label className="cms-label">Hero Title</label>
          <input className="cms-input mb-2" value={hero.title || 'Catering Services'} onChange={e => updateField('hero.title', e.target.value)} />
          
          <label className="cms-label">Hero Subtitle</label>
          <textarea className="cms-textarea mb-2" rows={2} value={hero.subtitle || ''} onChange={e => updateField('hero.subtitle', e.target.value)} />
        </div>
      </div>

      {/* Packages Section */}
      <div className="cms-section">
        <div className="cms-section-header">📦 Catering Packages</div>
        <div className="cms-section-body">
          <label className="cms-label">Section Title</label>
          <input className="cms-input mb-4" value={content.sectionTitle || 'Catering Packages'} onChange={e => updateField('sectionTitle', e.target.value)} />
          
          {(packages || []).map((pkg, idx) => (
            <div key={idx} className="package-item">
              <div className="row">
                <div className="col-md-12">
                  <label className="cms-label">Package Image</label>
                  {pkg.image && <img src={pkg.image} className="cms-preview-img" style={{ height: '120px' }} alt="package" />}
                  <Button size="sm" variant="warning" className="mb-3 w-100" onClick={() => openImagePicker(`packages.${idx}.image`)}><FaImage /> {pkg.image ? 'Change Package Image' : 'Upload Package Image'}</Button>
                </div>
                <div className="col-md-6"><label className="cms-label">Package Name</label><input className="cms-input" value={pkg.name || ''} onChange={e => { const np = [...packages]; np[idx].name = e.target.value; updateField('packages', np); }} /></div>
                <div className="col-md-3"><label className="cms-label">Price (UGX)</label><input type="number" className="cms-input" value={pkg.price || 0} onChange={e => { const np = [...packages]; np[idx].price = parseInt(e.target.value); updateField('packages', np); }} /></div>
                <div className="col-md-3"><label className="cms-label">Guests</label><input className="cms-input" value={pkg.guests || ''} onChange={e => { const np = [...packages]; np[idx].guests = e.target.value; updateField('packages', np); }} /></div>
                <div className="col-md-12 mt-2"><label className="cms-label">Description</label><textarea className="cms-textarea" rows={2} value={pkg.description || ''} onChange={e => { const np = [...packages]; np[idx].description = e.target.value; updateField('packages', np); }} /></div>
                <div className="col-md-12 mt-2"><label className="cms-label">Includes (comma separated)</label><input className="cms-input" value={(pkg.includes || []).join(', ')} onChange={e => { const np = [...packages]; np[idx].includes = e.target.value.split(',').map(i => i.trim()); updateField('packages', np); }} /></div>
              </div>
              <Button size="sm" variant="outline-danger" className="mt-2" onClick={() => updateField('packages', packages.filter((_, i) => i !== idx))}>Remove Package</Button>
            </div>
          ))}
          <Button variant="outline-light" size="sm" onClick={() => updateField('packages', [...packages, { name: 'New Package', price: 0, guests: '0', description: '', includes: [], image: '' }])}><FaPlus /> Add Package</Button>
        </div>
      </div>

      {/* Custom Banner Section */}
      <div className="cms-section">
        <div className="cms-section-header">🎨 Custom Banner</div>
        <div className="cms-section-body">
          <label className="cms-label">Custom Banner Background Image</label>
          {content.customBannerImage && <img src={content.customBannerImage} className="cms-preview-img" alt="custom banner" />}
          <Button size="sm" variant="warning" className="mb-3" onClick={() => openImagePicker('customBannerImage')}><FaImage /> Upload Custom Banner Image</Button>
          
          <label className="cms-label">Banner Eyebrow</label>
          <input className="cms-input mb-2" value={content.bannerEyebrow || 'Bespoke Service'} onChange={e => updateField('bannerEyebrow', e.target.value)} />
          
          <label className="cms-label">Banner Title</label>
          <input className="cms-input mb-2" value={content.bannerTitle || 'Need something beyond the menu?'} onChange={e => updateField('bannerTitle', e.target.value)} />
          
          <label className="cms-label">Banner Body</label>
          <textarea className="cms-textarea mb-2" rows={2} value={content.bannerBody || ''} onChange={e => updateField('bannerBody', e.target.value)} />
          
          <label className="cms-label">Banner Button Text</label>
          <input className="cms-input" value={content.bannerButtonText || 'Request a Custom Quote'} onChange={e => updateField('bannerButtonText', e.target.value)} />
        </div>
      </div>

      {/* ==================== HOW IT WORKS SECTION - FIXED ==================== */}
      <div className="cms-section">
        <div className="cms-section-header">🔄 How It Works Section</div>
        <div className="cms-section-body">
          <label className="cms-label">Section Eyebrow (small text above title)</label>
          <input className="cms-input mb-2" value={content.howItWorksEyebrow || 'The Experience'} onChange={e => updateField('howItWorksEyebrow', e.target.value)} />
          
          <label className="cms-label">Section Title</label>
          <input className="cms-input mb-4" value={content.howItWorksTitle || 'How It Works'} onChange={e => updateField('howItWorksTitle', e.target.value)} />

          <label className="cms-label">Steps (How It Works)</label>
          {(steps || []).map((step, idx) => (
            <div key={idx} className="step-item">
              <div className="row">
                <div className="col-md-12">
                  <label className="cms-label">Step {idx + 1} Image</label>
                  {step.img && (
                    <div className="mb-2">
                      <img 
                        src={step.img} 
                        className="cms-preview-img" 
                        style={{ height: '120px', objectFit: 'cover' }} 
                        alt="step preview" 
                        onError={(e) => { e.target.src = 'https://placehold.co/400x200?text=No+Image'; }}
                      />
                    </div>
                  )}
                  <div className="d-flex gap-2">
                    <Button 
                      size="sm" 
                      variant="warning" 
                      onClick={() => {
                        // Create a custom image picker that directly updates the step
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          // Upload to Cloudinary
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('upload_preset', UPLOAD_PRESET || 'mutindo_uploads');
                          formData.append('folder', 'mutindo/catering/howitworks');
                          
                          try {
                            toast.info('Uploading image...');
                            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { 
                              method: 'POST', 
                              body: formData 
                            });
                            const data = await response.json();
                            if (data.secure_url) {
                              updateStepImage(idx, data.secure_url);
                              toast.success('Image uploaded! Click Save Changes to persist.');
                            } else {
                              throw new Error('Upload failed');
                            }
                          } catch (error) {
                            console.error('Upload error:', error);
                            toast.error('Upload failed');
                          }
                        };
                        input.click();
                      }}
                    >
                      <FaImage /> {step.img ? 'Change Image' : 'Upload Image'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-secondary" 
                      onClick={() => {
                        const url = prompt('Enter image URL:', step.img || '');
                        if (url && url.trim()) {
                          updateStepImage(idx, url.trim());
                          toast.success('Image URL applied');
                        }
                      }}
                    >
                      Paste URL
                    </Button>
                  </div>
                  {step.img && (
                    <Button 
                      size="sm" 
                      variant="outline-danger" 
                      className="mt-2" 
                      onClick={() => updateStepImage(idx, '')}
                    >
                      Clear Image
                    </Button>
                  )}
                </div>
                <div className="col-md-3 mt-2">
                  <label className="cms-label">Step Number (e.g., 01)</label>
                  <input 
                    className="cms-input" 
                    value={step.n || ''} 
                    onChange={e => updateStepField(idx, 'n', e.target.value)} 
                  />
                </div>
                <div className="col-md-9 mt-2">
                  <label className="cms-label">Step Title</label>
                  <input 
                    className="cms-input" 
                    value={step.title || ''} 
                    onChange={e => updateStepField(idx, 'title', e.target.value)} 
                  />
                </div>
                <div className="col-md-12 mt-2">
                  <label className="cms-label">Step Description</label>
                  <textarea 
                    className="cms-textarea" 
                    rows={2} 
                    value={step.desc || ''} 
                    onChange={e => updateStepField(idx, 'desc', e.target.value)} 
                  />
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline-danger" 
                className="mt-2" 
                onClick={() => {
                  const newSteps = steps.filter((_, i) => i !== idx);
                  updateField('howItWorks', newSteps);
                }}
              >
                Remove Step
              </Button>
            </div>
          ))}
          <Button 
            variant="outline-light" 
            size="sm" 
            className="mt-3" 
            onClick={() => {
              const newSteps = [...steps, { n: `0${steps.length + 1}`, title: 'New Step', desc: '', img: '' }];
              updateField('howItWorks', newSteps);
            }}
          >
            <FaPlus /> Add Step
          </Button>
        </div>
      </div>
      {/* ==================== END OF HOW IT WORKS ==================== */}

      {/* CTA Section */}
      <div className="cms-section">
        <div className="cms-section-header">📞 Call to Action</div>
        <div className="cms-section-body">
          <label className="cms-label">CTA Text</label>
          <input className="cms-input" value={content.ctaText || 'Book Your Event Today'} onChange={e => updateField('ctaText', e.target.value)} />
        </div>
      </div>
    </div>
  );
};

// ================= MAIN COMPONENT =================
const WebsiteContentManager = () => {
  const [activePage, setActivePage] = useState('home');
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageField, setCurrentImageField] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => { loadAllContent(); }, []);

  const loadAllContent = async () => {
    setLoading(true);
    const newContent = {};
    for (const page of PAGES) {
      try {
        const response = await api.get(`/content/${page.id}`);
        newContent[page.id] = response.data || {};
      } catch (error) {
        console.error(`Error loading ${page.id}:`, error);
        newContent[page.id] = {};
      }
    }
    setContent(newContent);
    setLoading(false);
  };

  const updateField = (path, value) => {
    setContent(prev => {
      const newContent = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      if (!newContent[activePage]) newContent[activePage] = {};
      let current = newContent[activePage];
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newContent;
    });
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      await api.post(`/content/${activePage}`, content[activePage]);
      toast.success(`${activePage.charAt(0).toUpperCase() + activePage.slice(1)} content saved!`);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async () => {
    if (!selectedFile) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('upload_preset', UPLOAD_PRESET || 'mutindo_uploads');
    formData.append('folder', `mutindo/${activePage}`);
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      const data = await response.json();
      if (data.secure_url) {
        updateField(currentImageField, data.secure_url);
        toast.success('Image uploaded! Click Save Changes to persist.');
        setShowImageModal(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed - check Cloudinary credentials');
    } finally {
      setUploadingImage(false);
    }
  };

  const openImagePicker = (fieldPath) => {
    setCurrentImageField(fieldPath);
    setShowImageModal(true);
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading...</p>
      </Container>
    );
  }

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', color: '#f0ece4' }}>
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary bg-dark sticky-top" style={{ zIndex: 1000 }}>
        <h4 className="mb-0">✨ Mutindo Visual Editor</h4>
        <div>
          <Button variant="outline-light" className="me-2" onClick={loadAllContent}><FaUndo /> Reset</Button>
          <Button variant="warning" onClick={saveContent} disabled={saving}>
            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs activeKey={activePage} onSelect={setActivePage} className="admin-tabs mb-0 bg-dark" fill style={{ borderBottom: '1px solid #333' }}>
        <Tab eventKey="home" title={<span><FaHome /> Home</span>}>
          <HomeVisualEditor content={content.home || {}} updateField={updateField} openImagePicker={openImagePicker} />
        </Tab>
        <Tab eventKey="about" title={<span><FaInfoCircle /> About</span>}>
          <AboutVisualEditor content={content.about || {}} updateField={updateField} openImagePicker={openImagePicker} />
        </Tab>
        <Tab eventKey="gallery" title={<span><FaImages /> Gallery</span>}>
          <GalleryVisualEditor content={content.gallery || {}} updateField={updateField} openImagePicker={openImagePicker} />
        </Tab>
        <Tab eventKey="catering" title={<span><FaConciergeBell /> Catering</span>}>
          <CateringVisualEditor content={content.catering || {}} updateField={updateField} openImagePicker={openImagePicker} />
        </Tab>
      </Tabs>

      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
          <Modal.Title>📸 Upload Image</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <Form.Group>
            <Form.Label>Choose Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageSelect} className="bg-secondary text-white border-0" />
          </Form.Group>
          {previewUrl && <div className="mt-3 text-center"><img src={previewUrl} alt="Preview" className="img-fluid rounded" style={{ maxHeight: '200px' }} /></div>}
          <div className="mt-3 text-center">
            <Button variant="warning" onClick={uploadToCloudinary} disabled={!selectedFile || uploadingImage}>
              {uploadingImage ? <Spinner size="sm" className="me-2" /> : <FaUpload className="me-2" />}
              {uploadingImage ? 'Uploading...' : 'Upload to Cloudinary'}
            </Button>
          </div>
          <hr className="border-secondary my-3" />
          <Form.Group>
            <Form.Label>Or paste image URL</Form.Label>
            <Form.Control type="text" placeholder="https://..." className="bg-secondary text-white border-0" onChange={(e) => { if (e.target.value) { updateField(currentImageField, e.target.value); toast.success('URL applied'); setShowImageModal(false); } }} />
          </Form.Group>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default WebsiteContentManager;