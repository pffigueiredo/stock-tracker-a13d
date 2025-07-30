
import { db } from '../db';
import { investmentsTable } from '../db/schema';
import { type Investment } from '../schema';
import { eq } from 'drizzle-orm';

export const getInvestmentById = async (id: number): Promise<Investment | null> => {
  try {
    const result = await db.select()
      .from(investmentsTable)
      .where(eq(investmentsTable.id, id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    const investment = result[0];
    
    // Convert numeric field back to number and date string to Date
    return {
      ...investment,
      purchase_price: parseFloat(investment.purchase_price),
      purchase_date: new Date(investment.purchase_date)
    };
  } catch (error) {
    console.error('Get investment by ID failed:', error);
    throw error;
  }
};
