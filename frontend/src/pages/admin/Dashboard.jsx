import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaShoppingBag, FaMoneyBillWave, FaUtensils, 
  FaChartLine, FaArrowRight, FaEye, FaCheckCircle, 
  FaClock, FaTruck, FaCalendar, FaSearch, FaFilter,
  FaDownload, FaPrint, FaBell, FaCog, FaImage, FaGlobe
} from 'react-icons/fa';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalMenuItems: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    activeRiders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [visibleSections, setVisibleSections] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /* Intersection observer for animations */
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisibleSections(v => ({ ...v, [e.target.dataset.section]: true }));
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('[data-section]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      let orders = [];
      let users = [];
      let menuItems = [];
      let riders = [];
      
      try {
        const ordersRes = await api.get('/orders');
        orders = ordersRes.data.orders || ordersRes.data || [];
      } catch (err) {
        console.log('Orders endpoint not ready yet');
        orders = getMockOrders();
      }
      
      try {
        const usersRes = await api.get('/users');
        users = usersRes.data.users || [];
      } catch (err) {
        users = getMockUsers();
      }
      
      try {
        const menuRes = await api.get('/menu');
        menuItems = menuRes.data.data || menuRes.data || [];
      } catch (err) {
        menuItems = getMockMenu();
      }
      
      try {
        const ridersRes = await api.get('/riders');
        riders = ridersRes.data.riders || [];
      } catch (err) {
        riders = getMockRiders();
      }
      
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
      const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
      
      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalUsers: users.length,
        totalMenuItems: menuItems.length,
        pendingOrders,
        deliveredOrders,
        activeRiders: riders.filter(r => r.isActive !== false).length
      });
      
      setRecentOrders(orders.slice(0, 5));
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getMockOrders = () => [
    { id: 'ORD-001', customerName: 'Sarah Mukasa', total: 25000, status: 'delivered', createdAt: '2024-03-20' },
    { id: 'ORD-002', customerName: 'John Okello', total: 12000, status: 'confirmed', createdAt: '2024-03-20' },
    { id: 'ORD-003', customerName: 'Grace Auma', total: 45000, status: 'preparing', createdAt: '2024-03-19' },
    { id: 'ORD-004', customerName: 'David Ssekandi', total: 8000, status: 'pending', createdAt: '2024-03-19' },
    { id: 'ORD-005', customerName: 'Alice Nambi', total: 35000, status: 'delivered', createdAt: '2024-03-18' },
  ];

  const getMockUsers = () => [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
  const getMockMenu = () => [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
  const getMockRiders = () => [{ id: 1, isActive: true }, { id: 2, isActive: true }, { id: 3, isActive: false }];

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: '#FF6B35', icon: '⏳', label: 'Pending' },
      confirmed: { color: '#00C9A7', icon: '✓', label: 'Confirmed' },
      preparing: { color: '#4fc3f7', icon: '🍳', label: 'Preparing' },
      ready: { color: '#FFD700', icon: '✓', label: 'Ready' },
      on_the_way: { color: '#FFA07A', icon: '🚚', label: 'On the Way' },
      delivered: { color: '#28a745', icon: '✅', label: 'Delivered' },
      cancelled: { color: '#dc3545', icon: '❌', label: 'Cancelled' }
    };
    return config[status] || { color: '#6c757d', icon: '📦', label: status };
  };

  // Chart data
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Orders',
        data: [12, 19, 15, 17, 14, 23, 18],
        borderColor: '#FF6B35',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#FF6B35',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Revenue (UGX)',
        data: [150000, 220000, 180000, 210000, 190000, 280000, 250000],
        borderColor: '#00C9A7',
        backgroundColor: 'rgba(0, 201, 167, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#00C9A7',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1'
      }
    ]
  };

  const orderStatusData = {
    labels: ['Pending', 'Confirmed', 'Preparing', 'Delivered', 'Cancelled'],
    datasets: [
      {
        data: [12, 8, 15, 42, 5],
        backgroundColor: ['#FF6B35', '#00C9A7', '#4fc3f7', '#28a745', '#dc3545'],
        borderWidth: 0,
        cutout: '60%'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#f0ece4', font: { family: "'DM Sans', sans-serif", size: 11 } }
      },
      tooltip: { backgroundColor: '#141414', titleColor: '#f0ece4', bodyColor: 'rgba(240,236,228,0.7)' }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#f0ece4' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#f0ece4' } },
      y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#00C9A7' } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#f0ece4', font: { size: 10 } } }
    }
  };

  const statCards = [
    { title: 'Total Orders', value: stats.totalOrders, icon: FaShoppingBag, color: '#FF6B35', gradient: 'linear-gradient(135deg, #FF6B35, #FF8C42)' },
    { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: FaMoneyBillWave, color: '#00C9A7', gradient: 'linear-gradient(135deg, #00C9A7, #00E0B8)' },
    { title: 'Total Users', value: stats.totalUsers, icon: FaUsers, color: '#4fc3f7', gradient: 'linear-gradient(135deg, #4fc3f7, #6dd5fa)' },
    { title: 'Menu Items', value: stats.totalMenuItems, icon: FaUtensils, color: '#FFD700', gradient: 'linear-gradient(135deg, #FFD700, #FFED4E)' }
  ];

  if (loading) {
    return (
      <div style={{ background: '#0d0d0d', minHeight: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '20px' }}>
          <div className="admin-spinner" style={{ width: '48px', height: '48px', border: '2px solid rgba(255,107,53,0.2)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'rgba(240,236,228,0.5)', fontFamily: "'DM Sans', sans-serif" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{adminStyles}</style>
      
      <div className="admin-dashboard">
        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-content">
            <div>
              <span className="admin-header-badge">Admin Portal</span>
              <h1 className="admin-header-title">Dashboard</h1>
              <p className="admin-header-subtitle">Welcome back, Administrator. Here's what's happening with your business today.</p>
            </div>
            <div className="admin-header-actions">
              <button className="admin-header-btn">
                <FaPrint size={14} /> Export
              </button>
              <button className="admin-header-btn">
                <FaDownload size={14} /> Report
              </button>
              <button className="admin-header-btn admin-header-btn-primary">
                <FaBell size={14} /> Notifications
              </button>
            </div>
          </div>
        </div>

        <div className="admin-container">
          {/* Stats Cards */}
          <div className="admin-stats-grid" data-section="stats">
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={`admin-stat-card reveal ${visibleSections.stats ? 'visible' : ''}`} style={{ transitionDelay: `${idx * 100}ms` }}>
                  <div className="admin-stat-card-inner">
                    <div className="admin-stat-icon" style={{ background: stat.gradient }}>
                      <Icon size={24} />
                    </div>
                    <div className="admin-stat-info">
                      <span className="admin-stat-title">{stat.title}</span>
                      <span className="admin-stat-value">{stat.value}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="admin-quick-actions" data-section="actions">
            <h3>Quick Actions</h3>
            <div className="admin-actions-grid">
              <Link to="/admin/orders" className="admin-action-card">
                <div className="admin-action-icon" style={{ background: '#FF6B3520', color: '#FF6B35' }}>
                  <FaShoppingBag size={24} />
                </div>
                <div className="admin-action-info">
                  <h4>Manage Orders</h4>
                  <p>View and update order status</p>
                </div>
                <FaArrowRight size={14} className="admin-action-arrow" />
              </Link>
              
              <Link to="/admin/menu" className="admin-action-card">
                <div className="admin-action-icon" style={{ background: '#00C9A720', color: '#00C9A7' }}>
                  <FaUtensils size={24} />
                </div>
                <div className="admin-action-info">
                  <h4>Manage Menu</h4>
                  <p>Add, edit or remove menu items</p>
                </div>
                <FaArrowRight size={14} className="admin-action-arrow" />
              </Link>
              
              <Link to="/admin/riders" className="admin-action-card">
                <div className="admin-action-icon" style={{ background: '#FFD70020', color: '#FFD700' }}>
                  <FaTruck size={24} />
                </div>
                <div className="admin-action-info">
                  <h4>Manage Riders</h4>
                  <p>Assign and track delivery riders</p>
                </div>
                <FaArrowRight size={14} className="admin-action-arrow" />
              </Link>

              {/* Manage Catering button */}
              <button 
                className="admin-action-card" 
                onClick={() => navigate('/admin/catering')}
                style={{ cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <div className="admin-action-icon" style={{ background: '#17a2b820', color: '#17a2b8' }}>
                  <FaUtensils size={24} />
                </div>
                <div className="admin-action-info">
                  <h4>Manage Catering</h4>
                  <p>Manage catering orders and events</p>
                </div>
                <FaArrowRight size={14} className="admin-action-arrow" />
              </button>

              {/* REMOVED - Manage Images button */}

              {/* Website Content Manager button */}
              <button 
                className="admin-action-card" 
                onClick={() => navigate('/admin/content')}
                style={{ cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <div className="admin-action-icon" style={{ background: '#4c9aff20', color: '#4c9aff' }}>
                  <FaGlobe size={24} />
                </div>
                <div className="admin-action-info">
                  <h4>Website Content</h4>
                  <p>Manage homepage, about, and site content</p>
                </div>
                <FaArrowRight size={14} className="admin-action-arrow" />
              </button>
              
              <Link to="/admin/analytics" className="admin-action-card">
                <div className="admin-action-icon" style={{ background: '#c97bff20', color: '#c97bff' }}>
                  <FaChartLine size={24} />
                </div>
                <div className="admin-action-info">
                  <h4>View Analytics</h4>
                  <p>Deep insights and reports</p>
                </div>
                <FaArrowRight size={14} className="admin-action-arrow" />
              </Link>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="admin-quick-stats" data-section="quick">
            <div className="admin-quick-stat">
              <div className="admin-quick-stat-icon" style={{ background: 'rgba(255,107,53,0.1)' }}>
                <FaClock />
              </div>
              <div>
                <span className="admin-quick-stat-value">{stats.pendingOrders}</span>
                <span className="admin-quick-stat-label">Pending Orders</span>
              </div>
            </div>
            <div className="admin-quick-stat">
              <div className="admin-quick-stat-icon" style={{ background: 'rgba(0,201,167,0.1)' }}>
                <FaCheckCircle />
              </div>
              <div>
                <span className="admin-quick-stat-value">{stats.deliveredOrders}</span>
                <span className="admin-quick-stat-label">Delivered</span>
              </div>
            </div>
            <div className="admin-quick-stat">
              <div className="admin-quick-stat-icon" style={{ background: 'rgba(255,215,0,0.1)' }}>
                <FaTruck />
              </div>
              <div>
                <span className="admin-quick-stat-value">{stats.activeRiders}</span>
                <span className="admin-quick-stat-label">Active Riders</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="admin-charts-row" data-section="charts">
            <div className="admin-chart-card admin-chart-line">
              <div className="admin-chart-header">
                <h3>Performance Overview</h3>
                <div className="admin-chart-period">
                  <button className={selectedPeriod === 'week' ? 'active' : ''} onClick={() => setSelectedPeriod('week')}>Week</button>
                  <button className={selectedPeriod === 'month' ? 'active' : ''} onClick={() => setSelectedPeriod('month')}>Month</button>
                  <button className={selectedPeriod === 'year' ? 'active' : ''} onClick={() => setSelectedPeriod('year')}>Year</button>
                </div>
              </div>
              <div className="admin-chart-container">
                {stats.totalOrders > 0 ? (
                  <Line data={weeklyData} options={chartOptions} />
                ) : (
                  <div className="admin-chart-empty">No data available yet</div>
                )}
              </div>
            </div>
            
            <div className="admin-chart-card admin-chart-doughnut">
              <div className="admin-chart-header">
                <h3>Order Status Distribution</h3>
              </div>
              <div className="admin-chart-container">
                <Doughnut data={orderStatusData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="admin-recent-orders" data-section="orders">
            <div className="admin-recent-header">
              <h3>Recent Orders</h3>
              <Link to="/admin/orders" className="admin-view-all">
                View All <FaArrowRight size={12} />
              </Link>
            </div>
            
            {recentOrders.length > 0 ? (
              <div className="admin-orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => {
                      const status = getStatusBadge(order.status);
                      return (
                        <tr key={order.id}>
                          <td className="admin-order-id">#{order.id.slice(0, 8)}</td>
                          <td>{order.customerName}</td>
                          <td className="admin-order-amount">{formatCurrency(order.total)}</td>
                          <td>
                            <span className="admin-status-badge" style={{ background: `${status.color}20`, color: status.color }}>
                              <span>{status.icon}</span> {status.label}
                            </span>
                          </td>
                          <td>
                            <span className="admin-order-date">
                              <FaCalendar size={10} />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="admin-view-btn"
                              onClick={() => navigate(`/admin/orders/${order.id}`)}
                            >
                              <FaEye size={12} /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-empty-state">
                <div className="admin-empty-icon">📦</div>
                <h4>No orders yet</h4>
                <p>Start by adding menu items and placing test orders</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const adminStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .admin-dashboard {
    background: #0d0d0d;
    min-height: 100vh;
  }

  /* Header */
  .admin-header {
    background: linear-gradient(135deg, #1a0a00 0%, #2d1500 50%, #0d0d0d 100%);
    padding: 40px 6vw 60px;
    position: relative;
    overflow: hidden;
  }
  
  .admin-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 70% 40%, rgba(255,107,53,0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  
  .admin-header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;
    position: relative;
    z-index: 2;
  }
  
  .admin-header-badge {
    display: inline-block;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #FF6B35;
    margin-bottom: 12px;
  }
  
  .admin-header-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    color: #f0ece4;
    margin: 0 0 8px;
  }
  
  .admin-header-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    color: rgba(240,236,228,0.55);
    margin: 0;
  }
  
  .admin-header-actions {
    display: flex;
    gap: 12px;
  }
  
  .admin-header-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    color: rgba(240,236,228,0.7);
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .admin-header-btn:hover {
    background: rgba(255,107,53,0.1);
    border-color: rgba(255,107,53,0.3);
    color: #FF6B35;
  }
  
  .admin-header-btn-primary {
    background: #FF6B35;
    color: #fff;
    border-color: #FF6B35;
  }
  
  .admin-header-btn-primary:hover {
    background: #ff8555;
    color: #fff;
  }

  /* Container */
  .admin-container {
    max-width: 1400px;
    margin: -30px auto 0;
    padding: 0 6vw 60px;
    position: relative;
    z-index: 5;
  }

  /* Reveal */
  .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }

  /* Stats Cards */
  .admin-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2px;
    margin-bottom: 32px;
  }
  
  @media (max-width: 1024px) {
    .admin-stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
  
  @media (max-width: 640px) {
    .admin-stats-grid { grid-template-columns: 1fr; }
  }
  
  .admin-stat-card {
    background: #141414;
    padding: 24px;
    transition: transform 0.3s ease;
  }
  
  .admin-stat-card:hover {
    transform: translateY(-4px);
  }
  
  .admin-stat-card-inner {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .admin-stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
  
  .admin-stat-info {
    display: flex;
    flex-direction: column;
  }
  
  .admin-stat-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(240,236,228,0.5);
  }
  
  .admin-stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    font-weight: 900;
    color: #f0ece4;
  }

  /* Quick Actions */
  .admin-quick-actions {
    background: #141414;
    padding: 24px;
    margin-bottom: 32px;
  }
  
  .admin-quick-actions h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #f0ece4;
    margin: 0 0 20px;
  }
  
  .admin-actions-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 2px;
  }
  
  @media (max-width: 1200px) {
    .admin-actions-grid { grid-template-columns: repeat(3, 1fr); }
  }
  
  @media (max-width: 768px) {
    .admin-actions-grid { grid-template-columns: repeat(2, 1fr); }
  }
  
  @media (max-width: 480px) {
    .admin-actions-grid { grid-template-columns: 1fr; }
  }
  
  .admin-action-card {
    background: #1a1a1a;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    text-decoration: none;
    transition: all 0.3s ease;
    position: relative;
  }
  
  .admin-action-card:hover {
    background: #222;
    transform: translateX(4px);
  }
  
  .admin-action-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .admin-action-info {
    flex: 1;
  }
  
  .admin-action-info h4 {
    font-family: 'Playfair Display', serif;
    font-size: 0.95rem;
    font-weight: 700;
    color: #f0ece4;
    margin: 0 0 4px;
  }
  
  .admin-action-info p {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    color: rgba(240,236,228,0.4);
    margin: 0;
  }
  
  .admin-action-arrow {
    color: rgba(240,236,228,0.3);
    transition: all 0.2s;
  }
  
  .admin-action-card:hover .admin-action-arrow {
    color: #FF6B35;
    transform: translateX(4px);
  }

  /* Quick Stats */
  .admin-quick-stats {
    display: flex;
    gap: 2px;
    margin-bottom: 32px;
  }
  
  .admin-quick-stat {
    flex: 1;
    background: #141414;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .admin-quick-stat-icon {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: #FF6B35;
  }
  
  .admin-quick-stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 900;
    color: #f0ece4;
    display: block;
  }
  
  .admin-quick-stat-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    color: rgba(240,236,228,0.5);
  }
  
  @media (max-width: 768px) {
    .admin-quick-stats { flex-direction: column; gap: 2px; }
  }

  /* Charts Row */
  .admin-charts-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2px;
    margin-bottom: 32px;
  }
  
  @media (max-width: 1024px) {
    .admin-charts-row { grid-template-columns: 1fr; }
  }
  
  .admin-chart-card {
    background: #141414;
    padding: 24px;
  }
  
  .admin-chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .admin-chart-header h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #f0ece4;
    margin: 0;
  }
  
  .admin-chart-period {
    display: flex;
    gap: 8px;
  }
  
  .admin-chart-period button {
    padding: 6px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    color: rgba(240,236,228,0.5);
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .admin-chart-period button:hover {
    background: rgba(255,107,53,0.1);
    border-color: rgba(255,107,53,0.3);
    color: #FF6B35;
  }
  
  .admin-chart-period button.active {
    background: #FF6B35;
    border-color: #FF6B35;
    color: #fff;
  }
  
  .admin-chart-container {
    height: 280px;
    position: relative;
  }
  
  .admin-chart-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-family: 'DM Sans', sans-serif;
    color: rgba(240,236,228,0.3);
  }

  /* Recent Orders */
  .admin-recent-orders {
    background: #141414;
    margin-bottom: 32px;
  }
  
  .admin-recent-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 0;
    margin-bottom: 20px;
  }
  
  .admin-recent-header h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #f0ece4;
    margin: 0;
  }
  
  .admin-view-all {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    color: #FF6B35;
    text-decoration: none;
    transition: gap 0.2s;
  }
  
  .admin-view-all:hover {
    gap: 12px;
    color: #ff8555;
  }
  
  .admin-orders-table {
    overflow-x: auto;
  }
  
  .admin-orders-table table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .admin-orders-table th {
    text-align: left;
    padding: 16px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: rgba(240,236,228,0.4);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  
  .admin-orders-table td {
    padding: 16px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    color: rgba(240,236,228,0.7);
    border-bottom: 1px solid rgba(255,255,255,0.03);
  }
  
  .admin-order-id {
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    color: #FF6B35;
  }
  
  .admin-order-amount {
    font-weight: 500;
    color: #00C9A7;
  }
  
  .admin-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 500;
  }
  
  .admin-order-date {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.7rem;
    color: rgba(240,236,228,0.4);
  }
  
  .admin-view-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(255,107,53,0.1);
    border: 1px solid rgba(255,107,53,0.2);
    border-radius: 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    color: #FF6B35;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .admin-view-btn:hover {
    background: #FF6B35;
    color: #fff;
  }

  /* Empty State */
  .admin-empty-state {
    text-align: center;
    padding: 60px 20px;
  }
  
  .admin-empty-icon {
    font-size: 4rem;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .admin-empty-state h4 {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    color: #f0ece4;
    margin-bottom: 8px;
  }
  
  .admin-empty-state p {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    color: rgba(240,236,228,0.5);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default AdminDashboard;