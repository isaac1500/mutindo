import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';

/* ─────────────────────────────────────────────
   STATUS CONFIG (matching Orders.jsx)
───────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending:    { label: 'Pending',          emoji: '⏳', color: '#C8A96E', bg: 'rgba(200,169,110,0.12)', border: 'rgba(200,169,110,0.3)'  },
  confirmed:  { label: 'Confirmed',        emoji: '✅', color: '#6EC8A9', bg: 'rgba(110,200,169,0.12)', border: 'rgba(110,200,169,0.3)'  },
  preparing:  { label: 'Preparing',        emoji: '👨‍🍳', color: '#C8A96E', bg: 'rgba(200,169,110,0.12)', border: 'rgba(200,169,110,0.3)'  },
  ready:      { label: 'Ready for Pickup', emoji: '🍽️', color: '#A96EC8', bg: 'rgba(169,110,200,0.12)', border: 'rgba(169,110,200,0.3)'  },
  picked_up:  { label: 'Picked Up',        emoji: '🛵', color: '#6EA9C8', bg: 'rgba(110,169,200,0.12)', border: 'rgba(110,169,200,0.3)'  },
  on_the_way: { label: 'On The Way',       emoji: '🚗', color: '#C8A96E', bg: 'rgba(200,169,110,0.12)', border: 'rgba(200,169,110,0.3)'  },
  delivered:  { label: 'Delivered',        emoji: '✨', color: '#C8A96E', bg: 'rgba(200,169,110,0.15)', border: 'rgba(200,169,110,0.4)'  },
  cancelled:  { label: 'Cancelled',        emoji: '✕',  color: '#C86E6E', bg: 'rgba(200,110,110,0.12)', border: 'rgba(200,110,110,0.3)'  },
};

/* ─────────────────────────────────────────────
   GLOBAL STYLES (matching Orders.jsx theme)
───────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

  :root {
    --gold:      #C8A96E;
    --gold-dim:  #8a7249;
    --gold-pale: rgba(200,169,110,0.08);
    --obsidian:  #0a0907;
    --deep:      #0f0d0a;
    --surface:   #141209;
    --card-bg:   #181410;
    --border:    rgba(200,169,110,0.15);
    --text:      #e8e0d0;
    --muted:     #7a7060;
    --radius:    16px;
  }

  .chat-dubai {
    font-family: 'Jost', sans-serif;
    font-weight: 300;
    background: var(--obsidian);
    min-height: 100vh;
    color: var(--text);
    position: relative;
    overflow-x: hidden;
  }

  /* Ambient background glow */
  .chat-dubai::before {
    content: '';
    position: fixed;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 500px;
    background: radial-gradient(ellipse, rgba(200,169,110,0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* Chat Card */
  .dxb-chat-card {
    background: var(--card-bg) !important;
    border: 1px solid var(--border) !important;
    border-radius: var(--radius) !important;
    overflow: hidden;
    box-shadow: 0 2px 20px rgba(0,0,0,0.4) !important;
    animation: cardReveal 0.5s ease both;
    display: flex;
    flex-direction: column;
    min-height: 75vh;
    max-height: 85vh;
  }

  @keyframes cardReveal {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Chat Header */
  .dxb-chat-header {
    background: rgba(200,169,110,0.05) !important;
    border-bottom: 1px solid var(--border) !important;
    padding: 1rem 1.5rem !important;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .dxb-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .dxb-back-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(200,169,110,0.1);
    border: 1px solid var(--border);
    color: var(--gold);
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .dxb-back-btn:hover {
    background: rgba(200,169,110,0.2);
    border-color: var(--gold);
    transform: translateX(-2px);
  }

  .dxb-header-avatar {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(200,169,110,0.12);
    border: 1px solid rgba(200,169,110,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  .dxb-header-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--gold);
    letter-spacing: 0.02em;
  }

  .dxb-header-sub {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-top: 2px;
  }

  /* Status Badge */
  .dxb-status-badge {
    font-size: 10px !important;
    font-weight: 500 !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    padding: 5px 12px !important;
    border-radius: 20px !important;
  }

  /* Order Strip */
  .dxb-order-strip {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid var(--border);
    background: rgba(200,169,110,0.03);
    flex-shrink: 0;
  }

  .dxb-strip-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.04em;
  }

  .dxb-strip-icon {
    font-size: 12px;
  }

  .dxb-strip-divider {
    width: 1px;
    height: 12px;
    background: var(--border);
  }

  /* Messages Area */
  .dxb-msg-area {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background: var(--surface);
  }

  /* Date Separator */
  .dxb-date-sep {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 1.5rem 0 1rem;
  }

  .dxb-date-line {
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .dxb-date-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    background: var(--surface);
    padding: 0 8px;
  }

  /* Message Row */
  .msg-item {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    animation: messagePop 0.25s ease both;
  }

  @keyframes messagePop {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .msg-item.is-mine {
    justify-content: flex-end;
  }

  .msg-item.is-theirs {
    justify-content: flex-start;
  }

  /* Avatar */
  .dxb-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;
    background: rgba(200,169,110,0.12);
    border: 1px solid rgba(200,169,110,0.2);
    color: var(--gold);
  }

  .dxb-avatar-hidden {
    opacity: 0;
    visibility: hidden;
  }

  /* Sender Name */
  .dxb-sender-name {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold-dim);
    margin-bottom: 4px;
    padding-left: 4px;
  }

  /* Message Content */
  .dxb-message-content {
    max-width: 68%;
  }

  /* Bubbles */
  .dxb-bubble-mine {
    background: linear-gradient(135deg, rgba(200,169,110,0.15), rgba(200,169,110,0.08));
    border: 1px solid rgba(200,169,110,0.3);
    border-radius: 18px 18px 4px 18px;
    padding: 10px 14px;
  }

  .dxb-bubble-theirs {
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 18px 18px 18px 4px;
    padding: 10px 14px;
  }

  .dxb-bubble-text {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--text);
    font-weight: 400;
    word-break: break-word;
  }

  .dxb-bubble-meta {
    font-size: 9px;
    letter-spacing: 0.05em;
    margin-top: 6px;
    color: var(--muted);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
  }

  .dxb-bubble-meta.text-end {
    justify-content: flex-end;
  }

  /* Empty State */
  .dxb-empty-chat {
    text-align: center;
    padding: 4rem 2rem;
  }

  .dxb-empty-icon {
    font-size: 3rem;
    opacity: 0.3;
    margin-bottom: 1rem;
  }

  .dxb-empty-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.3rem;
    font-weight: 400;
    color: var(--text);
    margin-bottom: 0.5rem;
  }

  .dxb-empty-sub {
    font-size: 12px;
    color: var(--muted);
    max-width: 280px;
    margin: 0 auto;
    letter-spacing: 0.04em;
  }

  /* Input Area */
  .dxb-input-area {
    padding: 1rem 1.5rem 1.25rem;
    border-top: 1px solid var(--border);
    background: var(--card-bg);
    flex-shrink: 0;
  }

  .dxb-input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid var(--border);
    border-radius: 40px;
    padding: 6px 6px 6px 1.25rem;
    background: rgba(200,169,110,0.03);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .dxb-input-wrap:focus-within {
    border-color: var(--gold);
    box-shadow: 0 0 0 2px rgba(200,169,110,0.15);
  }

  .dxb-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: var(--text);
    padding: 8px 0;
  }

  .dxb-input::placeholder {
    color: var(--muted);
    font-weight: 300;
  }

  .dxb-send-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: rgba(200,169,110,0.2);
    color: var(--gold);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .dxb-send-btn:hover:not(:disabled) {
    background: var(--gold);
    color: var(--obsidian);
    transform: scale(1.05);
  }

  .dxb-send-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .dxb-input-hint {
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    text-align: center;
    margin-top: 10px;
  }

  /* Loading Spinner */
  .dxb-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 1.5rem;
  }

  .dxb-loading .spinner-border {
    color: var(--gold) !important;
    width: 32px;
    height: 32px;
    border-width: 1.5px;
  }

  .dxb-loading p {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0;
  }

  /* Scrollbar */
  .dxb-msg-area::-webkit-scrollbar {
    width: 4px;
  }

  .dxb-msg-area::-webkit-scrollbar-track {
    background: transparent;
  }

  .dxb-msg-area::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
  }
