import {
  routes,
  shipCompliance,
  bankEntries,
  pools,
  poolMembers,
  type Route,
  type InsertRoute,
  type ShipCompliance,
  type InsertShipCompliance,
  type BankEntry,
  type InsertBankEntry,
  type Pool,
  type InsertPool,
  type PoolMember,
  type InsertPoolMember,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  getAllRoutes(): Promise<Route[]>;
  getRouteById(id: number): Promise<Route | undefined>;
  getRouteByRouteId(routeId: string): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  setBaseline(id: number): Promise<Route>;
  getBaselineRoute(): Promise<Route | undefined>;
  
  getShipCompliance(shipId: string, year: number): Promise<ShipCompliance | undefined>;
  createShipCompliance(compliance: InsertShipCompliance): Promise<ShipCompliance>;
  updateShipCompliance(id: number, cbGco2eq: number): Promise<ShipCompliance>;
  getAllShipComplianceByYear(year: number): Promise<ShipCompliance[]>;
  
  getBankEntries(shipId: string, year: number): Promise<BankEntry[]>;
  getTotalBankedAmount(shipId: string, year: number): Promise<number>;
  createBankEntry(entry: InsertBankEntry): Promise<BankEntry>;
  
  createPool(pool: InsertPool): Promise<Pool>;
  createPoolMember(member: InsertPoolMember): Promise<PoolMember>;
  getPoolMembers(poolId: number): Promise<PoolMember[]>;
}

export class DatabaseStorage implements IStorage {
  async getAllRoutes(): Promise<Route[]> {
    return await db.select().from(routes).orderBy(routes.year, routes.routeId);
  }

  async getRouteById(id: number): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.id, id));
    return route || undefined;
  }

  async getRouteByRouteId(routeId: string): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.routeId, routeId));
    return route || undefined;
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const [newRoute] = await db.insert(routes).values(route).returning();
    return newRoute;
  }

  async setBaseline(id: number): Promise<Route> {
    await db.update(routes).set({ isBaseline: false }).where(eq(routes.isBaseline, true));
    
    const [updatedRoute] = await db
      .update(routes)
      .set({ isBaseline: true })
      .where(eq(routes.id, id))
      .returning();
    
    return updatedRoute;
  }

  async getBaselineRoute(): Promise<Route | undefined> {
    const [baseline] = await db.select().from(routes).where(eq(routes.isBaseline, true));
    return baseline || undefined;
  }

  async getShipCompliance(shipId: string, year: number): Promise<ShipCompliance | undefined> {
    const [compliance] = await db
      .select()
      .from(shipCompliance)
      .where(and(eq(shipCompliance.shipId, shipId), eq(shipCompliance.year, year)));
    return compliance || undefined;
  }

  async createShipCompliance(compliance: InsertShipCompliance): Promise<ShipCompliance> {
    const [newCompliance] = await db
      .insert(shipCompliance)
      .values(compliance)
      .returning();
    return newCompliance;
  }

  async updateShipCompliance(id: number, cbGco2eq: number): Promise<ShipCompliance> {
    const [updated] = await db
      .update(shipCompliance)
      .set({ cbGco2eq })
      .where(eq(shipCompliance.id, id))
      .returning();
    return updated;
  }

  async getAllShipComplianceByYear(year: number): Promise<ShipCompliance[]> {
    return await db
      .select()
      .from(shipCompliance)
      .where(eq(shipCompliance.year, year));
  }

  async getBankEntries(shipId: string, year: number): Promise<BankEntry[]> {
    return await db
      .select()
      .from(bankEntries)
      .where(and(eq(bankEntries.shipId, shipId), eq(bankEntries.year, year)))
      .orderBy(bankEntries.createdAt);
  }

  async getTotalBankedAmount(shipId: string, year: number): Promise<number> {
    const result = await db
      .select({ total: sql<number>`COALESCE(SUM(${bankEntries.amountGco2eq}), 0)` })
      .from(bankEntries)
      .where(and(eq(bankEntries.shipId, shipId), eq(bankEntries.year, year)));
    
    return result[0]?.total || 0;
  }

  async createBankEntry(entry: InsertBankEntry): Promise<BankEntry> {
    const [newEntry] = await db.insert(bankEntries).values(entry).returning();
    return newEntry;
  }

  async createPool(pool: InsertPool): Promise<Pool> {
    const [newPool] = await db.insert(pools).values(pool).returning();
    return newPool;
  }

  async createPoolMember(member: InsertPoolMember): Promise<PoolMember> {
    const [newMember] = await db.insert(poolMembers).values(member).returning();
    return newMember;
  }

  async getPoolMembers(poolId: number): Promise<PoolMember[]> {
    return await db
      .select()
      .from(poolMembers)
      .where(eq(poolMembers.poolId, poolId));
  }
}

export const storage = new DatabaseStorage();
