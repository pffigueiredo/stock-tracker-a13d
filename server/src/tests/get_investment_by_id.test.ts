
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { investmentsTable } from '../db/schema';
import { type CreateInvestmentInput } from '../schema';
import { getInvestmentById } from '../handlers/get_investment_by_id';

// Test investment data
const testInput: CreateInvestmentInput = {
  company_name: 'Apple Inc.',
  ticker_symbol: 'AAPL',
  shares: 100,
  purchase_price: 150.75,
  purchase_date: new Date('2024-01-15')
};

describe('getInvestmentById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return investment when found', async () => {
    // Create test investment
    const insertResult = await db.insert(investmentsTable)
      .values({
        company_name: testInput.company_name,
        ticker_symbol: testInput.ticker_symbol,
        shares: testInput.shares,
        purchase_price: testInput.purchase_price.toString(),
        purchase_date: testInput.purchase_date.toISOString().split('T')[0]
      })
      .returning()
      .execute();

    const createdId = insertResult[0].id;

    // Test retrieval
    const result = await getInvestmentById(createdId);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdId);
    expect(result!.company_name).toEqual('Apple Inc.');
    expect(result!.ticker_symbol).toEqual('AAPL');
    expect(result!.shares).toEqual(100);
    expect(result!.purchase_price).toEqual(150.75);
    expect(typeof result!.purchase_price).toBe('number');
    expect(result!.purchase_date).toBeInstanceOf(Date);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null when investment not found', async () => {
    const result = await getInvestmentById(999);
    expect(result).toBeNull();
  });

  it('should handle numeric and date conversion correctly', async () => {
    // Create investment with specific decimal value
    const insertResult = await db.insert(investmentsTable)
      .values({
        company_name: 'Tesla Inc.',
        ticker_symbol: 'TSLA',
        shares: 50,
        purchase_price: '299.99',
        purchase_date: '2024-02-01'
      })
      .returning()
      .execute();

    const result = await getInvestmentById(insertResult[0].id);

    expect(result).not.toBeNull();
    expect(result!.purchase_price).toEqual(299.99);
    expect(typeof result!.purchase_price).toBe('number');
    expect(result!.purchase_date).toBeInstanceOf(Date);
    expect(result!.purchase_date.toISOString().split('T')[0]).toEqual('2024-02-01');
  });
});
