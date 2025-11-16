import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const AnalyticsDashboard = () => {
  const { data: pageViews } = useQuery({
    queryKey: ['admin-page-views'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_page_views')
        .select('page_path')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      // Count page views by path
      const counts: Record<string, number> = {};
      data.forEach(view => {
        counts[view.page_path] = (counts[view.page_path] || 0) + 1;
      });
      
      return Object.entries(counts)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count);
    }
  });

  const { data: topEvents } = useQuery({
    queryKey: ['admin-top-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('event_name, event_type')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      // Count events
      const counts: Record<string, number> = {};
      data.forEach(event => {
        const key = `${event.event_type}: ${event.event_name}`;
        counts[key] = (counts[key] || 0) + 1;
      });
      
      return Object.entries(counts)
        .map(([event, count]) => ({ event, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
          <CardDescription>Most visited pages in last 100 views</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="text-right">Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageViews?.map(({ path, count }) => (
                <TableRow key={path}>
                  <TableCell className="font-medium">{path}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{count}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Events</CardTitle>
          <CardDescription>Most triggered events in last 100</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topEvents?.map(({ event, count }) => (
                <TableRow key={event}>
                  <TableCell className="font-medium">{event}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{count}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
