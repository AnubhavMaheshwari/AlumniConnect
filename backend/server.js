const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Firebase Admin Initialization
const admin = require('firebase-admin');
const fs = require('fs');

try {
    const serviceAccountPath = path.join(__dirname, 'firebaseServiceAccount.json');
    let serviceAccount;

    if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = require(serviceAccountPath);
        console.log('Firebase Admin: Initializing from firebaseServiceAccount.json');
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('Firebase Admin: Initializing from Environment Variable');
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized ✅');
    } else {
        console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT not found. Phone verification will not work.');
    }
} catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
}

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174'];
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root API route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to Alumni Connect API' });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));

app.use('/api/users', require('./routes/user.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/jobs', require('./routes/job.routes'));
app.use('/api/news', require('./routes/news.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Alumni Connect API is running' });
});

// Error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
