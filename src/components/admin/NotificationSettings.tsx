import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Bell, Mail } from "lucide-react";

interface NotificationPreference {
  id: string;
  admin_id: string;
  action_type: string;
  email_enabled: boolean;
}

const ACTION_TYPES = [
  { value: 'reset_download_limit', label: 'Download Limit Reset' },
  { value: 'create_download_limit', label: 'Custom Limit Created' },
  { value: 'delete_download_limit', label: 'Custom Limit Deleted' },
];

export const NotificationSettings = () => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(user);
      return user;
    }
  });

  // Fetch notification preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
      const { data, error } = await supabase
        .from('admin_notification_preferences')
        .select('*')
        .eq('admin_id', currentUser.id);
      
      if (error) throw error;
      return data as NotificationPreference[];
    },
    enabled: !!currentUser?.id
  });

  // Toggle notification preference
  const toggleMutation = useMutation({
    mutationFn: async ({ actionType, enabled }: { actionType: string; enabled: boolean }) => {
      if (!currentUser?.id) throw new Error("User not authenticated");

      const existingPref = preferences?.find(p => p.action_type === actionType);

      if (existingPref) {
        // Update existing preference
        const { error } = await supabase
          .from('admin_notification_preferences')
          .update({ email_enabled: enabled })
          .eq('id', existingPref.id);
        
        if (error) throw error;
      } else {
        // Create new preference
        const { error } = await supabase
          .from('admin_notification_preferences')
          .insert({
            admin_id: currentUser.id,
            action_type: actionType,
            email_enabled: enabled
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Notification preferences updated");
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update preferences");
    }
  });

  const isEnabled = (actionType: string) => {
    const pref = preferences?.find(p => p.action_type === actionType);
    return pref?.email_enabled ?? true; // Default to enabled
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading preferences...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Configure which admin actions trigger email notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>You'll receive emails at: {currentUser?.email}</span>
          </div>

          <div className="space-y-4">
            {ACTION_TYPES.map((actionType) => (
              <div
                key={actionType.value}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-0.5">
                  <Label htmlFor={actionType.value} className="text-base cursor-pointer">
                    {actionType.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when this action is performed
                  </p>
                </div>
                <Switch
                  id={actionType.value}
                  checked={isEnabled(actionType.value)}
                  onCheckedChange={(enabled) =>
                    toggleMutation.mutate({ actionType: actionType.value, enabled })
                  }
                  disabled={toggleMutation.isPending}
                />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Note: Notifications are sent immediately when actions are performed. Make sure your email address is correct and check your spam folder if you don't receive notifications.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
