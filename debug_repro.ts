import { calculateEstimation } from "./src/logic/bayes-estimator";
import { funkyJuggler2Config } from "./src/data/machines/funky-juggler-2";
import { hanaHoohConfig } from "./src/data/machines/hana-hooh";

console.log("=== Testing Funky Juggler 2 ===");
try {
  const inputs = {
    "total-games": 1000,
    "big-count": 4,
    "reg-count": 3,
    "grape-count": 160,
  };
  const results = calculateEstimation(funkyJuggler2Config, inputs);
  console.log("Results:", JSON.stringify(results, null, 2));
} catch (e) {
  console.error("Error in Funky Juggler 2:", e);
}

console.log("\n=== Testing Hana Hooh ===");
try {
  const inputs = {
    "total-games": 1000,
    "big-count": 4,
    "reg-count": 3,
    "bell-count": 130,
  };
  const results = calculateEstimation(hanaHoohConfig, inputs);
  console.log("Results:", JSON.stringify(results, null, 2));
} catch (e) {
  console.error("Error in Hana Hooh:", e);
}
