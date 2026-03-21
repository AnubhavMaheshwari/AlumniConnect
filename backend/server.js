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
        // Fix for private_key formatting issues (literal \n vs actual newlines)
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

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
        const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
        
        // Add CLIENT_URL from env if it exists
        if (process.env.CLIENT_URL) {
            const extraOrigins = process.env.CLIENT_URL.split(',').map(o => o.trim());
            allowedOrigins.push(...extraOrigins);
        }

        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            console.warn(`Denied origin by CORS: ${origin}`);
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
