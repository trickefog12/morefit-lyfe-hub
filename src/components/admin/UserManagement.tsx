import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
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
}

export const UserManagement = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // First get profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      
      // Then get user roles for each profile
      const usersWithRoles = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);
          
          return {
            ...profile,
            user_roles: rolesData || []
          };
        })
      );
      
      return usersWithRoles as User[];
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
              <TableHead>Registered</TableHead>
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
                  {format(new Date(user.created_at), 'MMM dd, yyyy')}
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
