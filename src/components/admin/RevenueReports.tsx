import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RevenueByProduct {
  product_sku: string;
  product_name: string;
  total_sales: number;
  total_revenue: number;
}

export const RevenueReports = () => {
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
    queryKey: ['admin-monthly-revenue'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('purchases')
        .select('amount_paid')
        .eq('status', 'completed')
        .gte('purchased_at', thirtyDaysAgo.toISOString());
      
      if (error) throw error;
      return data.reduce((sum, p) => sum + p.amount_paid, 0);
    }
  });

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
            <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Recent revenue</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Product</CardTitle>
          <CardDescription>Performance breakdown by product</CardDescription>
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
