require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const {HoldingsModel}=require('./model/HoldingsModel');
const {OrdersModel}=require('./model/OrdersModel');
const {PositionsModel}=require('./model/PositionsModel');
const {UserModel}=require('./model/UserModel');
const cors=require('cors');
const bodyParser=require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');    

const app = express();

// CORS configuration - automatically handles OPTIONS preflight requests
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Chrome DevTools occasionally probes this endpoint; respond gracefully to avoid CSP warnings
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.status(204).end();
});

app.get('/', (req, res) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.status(200).json({ status: 'TradeMate API running' });
});

//   app.get('/addHolding', async (req, res) => {
//     try {
//       let tempHoldings = [
//         { name: "BHARTIARTL", qty: 2, avg: 538.05, price: 541.15, net: "+0.58%", day: "+2.99%" },
//         { name: "HDFCBANK", qty: 2, avg: 1383.4, price: 1522.35, net: "+10.04%", day: "+0.11%" },
//         { name: "HINDUNILVR", qty: 1, avg: 2335.85, price: 2417.4, net: "+3.49%", day: "+0.21%" },
//         { name: "INFY", qty: 1, avg: 1350.5, price: 1555.45, net: "+15.18%", day: "-1.60%", isLoss: true },
//         { name: "ITC", qty: 5, avg: 202.0, price: 207.9, net: "+2.92%", day: "+0.80%" },
//         { name: "KPITTECH", qty: 5, avg: 250.3, price: 266.45, net: "+6.45%", day: "+3.54%" },
//         { name: "M&M", qty: 2, avg: 809.9, price: 779.8, net: "-3.72%", day: "-0.01%", isLoss: true },
//         { name: "RELIANCE", qty: 1, avg: 2193.7, price: 2112.4, net: "-3.71%", day: "+1.44%" },
//         { name: "SBIN", qty: 4, avg: 324.35, price: 430.2, net: "+32.63%", day: "-0.34%", isLoss: true },
//         { name: "SGBMAY29", qty: 2, avg: 4727.0, price: 4719.0, net: "-0.17%", day: "+0.15%" },
//         { name: "TATAPOWER", qty: 5, avg: 104.2, price: 124.15, net: "+19.15%", day: "-0.24%", isLoss: true },
//         { name: "TCS", qty: 1, avg: 3041.7, price: 3194.8, net: "+5.03%", day: "-0.25%", isLoss: true },
//         { name: "WIPRO", qty: 4, avg: 489.3, price: 577.75, net: "+18.08%", day: "+0.32%" }
//       ];
  
//       for (let holding of tempHoldings) {
//         const newHolding = new HoldingsModel(holding);
//         await newHolding.save();
//       }
  
//       res.status(200).json({ message: "✅ Holdings added successfully" });
//     } catch (err) {
//       console.error("❌ Error adding holdings:", err.message);
//       res.status(500).json({ error: "Failed to add holdings" });
//     }
//   });
// app.get('/addPosition', async (req, res) => {
//     try {
//       const tempPositions = [
//         {
//           product: "CNC",
//           name: "EVEREADY",
//           qty: 2,
//           avg: 316.27,
//           price: 312.35,
//           net: "+0.58%",
//           day: "-1.24%",
//           isLoss: true,
//         },
//         {
//           product: "CNC",
//           name: "JUBLFOOD",
//           qty: 1,
//           avg: 3124.75,
//           price: 3082.65,
//           net: "+10.04%",
//           day: "-1.35%",
//           isLoss: true,
//         },
//         {
//           product: "MIS",
//           name: "HDFCBANK",
//           qty: 3,
//           avg: 1530.2,
//           price: 1525.9,
//           net: "-0.28%",
//           day: "-0.31%",
//           isLoss: true,
//         }
//       ];
  
//       // ✅ Insert all positions at once
//       await PositionsModel.insertMany(tempPositions);
  
//       res.status(200).json({ message: "✅ Positions added successfully" });
//     } catch (err) {
//       console.error("❌ Error adding positions:", err.message);
//       res.status(500).json({ error: "Failed to add positions" });
//     }
//   });
const PORT = process.env.PORT || 3002;
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

if (!MONGO_URL) {
  console.error("❌ MONGO_URL not found in .env");
  process.exit(1);
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// Authentication Routes
// Signup
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields (name, email, password) are required' });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('❌ Error in signup:', err.message);
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('❌ Error in login:', err.message);
    res.status(500).json({ error: 'Failed to login', details: err.message });
  }
});

// Verify token (for frontend to check if user is authenticated)
app.get('/verify', authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('❌ Error verifying token:', err.message);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

// Routes - Define all routes before starting server
// Protected routes - require authentication
app.get('/allHoldings', authenticateToken, async (req, res) => {
  try {
    const allHoldings = await HoldingsModel.find();
    res.status(200).json({ allHoldings });
  } catch (err) {
    console.error("❌ Error fetching holdings:", err.message);
    res.status(500).json({ error: "Failed to fetch holdings" });
  }
});

app.get('/allPositions', authenticateToken, async (req, res) => {
  try {
    const allPositions = await PositionsModel.find();
    res.status(200).json({ allPositions });
  } catch (err) {
    console.error("❌ Error fetching positions:", err.message);
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

// Handle POST requests to /newOrder
app.post("/newOrder", authenticateToken, async (req, res) => {
  try {
    console.log("✅ Received POST request to /newOrder");
    console.log("Request body:", req.body);
    
    const { name, qty, price, mode } = req.body;
    
    if (!name || qty === undefined || price === undefined || !mode) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        received: { name, qty, price, mode },
        message: "All fields (name, qty, price, mode) are required" 
      });
    }
    
    const newOrder = new OrdersModel({
      name,
      qty: Number(qty),
      price: Number(price),
      mode,
      userId: req.user.userId // Associate order with user
    });
    
    await newOrder.save();
    console.log("✅ Order saved successfully:", newOrder);
    res.status(200).json({ message: "✅ Order added successfully", order: newOrder });
  } catch (err) {
    console.error("❌ Error adding order:", err.message);
    res.status(500).json({ error: "Failed to add order", details: err.message });
  }
});

// Get all orders (only for authenticated user)
app.get('/allOrders', authenticateToken, async (req, res) => {
  try {
    const allOrders = await OrdersModel.find({ userId: req.user.userId });
    res.status(200).json({ allOrders });
  } catch (err) {
    console.error("❌ Error fetching orders:", err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    // Start server only after MongoDB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Available routes:`);
      console.log(`   POST http://localhost:${PORT}/signup`);
      console.log(`   POST http://localhost:${PORT}/login`);
      console.log(`   GET  http://localhost:${PORT}/verify`);
      console.log(`   GET  http://localhost:${PORT}/allHoldings (Protected)`);
      console.log(`   GET  http://localhost:${PORT}/allPositions (Protected)`);
      console.log(`   GET  http://localhost:${PORT}/allOrders (Protected)`);
      console.log(`   POST http://localhost:${PORT}/newOrder (Protected)`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Please check your MongoDB connection string and credentials");
    process.exit(1);
  });



























