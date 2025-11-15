// server.js - Eduhire Backend Server (COMPLETE & CORRECTED)
// All routes properly organized, all middleware correctly initialized

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// ============ INITIALIZE APP & DATABASE ============
const app = express();
const dotenv = require('dotenv');
dotenv.config();

// ============ MIDDLEWARE SETUP ============
// CORS - Must be before routes
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Body parser - Must be before routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ RATE LIMITING ============
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many login attempts, please try again later.'
});

// Apply general rate limiter
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ============ ROUTE IMPORTS ============
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const institutionRoutes = require('./routes/institutionRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const userRoutes = require('./routes/userRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const supportRoutes = require('./routes/supportRoutes');
const locationRoutes = require('./routes/location');
const reviewRoutes = require('./routes/reviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const savedSearchRoutes = require('./routes/savedSearchRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');

// ============ ROUTE REGISTRATION ============
// IMPORTANT: Register routes AFTER middleware setup
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/user', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/saved-searches', savedSearchRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// ============ DATABASE CONNECTION ============
const uri = process.env.MONGO_URI;

if (!uri) {
    console.error('FATAL: MONGO_URI environment variable is not set');
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
        console.log(`Database: ${mongoose.connection.name}`);

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// ============ HEALTH & INFO ENDPOINTS ============
app.get('/', (req, res) => {
    res.json({
        message: 'Eduhire API Server',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date()
    });
});

app.get('/api/health', (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'Server is running',
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    };

    try {
        res.status(200).json(healthcheck);
    } catch (error) {
        healthcheck.message = error;
        res.status(503).json(healthcheck);
    }
});

// ============ 404 ERROR HANDLER ============
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// ============ ERROR HANDLER MIDDLEWARE ============
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format'
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            error: 'Duplicate entry',
            field: Object.keys(err.keyPattern)
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token expired'
        });
    }

    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============ GRACEFUL SHUTDOWN ============
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

// ============ START SERVER ============
let server;

(async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;
        server = app.listen(PORT, () => {
            console.log('');
            console.log('═══════════════════════════════════════');
            console.log(`✅ Server running on http://localhost:${PORT}`);
            console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🕐 Started at: ${new Date().toLocaleString()}`);
            console.log('═══════════════════════════════════════');
            console.log('');

            // List all registered routes for debugging
            console.log('📍 Registered Routes:');
            console.log('  ✓ /api/auth');
            console.log('  ✓ /api/jobs');
            console.log('  ✓ /api/applications');
            console.log('  ✓ /api/institutions');
            console.log('  ✓ /api/teachers');
            console.log('  ✓ /api/locations');
            console.log('  ✓ /api/reviews');
            console.log('  ✓ /api/dashboard');
            console.log('  ✓ /api/notifications');
            console.log('  ✓ /api/saved-searches');
            console.log('  ✓ /api/bookmarks');
            console.log('');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
})();

module.exports = app;
