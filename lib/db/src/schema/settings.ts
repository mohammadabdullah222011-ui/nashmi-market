import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = sqliteTable("app_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  instagram: text("instagram").notNull().default(""),
  facebook: text("facebook").notNull().default(""),
  discord: text("discord").notNull().default(""),
  showInstagram: integer("show_instagram").notNull().default(1),
  showFacebook: integer("show_facebook").notNull().default(1),
  showDiscord: integer("show_discord").notNull().default(1),
  storeName: text("store_name").notNull().default("نشمي ماركت"),
  storePhone: text("store_phone").notNull().default(""),
  storeEmail: text("store_email").notNull().default(""),
  storeAddress: text("store_address").notNull().default(""),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
