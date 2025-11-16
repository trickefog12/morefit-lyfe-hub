import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface AuditLog {
  id: string;
  admin_email: string;
  action_type: string;
  created_at: string;
  details: any;
}

export const NotificationPanel = () => {
  const [open, setOpen] = useState(false);
  const [lastViewedTime, setLastViewedTime] = useState<string>(
    localStorage.getItem('lastViewedNotifications') || new Date().toISOString()
  );
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: allActions } = useQuery({
    queryKey: ['notification-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); // Fetch more for filtering
      
      if (error) throw error;
      return data as AuditLog[];
    }
  });

  // Apply filters
  const recentActions = allActions?.filter(action => {
    // Date range filter
    if (dateRangeFilter !== "all") {
      const actionDate = new Date(action.created_at);
      const now = new Date();
      
      switch (dateRangeFilter) {
        case "today":
          if (actionDate < startOfDay(now)) return false;
          break;
        case "week":
          if (actionDate < subDays(now, 7)) return false;
          break;
        case "month":
          if (actionDate < subDays(now, 30)) return false;
          break;
      }
    }

    // Action type filter
    if (actionTypeFilter !== "all" && action.action_type !== actionTypeFilter) {
      return false;
    }

    // Severity filter
    if (severityFilter !== "all") {
      const severity = getActionSeverity(action.action_type);
      if (severity !== severityFilter) return false;
    }

    return true;
  }).slice(0, 20); // Limit to 20 after filtering

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('notification-panel-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_logs'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notification-history'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      const now = new Date().toISOString();
      setLastViewedTime(now);
      localStorage.setItem('lastViewedNotifications', now);
    }
  };

  const unreadCount = allActions?.filter(
    action => new Date(action.created_at) > new Date(lastViewedTime)
  ).length || 0;

  const clearFilters = () => {
    setSeverityFilter("all");
    setActionTypeFilter("all");
    setDateRangeFilter("all");
  };

  const hasActiveFilters = severityFilter !== "all" || actionTypeFilter !== "all" || dateRangeFilter !== "all";

  // Get unique action types for filter
  const uniqueActionTypes = Array.from(new Set(allActions?.map(a => a.action_type) || []));

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

  const getActionSeverity = (actionType: string): "default" | "destructive" | "success" | "warning" => {
    switch (actionType) {
      case 'delete_download_limit':
      case 'delete_user':
      case 'revoke_access':
        return 'destructive';
      case 'reset_download_limit':
      case 'modify_limit':
        return 'warning';
      case 'create_download_limit':
      case 'grant_access':
        return 'success';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity: "default" | "destructive" | "success" | "warning") => {
    switch (severity) {
      case 'destructive':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getSeverityColor = (severity: "default" | "destructive" | "success" | "warning") => {
    switch (severity) {
      case 'destructive':
        return 'text-red-500';
      case 'warning':
        return 'text-amber-500';
      case 'success':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Notification History</SheetTitle>
          <SheetDescription>
            Filter and review recent admin actions
          </SheetDescription>
        </SheetHeader>

        {/* Filters */}
        <div className="space-y-4 mt-6 pb-4 border-b">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Severity</Label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="destructive">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="default">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Date Range</Label>
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Action Type</Label>
            <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActionTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {getActionLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-380px)] mt-4">
          <div className="space-y-4 pr-4">
            {recentActions && recentActions.length > 0 ? (
              recentActions.map((action) => {
                const severity = getActionSeverity(action.action_type);
                const IconComponent = getSeverityIcon(severity);
                const iconColor = getSeverityColor(severity);
                const isUnread = new Date(action.created_at) > new Date(lastViewedTime);

                return (
                  <div
                    key={action.id}
                    className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                      isUnread ? 'bg-accent/50 border-accent' : 'bg-background'
                    }`}
                  >
                    <div className={`flex-shrink-0 mt-1 ${iconColor}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {getActionLabel(action.action_type)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            by {action.admin_email}
                          </p>
                        </div>
                        {isUnread && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(action.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No notifications yet
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
