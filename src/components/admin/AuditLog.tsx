import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Shield, Trash2, Plus, Filter, X } from "lucide-react";

interface AuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action_type: string;
  target_user_id: string | null;
  target_role: string | null;
  details: any;
  created_at: string;
}

export const AuditLog = () => {
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [adminEmailFilter, setAdminEmailFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs', actionTypeFilter, adminEmailFilter, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      // Apply action type filter
      if (actionTypeFilter !== "all") {
        query = query.eq('action_type', actionTypeFilter);
      }

      // Apply admin email filter
      if (adminEmailFilter) {
        query = query.ilike('admin_email', `%${adminEmailFilter}%`);
      }

      // Apply date range filters
      if (startDate) {
        query = query.gte('created_at', new Date(startDate).toISOString());
      }
      if (endDate) {
        // Add 1 day to include the entire end date
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        query = query.lt('created_at', endDateTime.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as AuditLog[];
    }
  });

  const clearFilters = () => {
    setActionTypeFilter("all");
    setAdminEmailFilter("");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = actionTypeFilter !== "all" || adminEmailFilter || startDate || endDate;

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'reset_download_limit':
        return <Shield className="h-4 w-4" />;
      case 'create_download_limit':
        return <Plus className="h-4 w-4" />;
      case 'delete_download_limit':
        return <Trash2 className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
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

  const getActionVariant = (actionType: string): "default" | "secondary" | "destructive" => {
    switch (actionType) {
      case 'reset_download_limit':
        return 'default';
      case 'create_download_limit':
        return 'secondary';
      case 'delete_download_limit':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="reset_download_limit">Reset Limit</SelectItem>
                  <SelectItem value="create_download_limit">Create Limit</SelectItem>
                  <SelectItem value="delete_download_limit">Delete Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Admin Email</Label>
              <Input
                placeholder="Search by email..."
                value={adminEmailFilter}
                onChange={(e) => setAdminEmailFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Audit Log</CardTitle>
          <CardDescription>
            Track all administrative actions including download limit resets and custom limit changes
            {logs && ` (${logs.length} ${logs.length === 1 ? 'entry' : 'entries'})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.admin_email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionVariant(log.action_type)} className="gap-1">
                      {getActionIcon(log.action_type)}
                      {getActionLabel(log.action_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.target_user_id && (
                      <div className="text-sm">
                        <div className="font-medium">User</div>
                        <div className="text-muted-foreground">
                          {log.details?.target_email || "Unknown"}
                        </div>
                      </div>
                    )}
                    {log.target_role && (
                      <Badge variant="outline">
                        {log.target_role.toUpperCase()}
                      </Badge>
                    )}
                    {!log.target_user_id && !log.target_role && (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.details?.daily_limit && (
                      <span className="text-sm">
                        Limit: {log.details.daily_limit} downloads/day
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!logs?.length && (
            <div className="text-center py-8 text-muted-foreground">
              {hasActiveFilters 
                ? "No audit logs match the selected filters."
                : "No audit logs found. Admin actions will appear here."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
