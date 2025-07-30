
import { z } from 'zod';

// Investment schema
export const investmentSchema = z.object({
  id: z.number(),
  company_name: z.string(),
  ticker_symbol: z.string(),
  shares: z.number().int().positive(),
  purchase_price: z.number().positive(),
  purchase_date: z.coerce.date(),
  created_at: z.coerce.date()
});

export type Investment = z.infer<typeof investmentSchema>;

// Input schema for creating investments
export const createInvestmentInputSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  ticker_symbol: z.string().min(1, "Ticker symbol is required").toUpperCase(),
  shares: z.number().int().positive("Number of shares must be a positive integer"),
  purchase_price: z.number().positive("Purchase price must be positive"),
  purchase_date: z.coerce.date()
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentInputSchema>;

// Input schema for updating investments
export const updateInvestmentInputSchema = z.object({
  id: z.number(),
  company_name: z.string().min(1).optional(),
  ticker_symbol: z.string().min(1).optional(),
  shares: z.number().int().positive().optional(),
  purchase_price: z.number().positive().optional(),
  purchase_date: z.coerce.date().optional()
});

export type UpdateInvestmentInput = z.infer<typeof updateInvestmentInputSchema>;

// Input schema for deleting investments
export const deleteInvestmentInputSchema = z.object({
  id: z.number()
});

export type DeleteInvestmentInput = z.infer<typeof deleteInvestmentInputSchema>;
