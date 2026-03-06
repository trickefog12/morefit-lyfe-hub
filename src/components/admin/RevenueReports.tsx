import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, TrendingUp, TrendingDown, Minus, Download, FileText, CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";

interface RevenueByProduct {
  product_sku: string;
  product_name: string;
  total_sales: number;
  total_revenue: number;
}

export const RevenueReports = () => {
  const [preset, setPreset] = useState<7 | 30 | 90 | null>(30);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Derived date boundaries used by all queries
  const rangeStart: Date = dateRange?.from
    ? startOfDay(dateRange.from)
    : subDays(new Date(), preset ?? 30);
  const rangeEnd: Date = dateRange?.to
    ? endOfDay(dateRange.to)
    : new Date();

  const isCustomRange = !!dateRange?.from;
  const rangeLabel = isCustomRange
    ? `${format(rangeStart, 'MMM d, yyyy')} – ${format(rangeEnd, 'MMM d, yyyy')}`
    : `Last ${preset} Days`;

  const handlePreset = (days: 7 | 30 | 90) => {
    setPreset(days);
    setDateRange(undefined);
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from) setPreset(null);
    if (range?.from && range?.to) setCalendarOpen(false);
  };

  const handleClearRange = () => {
    setDateRange(undefined);
    setPreset(30);
  };

  const { data: totalRevenue } = useQuery({
    queryKey: ['admin-total-revenue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('amount_paid')
        .eq('status', 'completed');
      if (error) throw error;
      return data.reduce((sum, p) => sum + p.amount_paid, 0);
    }
  });

  const { data: revenueByProduct } = useQuery({
    queryKey: ['admin-revenue-by-product', rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`product_sku, amount_paid, products!inner(name_en)`)
        .eq('status', 'completed')
        .gte('purchased_at', rangeStart.toISOString())
        .lte('purchased_at', rangeEnd.toISOString());
      if (error) throw error;

      const grouped: Record<string, RevenueByProduct> = {};
      data.forEach(purchase => {
        const sku = purchase.product_sku;
        if (!grouped[sku]) {
          grouped[sku] = {
            product_sku: sku,
            product_name: purchase.products.name_en,
            total_sales: 0,
            total_revenue: 0
          };
        }
        grouped[sku].total_sales++;
        grouped[sku].total_revenue += purchase.amount_paid;
      });
      return Object.values(grouped).sort((a, b) => b.total_revenue - a.total_revenue);
    }
  });

  const { data: periodRevenue } = useQuery({
    queryKey: ['admin-period-revenue', rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('amount_paid')
        .eq('status', 'completed')
        .gte('purchased_at', rangeStart.toISOString())
        .lte('purchased_at', rangeEnd.toISOString());
      if (error) throw error;
      return data.reduce((sum, p) => sum + p.amount_paid, 0);
    }
  });

  const { data: periodGrowth } = useQuery({
    queryKey: ['admin-period-growth', rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const spanMs = rangeEnd.getTime() - rangeStart.getTime();
      const previousStart = new Date(rangeStart.getTime() - spanMs);

      const { data, error } = await supabase
        .from('purchases')
        .select('purchased_at, amount_paid')
        .eq('status', 'completed')
        .gte('purchased_at', previousStart.toISOString())
        .lte('purchased_at', rangeEnd.toISOString());
      if (error) throw error;

      const current = data
        .filter(p => new Date(p.purchased_at) >= rangeStart)
        .reduce((sum, p) => sum + p.amount_paid, 0);
      const previous = data
        .filter(p => new Date(p.purchased_at) < rangeStart)
        .reduce((sum, p) => sum + p.amount_paid, 0);

      if (previous === 0) return current > 0 ? 100 : null;
      return +((( current - previous) / previous) * 100).toFixed(1);
    }
  });

  const { data: topCustomers } = useQuery({
    queryKey: ['admin-top-customers', rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`user_id, amount_paid, profiles!inner(email, full_name)`)
        .eq('status', 'completed')
        .gte('purchased_at', rangeStart.toISOString())
        .lte('purchased_at', rangeEnd.toISOString());
      if (error) throw error;

      const grouped: Record<string, { user_id: string; email: string; full_name: string | null; total_spend: number; order_count: number }> = {};
      data.forEach(p => {
        const uid = p.user_id;
        if (!grouped[uid]) {
          grouped[uid] = {
            user_id: uid,
            email: (p.profiles as any).email,
            full_name: (p.profiles as any).full_name,
            total_spend: 0,
            order_count: 0,
          };
        }
        grouped[uid].total_spend += p.amount_paid;
        grouped[uid].order_count++;
      });
      return Object.values(grouped)
        .sort((a, b) => b.total_spend - a.total_spend)
        .slice(0, 10);
    }
  });

  const { data: dailyRevenue } = useQuery({
    queryKey: ['admin-daily-revenue', rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('purchased_at, amount_paid')
        .eq('status', 'completed')
        .gte('purchased_at', rangeStart.toISOString())
        .lte('purchased_at', rangeEnd.toISOString())
        .order('purchased_at', { ascending: true });
      if (error) throw error;

      const byDay: Record<string, number> = {};
      data.forEach(p => {
        const day = format(new Date(p.purchased_at), 'MMM d');
        byDay[day] = (byDay[day] || 0) + p.amount_paid;
      });
      return Object.entries(byDay).map(([day, revenue]) => ({ day, revenue: +revenue.toFixed(2) }));
    }
  });

  const handleExportDailyCSV = () => {
    if (!dailyRevenue?.length) return;
    const headers = ['Date', 'Revenue ($)'];
    const rows = dailyRevenue.map(d => [d.day, d.revenue.toFixed(2)]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isCustomRange
      ? `daily-revenue-${format(rangeStart, 'yyyy-MM-dd')}-to-${format(rangeEnd, 'yyyy-MM-dd')}.csv`
      : `daily-revenue-${preset}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    doc.setFontSize(20);
    doc.setTextColor(30, 30, 30);
    doc.text('Revenue Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${dateStr}  |  Period: ${rangeLabel}`, 14, 28);

    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text('Summary', 14, 42);

    const totalUnits = revenueByProduct?.reduce((sum, p) => sum + p.total_sales, 0) || 0;
    const summaryData = [
      ['Total Revenue (All-time)', `$${(totalRevenue || 0).toFixed(2)}`],
      [`Revenue (${rangeLabel})`, `$${(periodRevenue || 0).toFixed(2)}`],
      ['Total Units Sold (Period)', String(totalUnits)],
      ['Period Growth vs Prior Period', periodGrowth != null ? `${periodGrowth >= 0 ? '+' : ''}${periodGrowth}%` : 'N/A'],
    ];

    autoTable(doc, {
      startY: 46,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40], textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });

    if (dailyRevenue && dailyRevenue.length > 0) {
      const afterSummary = (doc as any).lastAutoTable.finalY + 12;
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 30);
      doc.text(`Daily Revenue (${rangeLabel})`, 14, afterSummary);
      autoTable(doc, {
        startY: afterSummary + 4,
        head: [['Date', 'Revenue ($)']],
        body: dailyRevenue.map(d => [d.day, `$${d.revenue.toFixed(2)}`]),
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        columnStyles: { 1: { halign: 'right' } },
        margin: { left: 14, right: 14 },
      });
    }

    if (revenueByProduct && revenueByProduct.length > 0) {
      const afterDaily = (doc as any).lastAutoTable.finalY + 12;
      if (afterDaily > 240) doc.addPage();
      const tableY = afterDaily > 240 ? 20 : afterDaily;
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 30);
      doc.text('Revenue by Product', 14, tableY);
      autoTable(doc, {
        startY: tableY + 4,
        head: [['Product', 'Sales', 'Revenue ($)', 'Avg. Price ($)']],
        body: revenueByProduct.map(p => [
          p.product_name,
          p.total_sales,
          `$${p.total_revenue.toFixed(2)}`,
          `$${(p.total_revenue / p.total_sales).toFixed(2)}`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
        margin: { left: 14, right: 14 },
      });
    }

    const filename = isCustomRange
      ? `revenue-report-${format(rangeStart, 'yyyy-MM-dd')}-to-${format(rangeEnd, 'yyyy-MM-dd')}.pdf`
      : `revenue-report-${preset}d.pdf`;
    doc.save(filename);
  };

  const handleExportCSV = () => {
    if (!revenueByProduct?.length) return;
    const headers = ['Product', 'Sales', 'Revenue ($)', 'Avg. Price ($)'];
    const rows = revenueByProduct.map(p => [
      p.product_name,
      p.total_sales,
      p.total_revenue.toFixed(2),
      (p.total_revenue / p.total_sales).toFixed(2),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-by-product.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTopCustomersCSV = () => {
    if (!topCustomers?.length) return;
    const medals = ['🥇', '🥈', '🥉'];
    const headers = ['Rank', 'Name', 'Email', 'Orders', 'Total Spend ($)'];
    const rows = topCustomers.map((c, i) => [
      medals[i] ? `${medals[i]} #${i + 1}` : `#${i + 1}`,
      c.full_name || '',
      c.email,
      c.order_count,
      c.total_spend.toFixed(2),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isCustomRange
      ? `top-customers-${format(rangeStart, 'yyyy-MM-dd')}-to-${format(rangeEnd, 'yyyy-MM-dd')}.csv`
      : `top-customers-${preset}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Date range controls */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground font-medium">Period:</span>
        {([7, 30, 90] as const).map(d => (
          <Button
            key={d}
            size="sm"
            variant={preset === d && !isCustomRange ? "default" : "outline"}
            onClick={() => handlePreset(d)}
            className="text-xs h-8 px-3"
          >
            {d}d
          </Button>
        ))}

        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant={isCustomRange ? "default" : "outline"}
              className={cn("h-8 gap-1.5 text-xs", isCustomRange && "pr-2")}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {isCustomRange ? rangeLabel : "Custom range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
              disabled={(date) => date > new Date()}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {isCustomRange && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearRange}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">All-time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium truncate pr-1">{rangeLabel}</CardTitle>
            {periodGrowth === null || periodGrowth === undefined ? (
              <Minus className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : periodGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-chart-2 shrink-0" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive shrink-0" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${periodRevenue?.toFixed(2) || '0.00'}</div>
            <div className="flex items-center gap-1 mt-1">
              {periodGrowth !== null && periodGrowth !== undefined ? (
                <span className={`text-xs font-medium ${periodGrowth >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                  {periodGrowth >= 0 ? '+' : ''}{periodGrowth}% vs prev period
                </span>
              ) : (
                <p className="text-xs text-muted-foreground">No prior period data</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueByProduct?.reduce((sum, p) => sum + p.total_sales, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Units in period</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Revenue Bar Chart */}
      <Card>

        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>Daily Revenue</CardTitle>
              <CardDescription>{rangeLabel}</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportDailyCSV}
              disabled={!dailyRevenue?.length}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {dailyRevenue && dailyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
              No revenue data for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cumulative Revenue Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Revenue</CardTitle>
          <CardDescription>Running total over {rangeLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyRevenue && dailyRevenue.length > 0 ? (() => {
            let running = 0;
            const cumulativeData = dailyRevenue.map(d => {
              running += d.revenue;
              return { day: d.day, cumulative: +running.toFixed(2) };
            });
            return (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={cumulativeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cumulative Revenue']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            );
          })() : (
            <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
              No revenue data for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Ranked by total spend — {rangeLabel}</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportTopCustomersCSV}
              disabled={!topCustomers?.length}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {topCustomers && topCustomers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total Spend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map((customer, index) => {
                  const medals = [
                    { emoji: '🥇', label: 'Gold', color: 'text-yellow-500' },
                    { emoji: '🥈', label: 'Silver', color: 'text-slate-400' },
                    { emoji: '🥉', label: 'Bronze', color: 'text-amber-600' },
                  ];
                  const medal = medals[index];
                  return (
                    <TableRow key={customer.user_id}>
                      <TableCell className="w-10">
                        {medal ? (
                          <span className="text-lg leading-none" title={`${medal.label} – #${index + 1}`}>{medal.emoji}</span>
                        ) : (
                          <span className="text-muted-foreground font-mono text-xs">{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{customer.full_name || '—'}</div>
                        <div className="text-xs text-muted-foreground">{customer.email}</div>
                      </TableCell>
                      <TableCell className="text-right">{customer.order_count}</TableCell>
                      <TableCell className="text-right font-semibold">${customer.total_spend.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No customer data for this period
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>Revenue by Product</CardTitle>
              <CardDescription>{rangeLabel}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCSV}
                disabled={!revenueByProduct?.length}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportPDF}
                disabled={!revenueByProduct?.length}
                className="gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Avg. Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueByProduct?.map((product) => (
                <TableRow key={product.product_sku}>
                  <TableCell className="font-medium">{product.product_name}</TableCell>
                  <TableCell className="text-right">{product.total_sales}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${product.total_revenue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${(product.total_revenue / product.total_sales).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!revenueByProduct?.length && (
            <div className="text-center py-8 text-muted-foreground">
              No revenue data for this period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
