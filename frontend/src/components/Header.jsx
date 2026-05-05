import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaTimes, FaBars, FaChevronDown, FaSignOutAlt, FaTachometerAlt, FaClipboardList, FaMotorcycle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Cart from './Cart';

// Logo in public folder
const logo = '/mutindo.jpeg';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const location = useLocation();
  const userMenuRef = useRef(null);
  const prevCount = useRef(0);

  const cartItemCount = getCartCount();

  /* Scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Cart bounce animation on item add */
  useEffect(() => {
    if (cartItemCount > prevCount.current) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 600);
    }
    prevCount.current = cartItemCount;
  }, [cartItemCount]);

  /* Close user menu on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Close mobile on route change */
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const navLinks = [
    { label: 'Home', to: '/' },
     { label: 'About', to: '/about' }, 
    { label: 'Menu', to: '/menu' },
    { label: 'Gallery', to: '/gallery' },
    { label: 'Testimonials', to: '/testimonials' },
    { label: 'Catering', to: '/catering' },
    { label: 'Contact', to: '/contact' },
  ];

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  const getRoleDashboard = () => {
    if (user?.role === 'admin')  return { label: 'Admin Dashboard',  to: '/admin/dashboard',  icon: <FaTachometerAlt /> };
    if (user?.role === 'rider')  return { label: 'Rider Dashboard',  to: '/rider/dashboard',  icon: <FaMotorcycle /> };
    return null;
  };

  const roleDash = getRoleDashboard();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');

        .hdr-root {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.4s ease, box-shadow 0.4s ease, padding 0.3s ease;
        }
        .hdr-root.scrolled {
          background: rgba(13, 13, 13, 0.96);
          backdrop-filter: blur(20px);
          box-shadow: 0 1px 0 rgba(255,107,53,0.15), 0 8px 32px rgba(0,0,0,0.5);
        }
        .hdr-root.top {
          background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
        }

        .hdr-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 6vw;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }

        /* ── BRAND WITH LOGO ── */
        .hdr-brand {
          text-decoration: none;
          display: flex; align-items: center; gap: 12px;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .hdr-brand:hover {
          transform: translateY(-1px);
        }
        
        .hdr-logo-container {
          position: relative;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
        }
        
        .hdr-logo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .hdr-brand:hover .hdr-logo {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(255,107,53,0.3);
        }
        
        .hdr-logo-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, #FF6B35, #00C9A7);
          border-radius: 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }
        
        .hdr-brand:hover .hdr-logo-glow {
          opacity: 0.5;
        }
        
        .hdr-brand-text-container {
          display: flex;
          flex-direction: column;
        }
        
        .hdr-brand-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 900;
          color: #f0ece4;
          line-height: 1;
          letter-spacing: -0.3px;
        }
        
        .hdr-brand-sub {
          font-size: 0.6rem;
          font-weight: 400;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(240,236,228,0.4);
          margin-top: 2px;
        }

        /* ── NAV LINKS ── */
        .hdr-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          list-style: none;
          margin: 0;
          padding: 0;
          flex: 1;
        }
        @media (max-width: 900px) { 
          .hdr-nav { 
            display: none; 
          } 
        }

        .hdr-nav-link {
          position: relative;
          padding: 8px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(240,236,228,0.75);
          text-decoration: none;
          border-radius: 4px;
          letter-spacing: 0.3px;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .hdr-nav-link::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 16px;
          right: 16px;
          height: 2px;
          background: #FF6B35;
          transform: scaleX(0);
          transition: transform 0.25s ease;
          transform-origin: left;
        }
        .hdr-nav-link:hover { 
          color: #f0ece4; 
        }
        .hdr-nav-link:hover::after { 
          transform: scaleX(1); 
        }
        .hdr-nav-link.active { 
          color: #FF6B35; 
          font-weight: 600;
        }
        .hdr-nav-link.active::after { 
          transform: scaleX(1); 
        }

        /* ── RIGHT ACTIONS ── */
        .hdr-actions {
          display: flex; align-items: center; gap: 8px;
          flex-shrink: 0;
        }

        /* ── CART BUTTON ── */
        .hdr-cart-btn {
          position: relative;
          width: 40px; height: 40px;
          border-radius: 4px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(240,236,228,0.75);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
        }
        .hdr-cart-btn:hover {
          background: rgba(255,107,53,0.12);
          border-color: rgba(255,107,53,0.4);
          color: #FF6B35;
        }
        .hdr-cart-btn.bounce { animation: cartBounce 0.5s ease; }

        .hdr-cart-badge {
          position: absolute;
          top: -6px; right: -6px;
          min-width: 18px; height: 18px;
          background: #FF6B35;
          border-radius: 9px;
          font-size: 10px; font-weight: 600;
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
          border: 2px solid #0d0d0d;
          animation: badgePop 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        /* ── USER DROPDOWN ── */
        .hdr-user-wrap { position: relative; }

        .hdr-user-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 12px 6px 6px;
          border-radius: 4px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(240,236,228,0.75);
          cursor: pointer;
          transition: all 0.2s;
        }
        .hdr-user-btn:hover {
          background: rgba(255,107,53,0.1);
          border-color: rgba(255,107,53,0.3);
          color: #f0ece4;
        }
        .hdr-user-avatar {
          width: 28px; height: 28px;
          border-radius: 3px;
          background: linear-gradient(135deg, #FF6B35, #ff9a70);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 700;
          color: #fff; letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .hdr-user-name {
          font-size: 0.8rem; font-weight: 500;
          color: #f0ece4; max-width: 90px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .hdr-chevron {
          font-size: 0.6rem; opacity: 0.6;
          transition: transform 0.2s;
        }
        .hdr-chevron.open { transform: rotate(180deg); }

        .hdr-dropdown {
          position: absolute; top: calc(100% + 12px); right: 0;
          min-width: 220px;
          background: #181818;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.6);
          overflow: hidden;
          animation: dropDown 0.2s ease;
          z-index: 100;
        }

        .hdr-dropdown-header {
          padding: 16px 18px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .hdr-dropdown-name {
          font-weight: 500; color: #f0ece4; font-size: 0.9rem;
        }
        .hdr-dropdown-role {
          font-size: 0.72rem; letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #FF6B35; margin-top: 2px;
        }

        .hdr-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 18px;
          font-size: 0.875rem;
          color: rgba(240,236,228,0.65);
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          border: none; background: none; width: 100%; text-align: left;
        }
        .hdr-dropdown-item:hover {
          background: rgba(255,107,53,0.08);
          color: #f0ece4;
        }
        .hdr-dropdown-item svg { opacity: 0.6; font-size: 0.85rem; }
        .hdr-dropdown-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 4px 0;
        }
        .hdr-dropdown-item.logout { color: rgba(255,100,100,0.75); }
        .hdr-dropdown-item.logout:hover { color: #ff6464; background: rgba(255,100,100,0.08); }

        /* ── AUTH BUTTONS ── */
        .hdr-login-btn {
          padding: 8px 16px;
          font-size: 0.85rem; font-weight: 400;
          color: rgba(240,236,228,0.65);
          text-decoration: none;
          border-radius: 4px;
          transition: color 0.2s;
          letter-spacing: 0.3px;
        }
        .hdr-login-btn:hover { color: #f0ece4; }

        .hdr-register-btn {
          padding: 8px 18px;
          font-size: 0.85rem; font-weight: 500;
          color: #fff;
          background: #FF6B35;
          text-decoration: none;
          border-radius: 4px;
          letter-spacing: 0.3px;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .hdr-register-btn:hover {
          background: #ff8555;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255,107,53,0.35);
          color: #fff;
        }

        /* ── MOBILE HAMBURGER ── */
        .hdr-hamburger {
          display: none;
          width: 40px; height: 40px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          color: rgba(240,236,228,0.75);
          align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .hdr-hamburger:hover { background: rgba(255,107,53,0.1); border-color: rgba(255,107,53,0.3); color: #FF6B35; }
        @media (max-width: 900px) { .hdr-hamburger { display: flex; } }

        /* ── MOBILE MENU ── */
        .hdr-mobile {
          position: fixed; inset: 0; z-index: 999;
          display: flex; flex-direction: column;
          background: #0d0d0d;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hdr-mobile.open { transform: translateX(0); }

        .hdr-mobile-top {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 20px 6vw;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        
        .hdr-mobile-logo {
          display: flex; align-items: center; gap: 12px;
          text-decoration: none;
        }
        
        .hdr-mobile-logo-img {
          width: 36px;
          height: 36px;
          object-fit: cover;
          border-radius: 6px;
        }
        
        .hdr-mobile-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          font-weight: 900;
          color: #f0ece4;
        }
        
        .hdr-mobile-logo-sub {
          font-size: 0.55rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(240,236,228,0.4);
        }
        
        .hdr-mobile-close {
          width: 40px; height: 40px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px; color: rgba(240,236,228,0.75);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 1rem;
          transition: all 0.2s;
        }
        .hdr-mobile-close:hover { color: #FF6B35; border-color: rgba(255,107,53,0.3); }

        .hdr-mobile-nav {
          flex: 1; overflow-y: auto;
          padding: 24px 6vw;
          display: flex; flex-direction: column; gap: 8px;
        }

        .hdr-mobile-link {
          display: flex; align-items: center;
          padding: 14px 18px;
          font-size: 1rem; font-weight: 400;
          color: rgba(240,236,228,0.65);
          text-decoration: none;
          border-radius: 4px;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .hdr-mobile-link:hover, .hdr-mobile-link.active {
          background: rgba(255,107,53,0.08);
          border-color: rgba(255,107,53,0.2);
          color: #FF6B35;
        }

        .hdr-mobile-divider {
          height: 1px; background: rgba(255,255,255,0.06);
          margin: 16px 0;
        }

        .hdr-mobile-bottom {
          padding: 24px 6vw;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column; gap: 10px;
        }

        /* ── ORANGE INDICATOR LINE ── */
        .hdr-indicator {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,107,53,0.4), transparent);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .hdr-root.scrolled .hdr-indicator { opacity: 1; }

        /* Responsive adjustments */
        @media (max-width: 1100px) {
          .hdr-nav-link {
            padding: 8px 12px;
            font-size: 0.8rem;
          }
        }

        /* ── KEYFRAMES ── */
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cartBounce {
          0%, 100% { transform: scale(1); }
          30%       { transform: scale(1.3) rotate(-10deg); }
          60%       { transform: scale(0.9) rotate(5deg); }
        }
        @keyframes badgePop {
          0%   { transform: scale(0); }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════ */}
      <header className={`hdr-root ${scrolled ? 'scrolled' : 'top'}`}>
        <div className="hdr-inner">

          {/* Brand with Logo */}
          <Link to="/" className="hdr-brand">
            <div className="hdr-logo-container">
              <img src={logo} alt="Mutindo Catering" className="hdr-logo" />
              <div className="hdr-logo-glow" />
            </div>
            <div className="hdr-brand-text-container">
              <div className="hdr-brand-text">Mutindo</div>
              <div className="hdr-brand-sub">Catering Services</div>
            </div>
          </Link>

          {/* Desktop Nav - Centered */}
          <ul className="hdr-nav">
            {navLinks.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`hdr-nav-link ${isActive(link.to) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div className="hdr-actions">

            {/* Cart */}
            <button
              className={`hdr-cart-btn ${cartBounce ? 'bounce' : ''}`}
              onClick={() => setShowCart(true)}
              aria-label="Open cart"
            >
              <FaShoppingCart size={16} />
              {cartItemCount > 0 && (
                <span className="hdr-cart-badge">{cartItemCount}</span>
              )}
            </button>

            {/* User / Auth */}
            {isAuthenticated ? (
              <div className="hdr-user-wrap" ref={userMenuRef}>
                <button
                  className="hdr-user-btn"
                  onClick={() => setUserMenuOpen(o => !o)}
                >
                  <div className="hdr-user-avatar">
                    {user?.name ? user.name.slice(0, 2) : <FaUser size={12} />}
                  </div>
                  <span className="hdr-user-name">{user?.name?.split(' ')[0] || 'Account'}</span>
                  <FaChevronDown className={`hdr-chevron ${userMenuOpen ? 'open' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="hdr-dropdown">
                    <div className="hdr-dropdown-header">
                      <div className="hdr-dropdown-name">{user?.name || 'User'}</div>
                      <div className="hdr-dropdown-role">{user?.role || 'customer'}</div>
                    </div>

                    <Link to="/profile" className="hdr-dropdown-item">
                      <FaUser /> My Profile
                    </Link>

                    {user?.role === 'customer' && (
                      <Link to="/orders" className="hdr-dropdown-item">
                        <FaClipboardList /> My Orders
                      </Link>
                    )}

                    {roleDash && (
                      <>
                        <div className="hdr-dropdown-divider" />
                        <Link to={roleDash.to} className="hdr-dropdown-item">
                          {roleDash.icon} {roleDash.label}
                        </Link>
                      </>
                    )}

                    <div className="hdr-dropdown-divider" />
                    <button className="hdr-dropdown-item logout" onClick={handleLogout}>
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="hdr-login-btn">Login</Link>
                <Link to="/register" className="hdr-register-btn">Get Started</Link>
              </>
            )}

            {/* Mobile Hamburger */}
            <button
              className="hdr-hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <FaBars size={16} />
            </button>
          </div>
        </div>

        {/* Orange indicator line */}
        <div className="hdr-indicator" />
      </header>

      {/* ══ MOBILE MENU ═════════════════════════════════════ */}
      <div className={`hdr-mobile ${mobileOpen ? 'open' : ''}`}>
        <div className="hdr-mobile-top">
          <Link to="/" className="hdr-mobile-logo" onClick={() => setMobileOpen(false)}>
            <img src={logo} alt="Mutindo Catering" className="hdr-mobile-logo-img" />
            <div>
              <div className="hdr-mobile-logo-text">Mutindo</div>
              <div className="hdr-mobile-logo-sub">Catering Services</div>
            </div>
          </Link>
          <button className="hdr-mobile-close" onClick={() => setMobileOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <nav className="hdr-mobile-nav">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`hdr-mobile-link ${isActive(link.to) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated && (
            <>
              <div className="hdr-mobile-divider" />
              <Link to="/profile" className="hdr-mobile-link" onClick={() => setMobileOpen(false)}>My Profile</Link>
              {user?.role === 'customer' && (
                <Link to="/orders" className="hdr-mobile-link" onClick={() => setMobileOpen(false)}>My Orders</Link>
              )}
              {roleDash && (
                <Link to={roleDash.to} className="hdr-mobile-link" onClick={() => setMobileOpen(false)}>{roleDash.label}</Link>
              )}
            </>
          )}
        </nav>

        <div className="hdr-mobile-bottom">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)',
                color: 'rgba(255,120,120,0.9)', borderRadius: 4, padding: '14px 18px',
                cursor: 'pointer', fontSize: '0.9rem', display: 'flex',
                alignItems: 'center', gap: 10, justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <FaSignOutAlt /> Logout
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/login" className="hdr-mobile-link" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  background: '#FF6B35', color: '#fff', textDecoration: 'none',
                  borderRadius: 4, padding: '14px 18px', textAlign: 'center',
                  fontWeight: 500, fontSize: '0.9rem',
                }}
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ══ CART DRAWER ════════════════════════════════════ */}
      <Cart show={showCart} handleClose={() => setShowCart(false)} />
    </>
  );
};

export default Header;