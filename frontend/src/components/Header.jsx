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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (cartItemCount > prevCount.current) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 600);
    }
    prevCount.current = cartItemCount;
  }, [cartItemCount]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .hdr-root {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.4s ease, box-shadow 0.4s ease;
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
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* Tablet screens */
        @media (max-width: 992px) {
          .hdr-inner {
            padding: 0 20px;
          }
        }

        /* Mobile screens - hamburger appears here */
        @media (max-width: 768px) {
          .hdr-inner {
            padding: 0 16px;
            height: 60px;
          }
        }

        /* Small phones */
        @media (max-width: 480px) {
          .hdr-inner {
            padding: 0 12px;
            height: 56px;
            gap: 8px;
          }
        }

        /* ── BRAND WITH LOGO ── */
        .hdr-brand {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        
        .hdr-logo-container {
          position: relative;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
        }
        
        @media (max-width: 480px) {
          .hdr-logo-container {
            width: 32px;
            height: 32px;
          }
        }
        
        .hdr-logo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }
        
        .hdr-brand-text-container {
          display: flex;
          flex-direction: column;
        }
        
        .hdr-brand-text {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          font-weight: 900;
          color: #f0ece4;
          line-height: 1.1;
        }
        
        .hdr-brand-sub {
          font-size: 0.55rem;
          font-weight: 400;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(240,236,228,0.4);
          margin-top: 2px;
        }
        
        @media (max-width: 480px) {
          .hdr-brand-text {
            font-size: 0.85rem;
          }
          .hdr-brand-sub {
            font-size: 0.45rem;
            letter-spacing: 1px;
          }
        }

        /* ── DESKTOP NAV (hidden on mobile/tablet) ── */
        .hdr-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 0;
          flex: 1;
        }
        
        /* Hide desktop nav on screens smaller than 768px */
        @media (max-width: 768px) { 
          .hdr-nav { 
            display: none; 
          } 
        }

        .hdr-nav-link {
          position: relative;
          padding: 8px 14px;
          font-size: 0.85rem;
          font-weight: 500;
          color: rgba(240,236,228,0.75);
          text-decoration: none;
          white-space: nowrap;
        }
        
        .hdr-nav-link.active { 
          color: #FF6B35; 
          font-weight: 600;
        }

        /* ── RIGHT ACTIONS ── */
        .hdr-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        
        @media (max-width: 480px) {
          .hdr-actions {
            gap: 4px;
          }
        }

        /* ── CART BUTTON ── */
        .hdr-cart-btn {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 4px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(240,236,228,0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        
        @media (max-width: 480px) {
          .hdr-cart-btn {
            width: 36px;
            height: 36px;
          }
        }
        
        .hdr-cart-btn:hover {
          background: rgba(255,107,53,0.12);
          border-color: rgba(255,107,53,0.4);
          color: #FF6B35;
        }

        .hdr-cart-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 18px;
          height: 18px;
          background: #FF6B35;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 600;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid #0d0d0d;
        }

        /* ── USER BUTTON ── */
        .hdr-user-wrap { 
          position: relative; 
        }

        .hdr-user-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px 5px 5px;
          border-radius: 4px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
        }
        
        @media (max-width: 480px) {
          .hdr-user-btn {
            padding: 5px 6px 5px 5px;
          }
        }
        
        .hdr-user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 3px;
          background: linear-gradient(135deg, #FF6B35, #ff9a70);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
        }
        
        .hdr-user-name {
          font-size: 0.8rem;
          font-weight: 500;
          color: #f0ece4;
        }
        
        /* Hide user name on very small screens */
        @media (max-width: 500px) {
          .hdr-user-name {
            display: none;
          }
        }
        
        .hdr-chevron {
          font-size: 0.6rem;
          opacity: 0.6;
          transition: transform 0.2s;
        }
        
        /* Hide chevron on very small screens */
        @media (max-width: 500px) {
          .hdr-chevron {
            display: none;
          }
        }
        
        .hdr-chevron.open { 
          transform: rotate(180deg); 
        }

        /* ── AUTH BUTTONS ── */
        .hdr-login-btn {
          padding: 7px 14px;
          font-size: 0.8rem;
          color: rgba(240,236,228,0.65);
          text-decoration: none;
          white-space: nowrap;
        }
        
        @media (max-width: 480px) {
          .hdr-login-btn {
            padding: 6px 10px;
            font-size: 0.75rem;
          }
          .hdr-register-btn {
            padding: 6px 12px;
            font-size: 0.75rem;
          }
        }
        
        .hdr-register-btn {
          padding: 7px 16px;
          font-size: 0.8rem;
          font-weight: 500;
          color: #fff;
          background: #FF6B35;
          text-decoration: none;
          white-space: nowrap;
          border-radius: 4px;
        }

        /* ── MOBILE HAMBURGER (SHOWS ON 768px AND BELOW) ── */
        .hdr-hamburger {
          display: none;
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          color: rgba(240,236,228,0.75);
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        
        /* Hamburger appears on tablet and mobile (768px and below) */
        @media (max-width: 768px) { 
          .hdr-hamburger { 
            display: flex; 
          } 
        }
        
        @media (max-width: 480px) {
          .hdr-hamburger {
            width: 36px;
            height: 36px;
          }
        }
        
        .hdr-hamburger:hover { 
          background: rgba(255,107,53,0.1);
          border-color: rgba(255,107,53,0.3);
          color: #FF6B35;
        }

        /* ── MOBILE MENU ── */
        .hdr-mobile {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
          display: flex;
          flex-direction: column;
          background: #0d0d0d;
          transform: translateX(100%);
          transition: transform 0.35s ease;
        }
        
        .hdr-mobile.open { 
          transform: translateX(0); 
        }

        .hdr-mobile-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        
        @media (max-width: 480px) {
          .hdr-mobile-top {
            padding: 14px 16px;
          }
        }
        
        .hdr-mobile-logo {
          display: flex;
          align-items: center;
          gap: 10px;
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
        
        .hdr-mobile-close {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          color: rgba(240,236,228,0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .hdr-mobile-nav {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        @media (max-width: 480px) {
          .hdr-mobile-nav {
            padding: 16px;
          }
        }

        .hdr-mobile-link {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          font-size: 1rem;
          color: rgba(240,236,228,0.65);
          text-decoration: none;
          border-radius: 4px;
        }
        
        .hdr-mobile-link.active {
          background: rgba(255,107,53,0.08);
          color: #FF6B35;
        }

        .hdr-mobile-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 12px 0;
        }

        .hdr-mobile-bottom {
          padding: 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        @media (max-width: 480px) {
          .hdr-mobile-bottom {
            padding: 16px;
          }
        }

        /* Dropdown menu */
        .hdr-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          min-width: 220px;
          background: #181818;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          overflow: hidden;
          z-index: 100;
        }

        .hdr-dropdown-header {
          padding: 14px 18px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        
        .hdr-dropdown-name {
          font-weight: 500;
          color: #f0ece4;
          font-size: 0.85rem;
        }
        
        .hdr-dropdown-role {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: #FF6B35;
          margin-top: 2px;
        }

        .hdr-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          font-size: 0.85rem;
          color: rgba(240,236,228,0.65);
          text-decoration: none;
          cursor: pointer;
        }
        
        .hdr-dropdown-item:hover {
          background: rgba(255,107,53,0.08);
          color: #f0ece4;
        }
        
        .hdr-dropdown-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 4px 0;
        }
        
        .hdr-dropdown-item.logout { 
          color: rgba(255,100,100,0.75);
        }

        .hdr-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,107,53,0.4), transparent);
          opacity: 0;
        }
        
        .hdr-root.scrolled .hdr-indicator { 
          opacity: 1; 
        }

        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes cartBounce {
          0%, 100% { transform: scale(1); }
          30% { transform: scale(1.3); }
          60% { transform: scale(0.9); }
        }
        
        @keyframes badgePop {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>

      <header className={`hdr-root ${scrolled ? 'scrolled' : 'top'}`}>
        <div className="hdr-inner">

          <Link to="/" className="hdr-brand">
            <div className="hdr-logo-container">
              <img src={logo} alt="Mutindo Catering" className="hdr-logo" />
            </div>
            <div className="hdr-brand-text-container">
              <div className="hdr-brand-text">Mutindo</div>
              <div className="hdr-brand-sub">Catering Services</div>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile/tablet */}
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

          <div className="hdr-actions">
            <button
              className={`hdr-cart-btn ${cartBounce ? 'bounce' : ''}`}
              onClick={() => setShowCart(true)}
            >
              <FaShoppingCart size={16} />
              {cartItemCount > 0 && (
                <span className="hdr-cart-badge">{cartItemCount}</span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="hdr-user-wrap" ref={userMenuRef}>
                <button className="hdr-user-btn" onClick={() => setUserMenuOpen(o => !o)}>
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

                    <Link to="/profile" className="hdr-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <FaUser /> My Profile
                    </Link>

                    {user?.role === 'customer' && (
                      <Link to="/orders" className="hdr-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <FaClipboardList /> My Orders
                      </Link>
                    )}

                    {roleDash && (
                      <>
                        <div className="hdr-dropdown-divider" />
                        <Link to={roleDash.to} className="hdr-dropdown-item" onClick={() => setUserMenuOpen(false)}>
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
                <Link to="/register" className="hdr-register-btn">Sign Up</Link>
              </>
            )}

            {/* Hamburger - shows on screens 768px and below */}
            <button className="hdr-hamburger" onClick={() => setMobileOpen(true)}>
              <FaBars size={16} />
            </button>
          </div>
        </div>
        <div className="hdr-indicator" />
      </header>

      {/* Mobile Menu */}
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
            <button onClick={handleLogout} style={{
              background: 'rgba(255,100,100,0.1)',
              border: '1px solid rgba(255,100,100,0.2)',
              color: 'rgba(255,120,120,0.9)',
              borderRadius: 4,
              padding: '14px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}>
              <FaSignOutAlt /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="hdr-mobile-link" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
                Login
              </Link>
              <Link to="/register" style={{
                background: '#FF6B35',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 4,
                padding: '14px',
                textAlign: 'center',
                fontWeight: 500,
              }} onClick={() => setMobileOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      <Cart show={showCart} handleClose={() => setShowCart(false)} />
    </>
  );
};

export default Header;