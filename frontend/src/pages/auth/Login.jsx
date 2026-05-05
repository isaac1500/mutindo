import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// Logo from public folder
const logo = '/mutindo.jpeg';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(formData);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{loginStyles}</style>
      
      <div className={`login-container ${isVisible ? 'visible' : ''}`}>
        {/* Left Panel - Brand with Logo */}
        <div className="login-brand">
          <div className="login-brand-bg" />
          <div className="login-brand-pattern" />
          <div className="login-brand-content">
            <div className="login-logo-wrapper">
              <div className="login-logo-glow" />
              <img src={logo} alt="Mutindo Catering" className="login-logo" />
            </div>
            <h1 className="login-brand-name">Mutindo</h1>
            <p className="login-brand-tagline">
              Authentic Ugandan flavours,<br />
              delivered with love
            </p>
            
            <div className="login-brand-features">
              <div className="login-feature-item">
                <svg className="login-feature-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                </svg>
                <span>Fresh African cuisine daily</span>
              </div>
              <div className="login-feature-item">
                <svg className="login-feature-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" fill="none" />
                  <path d="M22 6L12 13L2 6" stroke="currentColor" fill="none" />
                </svg>
                <span>MTN & Airtel Mobile Money</span>
              </div>
              <div className="login-feature-item">
                <svg className="login-feature-icon" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" />
                  <path d="M12 6V12L16 14" stroke="currentColor" fill="none" />
                </svg>
                <span>Live GPS order tracking</span>
              </div>
            </div>
            
            <div className="login-brand-quote">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 11H7.5C7.5 9.5 8 8 9 7.5L10 6.5C8.5 7 7.5 8.5 7.5 10.5V13H10V11ZM16 11H13.5C13.5 9.5 14 8 15 7.5L16 6.5C14.5 7 13.5 8.5 13.5 10.5V13H16V11Z" />
              </svg>
              <p>Serving Uganda's finest meals since 2020</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="login-form-panel">
          <div className="login-form-card">
            
            {/* Header */}
            <div className="login-form-header">
              <div className="login-welcome-chip">
                <span>👋</span> Welcome back
              </div>
              <h2 className="login-form-title">Sign in to your account</h2>
              <p className="login-form-subtitle">
                New here?{' '}
                <Link to="/register" className="login-link">
                  Create a free account
                </Link>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="login-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="login-form">
              
              {/* Email Field */}
              <div className="login-field">
                <label className="login-label">Email address</label>
                <div className="login-input-wrapper">
                  <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" fill="none" />
                    <path d="M22 6L12 13L2 6" stroke="currentColor" fill="none" />
                  </svg>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="login-input"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="login-field">
                <label className="login-label">Password</label>
                <div className="login-input-wrapper">
                  <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="11" width="14" height="11" rx="1" stroke="currentColor" fill="none" />
                    <path d="M8 11V8C8 5.8 9.8 4 12 4C14.2 4 16 5.8 16 8V11" stroke="currentColor" fill="none" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="login-input login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-eye-btn"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" fill="none" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" fill="none" />
                        <path d="M3 3L21 21" stroke="currentColor" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" fill="none" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" fill="none" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="login-forgot">
                <Link to="/forgot-password" className="login-forgot-link">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="login-submit-btn"
              >
                {loading ? (
                  <>
                    <span className="login-spinner" />
                    Signing in...
                  </>
                ) : (
                  'Sign In →'
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="login-divider">
              <span className="login-divider-line" />
              {/* <span className="login-divider-text">Or continue with</span> */}
              <span className="login-divider-line" />
            </div>

            {/* Demo Account Note */}
            {/* <div className="login-demo-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>Demo: demo@mutindo.com / password: demo123</span>
            </div> */}

          </div>
        </div>
      </div>
    </>
  );
};

const loginStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .login-container {
    min-height: 100vh;
    display: flex;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .login-container.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── LEFT PANEL (BRAND) ── */
  .login-brand {
    flex: 0 0 45%;
    position: relative;
    background: linear-gradient(135deg, #1a0a00 0%, #2d1500 50%, #0d0d0d 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .login-brand-bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 20%, rgba(255,107,53,0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  .login-brand-pattern {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255,107,53,0.1) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  .login-brand-content {
    position: relative;
    z-index: 2;
    max-width: 380px;
    padding: 3rem;
    text-align: center;
  }

  .login-logo-wrapper {
    position: relative;
    width: 100px;
    height: 100px;
    margin: 0 auto 1.5rem;
  }

  .login-logo-glow {
    position: absolute;
    inset: -4px;
    background: linear-gradient(135deg, #FF6B35, #FF8C42);
    border-radius: 24px;
    opacity: 0.5;
    filter: blur(10px);
    animation: pulse 2s ease-in-out infinite;
  }

  .login-logo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 20px;
    position: relative;
    z-index: 1;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }

  .login-brand-name {
    font-family: 'Playfair Display', serif;
    font-size: 2.5rem;
    font-weight: 800;
    color: #f0ece4;
    margin-bottom: 0.75rem;
    letter-spacing: -0.02em;
  }

  .login-brand-tagline {
    font-family: 'Outfit', sans-serif;
    font-size: 1rem;
    font-weight: 300;
    color: rgba(240,236,228,0.7);
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .login-brand-features {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
    text-align: left;
  }

  .login-feature-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-family: 'Outfit', sans-serif;
    font-size: 0.875rem;
    color: rgba(240,236,228,0.8);
  }

  .login-feature-icon {
    width: 18px;
    height: 18px;
    color: #FF6B35;
    flex-shrink: 0;
  }

  .login-brand-quote {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(240,236,228,0.15);
    margin-top: 1rem;
  }

  .login-brand-quote svg {
    width: 20px;
    height: 20px;
    color: #FF6B35;
    opacity: 0.6;
  }

  .login-brand-quote p {
    font-family: 'Outfit', sans-serif;
    font-size: 0.75rem;
    color: rgba(240,236,228,0.5);
    letter-spacing: 0.5px;
  }

  /* ── RIGHT PANEL (FORM) ── */
  .login-form-panel {
    flex: 1;
    background: #fefcf8;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .login-form-card {
    width: 100%;
    max-width: 440px;
  }

  /* Form Header */
  .login-form-header {
    margin-bottom: 2rem;
    text-align: center;
  }

  .login-welcome-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #fee9e3;
    color: #C94F2C;
    font-family: 'Outfit', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.375rem 1rem;
    border-radius: 50px;
    margin-bottom: 1rem;
  }

  .login-form-title {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 700;
    color: #1a0f0a;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .login-form-subtitle {
    font-family: 'Outfit', sans-serif;
    font-size: 0.875rem;
    color: #7a6a5c;
  }

  .login-link {
    color: #FF6B35;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
  }

  .login-link:hover {
    color: #C94F2C;
    text-decoration: underline;
  }

  /* Error Message */
  .login-error {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #fee9e9;
    border-left: 3px solid #e74c3c;
    padding: 0.875rem 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-family: 'Outfit', sans-serif;
    font-size: 0.8125rem;
    color: #c0392b;
  }

  .login-error svg {
    flex-shrink: 0;
    color: #e74c3c;
  }

  /* Form Fields */
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .login-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .login-label {
    font-family: 'Outfit', sans-serif;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #1a0f0a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .login-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .login-input-icon {
    position: absolute;
    left: 1rem;
    color: #a88e7a;
    pointer-events: none;
  }

  .login-input {
    width: 100%;
    font-family: 'Outfit', sans-serif;
    font-size: 0.9375rem;
    padding: 0.875rem 1rem 0.875rem 2.75rem;
    background: #fff;
    border: 1.5px solid #e8dfd4;
    border-radius: 12px;
    transition: all 0.2s;
    color: #1a0f0a;
  }

  .login-input:focus {
    outline: none;
    border-color: #FF6B35;
    box-shadow: 0 0 0 3px rgba(255,107,53,0.1);
  }

  .login-password-input {
    padding-right: 3rem;
  }

  .login-eye-btn {
    position: absolute;
    right: 1rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #a88e7a;
    padding: 0;
    display: flex;
    align-items: center;
    transition: color 0.2s;
  }

  .login-eye-btn:hover {
    color: #FF6B35;
  }

  .login-forgot {
    text-align: right;
    margin-top: -0.5rem;
  }

  .login-forgot-link {
    font-family: 'Outfit', sans-serif;
    font-size: 0.75rem;
    color: #FF6B35;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .login-forgot-link:hover {
    color: #C94F2C;
    text-decoration: underline;
  }

  /* Submit Button */
  .login-submit-btn {
    width: 100%;
    padding: 0.9375rem;
    background: #FF6B35;
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-size: 0.9375rem;
    font-weight: 600;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .login-submit-btn:hover:not(:disabled) {
    background: #C94F2C;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255,107,53,0.3);
  }

  .login-submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .login-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    display: inline-block;
  }

  /* Divider */
  .login-divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .login-divider-line {
    flex: 1;
    height: 1px;
    background: #e8dfd4;
  }

  .login-divider-text {
    font-family: 'Outfit', sans-serif;
    font-size: 0.75rem;
    color: #a88e7a;
    text-transform: uppercase;
  }

  /* Demo Note */
  .login-demo-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #f8f5f0;
    border-radius: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.6875rem;
    color: #a88e7a;
  }

  .login-demo-note svg {
    flex-shrink: 0;
    color: #FF6B35;
  }

  /* Animations */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.5;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .login-container {
      flex-direction: column;
    }
    
    .login-brand {
      flex: 0 0 auto;
      padding: 2rem;
    }
    
    .login-brand-content {
      padding: 1rem;
    }
    
    .login-form-panel {
      padding: 2rem 1.5rem;
    }
  }
`;

export default Login;