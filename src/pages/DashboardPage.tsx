import { useData } from '@/contexts/DataContext';
import { formatAmount, formatDateDMY } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FileText, TrendingUp, Receipt, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

const fbrBadgeClass = (status: string) => {
  if (status === 'Accepted') return 'bg-[#16a34a] text-white';
  if (status === 'Failed') return 'bg-[#dc2626] text-white';
  if (status === 'Rejected') return 'bg-[#991b1b] text-white';
  if (status === 'Pending') return 'bg-[#f97316] text-white';
  return 'bg-[#6b7280] text-white';
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { invoices } = useData();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthInvoices = useMemo(() =>
    invoices.filter(inv => {
      const d = new Date(inv.invoiceDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }), [invoices, currentMonth, currentYear]);

  const stats = useMemo(() => ({
    totalInvoices: thisMonthInvoices.length,
    monthRevenue: thisMonthInvoices.reduce((s, i) => s + i.grandTotal, 0),
    monthGst: thisMonthInvoices.reduce((s, i) => s + i.gstAmount, 0),
    notSentFbr: invoices.filter(i => i.fbrStatus === 'Not Sent').length,
  }), [thisMonthInvoices, invoices]);

  const monthlyCount = useMemo(() => {
    return MONTHS.map((month, idx) => {
      const count = invoices.filter(inv => {
        const d = new Date(inv.invoiceDate);
        return d.getMonth() === idx && d.getFullYear() === currentYear;
      }).length;
      return { month, count };
    });
  }, [invoices, currentYear]);

  const monthlyRevenue = useMemo(() => {
    return MONTHS.map((month, idx) => {
      const revenue = invoices.filter(inv => {
        const d = new Date(inv.invoiceDate);
        return d.getMonth() === idx && d.getFullYear() === currentYear;
      }).reduce((s, i) => s + i.grandTotal, 0);
      return { month, revenue };
    });
  }, [invoices, currentYear]);

  const fbrStatusData = useMemo(() => {
    const statusMap: Record<string, number> = { 'Not Sent': 0, Accepted: 0, Failed: 0, Rejected: 0 };
    invoices.forEach(inv => { statusMap[inv.fbrStatus] = (statusMap[inv.fbrStatus] || 0) + 1; });
    const total = invoices.length || 1;
    return Object.entries(statusMap).filter(([, v]) => v > 0).map(([name, value]) => ({
      name, value, percentage: Math.round((value / total) * 100),
    }));
  }, [invoices]);

  const FBR_COLORS: Record<string, string> = { 'Not Sent': '#6b7280', Accepted: '#16a34a', Failed: '#dc2626', Rejected: '#991b1b', Pending: '#f97316' };

  const top5Customers = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach(inv => { map[inv.customerName] = (map[inv.customerName] || 0) + inv.grandTotal; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, revenue]) => ({ name, revenue }));
  }, [invoices]);

  const recentInvoices = useMemo(() =>
    [...invoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
    [invoices]);

  const statCards = [
    { label: "Total Invoices This Month", value: stats.totalInvoices, icon: FileText, format: (v: number) => String(v) },
    { label: 'Total Revenue This Month', value: stats.monthRevenue, icon: TrendingUp, format: formatAmount },
    { label: 'Total GST This Month', value: stats.monthGst, icon: Receipt, format: formatAmount },
    { label: 'Not Sent to FBR', value: stats.notSentFbr, icon: AlertTriangle, format: (v: number) => String(v) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1 pkr-format">{s.format(s.value)}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Monthly Invoice Count</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyCount}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="count" fill="#0496c7" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Monthly Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(value: number) => formatAmount(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#48cae4" strokeWidth={2} dot={{ r: 4, fill: '#48cae4' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>FBR Submission Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={fbrStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                  label={({ name, percentage }) => `${name} ${percentage}%`}>
                  {fbrStatusData.map((entry) => (
                    <Cell key={entry.name} fill={FBR_COLORS[entry.name] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [`${value} invoices`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top 5 Customers by Revenue</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={top5Customers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(value: number) => formatAmount(value)} />
                <Bar dataKey="revenue" fill="#0496c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Invoices</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">GST</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>FBR Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map(inv => (
                  <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/invoices/${inv.id}`)}>
                    <TableCell className="font-medium">{inv.invoiceNo}</TableCell>
                    <TableCell>{formatDateDMY(inv.invoiceDate)}</TableCell>
                    <TableCell>{inv.customerName}</TableCell>
                    <TableCell className="text-right pkr-format whitespace-nowrap">{formatAmount(inv.subtotal)}</TableCell>
                    <TableCell className="text-right pkr-format whitespace-nowrap">{formatAmount(inv.gstAmount)}</TableCell>
                    <TableCell className="text-right pkr-format whitespace-nowrap">{formatAmount(inv.grandTotal)}</TableCell>
                    <TableCell><Badge className={fbrBadgeClass(inv.fbrStatus)}>{inv.fbrStatus}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
