const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quanlydancu')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Routes
const authRoutes = require('./routes/AuthRoutes');
const dashboardRoutes = require('./routes/DashboardRoutes');
const nhanKhauRoutes = require('./routes/NhanKhauRoutes');
const hoKhauRoutes = require('./routes/HoKhauRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/nhankhau', nhanKhauRoutes);
app.use('/api/hokhau', hoKhauRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});