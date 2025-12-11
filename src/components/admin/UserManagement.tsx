import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { RefreshCw, Mail, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  welcome_email_sent: boolean;
  user_roles: Array<{
    role: string;
  }>;
  download_count: number;
  last_download_at: string | null;
}

export const UserManagement = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // First get profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*, welcome_email_sent')
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
      toast.success(t("download_limit_reset_success"));
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.message || t("download_limit_reset_failed"));
    }
  });

  const resendWelcomeEmailMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-resend-welcome-email', {
        body: { targetUserId: userId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(t("resend_welcome_email_success"));
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.message || t("resend_welcome_email_failed"));
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">{t("loading_users")}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("user_management")}</CardTitle>
        <CardDescription>{t("user_management_desc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead>Welcome Email</TableHead>
                <TableHead>{t("downloads")}</TableHead>
                <TableHead>{t("last_download")}</TableHead>
                <TableHead>{t("registered")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || t("na")}
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
                    <Tooltip>
                      <TooltipTrigger>
                        {user.welcome_email_sent ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        {user.welcome_email_sent ? t("welcome_email_sent") : t("welcome_email_not_sent")}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.download_count}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.last_download_at 
                      ? format(new Date(user.last_download_at), 'MMM dd, yyyy HH:mm')
                      : t("never")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={resetLimitMutation.isPending}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t("reset_download_limit")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("reset_limit_confirm_title")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("reset_limit_confirm_desc").replace("{user}", user.full_name || user.email)}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => resetLimitMutation.mutate(user.id)}>
                              {t("reset_limit")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={resendWelcomeEmailMutation.isPending}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {t("resend_welcome_email")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("resend_welcome_email_confirm_title")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("resend_welcome_email_confirm_desc").replace("{user}", user.full_name || user.email)}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => resendWelcomeEmailMutation.mutate(user.id)}>
                              {t("resend_welcome_email")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TooltipProvider>
        
        {!users?.length && (
          <div className="text-center py-8 text-muted-foreground">
            {t("no_users_yet")}
          </div>
        )}
      </CardContent>
    </Card>
  );
};