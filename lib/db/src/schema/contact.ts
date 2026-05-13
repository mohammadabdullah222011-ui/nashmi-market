import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const contactMessagesTable = sqliteTable("contact_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  read: integer("read").notNull().default(0),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export type ContactMessage = typeof contactMessagesTable.$inferSelect;
