
import { db } from '../db';
import { investmentsTable } from '../db/schema';
import { type CreateInvestmentInput, type Investment } from '../schema';

export const createInvestment = async (input: CreateInvestmentInput): Promise<Investment> => {
  try {
    // Insert investment record
    const result = await db.insert(investmentsTable)
      .values({
        company_name: input.company_name,
        ticker_symbol: input.ticker_symbol.toUpperCase(), // Ensure uppercase transformation
        shares: input.shares,
        purchase_price: input.purchase_price.toString(), // Convert number to string for numeric column
        purchase_date: input.purchase_date.toISOString().split('T')[0] // Convert Date to YYYY-MM-DD string
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const investment = result[0];
    return {
      ...investment,
      purchase_price: parseFloat(investment.purchase_price), // Convert string back to number
      purchase_date: new Date(investment.purchase_date), // Convert string back to Date
      created_at: investment.created_at // Already a Date object
    };
  } catch (error) {
    console.error('Investment creation failed:', error);
    throw error;
  }
};
