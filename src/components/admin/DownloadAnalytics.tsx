import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface DownloadEvent {
  id: string;
  created_at: string;
  properties: {
    product_sku?: string;
    purchase_id?: string;
  } | null;
  user_id: string | null;
}

export function DownloadAnalytics() {
  const { data: downloadStats } = useQuery({
    queryKey: ["download-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .eq("event_type", "download")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const downloads = data as DownloadEvent[];
      
      // Count downloads by product
      const productCounts = downloads.reduce((acc, download) => {
        const sku = download.properties?.product_sku;
        if (sku) {
          acc[sku] = (acc[sku] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topProducts = Object.entries(productCounts)
        .map(([sku, count]) => ({ sku, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalDownloads: downloads.length,
        topProducts,
        recentDownloads: downloads.slice(0, 10),
      };
    },
  });

  const { data: recentDownloadsWithDetails } = useQuery({
    queryKey: ["recent-downloads-details"],
    queryFn: async () => {
      if (!downloadStats?.recentDownloads.length) return [];

      const purchaseIds = downloadStats.recentDownloads
        .map(d => d.properties?.purchase_id)
        .filter(Boolean);

      const { data, error } = await supabase
        .from("purchases")
        .select("id, products(name_en, sku), profiles(full_name, email)")
        .in("id", purchaseIds);

      if (error) throw error;

      return downloadStats.recentDownloads.map(download => {
        const purchase = data?.find(p => p.id === download.properties?.purchase_id);
        return {
          ...download,
          productName: purchase?.products?.name_en || download.properties?.product_sku,
          userName: purchase?.profiles?.full_name || purchase?.profiles?.email || "Unknown",
        };
      });
    },
    enabled: !!downloadStats?.recentDownloads.length,
  });

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{downloadStats?.totalDownloads || 0}</div>
            <p className="text-xs text-muted-foreground">Last 100 recorded downloads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Product</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {downloadStats?.topProducts[0]?.sku || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {downloadStats?.topProducts[0]?.count || 0} downloads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Most Downloaded Products */}
      <Card>
        <CardHeader>
          <CardTitle>Most Downloaded Products</CardTitle>
          <CardDescription>Products ranked by download frequency</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product SKU</TableHead>
                <TableHead className="text-right">Downloads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {downloadStats?.topProducts.map((product) => (
                <TableRow key={product.sku}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell className="text-right">{product.count}</TableCell>
                </TableRow>
              ))}
              {(!downloadStats?.topProducts.length) && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No downloads recorded yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Downloads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Downloads</CardTitle>
          <CardDescription>Latest product downloads with timestamps</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Downloaded At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDownloadsWithDetails?.map((download) => (
                <TableRow key={download.id}>
                  <TableCell className="font-medium">{download.productName}</TableCell>
                  <TableCell>{download.userName}</TableCell>
                  <TableCell>
                    {format(new Date(download.created_at), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
              {(!recentDownloadsWithDetails?.length) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No recent downloads
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
