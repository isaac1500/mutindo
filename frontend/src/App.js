import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import InstallPrompt from './components/InstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="page-loader" style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    background: '#0d0d0d'
  }}>
    <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// LAZY LOAD ALL PAGE COMPONENTS
// Website Pages
const Home = lazy(() => import('./pages/website/Home'));
const About = lazy(() => import('./pages/website/About'));
const Menu = lazy(() => import('./pages/website/Menu'));
const Gallery = lazy(() => import('./pages/website/Gallery'));
const Testimonials = lazy(() => import('./pages/website/Testimonials'));
const Contact = lazy(() => import('./pages/website/Contact'));
const Catering = lazy(() => import('./pages/website/Catering'));

// Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Customer Pages
const Order = lazy(() => import('./pages/customer/Order'));
const Checkout = lazy(() => import('./pages/customer/Checkout'));
const Payment = lazy(() => import('./pages/customer/Payment'));
const Orders = lazy(() => import('./pages/customer/Orders'));
const Profile = lazy(() => import('./pages/customer/Profile'));
const Tracking = lazy(() => import('./pages/customer/Tracking'));
const Chat = lazy(() => import('./pages/customer/Chat'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const OrdersAdmin = lazy(() => import('./pages/admin/OrdersAdmin'));
const MenuAdmin = lazy(() => import('./pages/admin/MenuAdmin'));
const Riders = lazy(() => import('./pages/admin/Riders'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const CateringBookings = lazy(() => import('./pages/admin/CateringBookings'));
const AdvancedImageManager = lazy(() => import('./pages/admin/AdvancedImageManager'));
const WebsiteContentManager = lazy(() => import('./pages/admin/WebsiteContentManager'));

// Rider Pages
const RiderDashboard = lazy(() => import('./pages/rider/RiderDashboard'));
const Navigation = lazy(() => import('./pages/rider/Navigation'));
const Earnings = lazy(() => import('./pages/rider/Earnings'));
const History = lazy(() => import('./pages/rider/History'));
const Support = lazy(() => import('./pages/rider/Support'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <div className="App">
              <Header />
              <main className="main-content" style={{ paddingTop: '76px' }}>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/testimonials" element={<Testimonials />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/catering" element={<Catering />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Customer Routes */}
                    <Route path="/order" element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <Order />
                      </ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <Checkout />
                      </ProtectedRoute>
                    } />
                    <Route path="/payment/:orderId" element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <Payment />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute allowedRoles={['customer', 'admin']}>
                        <Orders />
                      </ProtectedRoute>
                    } />
                    <Route path="/tracking/:orderId" element={
                      <ProtectedRoute allowedRoles={['customer', 'rider', 'admin']}>
                        <Tracking />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute allowedRoles={['customer', 'rider', 'admin']}>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    
                    {/* Chat Route */}
                    <Route path="/chat/:orderId" element={
                      <ProtectedRoute allowedRoles={['customer', 'rider', 'admin']}>
                        <Chat />
                      </ProtectedRoute>
                    } />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/orders" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <OrdersAdmin />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/menu" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <MenuAdmin />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/riders" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Riders />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/analytics" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Analytics />
                      </ProtectedRoute>
                    } />
                    
                    {/* Catering Admin Route */}
                    <Route path="/admin/catering" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <CateringBookings />
                      </ProtectedRoute>
                    } />
                    
                    {/* Advanced Image Manager Admin Route */}
                    <Route path="/admin/images" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdvancedImageManager />
                      </ProtectedRoute>
                    } />

                    {/* Website Content Manager Admin Route */}
                    <Route path="/admin/content" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <WebsiteContentManager />
                      </ProtectedRoute>
                    } />
                    
                    {/* Rider Routes */}
                    <Route path="/rider/dashboard" element={
                      <ProtectedRoute allowedRoles={['rider']}>
                        <RiderDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/rider/navigation/:orderId" element={
                      <ProtectedRoute allowedRoles={['rider']}>
                        <Navigation />
                      </ProtectedRoute>
                    } />
                    <Route path="/rider/earnings" element={
                      <ProtectedRoute allowedRoles={['rider']}>
                        <Earnings />
                      </ProtectedRoute>
                    } />
                    <Route path="/rider/history" element={
                      <ProtectedRoute allowedRoles={['rider']}>
                        <History />
                      </ProtectedRoute>
                    } />
                    <Route path="/rider/support" element={
                      <ProtectedRoute allowedRoles={['rider']}>
                        <Support />
                      </ProtectedRoute>
                    } />
                    
                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <ToastContainer position="bottom-right" autoClose={5000} />
              <InstallPrompt />
              <OfflineIndicator />
            </div>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;