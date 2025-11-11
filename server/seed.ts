import { db } from "./db";
import { routes, shipCompliance, bankEntries, pools, poolMembers } from "@shared/schema";

const seedRoutes = [
  {
    routeId: "R001",
    vesselType: "Container",
    fuelType: "HFO",
    year: 2024,
    ghgIntensity: 91.0,
    fuelConsumption: 5000,
    distance: 12000,
    totalEmissions: 4500,
    isBaseline: true,
  },
  {
    routeId: "R002",
    vesselType: "BulkCarrier",
    fuelType: "LNG",
    year: 2024,
    ghgIntensity: 88.0,
    fuelConsumption: 4800,
    distance: 11500,
    totalEmissions: 4200,
    isBaseline: false,
  },
  {
    routeId: "R003",
    vesselType: "Tanker",
    fuelType: "MGO",
    year: 2024,
    ghgIntensity: 93.5,
    fuelConsumption: 5100,
    distance: 12500,
    totalEmissions: 4700,
    isBaseline: false,
  },
  {
    routeId: "R004",
    vesselType: "RoRo",
    fuelType: "HFO",
    year: 2025,
    ghgIntensity: 89.2,
    fuelConsumption: 4900,
    distance: 11800,
    totalEmissions: 4300,
    isBaseline: false,
  },
  {
    routeId: "R005",
    vesselType: "Container",
    fuelType: "LNG",
    year: 2025,
    ghgIntensity: 90.5,
    fuelConsumption: 4950,
    distance: 11900,
    totalEmissions: 4400,
    isBaseline: false,
  },
];

const seedShipCompliance = [
  {
    shipId: "SHIP001",
    routeId: "R001",
    year: 2024,
    cbGco2eq: -150.5,
  },
  {
    shipId: "SHIP002",
    routeId: "R002",
    year: 2024,
    cbGco2eq: 220.8,
  },
  {
    shipId: "SHIP003",
    routeId: "R003",
    year: 2024,
    cbGco2eq: -180.3,
  },
  {
    shipId: "SHIP004",
    routeId: "R004",
    year: 2025,
    cbGco2eq: -45.2,
  },
  {
    shipId: "SHIP005",
    routeId: "R005",
    year: 2025,
    cbGco2eq: 120.6,
  },
];

const seedBankEntries = [
  {
    shipId: "SHIP002",
    year: 2024,
    amountGco2eq: 100.0,
  },
  {
    shipId: "SHIP002",
    year: 2024,
    amountGco2eq: 50.5,
  },
  {
    shipId: "SHIP005",
    year: 2025,
    amountGco2eq: 80.3,
  },
];

const seedPools = [
  {
    year: 2024,
  },
];

const seedPoolMembers = [
  {
    poolId: 1,
    shipId: "SHIP001",
    cbBefore: -150.5,
    cbAfter: -50.2,
  },
  {
    poolId: 1,
    shipId: "SHIP002",
    cbBefore: 220.8,
    cbAfter: 120.5,
  },
];

async function seed() {
  console.log("Starting database seed...");

  try {
    const existingRoutes = await db.select().from(routes);
    
    if (existingRoutes.length > 0) {
      console.log("Database already seeded. Skipping...");
      return;
    }

    console.log("Inserting seed routes...");
    await db.insert(routes).values(seedRoutes);

    console.log("Inserting ship compliance records...");
    await db.insert(shipCompliance).values(seedShipCompliance);

    console.log("Inserting bank entries...");
    await db.insert(bankEntries).values(seedBankEntries);

    console.log("Inserting pools...");
    await db.insert(pools).values(seedPools);

    console.log("Inserting pool members...");
    await db.insert(poolMembers).values(seedPoolMembers);

    console.log("Seed completed successfully!");
    console.log(`Inserted ${seedRoutes.length} routes`);
    console.log(`Inserted ${seedShipCompliance.length} compliance records`);
    console.log(`Inserted ${seedBankEntries.length} bank entries`);
    console.log(`Inserted ${seedPools.length} pools`);
    console.log(`Inserted ${seedPoolMembers.length} pool members`);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("Seed process finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  });
