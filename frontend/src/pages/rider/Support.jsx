import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const T = {
  bg0:      '#0f0d0b',
  bg1:      '#161210',
  bg2:      '#1e1a14',
  bg3:      '#26201a',
  border:   '#2a2218',
  amber:    '#c97a2a',
  amberDim: '#7a4a1a',
  text:     '#f0e6d4',
  textMid:  '#c8bca8',
  textDim:  '#6b5e4a',
  textFaint:'#5a4e3e',
  green:    '#25D366',
  greenDim: '#0a2a1a',
  blue:     '#3a90d4',
  blueDim:  '#0a1a2a',
  mono:     "'Space Mono', monospace",
  sans:     "'Inter', sans-serif",
  serif:    "'DM Serif Display', serif",
};

const FAQ_ITEMS = [
  {
    question: "How do I get assigned to orders?",
    answer: "When you're ONLINE, nearby orders that are READY for pickup will appear in the 'Available Orders' section. You can accept any order you see there."
  },
  {
    question: "How much do I earn per delivery?",
    answer: "Base delivery fee is UGX 5,000 per order. You keep 100% of the delivery fee."
  },
  {
    question: "When do I get paid?",
    answer: "Earnings are calculated daily. Withdrawals can be requested every Monday and Thursday."
  },
  {
    question: "What if I can't complete a delivery?",
    answer: "Contact support immediately via WhatsApp or call. Don't cancel on your own."
  }
];

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div style={{ borderBottom: `1px solid ${T.border}`, padding: '16px 0' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'transparent',
          border: 'none',
          color: T.text,
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          padding: '8px 0',
          fontFamily: T.sans,
          textAlign: 'left',
        }}
      >
        {question}
        <span style={{ fontSize: 20, color: T.amber }}>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div style={{ paddingTop: 12, color: T.textDim, fontSize: 13, lineHeight: 1.6 }}>
          {answer}
        </div>
      )}
    </div>
  );
}

const Support = () => {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // UPDATE THESE WITH YOUR ACTUAL NUMBERS
  const WHATSAPP_NUMBER = "256700000000"; // Change to your WhatsApp number
  const PHONE_NUMBER = "+256700000000"; // Change to your phone number

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Mutindo%20Support%2C%20I%20need%20help%20with%20my%20delivery`;
  const callLink = `tel:${PHONE_NUMBER}`;

  return (
    <div style={{ background: T.bg0, minHeight: '100vh', fontFamily: T.sans }}>
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ borderBottom: `1px solid ${T.border}`, background: T.bg1, padding: '16px 24px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.text, margin: 0 }}>
              Mutindo<span style={{ color: T.amber }}>Kitchen</span>
            </h1>
            <p style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>Rider Support Center</p>
          </div>
          <button
            onClick={() => navigate('/rider/dashboard')}
            style={{
              background: T.bg2,
              border: `1px solid ${T.border}`,
              padding: '8px 20px',
              borderRadius: 40,
              color: T.textMid,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: T.sans,
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </motion.div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        
        {/* Emergency Contact Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'linear-gradient(135deg, #1a0a00, #3d1a00)',
            borderRadius: 20,
            padding: '28px 32px',
            marginBottom: 32,
            textAlign: 'center',
            border: `1px solid ${T.amber}40`,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚨</div>
          <h2 style={{ fontFamily: T.serif, fontSize: 24, color: T.text, marginBottom: 8 }}>
            Urgent Delivery Issue?
          </h2>
          <p style={{ color: T.textDim, fontSize: 13, marginBottom: 20 }}>
            For immediate assistance with active deliveries, contact us directly
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: T.green,
                padding: '12px 28px',
                borderRadius: 50,
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <span style={{ fontSize: 20 }}>📱</span> WhatsApp Support
            </a>
            <a
              href={callLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: T.blue,
                padding: '12px 28px',
                borderRadius: 50,
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <span style={{ fontSize: 20 }}>📞</span> Call Support
            </a>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ background: T.bg2, borderBottom: `1px solid ${T.border}`, padding: '20px 24px' }}>
            <span style={{ fontWeight: 600, color: T.text, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              ❓ Frequently Asked Questions
            </span>
          </div>
          <div style={{ padding: '8px 24px 20px' }}>
            {FAQ_ITEMS.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openFAQ === index}
                onToggle={() => toggleFAQ(index)}
              />
            ))}
          </div>
        </div>

        {/* Office Hours */}
        <div style={{ 
          marginTop: 24, 
          textAlign: 'center', 
          fontSize: 11, 
          color: T.textFaint,
          padding: '16px',
          borderTop: `1px solid ${T.border}`,
        }}>
          <p>Support Hours: Monday - Saturday, 8:00 AM - 8:00 PM</p>
          <p style={{ marginTop: 6 }}>📍 Mutindo Catering HQ, Kampala, Uganda</p>
        </div>
      </div>
    </div>
  );
};

export default Support;