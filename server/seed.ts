import { db } from "./db";
import { routes, shipCompliance, bankEntries, pools, poolMembers } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

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
  // extra ships for pooling scenarios
  {
    shipId: "SHIP004",
    routeId: "R002",
    year: 2024,
    cbGco2eq: 160.0,
  },
  {
    shipId: "SHIP005",
    routeId: "R001",
    year: 2024,
    cbGco2eq: 120.0,
  },
  {
    shipId: "SHIP006",
    routeId: "R002",
    year: 2024,
    cbGco2eq: 400.0,
  },
  {
    shipId: "SHIP007",
    routeId: "R003",
    year: 2024,
    cbGco2eq: 200.0,
  },
  {
    shipId: "SHIP008",
    routeId: "R004",
    year: 2025,
    cbGco2eq: -45.2,
  },
  {
    shipId: "SHIP009",
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
    poolId: 2,
    shipId: "SHIP002",
    cbBefore: 220.8,
    cbAfter: 120.5,
  },
];

async function seed() {
  console.log("Starting database seed...");

  try {
    // insert routes only if missing
    const existingRoutes = await db.select().from(routes);
    if (existingRoutes.length === 0) {
      console.log("Inserting seed routes...");
      await db.insert(routes).values(seedRoutes);
    } else {
      console.log("Routes already present, skipping route insert.");
    }

    // insert ship compliance entries if they don't already exist (by shipId+year)
    console.log("Ensuring ship compliance records...");
    for (const entry of seedShipCompliance) {
      const exists = await db.select().from(shipCompliance).where(
        and(eq(shipCompliance.shipId, entry.shipId), eq(shipCompliance.year, entry.year)),
      );
      if (exists.length === 0) {
        await db.insert(shipCompliance).values(entry);
        console.log(`Inserted ship compliance for ${entry.shipId} (${entry.year})`);
      } else {
        console.log(`Ship compliance for ${entry.shipId} (${entry.year}) already exists`);
      }
    }

    // insert bank entries if missing (simple check by shipId+year+amount)
    console.log("Ensuring bank entries...");
    for (const entry of seedBankEntries) {
      const exists = await db.select().from(bankEntries).where(
        and(eq(bankEntries.shipId, entry.shipId), eq(bankEntries.year, entry.year), eq(bankEntries.amountGco2eq, entry.amountGco2eq)),
      );
      if (exists.length === 0) {
        await db.insert(bankEntries).values(entry);
        console.log(`Inserted bank entry for ${entry.shipId} (${entry.year}) amount=${entry.amountGco2eq}`);
      } else {
        console.log(`Bank entry for ${entry.shipId} (${entry.year}) amount=${entry.amountGco2eq} already exists`);
      }
    }

    // create pools only if none exist for given year
    console.log("Ensuring pools and pool members...");
    for (const p of seedPools) {
      const existing = await db.select().from(pools).where(sql`year = ${p.year}`);
      if (existing.length === 0) {
        const [newPool] = await db.insert(pools).values(p).returning();
        console.log(`Inserted pool for year ${p.year} id=${newPool.id}`);

        // find members intended for this pool
        const membersForYear = seedPoolMembers.filter(m => m.poolId === 1); // original mapping uses poolId 1
        for (const m of membersForYear) {
          await db.insert(poolMembers).values({ poolId: newPool.id, shipId: m.shipId, cbBefore: m.cbBefore, cbAfter: m.cbAfter });
          console.log(`Inserted pool member ${m.shipId} for pool ${newPool.id}`);
        }
      } else {
        console.log(`Pool for year ${p.year} already exists`);
      }
    }

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
