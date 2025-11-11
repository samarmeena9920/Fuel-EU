import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const routes = pgTable("routes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  routeId: varchar("route_id", { length: 50 }).notNull().unique(),
  vesselType: varchar("vessel_type", { length: 100 }).notNull(),
  fuelType: varchar("fuel_type", { length: 50 }).notNull(),
  year: integer("year").notNull(),
  ghgIntensity: real("ghg_intensity").notNull(),
  fuelConsumption: real("fuel_consumption").notNull(),
  distance: real("distance").notNull(),
  totalEmissions: real("total_emissions").notNull(),
  isBaseline: boolean("is_baseline").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shipCompliance = pgTable("ship_compliance", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  shipId: varchar("ship_id", { length: 50 }).notNull(),
  routeId: varchar("route_id", { length: 50 }).notNull(),
  year: integer("year").notNull(),
  cbGco2eq: real("cb_gco2eq").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bankEntries = pgTable("bank_entries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  shipId: varchar("ship_id", { length: 50 }).notNull(),
  year: integer("year").notNull(),
  amountGco2eq: real("amount_gco2eq").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pools = pgTable("pools", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poolMembers = pgTable("pool_members", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  poolId: integer("pool_id").notNull().references(() => pools.id),
  shipId: varchar("ship_id", { length: 50 }).notNull(),
  cbBefore: real("cb_before").notNull(),
  cbAfter: real("cb_after").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const routesRelations = relations(routes, ({ many }) => ({
  compliance: many(shipCompliance),
}));

export const shipComplianceRelations = relations(shipCompliance, ({ one }) => ({
  route: one(routes, {
    fields: [shipCompliance.routeId],
    references: [routes.routeId],
  }),
}));

export const poolMembersRelations = relations(poolMembers, ({ one }) => ({
  pool: one(pools, {
    fields: [poolMembers.poolId],
    references: [pools.id],
  }),
}));

export const poolsRelations = relations(pools, ({ many }) => ({
  members: many(poolMembers),
}));

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
});

export const insertShipComplianceSchema = createInsertSchema(shipCompliance).omit({
  id: true,
  createdAt: true,
});

export const insertBankEntrySchema = createInsertSchema(bankEntries).omit({
  id: true,
  createdAt: true,
});

export const insertPoolSchema = createInsertSchema(pools).omit({
  id: true,
  createdAt: true,
});

export const insertPoolMemberSchema = createInsertSchema(poolMembers).omit({
  id: true,
  createdAt: true,
});

export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

export type ShipCompliance = typeof shipCompliance.$inferSelect;
export type InsertShipCompliance = z.infer<typeof insertShipComplianceSchema>;

export type BankEntry = typeof bankEntries.$inferSelect;
export type InsertBankEntry = z.infer<typeof insertBankEntrySchema>;

export type Pool = typeof pools.$inferSelect;
export type InsertPool = z.infer<typeof insertPoolSchema>;

export type PoolMember = typeof poolMembers.$inferSelect;
export type InsertPoolMember = z.infer<typeof insertPoolMemberSchema>;
