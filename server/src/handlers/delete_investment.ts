
import { db } from '../db';
import { investmentsTable } from '../db/schema';
import { type DeleteInvestmentInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteInvestment = async (input: DeleteInvestmentInput): Promise<boolean> => {
  try {
    // Delete investment record
    const result = await db.delete(investmentsTable)
      .where(eq(investmentsTable.id, input.id))
      .execute();

    // Return true if a record was deleted, false if no record found
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Investment deletion failed:', error);
    throw error;
  }
};
