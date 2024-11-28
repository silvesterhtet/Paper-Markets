const { DataTypes } = require('mysql2');
const db = require('../config/database'); // Ensure this path is correct

// Function to add a trade
const addTrade = (trade, callback) => {
  const query = 'INSERT INTO trades (userId, symbol, quantity, price, tradeType, date) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [trade.userId, trade.symbol, trade.quantity, trade.price, trade.tradeType, trade.date || new Date()];
  db.query(query, values, (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

// Function to get all trades
const getAllTrades = (callback) => {
  const query = 'SELECT * FROM trades';
  db.query(query, (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

// Function to delete a trade by ID
const deleteTradeById = (id, callback) => {
  const query = 'DELETE FROM trades WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

module.exports = {
  addTrade,
  getAllTrades,
  deleteTradeById
};