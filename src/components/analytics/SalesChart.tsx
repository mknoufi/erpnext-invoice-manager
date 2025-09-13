import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
// } from 'recharts';
import { format, subDays, subMonths } from 'date-fns';

interface SalesChartProps {
  invoices: any[];
  loading?: boolean;
}

const SalesChart: React.FC<SalesChartProps> = ({ invoices, loading = false }) => {
  const [chartType, setChartType] = React.useState<'line' | 'bar' | 'pie'>('line');
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const chartData = useMemo(() => {
    if (!invoices || invoices.length === 0) return [];

    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case '1y':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subDays(now, 30);
    }

    // Filter invoices by date range
    const filteredInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.posting_date);
      return invoiceDate >= startDate && invoiceDate <= now;
    });

    // Group by date and calculate totals
    const groupedData = filteredInvoices.reduce((acc: any, invoice) => {
      const date = format(new Date(invoice.posting_date), 'MMM dd');
      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          paid: 0,
          unpaid: 0,
          count: 0,
        };
      }
      acc[date].total += invoice.grand_total || 0;
      acc[date].count += 1;
      if (invoice.is_paid) {
        acc[date].paid += invoice.grand_total || 0;
      } else {
        acc[date].unpaid += invoice.grand_total || 0;
      }
      return acc;
    }, {});

    return Object.values(groupedData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [invoices, timeRange]);

  // const pieData = useMemo(() => {
  //   if (!invoices || invoices.length === 0) return [];

  //   const paid = invoices.filter(inv => inv.is_paid).length;
  //   const unpaid = invoices.filter(inv => !inv.is_paid).length;

  //   return [
  //     { name: 'Paid', value: paid, color: '#4caf50' },
  //     { name: 'Unpaid', value: unpaid, color: '#ff9800' },
  //   ];
  // }, [invoices]);

  const totalRevenue = useMemo(() => {
    return invoices?.reduce((sum, inv) => sum + (inv.grand_total || 0), 0) || 0;
  }, [invoices]);

  const averageInvoiceValue = useMemo(() => {
    if (!invoices || invoices.length === 0) return 0;
    return totalRevenue / invoices.length;
  }, [invoices, totalRevenue]);


  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" component="h2">
            Sales Analytics
          </Typography>
          <Box display="flex" gap={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value as any)}
              >
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
                <MenuItem value="1y">Last year</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                label="Chart Type"
                onChange={(e) => setChartType(e.target.value as any)}
              >
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box display="flex" gap={2} mb={3}>
          <Box textAlign="center">
            <Typography variant="h4" color="primary">
              ${totalRevenue.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Revenue
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h4" color="success.main">
              ${averageInvoiceValue.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Invoice Value
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h4" color="info.main">
              {invoices?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Invoices
            </Typography>
          </Box>
        </Box>

        <Box height={400} display="flex" alignItems="center" justifyContent="center" bgcolor="grey.50" borderRadius={2}>
          <Box textAlign="center">
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chart Visualization
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Interactive charts will be available once recharts is properly configured
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Chart Type: {chartType} | Data Points: {chartData.length}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
