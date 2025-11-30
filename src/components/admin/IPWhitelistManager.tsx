import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WhitelistedIP {
  id: string;
  ip_address: string;
  description: string | null;
  created_at: string;
  is_cidr: boolean;
}

export const IPWhitelistManager = () => {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newIP, setNewIP] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: whitelistedIPs, isLoading } = useQuery({
    queryKey: ["ip-whitelist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ip_whitelist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WhitelistedIP[];
    },
  });

  const addIPMutation = useMutation({
    mutationFn: async () => {
      const trimmedIP = newIP.trim();
      const isCIDR = trimmedIP.includes('/');
      
      const { error } = await supabase.from("ip_whitelist").insert({
        ip_address: trimmedIP,
        description: newDescription.trim() || null,
        is_cidr: isCIDR,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-whitelist"] });
      toast.success(t("ip_added_to_whitelist"));
      setIsAddDialogOpen(false);
      setNewIP("");
      setNewDescription("");
    },
    onError: (error: any) => {
      toast.error(error.message || t("ip_add_failed"));
    },
  });

  const removeIPMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ip_whitelist").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-whitelist"] });
      toast.success(t("ip_removed_from_whitelist"));
    },
    onError: (error: any) => {
      toast.error(error.message || t("ip_remove_failed"));
    },
  });

  const handleAddIP = () => {
    if (!newIP.trim()) {
      toast.error(t("please_enter_ip"));
      return;
    }

    const trimmedIP = newIP.trim();
    
    // Validate IP or CIDR notation
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const cidrPattern = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    
    if (!ipPattern.test(trimmedIP) && !cidrPattern.test(trimmedIP)) {
      toast.error(t("invalid_ip_format"));
      return;
    }

    // Validate CIDR prefix length if it's a CIDR range
    if (cidrPattern.test(trimmedIP)) {
      const prefix = parseInt(trimmedIP.split('/')[1]);
      if (prefix < 0 || prefix > 32) {
        toast.error(t("invalid_cidr_prefix"));
        return;
      }
    }

    addIPMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t("ip_whitelist_management")}
        </CardTitle>
        <CardDescription>
          {t("ip_whitelist_management_desc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {t("add_ip_to_whitelist")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("add_whitelisted_ip")}</DialogTitle>
                <DialogDescription>
                  {t("add_whitelisted_ip_desc")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ip-address">{t("ip_address_or_cidr")}</Label>
                  <Input
                    id="ip-address"
                    placeholder={t("ip_cidr_placeholder")}
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("ip_cidr_helper")}
                  </p>
                </div>
                <div>
                  <Label htmlFor="description">{t("description_optional")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("description_placeholder")}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleAddIP}
                  disabled={addIPMutation.isPending}
                  className="w-full"
                >
                  {addIPMutation.isPending ? t("adding") : t("add_to_whitelist")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t("loading")}</div>
          ) : !whitelistedIPs || whitelistedIPs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("no_whitelisted_ips")}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("ip_cidr_range_column")}</TableHead>
                    <TableHead>{t("type")}</TableHead>
                    <TableHead>{t("description")}</TableHead>
                    <TableHead>{t("added")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {whitelistedIPs.map((ip) => (
                    <TableRow key={ip.id}>
                      <TableCell className="font-mono">{ip.ip_address}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded ${
                          ip.is_cidr 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {ip.is_cidr ? t("cidr_range") : t("single_ip")}
                        </span>
                      </TableCell>
                      <TableCell>{ip.description || "-"}</TableCell>
                      <TableCell>
                        {new Date(ip.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIPMutation.mutate(ip.id)}
                          disabled={removeIPMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
