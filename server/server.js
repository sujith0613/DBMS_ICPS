console.log('DEBUG: ENTERING SERVER.JS');
require('dotenv').config();
console.log('DEBUG: DOTENV LOADED');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Pre-register Mongoose Models
require('./models/Branch');
require('./models/Event');
require('./models/PolicyHolder');
require('./models/Policy');
require('./models/ServiceProvider');
require('./models/Surveyor');
require('./models/Claim');
require('./models/ClaimReview');
require('./models/Payment');
require('./models/User');

// Configure Socket.io
const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, "") : 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
        if (!origin || origin.includes('localhost') || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible in routes
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    console.log(`CORS Check: Origin is [${origin}]`);
    
    const isLocal = !origin || origin.includes('localhost') || origin.includes('127.0.0.1');
    const isVercel = origin && (origin.endsWith('.vercel.app') || origin.includes('vercel.app'));
    
    if (isLocal || isVercel) {
      console.log('CORS Check: ALLOWED');
      callback(null, true);
    } else {
      console.log('CORS Check: BLOCKED');
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/policyholders', require('./routes/policyholders'));
app.use('/api/policies', require('./routes/policies'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/service-providers', require('./routes/service_providers'));
app.use('/api/surveyors', require('./routes/surveyors'));

const reviewAndPaymentsRoute = require('./routes/reviews_payments');
app.use('/api', reviewAndPaymentsRoute);

// Database connection
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/icps';

console.log('DEBUG: CONNECTING TO MONGODB...', MONGODB_URI);
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
