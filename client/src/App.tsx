
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Investment, CreateInvestmentInput } from '../../server/src/schema';

function App() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<CreateInvestmentInput>({
    company_name: '',
    ticker_symbol: '',
    shares: 1,
    purchase_price: 0,
    purchase_date: new Date()
  });

  const loadInvestments = useCallback(async () => {
    try {
      const result = await trpc.getInvestments.query();
      setInvestments(result);
    } catch (error) {
      console.error('Failed to load investments:', error);
    }
  }, []);

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createInvestment.mutate(formData);
      setInvestments((prev: Investment[]) => [...prev, response]);
      setFormData({
        company_name: '',
        ticker_symbol: '',
        shares: 1,
        purchase_price: 0,
        purchase_date: new Date()
      });
    } catch (error) {
      console.error('Failed to create investment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await trpc.deleteInvestment.mutate({ id });
      setInvestments((prev: Investment[]) => prev.filter(investment => investment.id !== id));
    } catch (error) {
      console.error('Failed to delete investment:', error);
    }
  };

  const calculateTotalValue = () => {
    return investments.reduce((total, investment) => total + (investment.shares * investment.purchase_price), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 Investment Portfolio Tracker</h1>
          <p className="text-gray-600">Manage and track your stock investments</p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">💼</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Investments</p>
                  <p className="text-2xl font-bold text-gray-900">{investments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(calculateTotalValue())}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Shares</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {investments.reduce((total, inv) => total + inv.shares, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Investment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>➕</span>
                Add New Investment
              </CardTitle>
              <CardDescription>
                Enter the details of your stock purchase to add it to your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    placeholder="e.g., Apple Inc."
                    value={formData.company_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateInvestmentInput) => ({ ...prev, company_name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticker_symbol">Ticker Symbol</Label>
                  <Input
                    id="ticker_symbol"
                    placeholder="e.g., AAPL"
                    value={formData.ticker_symbol}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateInvestmentInput) => ({ ...prev, ticker_symbol: e.target.value.toUpperCase() }))
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shares">Number of Shares</Label>
                    <Input
                      id="shares"
                      type="number"
                      min="1"
                      value={formData.shares}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateInvestmentInput) => ({ ...prev, shares: parseInt(e.target.value) || 1 }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchase_price">Purchase Price ($)</Label>
                    <Input
                      id="purchase_price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.purchase_price}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateInvestmentInput) => ({ ...prev, purchase_price: parseFloat(e.target.value) || 0 }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date.toISOString().split('T')[0]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateInvestmentInput) => ({ ...prev, purchase_date: new Date(e.target.value) }))
                    }
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Adding Investment...' : 'Add Investment'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Investment List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📋</span>
                Your Investments
              </CardTitle>
              <CardDescription>
                {investments.length === 0 
                  ? "No investments yet. Add your first investment to get started!" 
                  : `You have ${investments.length} investment${investments.length !== 1 ? 's' : ''} in your portfolio`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {investments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📈</div>
                  <p className="text-gray-500 mb-2">Start building your portfolio</p>
                  <p className="text-sm text-gray-400">Add your first investment using the form on the left</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {investments.map((investment: Investment) => (
                    <div key={investment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{investment.company_name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {investment.ticker_symbol}
                          </Badge>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              🗑️
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Investment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete your investment in {investment.company_name}? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(investment.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Shares</p>
                          <p className="font-medium">{investment.shares.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Purchase Price</p>
                          <p className="font-medium">{formatCurrency(investment.purchase_price)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Value</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(investment.shares * investment.purchase_price)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Purchase Date</p>
                          <p className="font-medium">{formatDate(investment.purchase_date)}</p>
                        </div>
                      </div>

                      <Separator className="my-3" />
                      <p className="text-xs text-gray-400">
                        Added on {formatDate(investment.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