`;

const Chat = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [order, setOrder] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const userId = user?.id;

  // Fetch messages when component mounts or orderId changes
  useEffect(() => {
    fetchOrderDetails();
    fetchMessages();
    
    // Set up polling to check for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch {
      toast.error('Failed to load order details');
      navigate('/orders');
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/${orderId}`);
      const fetchedMessages = res.data.messages || [];
      
      // Only update if messages have changed
      if (JSON.stringify(fetchedMessages) !== JSON.stringify(messages)) {
        setMessages(fetchedMessages);
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      const res = await api.post(`/chat/${orderId}`, { message: newMessage.trim() });
      
      // Add the new message to the list
      if (res.data && res.data.message) {
        setMessages(prev => [...prev, res.data.message]);
        setNewMessage('');
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const getStatusStyle = () => {
    const st = STATUS_CONFIG[order?.status] || STATUS_CONFIG.pending;
    return {
      background: st.bg,
      color: st.color,
      border: `1px solid ${st.border}`
    };
  };

  const getStatusLabel = () => {
    const st = STATUS_CONFIG[order?.status] || STATUS_CONFIG.pending;
    return `${st.emoji} ${st.label}`;
  };

  const formatCurrency = (amount) => {
    return `UGX ${Number(amount).toLocaleString()}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const getRoleIcon = (role) => {
    if (role === 'admin') return '⚙';
    if (role === 'rider') return '🛵';
    return '👤';
  };

  const getAvatarContent = (msg, idx, msgs) => {
    const showAvatar = idx === 0 || msgs[idx - 1]?.senderId !== msg.senderId;
    if (!showAvatar) return '';
    return msg.senderName ? getInitials(msg.senderName) : getRoleIcon(msg.senderRole);
  };

  const shouldShowAvatar = (msg, idx, msgs) => {
    return idx === 0 || msgs[idx - 1]?.senderId !== msg.senderId;
  };

  const shouldShowSenderName = (msg, idx, msgs) => {
    return idx === 0 || msgs[idx - 1]?.senderId !== msg.senderId;
  };

  // Group messages by date
  const groupedMessages = () => {
    const groups = {};
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp).toLocaleDateString('en-UG', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return Object.entries(groups);
  };

  if (loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="chat-dubai">
          <div className="container">
            <div className="dxb-loading">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading conversation…</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="chat-dubai">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="dxb-chat-card">
            {/* Header */}
            <div className="dxb-chat-header">
              <div className="dxb-header-left">
                <button className="dxb-back-btn" onClick={() => navigate('/orders')}>
                  ←
                </button>
                <div className="dxb-header-avatar">🍽</div>
                <div>
                  <div className="dxb-header-title">
                    Order #{orderId?.slice(0, 8).toUpperCase()}
                  </div>
                  <div className="dxb-header-sub">Mutindo Support Chat</div>
                </div>
              </div>
              <div className="dxb-status-badge" style={getStatusStyle()}>
                {getStatusLabel()}
              </div>
            </div>

            {/* Order summary strip */}
            {order && (
              <div className="dxb-order-strip">
                <span className="dxb-strip-item">
                  <span className="dxb-strip-icon">📦</span>
                  {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                </span>
                <span className="dxb-strip-divider" />
                <span className="dxb-strip-item">
                  <span className="dxb-strip-icon">💰</span>
                  {formatCurrency(order.totalAmount || order.total || 0)}
                </span>
                <span className="dxb-strip-divider" />
                <span className="dxb-strip-item">
                  <span className="dxb-strip-icon">📍</span>
                  {(order.deliveryAddress || 'No address').slice(0, 28)}…
                </span>
              </div>
            )}

            {/* Messages Area */}
            <div className="dxb-msg-area">
              {messages.length === 0 ? (
                <div className="dxb-empty-chat">
                  <div className="dxb-empty-icon">💬</div>
                  <div className="dxb-empty-title">No messages yet</div>
                  <div className="dxb-empty-sub">
                    Start the conversation — ask about your order, delivery time, or anything else.
                  </div>
                </div>
              ) : (
                groupedMessages().map(([date, msgs]) => (
                  <div key={date}>
                    {/* Date separator */}
                    <div className="dxb-date-sep">
                      <span className="dxb-date-line" />
                      <span className="dxb-date-label">{date}</span>
                      <span className="dxb-date-line" />
                    </div>

                    {msgs.map((msg, idx) => {
                      const isMine = msg.senderId === userId;
                      const showAvatar = shouldShowAvatar(msg, idx, msgs);
                      const showSenderName = shouldShowSenderName(msg, idx, msgs);

                      return (
                        <div
                          key={idx}
                          className={`msg-item ${isMine ? 'is-mine' : 'is-theirs'}`}
                          style={{
                            marginBottom: idx < msgs.length - 1 && msgs[idx + 1]?.senderId === msg.senderId
                              ? 4 : 12,
                          }}
                        >
                          {/* Avatar for others */}
                          {!isMine && (
                            <div 
                              className={`dxb-avatar ${!showAvatar ? 'dxb-avatar-hidden' : ''}`}
                              style={{
                                background: msg.senderRole === 'rider' ? 'rgba(110,169,200,0.12)' : 'rgba(200,169,110,0.12)',
                                color: msg.senderRole === 'rider' ? '#6EA9C8' : 'var(--gold)',
                              }}
                            >
                              {showAvatar && getAvatarContent(msg, idx, msgs)}
                            </div>
                          )}

                          <div className="dxb-message-content">
                            {/* Sender name */}
                            {!isMine && showSenderName && (
                              <div className="dxb-sender-name">
                                {getRoleIcon(msg.senderRole)} {msg.senderName || 'Support'}
                              </div>
                            )}

                            {/* Bubble */}
                            <div className={isMine ? 'dxb-bubble-mine' : 'dxb-bubble-theirs'}>
                              <p className="dxb-bubble-text">{msg.message}</p>
                              <div className={`dxb-bubble-meta ${isMine ? 'text-end' : ''}`}>
                                {formatTime(msg.timestamp)}
                                {isMine && <span>✓✓</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="dxb-input-area">
              <form onSubmit={sendMessage}>
                <div className="dxb-input-wrap">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Type a message… (Enter to send)"
                    disabled={sending}
                    className="dxb-input"
                  />
                  <button
                    type="submit"
                    className="dxb-send-btn"
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? (
                      <div style={{ width: 16, height: 16, border: '2px solid rgba(200,169,110,0.3)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="dxb-input-hint">
                  Powered by Mutindo Support · responses usually within minutes
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default Chat;