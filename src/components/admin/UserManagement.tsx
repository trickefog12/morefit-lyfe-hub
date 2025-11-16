import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  user_roles: Array<{
    role: string;
  }>;
  download_count: number;
  last_download_at: string | null;
}

export const UserManagement = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // First get profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      
      // Then get user roles and download stats for each profile
      const usersWithRoles = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);
          
          // Get download statistics
          const { data: downloadStats } = await supabase
            .from('analytics_events')
            .select('created_at')
            .eq('user_id', profile.id)
            .eq('event_type', 'download')
            .order('created_at', { ascending: false });
          
          return {
            ...profile,
            user_roles: rolesData || [],
            download_count: downloadStats?.length || 0,
            last_download_at: downloadStats?.[0]?.created_at || null
          };
        })
      );
      
      return usersWithRoles as User[];
    }
  });

  const resetLimitMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('reset-download-limit', {
        body: { targetUserId: userId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Download limit reset successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reset download limit");
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View and manage registered users</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead>Last Download</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name || 'N/A'}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.user_roles?.map((role, idx) => (
                    <Badge key={idx} variant={role.role === 'admin' ? 'default' : 'secondary'}>
                      {role.role}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.download_count}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.last_download_at 
                    ? format(new Date(user.last_download_at), 'MMM dd, yyyy HH:mm')
                    : 'Never'}
                </TableCell>
                <TableCell>
                  {format(new Date(user.created_at), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={resetLimitMutation.isPending}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset Download Limit
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Download Limit?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will clear all download history for {user.full_name || user.email} 
                          and allow them to download files again. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => resetLimitMutation.mutate(user.id)}>
                          Reset Limit
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {!users?.length && (
          <div className="text-center py-8 text-muted-foreground">
            No users yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};
