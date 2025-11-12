import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRouteSchema, insertShipComplianceSchema, insertBankEntrySchema } from "@shared/schema";
import { z } from "zod";

const TARGET_INTENSITY_2025 = 89.3368;
const ENERGY_CONVERSION_FACTOR = 41000;

function calculateComplianceBalance(
  targetIntensity: number,
  actualIntensity: number,
  fuelConsumption: number
): number {
  const energyInScope = fuelConsumption * ENERGY_CONVERSION_FACTOR;
  const cb = (targetIntensity - actualIntensity) * energyInScope / 1000000;
  return cb;
}

function calculateGreedyPoolAllocation(members: Array<{ shipId: string; cbBefore: number }>) {
  const sorted = [...members].sort((a, b) => b.cbBefore - a.cbBefore);
  
  const surplus = sorted.filter(m => m.cbBefore > 0);
  const deficit = sorted.filter(m => m.cbBefore < 0);
  
  const result: Array<{ shipId: string; cbBefore: number; cbAfter: number }> = [];
  
  const surplusRemaining = surplus.map(s => ({ ...s, remaining: s.cbBefore }));
  const deficitRemaining = deficit.map(d => ({ ...d, remaining: d.cbBefore }));
  
  for (const def of deficitRemaining) {
    let needed = Math.abs(def.remaining);
    let received = 0;
    
    for (const sur of surplusRemaining) {
      if (sur.remaining > 0 && needed > 0) {
        const transfer = Math.min(sur.remaining, needed);
        sur.remaining -= transfer;
        received += transfer;
        needed -= transfer;
      }
    }
    
    result.push({
      shipId: def.shipId,
      cbBefore: def.cbBefore,
      cbAfter: def.cbBefore + received
    });
  }
  
  for (const sur of surplusRemaining) {
    result.push({
      shipId: sur.shipId,
      cbBefore: sur.cbBefore,
      cbAfter: sur.remaining
    });
  }
  
  return result;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/routes", async (req, res) => {
    try {
      const allRoutes = await storage.getAllRoutes();
      res.json(allRoutes);
    } catch (error) {
      console.error("Error fetching routes:", error);
      res.status(500).json({ error: "Failed to fetch routes" });
    }
  });

  app.post("/api/routes/:id/baseline", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid route ID" });
      }

      const route = await storage.getRouteById(id);
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
      }

      const updatedRoute = await storage.setBaseline(id);
      res.json(updatedRoute);
    } catch (error) {
      console.error("Error setting baseline:", error);
      res.status(500).json({ error: "Failed to set baseline" });
    }
  });

  app.get("/api/routes/comparison", async (req, res) => {
    try {
      const baseline = await storage.getBaselineRoute();
      const allRoutes = await storage.getAllRoutes();

      if (!baseline) {
        return res.json({ baseline: null, comparisons: [] });
      }

      const comparisons = allRoutes
        .filter(r => !r.isBaseline)
        .map(route => {
          const percentDiff = ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100;
          const compliant = route.ghgIntensity <= TARGET_INTENSITY_2025;

          return {
            routeId: route.routeId,
            ghgIntensity: route.ghgIntensity,
            vesselType: route.vesselType,
            fuelType: route.fuelType,
            year: route.year,
            percentDiff,
            compliant
          };
        });

      res.json({
        baseline: {
          routeId: baseline.routeId,
          ghgIntensity: baseline.ghgIntensity,
          vesselType: baseline.vesselType,
          fuelType: baseline.fuelType,
          year: baseline.year
        },
        comparisons
      });
    } catch (error) {
      console.error("Error fetching comparison:", error);
      res.status(500).json({ error: "Failed to fetch comparison data" });
    }
  });

  app.get("/api/compliance/cb", async (req, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      
      if (!year) {
        return res.status(400).json({ error: "Year parameter is required" });
      }

      const allCompliance = await storage.getAllShipComplianceByYear(year);

      const complianceData = await Promise.all(
        allCompliance.map(async compliance => {
          const bankedAmount = await storage.getTotalBankedAmount(compliance.shipId, year);
          const adjustedCb = compliance.cbGco2eq - bankedAmount;

          return {
            shipId: compliance.shipId,
            year,
            cbGco2eq: compliance.cbGco2eq,
            adjustedCb,
            bankedAmount
          };
        })
      );

      res.json(complianceData);
    } catch (error) {
      console.error("Error fetching compliance balance:", error);
      res.status(500).json({ error: "Failed to fetch compliance balance" });
    }
  });

  app.get("/api/compliance/adjusted-cb", async (req, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      
      if (!year) {
        return res.status(400).json({ error: "Year parameter is required" });
      }

      const allCompliance = await storage.getAllShipComplianceByYear(year);

      const adjustedData = await Promise.all(
        allCompliance.map(async compliance => {
          const bankedAmount = await storage.getTotalBankedAmount(compliance.shipId, year);
          const adjustedCb = compliance.cbGco2eq - bankedAmount;

          return {
            shipId: compliance.shipId,
            year,
            adjustedCb
          };
        })
      );

      res.json(adjustedData);
    } catch (error) {
      console.error("Error fetching adjusted CB:", error);
      res.status(500).json({ error: "Failed to fetch adjusted compliance balance" });
    }
  });

  app.get("/api/banking/records", async (req, res) => {
    try {
      const shipId = req.query.shipId as string;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;

      if (!shipId || !year) {
        return res.status(400).json({ error: "shipId and year parameters are required" });
      }

      const records = await storage.getBankEntries(shipId, year);
      res.json(records);
    } catch (error) {
      console.error("Error fetching bank records:", error);
      res.status(500).json({ error: "Failed to fetch banking records" });
    }
  });

  app.post("/api/banking/bank", async (req, res) => {
    try {
      const schema = z.object({
        shipId: z.string(),
        year: z.number(),
        amount: z.number().positive()
      });

      const data = schema.parse(req.body);

      const compliance = await storage.getShipCompliance(data.shipId, data.year);
      if (!compliance) {
        return res.status(404).json({ error: "Compliance record not found" });
      }

      if (compliance.cbGco2eq <= 0) {
        return res.status(400).json({ error: "Cannot bank negative or zero compliance balance" });
      }

      if (data.amount > compliance.cbGco2eq) {
        return res.status(400).json({ error: "Cannot bank more than available positive balance" });
      }

      const entry = await storage.createBankEntry({
        shipId: data.shipId,
        year: data.year,
        amountGco2eq: data.amount
      });

      res.json(entry);
    } catch (error) {
      console.error("Error banking surplus:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to bank surplus" });
    }
  });

  app.post("/api/banking/apply", async (req, res) => {
    try {
      const schema = z.object({
        shipId: z.string(),
        year: z.number(),
        amount: z.number().positive()
      });

      const data = schema.parse(req.body);

      const bankedAmount = await storage.getTotalBankedAmount(data.shipId, data.year);
      
      if (bankedAmount === 0) {
        return res.status(400).json({ error: "No banked surplus available" });
      }

      if (data.amount > bankedAmount) {
        return res.status(400).json({ error: "Cannot apply more than available banked amount" });
      }

      const entry = await storage.createBankEntry({
        shipId: data.shipId,
        year: data.year,
        amountGco2eq: -data.amount
      });

      res.json(entry);
    } catch (error) {
      console.error("Error applying banked surplus:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to apply banked surplus" });
    }
  });

  app.post("/api/pools", async (req, res) => {
    try {
      const schema = z.object({
        year: z.number(),
        members: z.array(z.object({
          shipId: z.string(),
          cbBefore: z.number()
        })).min(2)
      });

      const data = schema.parse(req.body);

      const totalCb = data.members.reduce((sum, m) => sum + m.cbBefore, 0);
      
      if (totalCb < 0) {
        return res.status(400).json({ error: "Total pool compliance balance must be non-negative" });
      }

      const allocation = calculateGreedyPoolAllocation(data.members);

      for (const member of allocation) {
        if (member.cbBefore < 0 && member.cbAfter < member.cbBefore) {
          return res.status(400).json({ 
            error: "Deficit ship cannot exit worse after pooling",
            ship: member.shipId 
          });
        }
        if (member.cbBefore > 0 && member.cbAfter < 0) {
          return res.status(400).json({ 
            error: "Surplus ship cannot exit with negative balance",
            ship: member.shipId 
          });
        }
      }

      const pool = await storage.createPool({ year: data.year });

      const members = await Promise.all(
        allocation.map(member =>
          storage.createPoolMember({
            poolId: pool.id,
            shipId: member.shipId,
            cbBefore: member.cbBefore,
            cbAfter: member.cbAfter
          })
        )
      );

      res.json({
        poolId: pool.id,
        year: pool.year,
        members: members.map(m => ({
          shipId: m.shipId,
          cbBefore: m.cbBefore,
          cbAfter: m.cbAfter
        }))
      });
    } catch (error) {
      console.error("Error creating pool:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create pool" });
    }
  });

  app.get("/api/pools", async (req, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      if (!year) return res.status(400).json({ error: "Year parameter is required" });

      const pools = await storage.getPoolsByYear(year);
      res.json(pools.map(p => ({ id: p.id, year: p.year, members: p.members })));
    } catch (error) {
      console.error("Error fetching pools:", error);
      res.status(500).json({ error: "Failed to fetch pools" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
