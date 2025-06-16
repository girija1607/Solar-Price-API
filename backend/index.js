const express = require('express');
const cors = require('cors');
const { getBasePrice, calculateFinalPrice } = require('./utils/calculate');
const basePrices = require('./data/basePrices.json');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

// GET all states with base prices
app.get('/states', (req, res) => {
  res.json(basePrices);
});

// GET calculated price
app.get('/price', (req, res) => {
  const { source, destination, amount, hasStorage } = req.query;
  const amountKWh = parseFloat(amount);

  if (!source || !destination || isNaN(amountKWh)) {
    return res.status(400).json({ error: "Missing or invalid query parameters" });
  }

  const result = calculateFinalPrice(source, destination, amountKWh, hasStorage === 'true');
  if (result.error) return res.status(400).json({ error: result.error });

  res.json(result);
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Solar Price API running at http://localhost:${PORT}`);
});
