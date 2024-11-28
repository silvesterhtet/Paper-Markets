const express = require('express');
const { getStockData } = require('../services/alphaVantage');
const Trade = require('../models/Trade');
const router = express.Router();

router.get('/stocks/:symbol', async (req, res) => {
  const data = await getStockData(req.params.symbol);
  res.json(data);
});

router.post('/trade', async (req, res) => {
  const { userId, symbol, quantity, price, tradeType } = req.body;
  await Trade.create({ userId, symbol, quantity, price, tradeType });
  res.send('Trade successful');
});

module.exports = router;