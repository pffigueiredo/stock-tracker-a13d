
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { investmentsTable } from '../db/schema';
import { type CreateInvestmentInput } from '../schema';
import { getInvestments } from '../handlers/get_investments';

describe('getInvestments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no investments exist', async () => {
    const result = await getInvestments();
    expect(result).toEqual([]);
  });

  it('should return all investments', async () => {
    // Create test investments
    const testInvestment1: CreateInvestmentInput = {
      company_name: 'Apple Inc.',
      ticker_symbol: 'AAPL',
      shares: 100,
      purchase_price: 150.00,
      purchase_date: new Date('2023-01-15')
    };

    const testInvestment2: CreateInvestmentInput = {
      company_name: 'Microsoft Corporation',
      ticker_symbol: 'MSFT',
      shares: 50,
      purchase_price: 250.00,
      purchase_date: new Date('2023-02-20')
    };

    await db.insert(investmentsTable)
      .values({
        company_name: testInvestment1.company_name,
        ticker_symbol: testInvestment1.ticker_symbol,
        shares: testInvestment1.shares,
        purchase_price: testInvestment1.purchase_price.toString(),
        purchase_date: testInvestment1.purchase_date.toISOString().split('T')[0]
      })
      .execute();

    await db.insert(investmentsTable)
      .values({
        company_name: testInvestment2.company_name,
        ticker_symbol: testInvestment2.ticker_symbol,
        shares: testInvestment2.shares,
        purchase_price: testInvestment2.purchase_price.toString(),
        purchase_date: testInvestment2.purchase_date.toISOString().split('T')[0]
      })
      .execute();

    const result = await getInvestments();

    expect(result).toHaveLength(2);
    
    // Validate field types and values
    result.forEach(investment => {
      expect(investment.id).toBeDefined();
      expect(typeof investment.company_name).toBe('string');
      expect(typeof investment.ticker_symbol).toBe('string');
      expect(typeof investment.shares).toBe('number');
      expect(typeof investment.purchase_price).toBe('number');
      expect(investment.purchase_date).toBeInstanceOf(Date);
      expect(investment.created_at).toBeInstanceOf(Date);
    });

    // Check specific values
    const appleInvestment = result.find(inv => inv.ticker_symbol === 'AAPL');
    const microsoftInvestment = result.find(inv => inv.ticker_symbol === 'MSFT');

    expect(appleInvestment).toBeDefined();
    expect(appleInvestment!.company_name).toEqual('Apple Inc.');
    expect(appleInvestment!.shares).toEqual(100);
    expect(appleInvestment!.purchase_price).toEqual(150.00);
    expect(appleInvestment!.purchase_date).toEqual(new Date('2023-01-15'));

    expect(microsoftInvestment).toBeDefined();
    expect(microsoftInvestment!.company_name).toEqual('Microsoft Corporation');
    expect(microsoftInvestment!.shares).toEqual(50);
    expect(microsoftInvestment!.purchase_price).toEqual(250.00);
    expect(microsoftInvestment!.purchase_date).toEqual(new Date('2023-02-20'));
  });

  it('should return investments ordered by creation date (newest first)', async () => {
    // Create investments with slight delay to ensure different timestamps
    await db.insert(investmentsTable)
      .values({
        company_name: 'First Investment',
        ticker_symbol: 'FIRST',
        shares: 10,
        purchase_price: '100.00',
        purchase_date: '2023-01-01'
      })
      .execute();

    // Small delay to ensure different created_at timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(investmentsTable)
      .values({
        company_name: 'Second Investment',
        ticker_symbol: 'SECOND',
        shares: 20,
        purchase_price: '200.00',
        purchase_date: '2023-01-02'
      })
      .execute();

    const result = await getInvestments();

    expect(result).toHaveLength(2);
    // Should be ordered by created_at descending (newest first)
    expect(result[0].ticker_symbol).toEqual('SECOND');
    expect(result[1].ticker_symbol).toEqual('FIRST');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });
});
