import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
} from '@mui/material';
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   RadialBarChart,
//   RadialBar,
//   Legend,
// } from 'recharts';
import { format, subDays } from 'date-fns';
import {
  Payment,
  Schedule,
  CheckCircle,
  Warning,
} from '@mui/icons-material';

interface PaymentTrendsProps {
  invoices: any[];
  loading?: boolean;
}

const PaymentTrends: React.FC<PaymentTrendsProps> = ({ invoices, loading = false }) => {
  const paymentData = useMemo(() => {
    if (!invoices || invoices.length === 0) return [];

    const now = new Date();
    const last30Days = subDays(now, 30);

    // Filter invoices from last 30 days
    const recentInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.posting_date);
      return invoiceDate >= last30Days && invoiceDate <= now;
    });

    // Group by day
    const dailyData = recentInvoices.reduce((acc: any, invoice) => {
      const date = format(new Date(invoice.posting_date), 'MMM dd');
      if (!acc[date]) {
        acc[date] = {
          date,
          paid: 0,
          unpaid: 0,
          overdue: 0,
          total: 0,
        };
      }
      acc[date].total += invoice.grand_total || 0;
      if (invoice.is_paid) {
        acc[date].paid += invoice.grand_total || 0;
      } else {
        const dueDate = new Date(invoice.due_date);
        if (dueDate < now) {
          acc[date].overdue += invoice.grand_total || 0;
        } else {
          acc[date].unpaid += invoice.grand_total || 0;
        }
      }
      return acc;
    }, {});

    return Object.values(dailyData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [invoices]);

  const paymentStats = useMemo(() => {
    if (!invoices || invoices.length === 0) return {
      totalPaid: 0,
      totalUnpaid: 0,
      totalOverdue: 0,
      paymentRate: 0,
      averagePaymentTime: 0,
    };

    const totalPaid = invoices
      .filter(inv => inv.is_paid)
      .reduce((sum, inv) => sum + (inv.grand_total || 0), 0);

    const totalUnpaid = invoices
      .filter(inv => !inv.is_paid)
      .reduce((sum, inv) => sum + (inv.grand_total || 0), 0);

    const totalOverdue = invoices
      .filter(inv => !inv.is_paid && new Date(inv.due_date) < new Date())
      .reduce((sum, inv) => sum + (inv.grand_total || 0), 0);

    const paymentRate = invoices.length > 0 
      ? (invoices.filter(inv => inv.is_paid).length / invoices.length) * 100 
      : 0;

    // Calculate average payment time (mock calculation)
    const averagePaymentTime = 15; // days

    return {
      totalPaid,
      totalUnpaid,
      totalOverdue,
      paymentRate,
      averagePaymentTime,
    };
  }, [invoices]);

  const radialData = useMemo(() => {
    const { totalPaid, totalUnpaid, totalOverdue } = paymentStats;
    const total = totalPaid + totalUnpaid + totalOverdue;
    
    if (total === 0) return [];

    return [
      {
        name: 'Paid',
        value: (totalPaid / total) * 100,
        fill: '#4caf50',
      },
      {
        name: 'Unpaid',
        value: (totalUnpaid / total) * 100,
        fill: '#ff9800',
      },
      {
        name: 'Overdue',
        value: (totalOverdue / total) * 100,
        fill: '#f44336',
      },
    ];
  }, [paymentStats]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <LinearProgress sx={{ width: '100%' }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Payment Trends
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center" p={2} bgcolor="success.light" borderRadius={2}>
              <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" color="success.dark">
                ${paymentStats.totalPaid.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Paid
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center" p={2} bgcolor="warning.light" borderRadius={2}>
              <Schedule color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" color="warning.dark">
                ${paymentStats.totalUnpaid.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Payment
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center" p={2} bgcolor="error.light" borderRadius={2}>
              <Warning color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" color="error.dark">
                ${paymentStats.totalOverdue.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overdue
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center" p={2} bgcolor="info.light" borderRadius={2}>
              <Payment color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" color="info.dark">
                {paymentStats.paymentRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payment Rate
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Payment Trends Chart */}
          <Grid item xs={12} md={8}>
            <Box height={300} display="flex" alignItems="center" justifyContent="center" bgcolor="grey.50" borderRadius={2}>
              <Box textAlign="center">
                <Typography variant="subtitle1" gutterBottom>
                  Payment Trends (Last 30 Days)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Interactive area chart will be available once recharts is properly configured
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Data Points: {paymentData.length}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Payment Distribution */}
          <Grid item xs={12} md={4}>
            <Box height={300} display="flex" alignItems="center" justifyContent="center" bgcolor="grey.50" borderRadius={2}>
              <Box textAlign="center">
                <Typography variant="subtitle1" gutterBottom>
                  Payment Distribution
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Interactive radial chart will be available once recharts is properly configured
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Distribution Data: {radialData.length} categories
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Performance Indicators */}
        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            Performance Indicators
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box flexGrow={1}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Rate
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={paymentStats.paymentRate}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Chip
                  label={`${paymentStats.paymentRate.toFixed(1)}%`}
                  color={paymentStats.paymentRate > 80 ? 'success' : paymentStats.paymentRate > 60 ? 'warning' : 'error'}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box flexGrow={1}>
                  <Typography variant="body2" color="text.secondary">
                    Average Payment Time
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((paymentStats.averagePaymentTime / 30) * 100, 100)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Chip
                  label={`${paymentStats.averagePaymentTime} days`}
                  color={paymentStats.averagePaymentTime < 15 ? 'success' : paymentStats.averagePaymentTime < 30 ? 'warning' : 'error'}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentTrends;
