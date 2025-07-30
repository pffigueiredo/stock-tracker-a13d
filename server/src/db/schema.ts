
import { serial, text, pgTable, timestamp, numeric, integer, date } from 'drizzle-orm/pg-core';

export const investmentsTable = pgTable('investments', {
  id: serial('id').primaryKey(),
  company_name: text('company_name').notNull(),
  ticker_symbol: text('ticker_symbol').notNull(),
  shares: integer('shares').notNull(),
  purchase_price: numeric('purchase_price', { precision: 10, scale: 2 }).notNull(),
  purchase_date: date('purchase_date').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Investment = typeof investmentsTable.$inferSelect;
export type NewInvestment = typeof investmentsTable.$inferInsert;

// Important: Export all tables for proper query building
export const tables = { investments: investmentsTable };
