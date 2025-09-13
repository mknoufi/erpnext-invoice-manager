import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Receipt,
  Schedule,
  CheckCircle,
} from '@mui/icons-material';
import { subDays, subMonths } from 'date-fns';
import SalesChart from './SalesChart';
import PaymentTrends from './PaymentTrends';
import { useInvoices } from '../../hooks/useInvoices';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AnalyticsDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { invoices, isLoading, refetch } = useInvoices('All');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export analytics data');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share analytics dashboard');
  };

  // Calculate key metrics
  const metrics = useMemo(() => {
    if (!invoices || invoices.length === 0) {
      return {
        totalRevenue: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        unpaidInvoices: 0,
        overdueInvoices: 0,
        averageInvoiceValue: 0,
        paymentRate: 0,
        revenueGrowth: 0,
        invoiceGrowth: 0,
      };
    }

    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
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

    const filteredInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.posting_date);
      return invoiceDate >= startDate && invoiceDate <= now;
    });

    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0);
    const totalInvoices = filteredInvoices.length;
    const paidInvoices = filteredInvoices.filter(inv => inv.is_paid).length;
    const unpaidInvoices = filteredInvoices.filter(inv => !inv.is_paid).length;
    const overdueInvoices = filteredInvoices.filter(inv => 
      !inv.is_paid && new Date(inv.due_date) < now
    ).length;

    const averageInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
    const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

    // Calculate growth (mock data for now)
    const revenueGrowth = 12.5; // %
    const invoiceGrowth = 8.3; // %

    return {
      totalRevenue,
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      overdueInvoices,
      averageInvoiceValue,
      paymentRate,
      revenueGrowth,
      invoiceGrowth,
    };
  }, [invoices, dateRange]);

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    growth?: number;
    icon: React.ReactNode;
    color: 'primary' | 'success' | 'warning' | 'error' | 'info';
    loading?: boolean;
  }> = ({ title, value, growth, icon, color, loading = false }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {loading ? (
                <LinearProgress sx={{ width: 100, height: 8 }} />
              ) : (
                value
              )}
            </Typography>
            {growth !== undefined && !loading && (
              <Box display="flex" alignItems="center" mt={1}>
                {growth >= 0 ? (
                  <TrendingUp color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingDown color="error" sx={{ fontSize: 16, mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  color={growth >= 0 ? 'success.main' : 'error.main'}
                >
                  {Math.abs(growth).toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: `${color}.light`,
              color: `${color}.contrastText`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Data">
            <IconButton onClick={handleExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share Dashboard">
            <IconButton onClick={handleShare}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Date Range Filter */}
      <Box display="flex" gap={1} mb={3}>
        {(['7d', '30d', '90d', '1y'] as const).map((range) => (
          <Chip
            key={range}
            label={range === '7d' ? '7 days' : range === '30d' ? '30 days' : range === '90d' ? '90 days' : '1 year'}
            onClick={() => setDateRange(range)}
            color={dateRange === range ? 'primary' : 'default'}
            variant={dateRange === range ? 'filled' : 'outlined'}
          />
        ))}
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={`$${metrics.totalRevenue.toLocaleString()}`}
            growth={metrics.revenueGrowth}
            icon={<AttachMoney />}
            color="primary"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Invoices"
            value={metrics.totalInvoices}
            growth={metrics.invoiceGrowth}
            icon={<Receipt />}
            color="info"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Payment Rate"
            value={`${metrics.paymentRate.toFixed(1)}%`}
            icon={<CheckCircle />}
            color="success"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Overdue Invoices"
            value={metrics.overdueInvoices}
            icon={<Schedule />}
            color="error"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Analytics Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
            <Tab label="Sales Analytics" />
            <Tab label="Payment Trends" />
            <Tab label="Performance Metrics" />
            <Tab label="Customer Insights" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <SalesChart invoices={invoices} loading={isLoading} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <PaymentTrends invoices={invoices} loading={isLoading} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Invoice Status Distribution
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Paid Invoices</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={(metrics.paidInvoices / metrics.totalInvoices) * 100}
                          sx={{ width: 100, height: 8 }}
                        />
                        <Typography variant="body2">
                          {metrics.paidInvoices} ({metrics.paymentRate.toFixed(1)}%)
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Unpaid Invoices</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={(metrics.unpaidInvoices / metrics.totalInvoices) * 100}
                          sx={{ width: 100, height: 8 }}
                        />
                        <Typography variant="body2">
                          {metrics.unpaidInvoices} ({((metrics.unpaidInvoices / metrics.totalInvoices) * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Overdue Invoices</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={(metrics.overdueInvoices / metrics.totalInvoices) * 100}
                          sx={{ width: 100, height: 8 }}
                        />
                        <Typography variant="body2">
                          {metrics.overdueInvoices} ({((metrics.overdueInvoices / metrics.totalInvoices) * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Key Performance Indicators
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Average Invoice Value
                      </Typography>
                      <Typography variant="h5">
                        ${metrics.averageInvoiceValue.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Total Revenue
                      </Typography>
                      <Typography variant="h5">
                        ${metrics.totalRevenue.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Payment Rate
                      </Typography>
                      <Typography variant="h5">
                        {metrics.paymentRate.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Insights
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Customer analytics and insights will be available in the next update.
                This will include customer payment patterns, credit analysis, and relationship management.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default AnalyticsDashboard;
