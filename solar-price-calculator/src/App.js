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
    </div>
  );
}

export default App;

