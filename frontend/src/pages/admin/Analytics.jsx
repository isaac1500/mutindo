import React, { useState, useEffect, useRef } from 'react';
import {
  FaDownload, FaShoppingBag, FaMoneyBillWave,
  FaChartLine, FaUtensils, FaSyncAlt, FaArrowUp, FaArrowDown, FaMedal
} from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatCurrency';
import api from '../../services/api';
import { toast } from 'react-toastify';

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --bg:         #0c0c0c;
    --surface:    #161616;
    --surface2:   #1e1e1e;
    --surface3:   #262626;
    --border:     #2a2a2a;
    --gold:       #c9a84c;
    --gold-dim:   #7a5e22;
    --gold-glow:  rgba(201,168,76,0.1);
    --gold-light: #e8c96b;
    --text:       #f0ece4;
    --text-dim:   #6a6660;
    --text-mid:   #a09890;
    --green:      #45a876;
    --green-bg:   rgba(69,168,118,0.1);
    --red:        #d95555;
    --red-bg:     rgba(217,85,85,0.1);
    --blue:       #5482d9;
    --amber:      #d9943a;
    --teal:       #38a89d;
    --violet:     #8b6bd9;
    --radius:     14px;
    --radius-sm:  8px;
    --transition: 0.22s cubic-bezier(0.4,0,0.2,1);
    --mono:       'DM Mono', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .an-root {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    padding: 32px 40px 60px;
  }

  /* ─── Header ─── */
  .an-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
    padding-bottom: 28px;
    margin-bottom: 36px;
  }
  .an-eyebrow {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 500;
    margin-bottom: 6px;
  }
  .an-title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .an-subtitle { color: var(--text-dim); font-size: 13px; margin-top: 4px; }

  .an-controls { display: flex; align-items: center; gap: 10px; }

  /* Range Tabs */
  .an-range-tabs {
    display: flex;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }
  .an-range-tab {
    padding: 8px 18px;
    background: transparent;
    border: none;
    color: var(--text-dim);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition);
    border-right: 1px solid var(--border);
  }
  .an-range-tab:last-child { border-right: none; }
  .an-range-tab:hover { color: var(--text); background: var(--surface2); }
  .an-range-tab.active { background: var(--gold); color: #0c0c0c; }

  /* Export Button */
  .an-export-btn {
    display: flex; align-items: center; gap: 7px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-mid);
    padding: 9px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition);
  }
  .an-export-btn:hover { border-color: var(--gold-dim); color: var(--gold); }

  /* ─── KPI Row ─── */
  .an-kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .an-kpi {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 22px 24px;
    position: relative;
    overflow: hidden;
    transition: border-color var(--transition);
    animation: fadeUp 0.4s ease both;
  }
  .an-kpi:hover { border-color: var(--gold-dim); }
  .an-kpi::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    background: var(--kpi-color, var(--gold));
    opacity: 0.6;
  }

  .an-kpi-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .an-kpi-label svg { color: var(--kpi-color, var(--gold)); }

  .an-kpi-value {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
    line-height: 1;
    color: var(--text);
    margin-bottom: 10px;
  }
  .an-kpi-value.mono {
    font-family: var(--mono);
    font-size: 22px;
    letter-spacing: -0.5px;
  }

  .an-kpi-delta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 100px;
  }
  .an-kpi-delta.up   { background: var(--green-bg); color: var(--green); }
  .an-kpi-delta.down { background: var(--red-bg);   color: var(--red);   }

  /* ─── Main Grid ─── */
  .an-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 20px;
    margin-bottom: 20px;
  }

  /* ─── Panel ─── */
  .an-panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    animation: fadeUp 0.4s ease both;
  }
  .an-panel-head {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .an-panel-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 500;
  }
  .an-panel-tag {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-dim);
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 3px 10px;
  }
  .an-panel-body { padding: 24px; }

  /* ─── SVG Revenue Chart ─── */
  .an-chart-wrap {
    position: relative;
    height: 220px;
  }
  .an-chart-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .an-chart-grid line { stroke: var(--border); stroke-dasharray: 4 4; }
  .an-chart-area { fill: url(#areaGrad); }
  .an-chart-line { fill: none; stroke: var(--gold); stroke-width: 2; stroke-linejoin: round; }
  .an-chart-dot {
    fill: var(--bg);
    stroke: var(--gold);
    stroke-width: 2;
    cursor: pointer;
    transition: r 0.15s ease;
  }
  .an-chart-dot:hover { r: 5; }
  .an-chart-label { fill: var(--text-dim); font-size: 10px; font-family: 'DM Sans', sans-serif; }
  .an-chart-peak-label { fill: var(--gold); font-size: 10px; font-family: var(--mono); }

  /* Tooltip */
  .an-tooltip {
    position: absolute;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    pointer-events: none;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    transition: opacity 0.1s;
  }
  .an-tooltip-label { color: var(--text-dim); font-size: 10px; margin-bottom: 2px; }
  .an-tooltip-val   { color: var(--gold); font-family: var(--mono); font-weight: 500; }

  /* ─── Pie-ish: Donut Ring ─── */
  .an-donut-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .an-donut-svg { overflow: visible; }
  .an-donut-legend { width: 100%; display: flex; flex-direction: column; gap: 8px; }
  .an-donut-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }
  .an-donut-item-left { display: flex; align-items: center; gap: 8px; }
  .an-donut-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
  .an-donut-name { color: var(--text-mid); }
  .an-donut-pct  { font-family: var(--mono); font-size: 11px; color: var(--text-dim); }

  /* ─── Bottom Row ─── */
  .an-bottom-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  /* ─── Bar Chart (horizontal) ─── */
  .an-hbar-list { display: flex; flex-direction: column; gap: 14px; }
  .an-hbar-item {}
  .an-hbar-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 5px;
  }
  .an-hbar-rank {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--gold-dim);
    margin-right: 6px;
  }
  .an-hbar-name { font-size: 13px; color: var(--text); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .an-hbar-qty  { font-family: var(--mono); font-size: 12px; color: var(--text-dim); }
  .an-hbar-track {
    height: 4px;
    background: var(--surface3);
    border-radius: 2px;
    overflow: hidden;
  }
  .an-hbar-fill {
    height: 100%;
    border-radius: 2px;
    background: var(--gold);
    transform-origin: left;
    animation: barGrow 0.8s cubic-bezier(0.4,0,0.2,1) both;
  }
  @keyframes barGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  .an-hbar-rev {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 3px;
    text-align: right;
  }

  /* ─── Category Table ─── */
  .an-cat-table { width: 100%; border-collapse: collapse; }
  .an-cat-table thead th {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-dim);
    padding: 0 0 14px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }
  .an-cat-table thead th:not(:first-child) { text-align: right; }
  .an-cat-table tbody tr {
    border-bottom: 1px solid var(--border);
    transition: background var(--transition);
  }
  .an-cat-table tbody tr:last-child { border-bottom: none; }
  .an-cat-table tbody tr:hover { background: var(--surface2); }
  .an-cat-table td {
    padding: 12px 0;
    font-size: 13px;
  }
  .an-cat-table td:not(:first-child) { text-align: right; font-family: var(--mono); font-size: 12px; }
  .an-cat-name { font-weight: 500; }
  .an-cat-pill {
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 2px;
    margin-right: 8px;
    vertical-align: middle;
  }
  .an-cat-bar-cell { padding-right: 0; }
  .an-cat-bar-wrap { display: flex; align-items: center; gap: 10px; }
  .an-cat-mini-track { flex: 1; height: 3px; background: var(--surface3); border-radius: 2px; }
  .an-cat-mini-fill  { height: 100%; border-radius: 2px; animation: barGrow 0.8s cubic-bezier(0.4,0,0.2,1) both; }

  /* ─── Loading ─── */
  .an-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 60vh; gap: 16px; color: var(--text-dim);
  }
  .an-spinner {
    width: 36px; height: 36px;
    border: 2px solid var(--border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ─── Constants ─────────────────────────────────────────────────────────── */
const CAT_COLORS = ['#c9a84c', '#45a876', '#5482d9', '#d9943a', '#8b6bd9', '#38a89d'];

const MOCK = {
  summary: { totalOrders: 156, totalRevenue: 2450000, averageOrderValue: 15705, totalItemsSold: 423 },
  revenue: [
    { period: 'Mon', amount: 125000 }, { period: 'Tue', amount: 189000 },
    { period: 'Wed', amount: 156000 }, { period: 'Thu', amount: 210000 },
    { period: 'Fri', amount: 278000 }, { period: 'Sat', amount: 325000 },
    { period: 'Sun', amount: 298000 },
  ],
  popularItems: [
    { name: 'Rolex (Chapati & Eggs)', quantity: 67, revenue: 335000 },
    { name: 'Matooke with Beef',      quantity: 45, revenue: 540000 },
    { name: 'Chicken Pilau',          quantity: 38, revenue: 570000 },
    { name: 'Ugandan Samosa',         quantity: 52, revenue: 156000 },
    { name: 'Grilled Tilapia',        quantity: 28, revenue: 700000 },
    { name: 'Posho & Beans',          quantity: 35, revenue: 175000 },
  ],
  categorySales: [
    { category: 'Mains',          quantity: 66,  revenue: 1250000 },
    { category: 'Local Specials', quantity: 112, revenue: 896000  },
    { category: 'Starters',       quantity: 52,  revenue: 156000  },
    { category: 'Breads',         quantity: 43,  revenue: 129000  },
  ],
};

/* ─── SVG Sparkline Revenue Chart ──────────────────────────────────────── */
const RevenueChart = ({ data }) => {
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  if (!data?.length) return null;

  const W = 600, H = 200, PAD = { top: 20, right: 20, bottom: 30, left: 10 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const maxAmt  = Math.max(...data.map(d => d.amount));
  const xStep   = iW / (data.length - 1 || 1);
  const yScale  = (v) => iH - (v / maxAmt) * iH;

  const points  = data.map((d, i) => ({ x: PAD.left + i * xStep, y: PAD.top + yScale(d.amount), ...d }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length-1].x},${PAD.top + iH} L${PAD.left},${PAD.top + iH} Z`;

  const gridLines = [0.25, 0.5, 0.75, 1].map(f => PAD.top + iH * (1 - f));
  const peakIdx   = points.reduce((best, p, i) => p.amount > points[best].amount ? i : best, 0);

  const handleMouseMove = (e, p) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({ x: p.x / W * 100, y: (p.y - 20) / H * 100, period: p.period, amount: p.amount });
  };

  return (
    <div className="an-chart-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="an-chart-svg"
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#c9a84c" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <g className="an-chart-grid">
          {gridLines.map((y, i) => (
            <line key={i} x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} />
          ))}
        </g>

        {/* Area + Line */}
        <path className="an-chart-area" d={areaPath} />
        <path className="an-chart-line" d={linePath} />

        {/* Peak callout */}
        <text className="an-chart-peak-label" x={points[peakIdx].x} y={points[peakIdx].y - 12} textAnchor="middle">
          {formatCurrency(points[peakIdx].amount)}
        </text>

        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            className="an-chart-dot"
            cx={p.x} cy={p.y} r="4"
            onMouseMove={(e) => handleMouseMove(e, p)}
          />
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => (
          <text key={i} className="an-chart-label" x={p.x} y={H - 4} textAnchor="middle">
            {p.period}
          </text>
        ))}
      </svg>

      {tooltip && (
        <div className="an-tooltip" style={{
          left: `${tooltip.x}%`, top: `${tooltip.y}%`,
          transform: 'translate(-50%, -100%)', opacity: 1,
        }}>
          <div className="an-tooltip-label">{tooltip.period}</div>
          <div className="an-tooltip-val">{formatCurrency(tooltip.amount)}</div>
        </div>
      )}
    </div>
  );
};

/* ─── Donut Chart ──────────────────────────────────────────────────────── */
const DonutChart = ({ data, total }) => {
  const SIZE = 140, R = 54, CX = 70, CY = 70;
  const circumference = 2 * Math.PI * R;
  let offset = 0;

  const slices = data.map((d, i) => {
    const pct   = total > 0 ? d.revenue / total : 0;
    const dash  = pct * circumference;
    const gap   = circumference - dash;
    const slice = { ...d, pct, dash, gap, offset, color: CAT_COLORS[i % CAT_COLORS.length] };
    offset += dash;
    return slice;
  });

  return (
    <div className="an-donut-wrap">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="an-donut-svg">
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={s.color}
            strokeWidth="16"
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset + circumference / 4}
            style={{ transition: 'stroke-dasharray 0.6s ease', opacity: 0.85 }}
          />
        ))}
        <circle cx={CX} cy={CY} r="38" fill="var(--surface)" />
        <text x={CX} y={CY - 4} textAnchor="middle" fill="var(--gold)"
          fontFamily="'Playfair Display', serif" fontSize="16" fontWeight="700">
          {slices.length}
        </text>
        <text x={CX} y={CY + 14} textAnchor="middle" fill="var(--text-dim)"
          fontFamily="'DM Sans', sans-serif" fontSize="9" letterSpacing="1">
          CATEGORIES
        </text>
      </svg>

      <div className="an-donut-legend">
        {slices.map((s, i) => (
          <div key={i} className="an-donut-item">
            <div className="an-donut-item-left">
              <div className="an-donut-dot" style={{ background: s.color }} />
              <span className="an-donut-name">{s.category}</span>
            </div>
            <span className="an-donut-pct">{(s.pct * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Component ──────────────────────────────────────────────────────────── */
const Analytics = () => {
  const [loading,   setLoading]   = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [summary,   setSummary]   = useState(MOCK.summary);
  const [revenue,   setRevenue]   = useState(MOCK.revenue);
  const [popular,   setPopular]   = useState(MOCK.popularItems);
  const [catSales,  setCatSales]  = useState(MOCK.categorySales);

  useEffect(() => { fetchAnalytics(); }, [timeRange]);

  const filterByRange = (orders, range) => {
    const now = new Date();
    const start = new Date(now);
    if (range === 'week')  start.setDate(start.getDate() - 7);
    if (range === 'month') start.setMonth(start.getMonth() - 1);
    if (range === 'year')  start.setFullYear(start.getFullYear() - 1);
    return orders.filter(o => new Date(o.createdAt) >= start);
  };

  const calcRevenue = (orders, range) => {
    const map = new Map();
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = range === 'week'
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : range === 'month'
          ? d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
          : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      map.set(key, (map.get(key) || 0) + (o.total || 0));
    });
    return Array.from(map.entries()).map(([period, amount]) => ({ period, amount }));
  };

  const calcPopular = (orders) => {
    const map = new Map();
    orders.forEach(o => o.items?.forEach(item => {
      const c = map.get(item.name) || { name: item.name, quantity: 0, revenue: 0 };
      c.quantity += item.quantity;
      c.revenue  += item.price * item.quantity;
      map.set(item.name, c);
    }));
    return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 6);
  };

  const calcCategories = (orders) => {
    const map = new Map();
    orders.forEach(o => o.items?.forEach(item => {
      const c = map.get(item.category) || { category: item.category, quantity: 0, revenue: 0 };
      c.quantity += item.quantity;
      c.revenue  += item.price * item.quantity;
      map.set(item.category, c);
    }));
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res    = await api.get('/orders');
      const orders = res.data.orders || [];
      const filt   = filterByRange(orders, timeRange);

      const totalOrders       = filt.length;
      const totalRevenue      = filt.reduce((s, o) => s + (o.total || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const totalItemsSold    = filt.reduce((s, o) =>
        s + (o.items?.reduce((is, i) => is + (i.quantity || 0), 0) || 0), 0);

      setSummary({ totalOrders, totalRevenue, averageOrderValue, totalItemsSold });
      setRevenue(calcRevenue(filt, timeRange));
      setPopular(calcPopular(filt));
      setCatSales(calcCategories(filt));
    } catch {
      // Fall back to rich mock data
      setSummary(MOCK.summary);
      setRevenue(MOCK.revenue);
      setPopular(MOCK.popularItems);
      setCatSales(MOCK.categorySales);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ summary, revenue, popular, catSales, exportedAt: new Date() }, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `mutindo-analytics-${timeRange}-${Date.now()}.json` });
    a.click(); URL.revokeObjectURL(url);
    toast.success('Report exported!');
  };

  const maxQty      = Math.max(...popular.map(p => p.quantity), 1);
  const totalCatRev = catSales.reduce((s, c) => s + c.revenue, 0);

  const KPI_CONFIG = [
    { label: 'Total Orders',    value: summary.totalOrders,       icon: <FaShoppingBag />,    color: 'var(--gold)',  mono: false, delta: '+12%' },
    { label: 'Total Revenue',   value: formatCurrency(summary.totalRevenue), icon: <FaMoneyBillWave />, color: 'var(--green)', mono: true,  delta: '+8%' },
    { label: 'Avg Order Value', value: formatCurrency(summary.averageOrderValue), icon: <FaChartLine />, color: 'var(--blue)',  mono: true,  delta: '-3%' },
    { label: 'Items Sold',      value: summary.totalItemsSold,    icon: <FaUtensils />,       color: 'var(--amber)', mono: false, delta: '+19%' },
  ];

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="an-root">
        <div className="an-loading">
          <div className="an-spinner" />
          <span>Crunching the numbers…</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="an-root">

        {/* ── Header ── */}
        <div className="an-header">
          <div>
            <div className="an-eyebrow">Business Intelligence</div>
            <h1 className="an-title">Analytics & Reports</h1>
            <p className="an-subtitle">Mutindo Catering Services · Revenue & Performance Insights</p>
          </div>
          <div className="an-controls">
            <div className="an-range-tabs">
              {[['week','7 Days'],['month','30 Days'],['year','12 Months']].map(([k, l]) => (
                <button
                  key={k}
                  className={`an-range-tab ${timeRange === k ? 'active' : ''}`}
                  onClick={() => setTimeRange(k)}
                >{l}</button>
              ))}
            </div>
            <button className="an-export-btn" onClick={handleExport}>
              <FaDownload size={11} /> Export JSON
            </button>
          </div>
        </div>

        {/* ── KPI Row ── */}
        <div className="an-kpi-row">
          {KPI_CONFIG.map((k, i) => {
            const isUp = k.delta.startsWith('+');
            return (
              <div key={i} className="an-kpi" style={{ '--kpi-color': k.color, animationDelay: `${i * 60}ms` }}>
                <div className="an-kpi-label">
                  {k.icon} {k.label}
                </div>
                <div className={`an-kpi-value ${k.mono ? 'mono' : ''}`}>{k.value}</div>
                <span className={`an-kpi-delta ${isUp ? 'up' : 'down'}`}>
                  {isUp ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
                  {k.delta} vs prev period
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Revenue + Donut ── */}
        <div className="an-grid">
          <div className="an-panel" style={{ animationDelay: '240ms' }}>
            <div className="an-panel-head">
              <span className="an-panel-title">Revenue Trend</span>
              <span className="an-panel-tag">
                {timeRange === 'week' ? 'Daily' : timeRange === 'month' ? 'Daily' : 'Monthly'}
              </span>
            </div>
            <div className="an-panel-body">
              <RevenueChart data={revenue} />
            </div>
          </div>

          <div className="an-panel" style={{ animationDelay: '280ms' }}>
            <div className="an-panel-head">
              <span className="an-panel-title">Sales by Category</span>
              <span className="an-panel-tag">Revenue share</span>
            </div>
            <div className="an-panel-body">
              <DonutChart data={catSales} total={totalCatRev} />
            </div>
          </div>
        </div>

        {/* ── Bottom: Popular Items + Category Table ── */}
        <div className="an-bottom-row" style={{ marginTop: 20 }}>

          {/* Horizontal Bar — Popular Items */}
          <div className="an-panel" style={{ animationDelay: '320ms' }}>
            <div className="an-panel-head">
              <span className="an-panel-title">Top Dishes</span>
              <span className="an-panel-tag">By quantity sold</span>
            </div>
            <div className="an-panel-body">
              <div className="an-hbar-list">
                {popular.map((item, i) => (
                  <div key={i} className="an-hbar-item">
                    <div className="an-hbar-top">
                      <span>
                        <span className="an-hbar-rank">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                        </span>
                        <span className="an-hbar-name">{item.name}</span>
                      </span>
                      <span className="an-hbar-qty">{item.quantity} sold</span>
                    </div>
                    <div className="an-hbar-track">
                      <div
                        className="an-hbar-fill"
                        style={{
                          width: `${(item.quantity / maxQty) * 100}%`,
                          background: CAT_COLORS[i % CAT_COLORS.length],
                          animationDelay: `${i * 80}ms`
                        }}
                      />
                    </div>
                    <div className="an-hbar-rev">{formatCurrency(item.revenue)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Performance Table */}
          <div className="an-panel" style={{ animationDelay: '360ms' }}>
            <div className="an-panel-head">
              <span className="an-panel-title">Category Performance</span>
              <span className="an-panel-tag">Revenue breakdown</span>
            </div>
            <div className="an-panel-body">
              <table className="an-cat-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Units</th>
                    <th>Revenue</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {catSales.map((cat, i) => {
                    const pct = totalCatRev > 0 ? (cat.revenue / totalCatRev) * 100 : 0;
                    return (
                      <tr key={i}>
                        <td>
                          <span className="an-cat-pill" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                          <span className="an-cat-name">{cat.category}</span>
                        </td>
                        <td>{cat.quantity}</td>
                        <td>{formatCurrency(cat.revenue)}</td>
                        <td className="an-cat-bar-cell">
                          <div className="an-cat-bar-wrap">
                            <span>{pct.toFixed(1)}%</span>
                            <div className="an-cat-mini-track">
                              <div
                                className="an-cat-mini-fill"
                                style={{
                                  width: `${pct}%`,
                                  background: CAT_COLORS[i % CAT_COLORS.length],
                                  animationDelay: `${i * 100}ms`
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Analytics;