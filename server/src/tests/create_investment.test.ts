
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { investmentsTable } from '../db/schema';
import { type CreateInvestmentInput } from '../schema';
import { createInvestment } from '../handlers/create_investment';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateInvestmentInput = {
  company_name: 'Apple Inc.',
  ticker_symbol: 'AAPL',
  shares: 100,
  purchase_price: 150.25,
  purchase_date: new Date('2024-01-15')
};

describe('createInvestment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an investment', async () => {
    const result = await createInvestment(testInput);

    // Basic field validation
    expect(result.company_name).toEqual('Apple Inc.');
    expect(result.ticker_symbol).toEqual('AAPL');
    expect(result.shares).toEqual(100);
    expect(result.purchase_price).toEqual(150.25);
    expect(typeof result.purchase_price).toBe('number');
    expect(result.purchase_date).toBeInstanceOf(Date);
    expect(result.purchase_date.toISOString().split('T')[0]).toEqual('2024-01-15');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save investment to database', async () => {
    const result = await createInvestment(testInput);

    // Query using proper drizzle syntax
    const investments = await db.select()
      .from(investmentsTable)
      .where(eq(investmentsTable.id, result.id))
      .execute();

    expect(investments).toHaveLength(1);
    expect(investments[0].company_name).toEqual('Apple Inc.');
    expect(investments[0].ticker_symbol).toEqual('AAPL');
    expect(investments[0].shares).toEqual(100);
    expect(parseFloat(investments[0].purchase_price)).toEqual(150.25);
    expect(investments[0].purchase_date).toEqual('2024-01-15');
    expect(investments[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle ticker symbol transformation', async () => {
    const inputWithLowercase: CreateInvestmentInput = {
      ...testInput,
      ticker_symbol: 'tsla'
    };

    const result = await createInvestment(inputWithLowercase);

    // Verify ticker symbol is transformed to uppercase in handler
    expect(result.ticker_symbol).toEqual('TSLA');

    // Verify in database
    const investments = await db.select()
      .from(investmentsTable)
      .where(eq(investmentsTable.id, result.id))
      .execute();

    expect(investments[0].ticker_symbol).toEqual('TSLA');
  });

  it('should handle different purchase dates correctly', async () => {
    const futureDate = new Date('2025-06-30');
    const inputWithFutureDate: CreateInvestmentInput = {
      ...testInput,
      purchase_date: futureDate
    };

    const result = await createInvestment(inputWithFutureDate);

    expect(result.purchase_date).toBeInstanceOf(Date);
    expect(result.purchase_date.toISOString().split('T')[0]).toEqual('2025-06-30');

    // Verify in database
    const investments = await db.select()
      .from(investmentsTable)
      .where(eq(investmentsTable.id, result.id))
      .execute();

    expect(investments[0].purchase_date).toEqual('2025-06-30');
  });
});
