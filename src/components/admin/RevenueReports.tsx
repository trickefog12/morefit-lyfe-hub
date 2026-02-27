import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, TrendingUp, TrendingDown, Minus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface RevenueByProduct {
  product_sku: string;
  product_name: string;
  total_sales: number;
  total_revenue: number;
}

export const RevenueReports = () => {
  const [revenueDays, setRevenueDays] = useState<7 | 30 | 90>(30);
  const { data: totalRevenue } = useQuery({
    queryKey: ['admin-total-revenue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('amount_paid')
        .eq('status', 'completed');
      
      if (error) throw error;
      return data.reduce((sum, p) => sum + p.amount_paid, 0);
    }
  });

  const { data: revenueByProduct } = useQuery({
    queryKey: ['admin-revenue-by-product'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          product_sku,
          amount_paid,
          products!inner(name_en)
        `)
        .eq('status', 'completed');
      
      if (error) throw error;
      
      // Group by product
      const grouped: Record<string, RevenueByProduct> = {};
      data.forEach(purchase => {
        const sku = purchase.product_sku;
        if (!grouped[sku]) {
          grouped[sku] = {
            product_sku: sku,
            product_name: purchase.products.name_en,
            total_sales: 0,
            total_revenue: 0
          };
        }
        grouped[sku].total_sales++;
        grouped[sku].total_revenue += purchase.amount_paid;
      });
      
      return Object.values(grouped).sort((a, b) => b.total_revenue - a.total_revenue);
    }
  });

  const { data: monthlyRevenue } = useQuery({
    queryKey: ['admin-monthly-revenue', revenueDays],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - revenueDays);
      
      const { data, error } = await supabase
        .from('purchases')
        .select('amount_paid')
        .eq('status', 'completed')
        .gte('purchased_at', daysAgo.toISOString());
      
      if (error) throw error;
      return data.reduce((sum, p) => sum + p.amount_paid, 0);
    }
  });

  const { data: periodGrowth } = useQuery({
    queryKey: ['admin-period-growth', revenueDays],
    queryFn: async () => {
      const now = new Date();
      const currentStart = new Date();
      currentStart.setDate(now.getDate() - revenueDays);
      const previousStart = new Date();
      previousStart.setDate(now.getDate() - revenueDays * 2);

      const { data, error } = await supabase
        .from('purchases')
        .select('purchased_at, amount_paid')
        .eq('status', 'completed')
        .gte('purchased_at', previousStart.toISOString());

      if (error) throw error;

      const current = data
        .filter(p => new Date(p.purchased_at) >= currentStart)
        .reduce((sum, p) => sum + p.amount_paid, 0);
      const previous = data
        .filter(p => new Date(p.purchased_at) < currentStart)
        .reduce((sum, p) => sum + p.amount_paid, 0);

      if (previous === 0) return current > 0 ? 100 : null;
      return +((( current - previous) / previous) * 100).toFixed(1);
    }
  });

  const { data: dailyRevenue } = useQuery({
    queryKey: ['admin-daily-revenue', revenueDays],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - revenueDays);

      const { data, error } = await supabase
        .from('purchases')
        .select('purchased_at, amount_paid')
        .eq('status', 'completed')
        .gte('purchased_at', daysAgo.toISOString())
        .order('purchased_at', { ascending: true });

      if (error) throw error;

      const byDay: Record<string, number> = {};
      data.forEach(p => {
        const day = format(new Date(p.purchased_at), 'MMM d');
        byDay[day] = (byDay[day] || 0) + p.amount_paid;
      });

      return Object.entries(byDay).map(([day, revenue]) => ({ day, revenue: +revenue.toFixed(2) }));
    }
  });

  const handleExportDailyCSV = () => {
    if (!dailyRevenue?.length) return;
    const headers = ['Date', 'Revenue ($)'];
    const rows = dailyRevenue.map(d => [d.day, d.revenue.toFixed(2)]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-revenue-${revenueDays}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!revenueByProduct?.length) return;
    const headers = ['Product', 'Sales', 'Revenue ($)', 'Avg. Price ($)'];
    const rows = revenueByProduct.map(p => [
      p.product_name,
      p.total_sales,
      p.total_revenue.toFixed(2),
      (p.total_revenue / p.total_sales).toFixed(2),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-by-product.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">All-time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last {revenueDays} Days</CardTitle>
            {periodGrowth === null || periodGrowth === undefined ? (
              <Minus className="h-4 w-4 text-muted-foreground" />
            ) : periodGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-chart-2" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue?.toFixed(2) || '0.00'}</div>
            <div className="flex items-center gap-1 mt-1">
              {periodGrowth !== null && periodGrowth !== undefined ? (
                <span className={`text-xs font-medium ${periodGrowth >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                  {periodGrowth >= 0 ? '+' : ''}{periodGrowth}% vs prev period
                </span>
              ) : (
                <p className="text-xs text-muted-foreground">No prior period data</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueByProduct?.reduce((sum, p) => sum + p.total_sales, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total units</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Revenue Bar Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>Daily Revenue</CardTitle>
              <CardDescription>Revenue per day</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportDailyCSV}
                disabled={!dailyRevenue?.length}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
              <div className="flex gap-1">
                {([7, 30, 90] as const).map(d => (
                  <Button
                    key={d}
                    size="sm"
                    variant={revenueDays === d ? "default" : "outline"}
                    onClick={() => setRevenueDays(d)}
                    className="text-xs h-7 px-2.5"
                  >
                    {d}d
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {dailyRevenue && dailyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
              No revenue data for this period
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>Revenue by Product</CardTitle>
              <CardDescription>Performance breakdown by product</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              disabled={!revenueByProduct?.length}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Avg. Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueByProduct?.map((product) => (
                <TableRow key={product.product_sku}>
                  <TableCell className="font-medium">{product.product_name}</TableCell>
                  <TableCell className="text-right">{product.total_sales}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${product.total_revenue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${(product.total_revenue / product.total_sales).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {!revenueByProduct?.length && (
            <div className="text-center py-8 text-muted-foreground">
              No revenue data yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
