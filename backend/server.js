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
        // Non-browser requests (like health checks/postman) may not send origin.
        if (!origin) {
            return callback(null, true);
        }

        const normalize = (value) => value.trim().replace(/\/$/, '');
        const allowedOrigins = new Set(['http://localhost:5173', 'http://localhost:5174']);

        if (process.env.CLIENT_URL) {
            const extraOrigins = process.env.CLIENT_URL
                .split(',')
                .map(normalize)
                .filter(Boolean);
            extraOrigins.forEach((o) => allowedOrigins.add(o));
        }

        const normalizedOrigin = normalize(origin);
        let hostname = '';
        try {
            hostname = new URL(normalizedOrigin).hostname;
        } catch (e) {
            console.warn(`Invalid origin format blocked by CORS: ${origin}`);
            return callback(new Error('Not allowed by CORS'));
        }

        const isAllowed =
            allowedOrigins.has(normalizedOrigin) ||
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.endsWith('.vercel.app');

        if (isAllowed) {
            return callback(null, true);
        }

        console.warn(`Denied origin by CORS: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
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
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/message', require('./routes/message.routes'));
app.use('/api/activity', require('./routes/activity.routes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Alumni Connect API is running' });
});

// Error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            const normalize = (val) => val.trim().replace(/\/$/, '');
            const normalizedOrigin = normalize(origin);
            const allowedOrigins = new Set(['http://localhost:5173', 'http://localhost:5174']);
            if (process.env.CLIENT_URL) {
                process.env.CLIENT_URL.split(',').forEach(o => allowedOrigins.add(normalize(o)));
            }
            if (allowedOrigins.has(normalizedOrigin)) return callback(null, true);
            try {
                const hostname = new URL(normalizedOrigin).hostname;
                if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.vercel.app')) {
                    return callback(null, true);
                }
            } catch (err) {}
            callback(new Error('Not allowed by CORS'));
        },
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

        if (!chat || !chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id === newMessageRecieved.sender._id) return;
            socket.in(user._id).emit("message recieved", newMessageRecieved);
        });
    });

    socket.on("message updated", (updatedMessage) => {
        var chat = updatedMessage.chat;
        if (!chat || !chat.users) return;
        chat.users.forEach((user) => {
            if (user._id === updatedMessage.sender._id) return;
            socket.in(user._id).emit("message updated", updatedMessage);
        });
    });

    socket.on("message deleted", (deletedMessage) => {
        var chat = deletedMessage.chat;
        if (!chat || !chat.users) return;
        chat.users.forEach((user) => {
            if (user._id === deletedMessage.sender._id) return;
            socket.in(user._id).emit("message deleted", deletedMessage);
        });
    });

    socket.off("setup", (userData) => {
        console.log("USER DISCONNECTED");
        if (userData && userData._id) {
            socket.leave(userData._id);
        }
    });
});
