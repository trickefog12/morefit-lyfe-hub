import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
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

interface DownloadLimit {
  id: string;
  user_id: string | null;
  role: string | null;
  daily_limit: number;
  profiles?: {
    email: string;
    full_name: string | null;
  };
}

export const DownloadLimitManager = () => {
  const queryClient = useQueryClient();
  const [limitType, setLimitType] = useState<"user" | "role">("user");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [dailyLimit, setDailyLimit] = useState<string>("10");

  const { data: limits, isLoading: limitsLoading } = useQuery({
    queryKey: ['download-limits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('download_limits')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DownloadLimit[];
    }
  });

  const { data: users } = useQuery({
    queryKey: ['users-for-limits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('email');
      
      if (error) throw error;
      return data;
    }
  });

  const createLimitMutation = useMutation({
    mutationFn: async () => {
      const limitValue = parseInt(dailyLimit);
      if (isNaN(limitValue) || limitValue <= 0) {
        throw new Error("Daily limit must be a positive number");
      }

      const insertData: any = { daily_limit: limitValue };
      
      if (limitType === "user") {
        if (!selectedUser) throw new Error("Please select a user");
        insertData.user_id = selectedUser;
      } else {
        if (!selectedRole) throw new Error("Please select a role");
        insertData.role = selectedRole;
      }

      const { error } = await supabase
        .from('download_limits')
        .insert(insertData);
      
      if (error) throw error;

      // Log the admin action
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('audit_logs').insert({
          admin_id: user.id,
          admin_email: user.email || "unknown",
          action_type: "create_download_limit",
          target_user_id: limitType === "user" ? selectedUser : null,
          target_role: limitType === "role" ? selectedRole as any : null,
          details: { daily_limit: limitValue }
        });

        // Get target info for notification
        let targetInfo = "";
        if (limitType === "user") {
          const targetUser = users?.find(u => u.id === selectedUser);
          targetInfo = `User: ${targetUser?.email || 'Unknown'}`;
        } else {
          targetInfo = `Role: ${selectedRole.toUpperCase()}`;
        }

        // Send notification email in the background
        supabase.functions.invoke('send-admin-notification', {
          body: {
            actionType: 'create_download_limit',
            actionLabel: 'Create Download Limit',
            performedBy: user.email || 'Unknown Admin',
            target: targetInfo,
            details: `Daily limit set to ${limitValue} downloads`,
          }
        });
      }
    },
    onSuccess: () => {
      toast.success("Download limit created successfully");
      queryClient.invalidateQueries({ queryKey: ['download-limits'] });
      setSelectedUser("");
      setSelectedRole("");
      setDailyLimit("10");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create download limit");
    }
  });

  const deleteLimitMutation = useMutation({
    mutationFn: async (limitId: string) => {
      // Get limit details before deleting
      const { data: limitData } = await supabase
        .from('download_limits')
        .select('user_id, role, daily_limit, profiles:user_id(email)')
        .eq('id', limitId)
        .single();

      const { error } = await supabase
        .from('download_limits')
        .delete()
        .eq('id', limitId);
      
      if (error) throw error;

      // Log the admin action
      const { data: { user } } = await supabase.auth.getUser();
      if (user && limitData) {
        await supabase.from('audit_logs').insert({
          admin_id: user.id,
          admin_email: user.email || "unknown",
          action_type: "delete_download_limit",
          target_user_id: limitData.user_id,
          target_role: limitData.role as any,
          details: { 
            daily_limit: limitData.daily_limit,
            target_email: (limitData.profiles as any)?.email
          }
        });

        // Prepare target info for notification
        const targetInfo = limitData.user_id 
          ? `User: ${(limitData.profiles as any)?.email || 'Unknown'}`
          : `Role: ${limitData.role?.toUpperCase()}`;

        // Send notification email in the background
        supabase.functions.invoke('send-admin-notification', {
          body: {
            actionType: 'delete_download_limit',
            actionLabel: 'Delete Download Limit',
            performedBy: user.email || 'Unknown Admin',
            target: targetInfo,
            details: `Removed custom limit of ${limitData.daily_limit} downloads/day`,
          }
        });
      }
    },
    onSuccess: () => {
      toast.success("Download limit deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['download-limits'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete download limit");
    }
  });

  if (limitsLoading) {
    return <div className="text-center py-8">Loading download limits...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Set Custom Download Limit</CardTitle>
          <CardDescription>
            Create custom download limits for specific users or roles. User-specific limits take priority over role-based limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Limit Type</Label>
            <Select value={limitType} onValueChange={(value: "user" | "role") => setLimitType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User-Specific</SelectItem>
                <SelectItem value="role">Role-Based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {limitType === "user" ? (
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Select Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Daily Download Limit</Label>
            <Input
              type="number"
              min="1"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              placeholder="10"
            />
          </div>

          <Button
            onClick={() => createLimitMutation.mutate()}
            disabled={createLimitMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Limit
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Download Limits</CardTitle>
          <CardDescription>
            Manage custom download limits. Default limit is 10 downloads per day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Daily Limit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {limits?.map((limit) => (
                <TableRow key={limit.id}>
                  <TableCell>
                    <Badge variant={limit.user_id ? "default" : "secondary"}>
                      {limit.user_id ? "User" : "Role"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {limit.user_id 
                      ? (limit.profiles?.full_name || limit.profiles?.email || "Unknown")
                      : limit.role?.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{limit.daily_limit} downloads/day</Badge>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deleteLimitMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Download Limit?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the custom limit and revert to the default limit of 10 downloads per day.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteLimitMutation.mutate(limit.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!limits?.length && (
            <div className="text-center py-8 text-muted-foreground">
              No custom download limits set. Default limit of 10 downloads per day applies to all users.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
