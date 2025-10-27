require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const institutionRoutes = require('./routes/institutionRoutes');

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/institutions', institutionRoutes);

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

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

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

let server;

(async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;
        server = app.listen(PORT, () => {
            console.log('');
            console.log('═══════════════════════════════════════');
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Started at: ${new Date().toLocaleString()}`);
            console.log('═══════════════════════════════════════');
            console.log('');
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
})();

module.exports = app;
