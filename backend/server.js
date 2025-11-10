require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

const authRouter = require('./routes/AuthRoutes');
const nhanKhauRouter = require('./routes/NhanKhauRoutes');
const hoKhauRouter = require('./routes/HoKhauRoutes');    
const khoanThuRouter = require('./routes/KhoanThuRoutes');  
const phieuThuRouter = require('./routes/PhieuThuRoutes');
const dashboardRouter = require('./routes/DashboardRoutes');  

// MongoDB connection
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/quanlydancu';
mongoose.connect(MONGO)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connect error:', err.message));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/nhankhau', nhanKhauRouter);
app.use('/api/hokhau', hoKhauRouter);
app.use('/api/khoanthu', khoanThuRouter);
app.use('/api/phieuthu', phieuThuRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));