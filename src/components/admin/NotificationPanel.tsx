import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Bell, AlertCircle, CheckCircle, AlertTriangle, Info, X, Search, CheckCheck, ChevronDown, ChevronRight, BellRing, Volume2, Trash2, Download, FileJson, FileSpreadsheet } from "lucide-react";
import { format, subDays, startOfDay, endOfDay, isToday, isYesterday, isThisWeek } from "date-fns";
import { playNotificationSound, showBrowserNotification, requestNotificationPermission } from "@/lib/notificationSound";

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
  const [adminUserFilter, setAdminUserFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["today", "yesterday", "thisWeek", "older"]));
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    localStorage.getItem('notificationSoundEnabled') !== 'false'
  );
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState<boolean>(
    localStorage.getItem('browserNotificationsEnabled') === 'true'
  );
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState<boolean>(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const severityFilterRef = useRef<HTMLButtonElement>(null);
  const dateRangeFilterRef = useRef<HTMLButtonElement>(null);
  const actionTypeFilterRef = useRef<HTMLButtonElement>(null);
  const adminUserFilterRef = useRef<HTMLButtonElement>(null);
  const notificationRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastNotificationCountRef = useRef<number>(0);

  // Keyboard shortcut listener - global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
        // Focus search input after a short delay to ensure the panel is open
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
      
      // Escape to close (when panel is open)
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }

      // Ctrl+Shift+M or Cmd+Shift+M to mark all as read
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        markAllAsRead();
      }

      // Ctrl+M or Cmd+M to mark selected as read (when items are selected)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'm' && open && selectedNotifications.size > 0) {
        e.preventDefault();
        markSelectedAsRead();
      }

      // Ctrl+A or Cmd+A to select all (when panel is open)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && open) {
        e.preventDefault();
        toggleSelectAll();
      }

      // Ctrl+I or Cmd+I to invert selection (when panel is open)
      if ((e.ctrlKey || e.metaKey) && e.key === 'i' && open) {
        e.preventDefault();
        invertSelection();
      }

      // Ctrl+D or Cmd+D to delete selected (when panel is open and items are selected)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && open && selectedNotifications.size > 0) {
        e.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedNotifications.size]);

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
    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const matchesEmail = action.admin_email.toLowerCase().includes(searchLower);
      const matchesAction = getActionLabel(action.action_type).toLowerCase().includes(searchLower);
      const matchesDetails = action.details && 
        JSON.stringify(action.details).toLowerCase().includes(searchLower);
      
      if (!matchesEmail && !matchesAction && !matchesDetails) {
        return false;
      }
    }

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

    // Admin user filter
    if (adminUserFilter !== "all" && action.admin_email !== adminUserFilter) {
      return false;
    }

    // Severity filter
    if (severityFilter !== "all") {
      const severity = getActionSeverity(action.action_type);
      if (severity !== severityFilter) return false;
    }

    return true;
  }).slice(0, 20); // Limit to 20 after filtering

  // Keyboard navigation shortcuts - needs recentActions
  useEffect(() => {
    const handleNavigationKeys = (e: KeyboardEvent) => {
      // Arrow navigation, Space, and Enter (when panel is open and not focused on search)
      if (open && document.activeElement !== searchInputRef.current) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => {
            const maxIndex = (recentActions?.length || 0) - 1;
            const next = Math.min(prev + 1, maxIndex);
            // Scroll into view
            setTimeout(() => {
              notificationRefs.current[next]?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
              });
            }, 0);
            return next;
          });
        }
        
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => {
            const next = prev > 0 ? prev - 1 : 0;
            // Scroll into view
            setTimeout(() => {
              notificationRefs.current[next]?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
              });
            }, 0);
            return next;
          });
        }
        
        if (e.key === ' ' && selectedIndex >= 0) {
          e.preventDefault();
          // Toggle checkbox selection for the currently focused notification
          const notification = recentActions?.[selectedIndex];
          if (notification) {
            toggleNotificationSelection(notification.id);
          }
        }
        
        if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault();
          // Toggle expansion for the currently focused notification
          const notification = recentActions?.[selectedIndex];
          if (notification) {
            toggleExpanded(notification.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleNavigationKeys);
    return () => window.removeEventListener('keydown', handleNavigationKeys);
  }, [open, selectedIndex, recentActions]);

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('notification-panel-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs'
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['notification-history'] });
          
          // Check if this is a new notification (not from initial load)
          const currentCount = allActions?.length || 0;
          if (lastNotificationCountRef.current > 0 && currentCount > lastNotificationCountRef.current) {
            // Play sound if enabled
            if (soundEnabled) {
              playNotificationSound();
            }
            
            // Show browser notification if enabled
            if (browserNotificationsEnabled && notificationPermissionGranted) {
              const newAction = payload.new as AuditLog;
              showBrowserNotification('New Admin Action', {
                body: `${getActionLabel(newAction.action_type)} by ${newAction.admin_email}`,
                tag: newAction.id,
                requireInteraction: false,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, soundEnabled, browserNotificationsEnabled, notificationPermissionGranted, allActions]);

  // Update last notification count
  useEffect(() => {
    if (allActions) {
      lastNotificationCountRef.current = allActions.length;
    }
  }, [allActions]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      const now = new Date().toISOString();
      setLastViewedTime(now);
      localStorage.setItem('lastViewedNotifications', now);
      // Focus search input when opening
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // Reset selection when closing
      setSelectedIndex(-1);
      setSelectedNotifications(new Set());
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const markAllAsRead = () => {
    const now = new Date().toISOString();
    setLastViewedTime(now);
    localStorage.setItem('lastViewedNotifications', now);
  };

  const unreadCount = allActions?.filter(
    action => new Date(action.created_at) > new Date(lastViewedTime)
  ).length || 0;

  const clearFilters = () => {
    setSeverityFilter("all");
    setActionTypeFilter("all");
    setDateRangeFilter("all");
    setAdminUserFilter("all");
    setSearchTerm("");
    setSelectedIndex(-1);
  };

  const hasActiveFilters = severityFilter !== "all" || actionTypeFilter !== "all" || dateRangeFilter !== "all" || adminUserFilter !== "all" || searchTerm.trim() !== "";

  // Get unique action types and admin users for filters
  const uniqueActionTypes = Array.from(new Set(allActions?.map(a => a.action_type) || []));
  const uniqueAdminUsers = Array.from(new Set(allActions?.map(a => a.admin_email) || [])).sort();

  // Group notifications by date
  const groupedNotifications = recentActions?.reduce((groups, action) => {
    const actionDate = new Date(action.created_at);
    let groupKey: string;

    if (isToday(actionDate)) {
      groupKey = "today";
    } else if (isYesterday(actionDate)) {
      groupKey = "yesterday";
    } else if (isThisWeek(actionDate, { weekStartsOn: 1 })) {
      groupKey = "thisWeek";
    } else {
      groupKey = "older";
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(action);
    return groups;
  }, {} as Record<string, typeof recentActions>);

  const groupLabels = {
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    older: "Older"
  };

  const groupOrder = ["today", "yesterday", "thisWeek", "older"];

  const toggleGroup = (groupKey: string) => {
    setOpenGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('notificationSoundEnabled', String(enabled));
  };

  const handleBrowserNotificationsToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      setNotificationPermissionGranted(granted);
      setBrowserNotificationsEnabled(granted);
      localStorage.setItem('browserNotificationsEnabled', String(granted));
      
      if (!granted) {
        // Show a message to the user that permission was denied
        console.log('Notification permission denied');
      }
    } else {
      setBrowserNotificationsEnabled(false);
      localStorage.setItem('browserNotificationsEnabled', 'false');
    }
  };

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

  // Bulk action functions
  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.size === recentActions?.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(recentActions?.map(a => a.id) || []));
    }
  };

  const invertSelection = () => {
    const allIds = new Set(recentActions?.map(a => a.id) || []);
    const newSelection = new Set<string>();
    
    allIds.forEach(id => {
      if (!selectedNotifications.has(id)) {
        newSelection.add(id);
      }
    });
    
    setSelectedNotifications(newSelection);
  };

  const markSelectedAsRead = () => {
    const now = new Date().toISOString();
    setLastViewedTime(now);
    localStorage.setItem('lastViewedNotifications', now);
    setSelectedNotifications(new Set());
  };

  const deleteSelected = async () => {
    try {
      const idsToDelete = Array.from(selectedNotifications);
      await supabase
        .from('audit_logs')
        .delete()
        .in('id', idsToDelete);
      
      setSelectedNotifications(new Set());
      queryClient.invalidateQueries({ queryKey: ['notification-history'] });
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const exportSelectedAsCSV = () => {
    const selectedActions = recentActions?.filter(a => selectedNotifications.has(a.id)) || [];
    
    if (selectedActions.length === 0) return;

    // CSV headers
    const headers = ['ID', 'Admin Email', 'Action Type', 'Date', 'Details'];
    
    // Convert data to CSV rows
    const rows = selectedActions.map(action => {
      const details = action.details ? JSON.stringify(action.details).replace(/"/g, '""') : '';
      return [
        action.id,
        action.admin_email,
        getActionLabel(action.action_type),
        format(new Date(action.created_at), "yyyy-MM-dd HH:mm:ss"),
        `"${details}"`
      ].join(',');
    });

    // Combine headers and rows
    const csv = [headers.join(','), ...rows].join('\n');

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `notifications_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSelectedAsJSON = () => {
    const selectedActions = recentActions?.filter(a => selectedNotifications.has(a.id)) || [];
    
    if (selectedActions.length === 0) return;

    // Format data for JSON export
    const exportData = selectedActions.map(action => ({
      id: action.id,
      admin_email: action.admin_email,
      action_type: action.action_type,
      action_label: getActionLabel(action.action_type),
      created_at: action.created_at,
      formatted_date: format(new Date(action.created_at), "yyyy-MM-dd HH:mm:ss"),
      details: action.details
    }));

    // Create JSON string with formatting
    const json = JSON.stringify(exportData, null, 2);

    // Create blob and download
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `notifications_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative" title="Notifications (Ctrl+K)">
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
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Notification History</SheetTitle>
              <SheetDescription>
                Filter and review recent admin actions
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
              <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium opacity-100 sm:flex">
                ↑↓
              </kbd>
              <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium opacity-100 sm:flex">
                ESC
              </kbd>
            </div>
          </div>
          
          {/* Bulk action buttons */}
          {selectedNotifications.size > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markSelectedAsRead}
                  className="flex-1"
                  title="Mark selected as read (Ctrl+M)"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark as Read ({selectedNotifications.size})
                  <kbd className="ml-auto hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>M
                  </kbd>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteSelected}
                  className="flex-1"
                  title="Delete selected (Ctrl+D)"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedNotifications.size})
                  <kbd className="ml-auto hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>D
                  </kbd>
                </Button>
              </div>
              
              {/* Export buttons */}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={exportSelectedAsCSV}
                  className="flex-1"
                  title="Export selected as CSV"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={exportSelectedAsJSON}
                  className="flex-1"
                  title="Export selected as JSON"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </div>
          )}

          {/* Mark all as read button */}
          {unreadCount > 0 && selectedNotifications.size === 0 && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="w-full"
                title="Mark all as read (Ctrl+Shift+M)"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All as Read ({unreadCount})
                <kbd className="ml-auto hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>⇧M
                </kbd>
              </Button>
            </div>
          )}

          {/* Notification Settings */}
          <div className="mt-4 pt-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="sound-toggle" className="text-sm font-normal cursor-pointer">
                  Sound Alerts
                </Label>
              </div>
              <Switch
                id="sound-toggle"
                checked={soundEnabled}
                onCheckedChange={handleSoundToggle}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="browser-notifications-toggle" className="text-sm font-normal cursor-pointer">
                  Browser Notifications
                </Label>
              </div>
              <Switch
                id="browser-notifications-toggle"
                checked={browserNotificationsEnabled}
                onCheckedChange={handleBrowserNotificationsToggle}
              />
            </div>
            {browserNotificationsEnabled && !notificationPermissionGranted && (
              <p className="text-xs text-muted-foreground">
                Permission denied. Please enable notifications in your browser settings.
              </p>
            )}
          </div>
        </SheetHeader>

        {/* Filters */}
        <div className="space-y-4 mt-6 pb-4 border-b">
          <div className="space-y-2">
            <Label htmlFor="search-notifications" className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-notifications"
                ref={searchInputRef}
                placeholder="Search by email or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
                autoComplete="off"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchTerm("")}
                  tabIndex={0}
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="severity-filter" className="text-xs">Severity</Label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger id="severity-filter" className="h-9">
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
              <Label htmlFor="date-range-filter" className="text-xs">Date Range</Label>
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger id="date-range-filter" className="h-9">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="action-type-filter" className="text-xs">Action Type</Label>
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger id="action-type-filter" className="h-9">
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

            <div className="space-y-2">
              <Label htmlFor="admin-user-filter" className="text-xs">Admin User</Label>
              <Select value={adminUserFilter} onValueChange={setAdminUserFilter}>
                <SelectTrigger id="admin-user-filter" className="h-9" ref={adminUserFilterRef}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Admins</SelectItem>
                  {uniqueAdminUsers.map(email => (
                    <SelectItem key={email} value={email}>
                      {email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="w-full"
              tabIndex={0}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-450px)] mt-4">
          <div className="space-y-4 pr-4">
            {/* Select All Checkbox */}
            {recentActions && recentActions.length > 0 && (
              <div className="flex items-center gap-2 px-2 py-1 border-b">
                <Checkbox
                  id="select-all"
                  checked={selectedNotifications.size === recentActions.length && recentActions.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm cursor-pointer flex items-center gap-2">
                  Select All ({recentActions.length})
                  <kbd className="ml-1 hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:inline-flex">
                    <span className="text-xs">⌘</span>A
                  </kbd>
                  <span className="text-muted-foreground mx-1">|</span>
                  <span className="text-xs text-muted-foreground">Invert</span>
                  <kbd className="hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:inline-flex">
                    <span className="text-xs">⌘</span>I
                  </kbd>
                </Label>
              </div>
            )}

            {recentActions && recentActions.length > 0 ? (
              groupOrder.map((groupKey) => {
                const groupActions = groupedNotifications?.[groupKey];
                if (!groupActions || groupActions.length === 0) return null;

                const isGroupOpen = openGroups.has(groupKey);
                const groupLabel = groupLabels[groupKey as keyof typeof groupLabels];

                // Calculate starting index for this group
                const previousGroupsLength = groupOrder
                  .slice(0, groupOrder.indexOf(groupKey))
                  .reduce((sum, key) => sum + (groupedNotifications?.[key]?.length || 0), 0);

                return (
                  <Collapsible
                    key={groupKey}
                    open={isGroupOpen}
                    onOpenChange={() => toggleGroup(groupKey)}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-lg transition-colors group">
                      <div className="flex items-center gap-2">
                        {isGroupOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-semibold text-sm">{groupLabel}</span>
                        <Badge variant="secondary" className="text-xs">
                          {groupActions.length}
                        </Badge>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-2">
                      {groupActions.map((action, groupIndex) => {
                        const globalIndex = previousGroupsLength + groupIndex;
                        const severity = getActionSeverity(action.action_type);
                        const IconComponent = getSeverityIcon(severity);
                        const iconColor = getSeverityColor(severity);
                        const isUnread = new Date(action.created_at) > new Date(lastViewedTime);
                        const isExpanded = expandedNotifications.has(action.id);
                        const isSelected = selectedIndex === globalIndex;
                        const isChecked = selectedNotifications.has(action.id);

                        return (
                          <div
                            key={action.id}
                            ref={el => notificationRefs.current[globalIndex] = el}
                            className={`flex gap-3 p-3 rounded-lg border transition-all duration-300 ease-in-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                              isUnread ? 'bg-accent/50 border-accent' : 'bg-background'
                            } ${isSelected ? 'ring-2 ring-primary shadow-lg bg-primary/5 border-primary scale-[1.02]' : ''} ${isChecked ? 'bg-primary/10' : ''} hover:border-primary/50`}
                            style={{
                              transitionProperty: 'box-shadow, border-color, background-color, transform, opacity',
                              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                            onClick={() => toggleExpanded(action.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleExpanded(action.id);
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-expanded={isExpanded}
                            aria-label={`${getActionLabel(action.action_type)} by ${action.admin_email}`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => toggleNotificationSelection(action.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1"
                            />
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
                                <div className="flex items-center gap-2">
                                  {isUnread && (
                                    <Badge variant="secondary" className="text-xs">
                                      New
                                    </Badge>
                                  )}
                                  {isSelected && (
                                    <kbd className="hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
                                      ↵
                                    </kbd>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(action.created_at), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                              
                              {/* Expanded details */}
                              {isExpanded && action.details && (
                                <div className="mt-3 p-2 rounded bg-muted/50 border text-xs">
                                  <p className="font-medium mb-1">Details:</p>
                                  <pre className="whitespace-pre-wrap break-words font-mono">
                                    {JSON.stringify(action.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
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
