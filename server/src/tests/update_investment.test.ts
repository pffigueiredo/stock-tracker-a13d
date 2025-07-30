
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { investmentsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type CreateInvestmentInput, type UpdateInvestmentInput } from '../schema';
import { updateInvestment } from '../handlers/update_investment';

// Test investment data
const testInvestment: CreateInvestmentInput = {
  company_name: 'Apple Inc.',
  ticker_symbol: 'AAPL',
  shares: 100,
  purchase_price: 150.50,
  purchase_date: new Date('2024-01-15')
};

describe('updateInvestment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of an investment', async () => {
    // Create initial investment
    const created = await db.insert(investmentsTable)
      .values({
        company_name: testInvestment.company_name,
        ticker_symbol: testInvestment.ticker_symbol,
        shares: testInvestment.shares,
        purchase_price: testInvestment.purchase_price.toString(),
        purchase_date: testInvestment.purchase_date.toISOString().split('T')[0]
      })
      .returning()
      .execute();

    const investmentId = created[0].id;

    // Update all fields
    const updateInput: UpdateInvestmentInput = {
      id: investmentId,
      company_name: 'Microsoft Corporation',
      ticker_symbol: 'MSFT',
      shares: 200,
      purchase_price: 250.75,
      purchase_date: new Date('2024-02-20')
    };

    const result = await updateInvestment(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(investmentId);
    expect(result!.company_name).toEqual('Microsoft Corporation');
    expect(result!.ticker_symbol).toEqual('MSFT');
    expect(result!.shares).toEqual(200);
    expect(result!.purchase_price).toEqual(250.75);
    expect(typeof result!.purchase_price).toBe('number');
    expect(result!.purchase_date).toEqual(new Date('2024-02-20'));
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    // Create initial investment
    const created = await db.insert(investmentsTable)
      .values({
        company_name: testInvestment.company_name,
        ticker_symbol: testInvestment.ticker_symbol,
        shares: testInvestment.shares,
        purchase_price: testInvestment.purchase_price.toString(),
        purchase_date: testInvestment.purchase_date.toISOString().split('T')[0]
      })
      .returning()
      .execute();

    const investmentId = created[0].id;

    // Update only shares and purchase price
    const updateInput: UpdateInvestmentInput = {
      id: investmentId,
      shares: 150,
      purchase_price: 175.25
    };

    const result = await updateInvestment(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(investmentId);
    expect(result!.company_name).toEqual('Apple Inc.'); // Unchanged
    expect(result!.ticker_symbol).toEqual('AAPL'); // Unchanged
    expect(result!.shares).toEqual(150); // Updated
    expect(result!.purchase_price).toEqual(175.25); // Updated
    expect(result!.purchase_date).toEqual(new Date('2024-01-15')); // Unchanged
  });

  it('should persist changes to database', async () => {
    // Create initial investment
    const created = await db.insert(investmentsTable)
      .values({
        company_name: testInvestment.company_name,
        ticker_symbol: testInvestment.ticker_symbol,
        shares: testInvestment.shares,
        purchase_price: testInvestment.purchase_price.toString(),
        purchase_date: testInvestment.purchase_date.toISOString().split('T')[0]
      })
      .returning()
      .execute();

    const investmentId = created[0].id;

    // Update investment
    const updateInput: UpdateInvestmentInput = {
      id: investmentId,
      company_name: 'Google Inc.',
      shares: 75
    };

    await updateInvestment(updateInput);

    // Verify changes in database
    const updated = await db.select()
      .from(investmentsTable)
      .where(eq(investmentsTable.id, investmentId))
      .execute();

    expect(updated).toHaveLength(1);
    expect(updated[0].company_name).toEqual('Google Inc.');
    expect(updated[0].shares).toEqual(75);
    expect(updated[0].ticker_symbol).toEqual('AAPL'); // Unchanged
    expect(parseFloat(updated[0].purchase_price)).toEqual(150.50); // Unchanged
  });

  it('should return null for non-existent investment', async () => {
    const updateInput: UpdateInvestmentInput = {
      id: 999999,
      company_name: 'Non-existent Company'
    };

    const result = await updateInvestment(updateInput);

    expect(result).toBeNull();
  });

  it('should handle empty update input', async () => {
    // Create initial investment
    const created = await db.insert(investmentsTable)
      .values({
        company_name: testInvestment.company_name,
        ticker_symbol: testInvestment.ticker_symbol,
        shares: testInvestment.shares,
        purchase_price: testInvestment.purchase_price.toString(),
        purchase_date: testInvestment.purchase_date.toISOString().split('T')[0]
      })
      .returning()
      .execute();

    const investmentId = created[0].id;

    // Update with only ID (no fields to update)
    const updateInput: UpdateInvestmentInput = {
      id: investmentId
    };

    const result = await updateInvestment(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(investmentId);
    expect(result!.company_name).toEqual('Apple Inc.');
    expect(result!.ticker_symbol).toEqual('AAPL');
    expect(result!.shares).toEqual(100);
    expect(result!.purchase_price).toEqual(150.50);
    expect(result!.purchase_date).toEqual(new Date('2024-01-15'));
  });

  it('should handle date updates correctly', async () => {
    // Create initial investment
    const created = await db.insert(investmentsTable)
      .values({
        company_name: testInvestment.company_name,
        ticker_symbol: testInvestment.ticker_symbol,
        shares: testInvestment.shares,
        purchase_price: testInvestment.purchase_price.toString(),
        purchase_date: testInvestment.purchase_date.toISOString().split('T')[0]
      })
      .returning()
      .execute();

    const investmentId = created[0].id;

    // Update purchase date
    const newDate = new Date('2024-03-10');
    const updateInput: UpdateInvestmentInput = {
      id: investmentId,
      purchase_date: newDate
    };

    const result = await updateInvestment(updateInput);

    expect(result).not.toBeNull();
    expect(result!.purchase_date).toEqual(newDate);
    expect(result!.purchase_date).toBeInstanceOf(Date);
  });
});
