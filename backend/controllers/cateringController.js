const CateringPackage = require('../models/CateringPackage');
const CateringBooking = require('../models/CateringBooking');

const sendEmail = async (to, subject, html) => {
  try {
    console.log('📧 Email would be sent to:', to);
    console.log('Subject:', subject);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

// Get all catering packages (public)
const getPackages = async (req, res) => {
  try {
    const packages = await CateringPackage.findAll();
    res.json({ success: true, count: packages.length, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching packages', error: error.message });
  }
};

// Create catering package (admin only)
const createPackage = async (req, res) => {
  try {
    const { name, description, price, features, capacity, imageUrl } = req.body;
    if (!name || !description || !price) {
      return res.status(400).json({ success: false, message: 'Name, description, and price are required' });
    }
    const pkg = await CateringPackage.create({
      name,
      description,
      price: parseFloat(price),
      features: features || [],
      capacity: capacity || 0,
      imageUrl: imageUrl || null,
      isActive: true
    });
    res.status(201).json({ success: true, message: 'Package created successfully', data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating package', error: error.message });
  }
};

// Update package (admin only)
const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await CateringPackage.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    const updated = await CateringPackage.update(id, req.body);
    res.json({ success: true, message: 'Package updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating package', error: error.message });
  }
};

// Delete package (admin only)
const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await CateringPackage.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    await CateringPackage.delete(id);
    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting package', error: error.message });
  }
};

// Submit catering booking (public)
const submitBooking = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, eventType, eventDate, eventLocation, guestCount, packageId, specialRequests, budget } = req.body;
    
    if (!customerName || !customerEmail || !customerPhone || !eventType || !eventDate || !guestCount) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    
    let packageDetails = null;
    if (packageId) {
      packageDetails = await CateringPackage.findById(packageId);
    }
    
    const booking = await CateringBooking.create({
      customerName,
      customerEmail: customerEmail.toLowerCase(),
      customerPhone,
      eventType,
      eventDate: new Date(eventDate).toISOString(),
      eventLocation,
      guestCount: parseInt(guestCount),
      packageId: packageId || null,
      packageName: packageDetails ? packageDetails.name : null,
      specialRequests: specialRequests || '',
      budget: budget ? parseFloat(budget) : null,
      status: 'pending',
      quoteAmount: null,
      quoteDetails: null
    });
    
    await sendEmail('admin@mutindo.com', 'New Catering Booking Request', 'Booking ID: ' + booking.bookingId);
    await sendEmail(customerEmail, 'Catering Booking Confirmation', 'Thank you for your inquiry. Reference: ' + booking.bookingId);
    
    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully! We will contact you within 24 hours.',
      data: { bookingId: booking.bookingId, status: booking.status }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting booking', error: error.message });
  }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filters = {};
    if (status) filters.status = status;
    const bookings = await CateringBooking.findAll(filters);
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bookings', error: error.message });
  }
};

// Get booking by ID (admin or customer)
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await CateringBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (req.user.role !== 'admin' && booking.customerEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching booking', error: error.message });
  }
};

// Send quote for booking (admin only)
const sendQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { quoteAmount, quoteDetails } = req.body;
    if (!quoteAmount) {
      return res.status(400).json({ success: false, message: 'Quote amount is required' });
    }
    const booking = await CateringBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    const updated = await CateringBooking.sendQuote(id, parseFloat(quoteAmount), quoteDetails);
    await sendEmail(booking.customerEmail, 'Your Catering Quote from Mutindo', 'Quote amount: UGX ' + quoteAmount);
    res.json({ success: true, message: 'Quote sent successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending quote', error: error.message });
  }
};

// Update booking status (admin only)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const validStatuses = ['pending', 'quote_sent', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const updated = await CateringBooking.updateStatus(id, status, { notes });
    res.json({ success: true, message: 'Booking status updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating booking status', error: error.message });
  }
};

// Get bookings by customer email (authenticated user)
const getMyBookings = async (req, res) => {
  try {
    const email = req.user.email;
    const bookings = await CateringBooking.findByEmail(email);
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching your bookings', error: error.message });
  }
};

module.exports = {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  submitBooking,
  getAllBookings,
  getBookingById,
  sendQuote,
  updateBookingStatus,
  getMyBookings
};
