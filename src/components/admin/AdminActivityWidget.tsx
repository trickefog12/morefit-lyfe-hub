import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Shield, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AuditLog {
  id: string;
  admin_email: string;
  action_type: string;
  created_at: string;
}

export const AdminActivityWidget = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-activity-stats'],
    queryFn: async () => {
      // Get logs from last 7 days
      const sevenDaysAgo = subDays(new Date(), 7);
      
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('id, admin_email, action_type, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Calculate stats
      const totalActions = logs?.length || 0;
      
      // Count by action type
      const actionCounts = logs?.reduce((acc, log) => {
        acc[log.action_type] = (acc[log.action_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get unique admins
      const uniqueAdmins = new Set(logs?.map(log => log.admin_email)).size;

      // Calculate daily activity for chart (last 7 days)
      const dailyActivity = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const count = logs?.filter(log => {
          const logDate = new Date(log.created_at);
          return logDate >= dayStart && logDate <= dayEnd;
        }).length || 0;

        return {
          date: format(date, 'MMM dd'),
          actions: count
        };
      });

      // Get recent activity (last 5)
      const recentActivity = logs?.slice(0, 5) || [];

      return {
        totalActions,
        actionCounts,
        uniqueAdmins,
        dailyActivity,
        recentActivity: recentActivity as AuditLog[]
      };
    }
  });

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'reset_download_limit':
        return 'Reset Limit';
      case 'create_download_limit':
        return 'Create Limit';
      case 'delete_download_limit':
        return 'Delete Limit';
      default:
        return actionType;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'reset_download_limit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'create_download_limit':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delete_download_limit':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Admin Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading activity...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Admin Activity
        </CardTitle>
        <CardDescription>Last 7 days activity summary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Total Actions
            </div>
            <div className="text-2xl font-bold">{stats?.totalActions || 0}</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Active Admins
            </div>
            <div className="text-2xl font-bold">{stats?.uniqueAdmins || 0}</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">By Action Type</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats?.actionCounts || {}).map(([type, count]) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {getActionLabel(type)}: {count}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Daily Activity</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={stats?.dailyActivity || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="actions" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Recent Actions</div>
          <div className="space-y-2">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action_type)}`}>
                      {getActionLabel(log.action_type)}
                    </span>
                    <span className="text-muted-foreground truncate">
                      by {log.admin_email}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {format(new Date(log.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
