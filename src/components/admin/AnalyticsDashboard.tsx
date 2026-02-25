import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

  const { data: dailyTrends } = useQuery({
    queryKey: ['admin-daily-trends'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const since = thirtyDaysAgo.toISOString();

      const [eventsRes, viewsRes] = await Promise.all([
        supabase
          .from('analytics_events')
          .select('created_at')
          .gte('created_at', since)
          .order('created_at', { ascending: true })
          .limit(1000),
        supabase
          .from('analytics_page_views')
          .select('created_at')
          .gte('created_at', since)
          .order('created_at', { ascending: true })
          .limit(1000),
      ]);

      const eventsByDay: Record<string, number> = {};
      const viewsByDay: Record<string, number> = {};

      eventsRes.data?.forEach(e => {
        const day = format(new Date(e.created_at!), 'MMM d');
        eventsByDay[day] = (eventsByDay[day] || 0) + 1;
      });
      viewsRes.data?.forEach(v => {
        const day = format(new Date(v.created_at!), 'MMM d');
        viewsByDay[day] = (viewsByDay[day] || 0) + 1;
      });

      const allDays = new Set([...Object.keys(eventsByDay), ...Object.keys(viewsByDay)]);
      return Array.from(allDays)
        .sort((a, b) => new Date(a + ' 2025').getTime() - new Date(b + ' 2025').getTime())
        .map(day => ({ day, events: eventsByDay[day] || 0, pageViews: viewsByDay[day] || 0 }));
    },
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={isRunningCleanup}>
                  {isRunningCleanup ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Run Cleanup Now
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Run Analytics Cleanup?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all analytics events and page views older than 90 days. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRunCleanup}>
                    Yes, run cleanup
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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

      {/* Daily Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Trends (Last 30 Days)</CardTitle>
          <CardDescription>Events and page views per day</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyTrends && dailyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyTrends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="events"
                  name="Events"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="pageViews"
                  name="Page Views"
                  stroke="hsl(var(--secondary-foreground))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
              No trend data available yet
            </div>
          )}
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
