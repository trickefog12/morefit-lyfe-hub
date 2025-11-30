import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { Shield, Trash2, Plus, Filter, X, Download, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [adminEmailFilter, setAdminEmailFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 25;

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['audit-logs', actionTypeFilter, adminEmailFilter, startDate, endDate, currentPage],
    queryFn: async () => {
      // Build base query for counting
      let countQuery = supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true });
      
      // Apply filters to count query
      if (actionTypeFilter !== "all") {
        countQuery = countQuery.eq('action_type', actionTypeFilter);
      }
      if (adminEmailFilter) {
        countQuery = countQuery.ilike('admin_email', `%${adminEmailFilter}%`);
      }
      if (startDate) {
        countQuery = countQuery.gte('created_at', new Date(startDate).toISOString());
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        countQuery = countQuery.lt('created_at', endDateTime.toISOString());
      }

      // Get total count
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      // Build data query with pagination
      let dataQuery = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
      
      // Apply filters to data query
      if (actionTypeFilter !== "all") {
        dataQuery = dataQuery.eq('action_type', actionTypeFilter);
      }
      if (adminEmailFilter) {
        dataQuery = dataQuery.ilike('admin_email', `%${adminEmailFilter}%`);
      }
      if (startDate) {
        dataQuery = dataQuery.gte('created_at', new Date(startDate).toISOString());
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        dataQuery = dataQuery.lt('created_at', endDateTime.toISOString());
      }
      
      const { data, error } = await dataQuery;
      
      if (error) throw error;
      return { logs: data as AuditLog[], totalCount: count || 0 };
    }
  });

  const logs = logsData?.logs;
  const totalCount = logsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('audit-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_logs'
        },
        (payload) => {
          console.log('Audit log change detected:', payload);
          
          // Show toast notification for new actions
          if (payload.eventType === 'INSERT' && payload.new) {
            const log = payload.new as AuditLog;
            const severity = getActionSeverity(log.action_type);
            const IconComponent = getSeverityIcon(severity);
            
            toast({
              title: t("new_admin_action"),
              description: (
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  <span>{log.admin_email} {t("performed_action").replace("{action}", getActionLabel(log.action_type))}</span>
                </div>
              ),
              variant: severity,
            });
          }
          
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const clearFilters = () => {
    setActionTypeFilter("all");
    setAdminEmailFilter("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
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
        return t("reset_limit_action");
      case 'create_download_limit':
        return t("create_limit_action");
      case 'delete_download_limit':
        return t("delete_limit_action");
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

  const exportToCSV = () => {
    if (!logs || logs.length === 0) {
      return;
    }

    // Prepare CSV headers
    const headers = [t("timestamp"), t("admin_email"), t("action_type"), t("target"), t("details")];
    
    // Prepare CSV rows
    const rows = logs.map(log => {
      const timestamp = format(new Date(log.created_at), "MMM d, yyyy h:mm a");
      const target = log.target_user_id 
        ? `${t("user")}: ${log.details?.target_email || t("unknown_user")}`
        : log.target_role 
        ? `${t("role")}: ${log.target_role.toUpperCase()}`
        : "-";
      const details = log.details?.daily_limit 
        ? `${t("limit_label").replace("{limit}", log.details.daily_limit.toString())}`
        : "-";
      
      return [timestamp, log.admin_email, getActionLabel(log.action_type), target, details];
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!logs || logs.length === 0) {
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(t("admin_audit_log"), 14, 22);
    
    // Add export date
    doc.setFontSize(11);
    doc.text(t("generated_at").replace("{date}", format(new Date(), "MMM d, yyyy h:mm a")), 14, 30);
    
    // Add filter info if any
    if (hasActiveFilters) {
      let filterText = `${t("filters_label").replace("{filters}", "")} `;
      const filters = [];
      if (actionTypeFilter !== "all") filters.push(`${t("action")}: ${getActionLabel(actionTypeFilter)}`);
      if (adminEmailFilter) filters.push(`${t("admin_email")}: ${adminEmailFilter}`);
      if (startDate) filters.push(t("from_date").replace("{date}", format(new Date(startDate), "MMM d, yyyy")));
      if (endDate) filters.push(t("to_date").replace("{date}", format(new Date(endDate), "MMM d, yyyy")));
      filterText += filters.join(", ");
      doc.setFontSize(9);
      doc.text(filterText, 14, 36);
    }

    // Prepare table data
    const tableData = logs.map(log => {
      const timestamp = format(new Date(log.created_at), "MMM d, yyyy h:mm a");
      const target = log.target_user_id 
        ? `${t("user")}: ${log.details?.target_email || t("unknown_user")}`
        : log.target_role 
        ? `${t("role")}: ${log.target_role.toUpperCase()}`
        : "-";
      const details = log.details?.daily_limit 
        ? `${log.details.daily_limit} ${t("downloads")}/day`
        : "-";
      
      return [timestamp, log.admin_email, getActionLabel(log.action_type), target, details];
    });

    // Add table
    autoTable(doc, {
      startY: hasActiveFilters ? 40 : 35,
      head: [[t("timestamp"), t("admin_label"), t("action"), t("target"), t("details")]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 85, 105] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // Save PDF
    doc.save(`audit-logs-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  if (isLoading) {
    return <div className="text-center py-8">{t("loading_audit_logs")}</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("filters")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>{t("action_type")}</Label>
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all_actions")}</SelectItem>
                  <SelectItem value="reset_download_limit">{t("reset_limit_action")}</SelectItem>
                  <SelectItem value="create_download_limit">{t("create_limit_action")}</SelectItem>
                  <SelectItem value="delete_download_limit">{t("delete_limit_action")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("admin_email")}</Label>
              <Input
                placeholder={t("search_by_email")}
                value={adminEmailFilter}
                onChange={(e) => setAdminEmailFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("start_date")}</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("end_date")}</Label>
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
                {t("clear_filters")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{t("admin_audit_log")}</CardTitle>
              <CardDescription>
                {t("admin_audit_log_desc")}
                {logs && ` (${logs.length} ${logs.length === 1 ? t("entry") : t("entries")})`}
              </CardDescription>
            </div>
            {logs && logs.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t("export_csv")}
                </Button>
                <Button variant="outline" size="sm" onClick={exportToPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  {t("export_pdf")}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("timestamp")}</TableHead>
                <TableHead>{t("admin_label")}</TableHead>
                <TableHead>{t("action")}</TableHead>
                <TableHead>{t("target")}</TableHead>
                <TableHead>{t("details")}</TableHead>
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
                        <div className="font-medium">{t("user")}</div>
                        <div className="text-muted-foreground">
                          {log.details?.target_email || t("unknown_user")}
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
                        {t("limit_label").replace("{limit}", log.details.daily_limit.toString())}
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
                ? t("no_audit_logs_filters")
                : t("no_audit_logs_found")}
            </div>
          )}

          {logs && logs.length > 0 && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} {totalCount === 1 ? t("entry") : t("entries")}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
