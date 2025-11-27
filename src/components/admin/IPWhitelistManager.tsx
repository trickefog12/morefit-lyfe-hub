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

interface WhitelistedIP {
  id: string;
  ip_address: string;
  description: string | null;
  created_at: string;
  is_cidr: boolean;
}

export const IPWhitelistManager = () => {
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
      toast.success("IP address added to whitelist");
      setIsAddDialogOpen(false);
      setNewIP("");
      setNewDescription("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add IP address");
    },
  });

  const removeIPMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ip_whitelist").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-whitelist"] });
      toast.success("IP address removed from whitelist");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove IP address");
    },
  });

  const handleAddIP = () => {
    if (!newIP.trim()) {
      toast.error("Please enter an IP address or CIDR range");
      return;
    }

    const trimmedIP = newIP.trim();
    
    // Validate IP or CIDR notation
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const cidrPattern = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    
    if (!ipPattern.test(trimmedIP) && !cidrPattern.test(trimmedIP)) {
      toast.error("Please enter a valid IP address (e.g., 192.168.1.1) or CIDR range (e.g., 192.168.1.0/24)");
      return;
    }

    // Validate CIDR prefix length if it's a CIDR range
    if (cidrPattern.test(trimmedIP)) {
      const prefix = parseInt(trimmedIP.split('/')[1]);
      if (prefix < 0 || prefix > 32) {
        toast.error("CIDR prefix must be between 0 and 32");
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
          IP Whitelist Management
        </CardTitle>
        <CardDescription>
          Manage trusted IPs and CIDR ranges that bypass rate limiting for webhooks and API endpoints
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add IP to Whitelist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Whitelisted IP or CIDR Range</DialogTitle>
                <DialogDescription>
                  Add a trusted IP address or CIDR range that will bypass rate limiting
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ip-address">IP Address or CIDR Range</Label>
                  <Input
                    id="ip-address"
                    placeholder="192.168.1.1 or 192.168.1.0/24"
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a single IP (192.168.1.1) or CIDR range (192.168.1.0/24)
                  </p>
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., Stripe webhook servers, Partner API"
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
                  {addIPMutation.isPending ? "Adding..." : "Add to Whitelist"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : !whitelistedIPs || whitelistedIPs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No whitelisted IPs yet. Add trusted IPs or CIDR ranges to bypass rate limits.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP / CIDR Range</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                          {ip.is_cidr ? 'CIDR Range' : 'Single IP'}
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
