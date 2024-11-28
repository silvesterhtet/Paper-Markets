const axios = require('axios');

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

const getStockData = async (symbol) => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${AAMV03KLRYLBIFX0}`;
  const response = await axios.get(url);
  return response.data['Time Series (5min)'];
};

module.exports = { getStockData };