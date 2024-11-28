require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const authRoutes = require('./routes/auth');
const tradeRoutes = require('./routes/trade');
const portfolioRoutes = require('./routes/portfolio');
require('./config/passport');

const app = express();

// Connect to MySQL database
const db = require('./config/database');
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  } else {
    console.log('Connected to the MySQL database');
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


app.use('/auth', authRoutes);
app.use('/trade', tradeRoutes);
app.use('/portfolio', portfolioRoutes);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Add a route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  // Add a route to serve the registration form

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
  });

  // Add a route to serve the login form
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  });

app.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
        }
        else {
        res.redirect('/login');
        }
    }
);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(3000, () => console.log('Server running on port 3000'));