require('dotenv').config(); 
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 

const app = express();

// --- Middleware ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://ceylon-traveler.onrender.com',
  /\.vercel\.app$/
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => o instanceof RegExp ? o.test(origin) : o === origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions)); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ✅ GLOBAL LOGGER (Paste this block) ---
app.use((req, res, next) => {
    console.log(`\n👉 [${new Date().toLocaleTimeString()}] Request Received: ${req.method} ${req.url}`);
    next();
});
// ------------------------------------------

// --- Connect to MongoDB ---
const connectDB = require('./config/db');
connectDB();

mongoose.connection.on('connected', () => console.log('Mongoose connected to DB ✅'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));

// --- Define API Routes ---
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/admin', require('./routes/adminRoutes')); 
// Add other routes as needed...
app.use('/api/rooms', require('./routes/roomRoutes')); 
app.use('/api/hotels', require('./routes/hotelRoutes'));
app.use('/api/hotel', require('./routes/hotelRoutes')); 
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/taxi', require('./routes/taxiRoutes')); 
app.use('/api/guide', require('./routes/guideRoutes'));
app.use('/api/planning', require('./routes/planningRoutes'));
app.use('/api/trips', require('./routes/tripRoutes')); 
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));

// --- Basic Root Route ---
app.get('/', (req, res) => {
    res.send('Ceylon Traveler API is running...');
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const server = http.createServer(app);
const io = new Server(server, {
    cors: corsOptions
});

// --- Socket.io Logic ---
io.on('connection', (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`👤 User ${socket.id} joined room: ${room}`);
    });

    socket.on('send_message', async (data) => {
        const { sender, receiver, content, room } = data;
        
        try {
            // Save message to database
            const newMessage = new Message({
                sender,
                receiver,
                content,
                room
            });
            await newMessage.save();

            // Emit to both parties in the room
            io.to(room).emit('receive_message', data);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('typing', (data) => {
        socket.to(data.room).emit('user_typing', data);
    });

    socket.on('disconnect', () => {
        console.log('👋 User disconnected');
    });
});

server.listen(PORT, () => console.log(`Backend server is running on port ${PORT} ✅`));