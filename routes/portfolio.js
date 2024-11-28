const express = require('express');
const request = require('request');
const db = require('../config/database'); // Import MySQL database connection
const router = express.Router();

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Middleware to ensure the user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Route to fetch portfolio information
router.get('/info', ensureAuthenticated, (req, res) => {
  const userId = req.user.id; // Assuming user ID is stored in req.user
  const query = 'SELECT symbol, name, price, shares FROM positions WHERE user_id = ?';
  db.query(query, [userId], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch portfolio information' });
    }

    // Fetch the latest price for each stock from Alpha Vantage API
    const updatedResults = await Promise.all(results.map(async (position) => {
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${position.symbol}&interval=5min&apikey=${ALPHA_VANTAGE_API_KEY}`;
      return new Promise((resolve, reject) => {
        request.get({
          url: url,
          json: true,
          headers: { 'User-Agent': 'request' }
        }, (err, response, data) => {
          if (err) {
            console.log('Error:', err);
            resolve(position); // Return the original position if the API call fails
          } else if (response.statusCode !== 200) {
            console.log('Status:', response.statusCode);
            resolve(position); // Return the original position if the API call fails
          } else {
            // Data is successfully parsed as a JSON object
            const timeSeries = data['Time Series (5min)'];
            const latestTime = Object.keys(timeSeries)[0];
            const latestPrice = timeSeries[latestTime]['4. close'];
            resolve({ ...position, price: latestPrice });
          }
        });
      });
    }));

    res.json(updatedResults);
  });
});

// Route to fetch portfolio history
router.get('/history', ensureAuthenticated, (req, res) => {
  const userId = req.user.id; // Assuming user ID is stored in req.user
  const { timeframe } = req.query; // Get the timeframe from query parameters
  const query = 'SELECT date, value FROM portfolio_history WHERE user_id = ? AND timeframe = ?';
  db.query(query, [userId, timeframe], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch portfolio history' });
    }
    res.json(results);
  });
});

// Route to handle buying stocks
router.post('/buy', ensureAuthenticated, (req, res) => {
  const userId = req.user.id; // Assuming user ID is stored in req.user
  const { symbol, name, price, shares } = req.body;

  // Fetch the current position for the stock
  const query = 'SELECT avg_price, shares FROM positions WHERE user_id = ? AND symbol = ?';
  db.query(query, [userId, symbol], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch current position' });
    }

    let newAvgPrice;
    let newShares;

    if (results.length > 0) {
      // Calculate the new average price and total shares
      const currentPosition = results[0];
      const oldAvgPrice = currentPosition.avg_price;
      const oldShares = currentPosition.shares;
      newShares = oldShares + shares;
      newAvgPrice = ((oldAvgPrice * oldShares) + (price * shares)) / newShares;

      // Update the existing position
      const updateQuery = 'UPDATE positions SET avg_price = ?, shares = ? WHERE user_id = ? AND symbol = ?';
      db.query(updateQuery, [newAvgPrice, newShares, userId, symbol], (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to update position' });
        }
        res.json({ message: 'Stock bought successfully' });
      });
    } else {
      // Insert a new position
      newAvgPrice = price;
      newShares = shares;
      const insertQuery = 'INSERT INTO positions (user_id, symbol, name, avg_price, shares) VALUES (?, ?, ?, ?, ?)';
      db.query(insertQuery, [userId, symbol, name, newAvgPrice, newShares], (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to buy stock' });
        }
        res.json({ message: 'Stock bought successfully' });
      });
    }
  });
});

// Route to handle selling stocks
router.post('/sell', ensureAuthenticated, (req, res) => {
  const userId = req.user.id; // Assuming user ID is stored in req.user
  const { symbol, shares } = req.body;
  const query = 'UPDATE positions SET shares = shares - ? WHERE user_id = ? AND symbol = ?';
  db.query(query, [shares, userId, symbol], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to sell stock' });
    }
    res.json({ message: 'Stock sold successfully' });
  });
});

// Route to search for stocks
router.get('/search', ensureAuthenticated, async (req, res) => {
  const { symbol } = req.query;
  const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
  try {
    request.get({
      url: url,
      json: true,
      headers: { 'User-Agent': 'request' }
    }, (err, response, data) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to search for stocks' });
      } else if (response.statusCode !== 200) {
        return res.status(response.statusCode).json({ error: 'Failed to search for stocks' });
      } else {
        res.json(data.bestMatches);
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to search for stocks' });
  }
});

module.exports = router;