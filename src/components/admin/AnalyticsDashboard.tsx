import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Trash2, Clock, BarChart3, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const AnalyticsDashboard = () => {
  const [isRunningCleanup, setIsRunningCleanup] = useState(false);
  const queryClient = useQueryClient();

  const handleRunCleanup = async () => {
    setIsRunningCleanup(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-analytics');
      if (error) throw error;
      toast({
        title: "Cleanup complete",
        description: `Deleted ${data.deleted.analytics_events} events and ${data.deleted.analytics_page_views} page views.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-retention-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-page-views'] });
      queryClient.invalidateQueries({ queryKey: ['admin-top-events'] });
    } catch (err: any) {
      toast({
        title: "Cleanup failed",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRunningCleanup(false);
    }
  };
  const { data: pageViews } = useQuery({
    queryKey: ['admin-page-views'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_page_views')
        .select('page_path')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
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

  const { data: retentionStats } = useQuery({
    queryKey: ['admin-retention-stats'],
    queryFn: async () => {
      const [eventsRes, viewsRes, oldestEventRes, oldestViewRes] = await Promise.all([
        supabase.from('analytics_events').select('id', { count: 'exact', head: true }),
        supabase.from('analytics_page_views').select('id', { count: 'exact', head: true }),
        supabase.from('analytics_events').select('created_at').order('created_at', { ascending: true }).limit(1),
        supabase.from('analytics_page_views').select('created_at').order('created_at', { ascending: true }).limit(1),
      ]);

      const oldestEvent = oldestEventRes.data?.[0]?.created_at;
      const oldestView = oldestViewRes.data?.[0]?.created_at;
      const oldest = oldestEvent && oldestView
        ? (oldestEvent < oldestView ? oldestEvent : oldestView)
        : oldestEvent || oldestView;

      return {
        totalEvents: eventsRes.count ?? 0,
        totalPageViews: viewsRes.count ?? 0,
        oldestRecord: oldest ? new Date(oldest) : null,
        retentionDays: 90,
      };
    },
    refetchInterval: 60000,
  });

  return (
    <div className="space-y-4">
      {/* Data Retention Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Data Retention</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunCleanup}
              disabled={isRunningCleanup}
            >
              {isRunningCleanup ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Run Cleanup Now
            </Button>
          </div>
          <CardDescription>Auto-cleanup runs daily — records older than 90 days are removed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Total Events</span>
              </div>
              <span className="text-2xl font-bold">{retentionStats?.totalEvents ?? '—'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Total Page Views</span>
              </div>
              <span className="text-2xl font-bold">{retentionStats?.totalPageViews ?? '—'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Oldest Record</span>
              </div>
              <span className="text-sm font-medium">
                {retentionStats?.oldestRecord
                  ? format(retentionStats.oldestRecord, 'MMM d, yyyy')
                  : 'No data'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Trash2 className="h-3.5 w-3.5" />
                <span>Retention Policy</span>
              </div>
              <Badge variant="outline" className="w-fit">{retentionStats?.retentionDays ?? 90} days</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
};
