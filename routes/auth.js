const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const db = require('../config/database'); // Import MySQL database connection
const router = express.Router();

// Helper function to validate username
const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  };
  
  // Helper function to validate password (alphanumeric only)
  const validatePassword = (password) => {
    const passwordRegex = /^[a-zA-Z0-9]{8,30}$/;
    return passwordRegex.test(password);
  };
  
  // Registration route
  router.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    // Validate username and password
    if (!validateUsername(username)) {
      return res.status(400).json({ error: 'Username must be 3-20 characters long and can only contain alphanumeric characters, underscores, and hyphens.' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be 8-30 characters long and contain only alphanumeric characters.' });
    }
  
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
        db.query(query, [username, hashedPassword], (err, results) => {
          if (err) {
            return res.status(500).json({ error: 'Username is taken' });
          }
          res.json({ message: 'User registered successfully' });
        });
      } catch (err) {
        res.status(500).json({ error: 'Failed to hash password' });
      }
    });
  
  router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  }));
  
  router.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  });
  
  module.exports = router;