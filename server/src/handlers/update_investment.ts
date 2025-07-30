
import { db } from '../db';
import { investmentsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateInvestmentInput, type Investment } from '../schema';

export const updateInvestment = async (input: UpdateInvestmentInput): Promise<Investment | null> => {
  try {
    // First check if the investment exists
    const existingInvestment = await db.select()
      .from(investmentsTable)
      .where(eq(investmentsTable.id, input.id))
      .execute();

    if (existingInvestment.length === 0) {
      return null;
    }

    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.company_name !== undefined) {
      updateData.company_name = input.company_name;
    }
    
    if (input.ticker_symbol !== undefined) {
      updateData.ticker_symbol = input.ticker_symbol;
    }
    
    if (input.shares !== undefined) {
      updateData.shares = input.shares;
    }
    
    if (input.purchase_price !== undefined) {
      updateData.purchase_price = input.purchase_price.toString();
    }
    
    if (input.purchase_date !== undefined) {
      updateData.purchase_date = input.purchase_date.toISOString().split('T')[0];
    }

    // If no fields to update, return the existing investment
    if (Object.keys(updateData).length === 0) {
      const investment = existingInvestment[0];
      return {
        ...investment,
        purchase_price: parseFloat(investment.purchase_price),
        purchase_date: new Date(investment.purchase_date + 'T00:00:00.000Z')
      };
    }

    // Update the investment
    const result = await db.update(investmentsTable)
      .set(updateData)
      .where(eq(investmentsTable.id, input.id))
      .returning()
      .execute();

    const updatedInvestment = result[0];
    return {
      ...updatedInvestment,
      purchase_price: parseFloat(updatedInvestment.purchase_price),
      purchase_date: new Date(updatedInvestment.purchase_date + 'T00:00:00.000Z')
    };
  } catch (error) {
    console.error('Investment update failed:', error);
    throw error;
  }
};
