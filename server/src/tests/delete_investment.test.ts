
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { investmentsTable } from '../db/schema';
import { type CreateInvestmentInput, type DeleteInvestmentInput } from '../schema';
import { deleteInvestment } from '../handlers/delete_investment';
import { eq } from 'drizzle-orm';

// Test investment data
const testInvestment: CreateInvestmentInput = {
  company_name: 'Apple Inc.',
  ticker_symbol: 'AAPL',
  shares: 100,
  purchase_price: 150.00,
  purchase_date: new Date('2024-01-15')
};

describe('deleteInvestment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing investment', async () => {
    // Create test investment first
    const createResult = await db.insert(investmentsTable)
      .values({
        company_name: testInvestment.company_name,
        ticker_symbol: testInvestment.ticker_symbol,
        shares: testInvestment.shares,
        purchase_price: testInvestment.purchase_price.toString(),
        purchase_date: testInvestment.purchase_date.toISOString().split('T')[0]
      })
      .returning()
      .execute();

    const createdInvestment = createResult[0];

    // Delete the investment
    const deleteInput: DeleteInvestmentInput = {
      id: createdInvestment.id
    };

    const result = await deleteInvestment(deleteInput);

    // Should return true for successful deletion
    expect(result).toBe(true);

    // Verify investment is deleted from database
    const investments = await db.select()
      .from(investmentsTable)
      .where(eq(investmentsTable.id, createdInvestment.id))
      .execute();

    expect(investments).toHaveLength(0);
  });

  it('should return false when investment does not exist', async () => {
    const deleteInput: DeleteInvestmentInput = {
      id: 9999 // Non-existent ID
    };

    const result = await deleteInvestment(deleteInput);

    // Should return false for non-existent investment
    expect(result).toBe(false);
  });

  it('should not affect other investments when deleting one', async () => {
    // Create two test investments
    const investment1 = await db.insert(investmentsTable)
      .values({
        company_name: 'Apple Inc.',
        ticker_symbol: 'AAPL',
        shares: 100,
        purchase_price: '150.00',
        purchase_date: '2024-01-15'
      })
      .returning()
      .execute();

    const investment2 = await db.insert(investmentsTable)
      .values({
        company_name: 'Microsoft Corp.',
        ticker_symbol: 'MSFT',
        shares: 50,
        purchase_price: '300.00',
        purchase_date: '2024-01-20'
      })
      .returning()
      .execute();

    // Delete first investment
    const deleteInput: DeleteInvestmentInput = {
      id: investment1[0].id
    };

    const result = await deleteInvestment(deleteInput);

    expect(result).toBe(true);

    // Verify only first investment is deleted
    const remainingInvestments = await db.select()
      .from(investmentsTable)
      .execute();

    expect(remainingInvestments).toHaveLength(1);
    expect(remainingInvestments[0].id).toEqual(investment2[0].id);
    expect(remainingInvestments[0].company_name).toEqual('Microsoft Corp.');
  });
});
