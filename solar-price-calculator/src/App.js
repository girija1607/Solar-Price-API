import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [states, setStates] = useState({});
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [hasStorage, setHasStorage] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [location, setLocation] = useState("");
const [usage, setUsage] = useState("");
const [type, setType] = useState("residential");
const [date, setDate] = useState("");
const [solarResult, setSolarResult] = useState(null);

  useEffect(() => {
   axios.get("https://solar-price-api.onrender.com/states")
      .then(res => setStates(res.data))
      .catch(err => setError("Failed to fetch states"));
  }, []);

  const handleSubmit = async () => {
    if (!source || !destination || !amount) {
      setError("Please fill all fields");
      return;
    }

    try {
      const res = await axios.get("https://solar-price-api.onrender.com/price", {
  params: {
    source,
    destination,
    amount,
    hasStorage

        }
      });
      setResult(res.data);
      setError("");
    } catch (err) {
      setError("Error calculating price. Check your input.");
    }
  };

   const handleAdvancedSubmit = async () => {
    if (!location || !usage || !type) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const res = await axios.get("https://solar-price-api.onrender.com/api/solar-price", {
        params: {
          location,
          usage,
          type,
          date,
        },
      });
      setSolarResult(res.data);
      console.log("Advanced Solar Result:", res.data);

      setError("");
    } catch (err) {
      setError("Error fetching advanced solar price");
    }
  };

  return (
    <div className="App">
      <h1>🔆 Solar Price Calculator</h1>

      <div>
        <label>Source State:</label>
        <select value={source} onChange={e => setSource(e.target.value)}>
          <option value="">Select</option>
          {Object.keys(states).map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Destination State:</label>
        <select value={destination} onChange={e => setDestination(e.target.value)}>
          <option value="">Select</option>
          {Object.keys(states).map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Amount (kWh):</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={hasStorage}
            onChange={() => setHasStorage(!hasStorage)}
          />
          I have storage capacity
        </label>
      </div>

      <button onClick={handleSubmit}>Calculate</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div className="result">
          <h2>Result</h2>
          <p><strong>Base Price:</strong> ₹{result.basePrice}</p>
          <p><strong>Transmission Charge:</strong> ₹{result.transmissionCharge}</p>
          {hasStorage && (
            <p><strong>Storage Premium:</strong> ₹{result.storagePremium}</p>
          )}
          <p><strong>Final Price per kWh:</strong> ₹{result.finalPricePerKWh}</p>
          <p><strong>Total Price:</strong> ₹{result.totalPrice}</p>
        </div>
      )}
      <hr />
      <h2>🔍 Advanced Solar Price Estimate</h2>

      <div>
        <label>Location:</label>
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">Select</option>
          {Object.keys(states).map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Usage (kWh):</label>
        <input
          type="number"
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
        />
      </div>

      <div>
        <label>Type:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
        </select>
      </div>

      <div>
        <label>Date (optional):</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <button onClick={handleAdvancedSubmit}>Get Advanced Estimate</button>

      {solarResult && (
        <div className="result">
          <h2>Advanced Estimate</h2>
          <p><strong>Location:</strong> {solarResult.location}</p>
          <p><strong>Type:</strong> {solarResult.type}</p>
          <p><strong>Usage:</strong> {solarResult.usage}</p>
          <p><strong>Price per kWh:</strong> ₹{solarResult.price_per_kWh}</p>
          <p><strong>Estimated Monthly Cost:</strong> ₹{solarResult.estimated_monthly_cost}</p>
          <p><strong>Grid Price per kWh:</strong> ₹{solarResult.grid_price_per_kWh}</p>
          <p><strong>Subsidy:</strong> {solarResult.subsidy * 100}%</p>
          <p><strong>Subsidized Cost:</strong> ₹{solarResult.subsidized_cost}</p>
          {console.log("Rendered Subsidized Cost:", solarResult.subsidized_cost)}

          <p><strong>Savings vs Grid:</strong> ₹{solarResult.savings_vs_grid}</p>
          <p><strong>Data Source:</strong> {solarResult.data_source}</p>
          <p><strong>Date:</strong> {new Date(solarResult.date).toLocaleString()}</p>
        </div>
      )}

    </div>
  );
}

export default App;

