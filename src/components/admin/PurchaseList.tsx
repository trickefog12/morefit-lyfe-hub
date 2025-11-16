import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Purchase {
  id: string;
  user_id: string;
  product_sku: string;
  amount_paid: number;
  status: string;
  purchased_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  };
  products: {
    name_en: string;
  };
}

export const PurchaseList = () => {
  const { data: purchases, isLoading } = useQuery({
    queryKey: ['admin-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          profiles!inner(email, full_name),
          products!inner(name_en)
        `)
        .order('purchased_at', { ascending: false });
      
      if (error) throw error;
      return data as Purchase[];
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading purchases...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase History</CardTitle>
        <CardDescription>View all customer purchases and transaction details</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases?.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>
                  {format(new Date(purchase.purchased_at), 'MMM dd, yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{purchase.profiles.full_name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">{purchase.profiles.email}</div>
                  </div>
                </TableCell>
                <TableCell>{purchase.products.name_en}</TableCell>
                <TableCell className="font-semibold">${purchase.amount_paid.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={purchase.status === 'completed' ? 'default' : 'secondary'}>
                    {purchase.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {!purchases?.length && (
          <div className="text-center py-8 text-muted-foreground">
            No purchases yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};
