require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/dashboard', require('./modules/dashboard/dashboard.routes'));
app.use('/api/sales', require('./modules/sales/sales.routes'));
app.use('/api/warehouse', require('./modules/warehouse/warehouse.routes'));
app.use('/api/finance', require('./modules/finance/finance.routes'));
app.use('/api/export', require('./modules/export/export.routes'));
app.use('/api/notifications', require('./modules/notifications/notification.routes'));
app.use('/api/ai', require('./modules/ai/ai.routes'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HEAT ERP',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
    }
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server xatosi' });
});

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: process.env.NODE_ENV !== 'production' })
  .then(async () => {
    app.listen(PORT, () => {
      console.log(`🚀 HEAT ERP: http://localhost:${PORT}`);
    });

    try {
      const notificationService = require('./modules/notifications/notification.service');
      await notificationService.initialize();
    } catch (e) {
      console.log('Notification service:', e.message);
    }

    try {
      const scheduler = require('./utils/scheduler');
      scheduler.start();
    } catch (e) {
      console.log('Scheduler:', e.message);
    }
  })
  .catch(err => {
    console.error('DB Error:', err);
    process.exit(1);
  });

module.exports = app;
