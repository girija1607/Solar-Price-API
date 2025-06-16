const express = require('express');
const cors = require('cors');
const { getBasePrice, calculateFinalPrice } = require('./utils/calculate');
const basePrices = require('./data/basePrices.json');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');


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

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Solar Price API",
      version: "1.0.0",
      description: "API to calculate solar energy prices",
    },
  },
  apis: ["./index.js"],
};

/**
 * @swagger
 * /api/solar-price:
 *   get:
 *     summary: Get solar price estimate
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         required: true
 *         description: Location (city/state)
 *       - in: query
 *         name: usage
 *         schema:
 *           type: number
 *         required: true
 *         description: Energy usage in kWh
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         required: true
 *         description: Type of user (residential/commercial)
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional date/time
 *     responses:
 *       200:
 *         description: Price estimate
 */


const swaggerSpec = swaggerJsdoc(options);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get('/api/solar-price', (req, res) => {
  const { location, usage, type, date } = req.query;

  if (!location || !usage || !type) {
    return res.status(400).json({ error: "Missing required query parameters: location, usage, or type" });
  }

  const amountKWh = parseFloat(usage);
  const base = getBasePrice(location);

  if (!base || isNaN(amountKWh)) {
    return res.status(400).json({ error: "Invalid location or usage" });
  }

  // Example logic: commercial might be 5% more expensive
  const typeFactor = type === "commercial" ? 1.05 : 1;
  const pricePerKWh = (base * typeFactor).toFixed(2);
  const estimatedCost = (pricePerKWh * amountKWh).toFixed(2);

  const subsidyRate = 0.1; // 10%
  const gridPrice = 7.0; // ₹7/kWh (example)
  const costWithGrid = parseFloat((gridPrice * amountKWh).toFixed(2));
  const savings = parseFloat((costWithGrid - estimatedCost).toFixed(2));

  res.json({
    location,
    type,
    usage: `${amountKWh} kWh`,
    price_per_kWh: parseFloat(pricePerKWh),
    estimated_monthly_cost: parseFloat(estimatedCost),
    currency: "INR",
    data_source: "MNRE, IEX",
    date: date || new Date().toISOString(),
     subsidy: subsidyRate,
    grid_price_per_kWh: gridPrice,
    savings_vs_grid: savings
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Solar Price API running at http://localhost:${PORT}`);
});
