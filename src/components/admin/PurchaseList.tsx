import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
  
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
    return <div className="text-center py-8">{t("loading_purchases")}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("purchase_history")}</CardTitle>
        <CardDescription>{t("purchase_history_desc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("customer")}</TableHead>
              <TableHead>{t("product")}</TableHead>
              <TableHead>{t("amount")}</TableHead>
              <TableHead>{t("status")}</TableHead>
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
                    <div className="font-medium">{purchase.profiles.full_name || t("na")}</div>
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
            {t("no_purchases_yet")}
          </div>
        )}
      </CardContent>
    </Card>
  );
};