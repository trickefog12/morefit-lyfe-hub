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
import { format } from "date-fns";
import { Shield, Trash2, Plus } from "lucide-react";

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
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as AuditLog[];
    }
  });

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
    <Card>
      <CardHeader>
        <CardTitle>Admin Audit Log</CardTitle>
        <CardDescription>
          Track all administrative actions including download limit resets and custom limit changes
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
            No audit logs found. Admin actions will appear here.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
