
import { db } from '../db';
import { investmentsTable } from '../db/schema';
import { type Investment } from '../schema';
import { desc } from 'drizzle-orm';

export const getInvestments = async (): Promise<Investment[]> => {
  try {
    const results = await db.select()
      .from(investmentsTable)
      .orderBy(desc(investmentsTable.created_at))
      .execute();

    // Convert numeric and date fields back to proper types before returning
    return results.map(investment => ({
      ...investment,
      purchase_price: parseFloat(investment.purchase_price), // Convert string back to number
      purchase_date: new Date(investment.purchase_date) // Convert string back to Date
    }));
  } catch (error) {
    console.error('Failed to fetch investments:', error);
    throw error;
  }
};
