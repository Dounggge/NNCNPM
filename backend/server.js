require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// route files (tạo ở bước sau)
const residentsRouter = require('./routes/residents');
const householdsRouter = require('./routes/households');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/quanly';
mongoose.connect(MONGO)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connect error:', err.message));

app.use('/api/residents', residentsRouter);
app.use('/api/households', householdsRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));