const basePrices = require('../data/basePrices.json');
const distances = require('../data/distances.json');

function getBasePrice(state) {
  return basePrices[state] || null;
}

function getDistance(source, destination) {
  return distances[source]?.[destination] ||
         distances[destination]?.[source] ||
         1000; // default if unknown
}

function calculateTransmissionCharge(distance) {
  return 0.3 * (distance / 1000) + 0.1;
}

function calculateStoragePremium(highPrice = 4.5, lowPrice = 3.0, efficiency = 0.9) {
  return (highPrice - lowPrice) * efficiency;  // Default premium = ₹1.35
}


function calculateFinalPrice(source, destination, amountKWh, hasStorage = false) {
  const base = getBasePrice(source);
  const destExists = getBasePrice(destination);

  if (!base || !destExists) {
    return { error: "Invalid state(s)" };
  }

  let transmission = 0;
  if (source !== destination) {
    const distance = getDistance(source, destination);
    transmission = calculateTransmissionCharge(distance);
  }

  let storagePremium = 0;
  if (hasStorage) {
    storagePremium = calculateStoragePremium(); // ₹1.35 by default
  }

  const perKWh = base + transmission + storagePremium;
  const total = perKWh * amountKWh;

  return {
    source,
    destination,
    basePrice: base,
    transmissionCharge: transmission,
    storagePremium,
    finalPricePerKWh: perKWh,
    totalPrice: total
  };
}


module.exports = {
  getBasePrice,
  calculateFinalPrice
};
