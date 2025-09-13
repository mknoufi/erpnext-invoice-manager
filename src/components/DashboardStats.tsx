import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Receipt,
  Warning,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { useInvoices } from '../hooks/useInvoices';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  loading = false,
}) => {
  const getChangeColor = () => {
    if (change === undefined) return 'default';
    return change >= 0 ? 'success' : 'error';
  };

  const getChangeIcon = () => {
    if (change === undefined) return undefined;
    return change >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />;
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
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
          {change !== undefined && (
            <Chip
              icon={getChangeIcon()}
              label={`${change >= 0 ? '+' : ''}${change}%`}
              color={getChangeColor()}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
        
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
          {loading ? (
            <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
          ) : (
            value
          )}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

const DashboardStats: React.FC = () => {
  const { invoices, isLoading, refetch } = useInvoices('All');

  const stats = React.useMemo(() => {
    if (!invoices) return null;

    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((inv: any) => inv.is_paid).length;
    const unpaidInvoices = invoices.filter((inv: any) => !inv.is_paid).length;
    const overdueInvoices = invoices.filter((inv: any) => 
      !inv.is_paid && new Date(inv.due_date) < new Date()
    ).length;

    const totalAmount = invoices.reduce((sum: number, inv: any) => sum + (inv.grand_total || 0), 0);
    const paidAmount = invoices
      .filter((inv: any) => inv.is_paid)
      .reduce((sum: number, inv: any) => sum + (inv.grand_total || 0), 0);
    const unpaidAmount = invoices
      .filter((inv: any) => !inv.is_paid)
      .reduce((sum: number, inv: any) => sum + (inv.grand_total || 0), 0);

    const paidPercentage = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;

    return {
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      overdueInvoices,
      totalAmount,
      paidAmount,
      unpaidAmount,
      paidPercentage,
    };
  }, [invoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StatCard
              title="Loading..."
              value=""
              icon={<Refresh />}
              color="primary"
              loading={true}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          Dashboard Overview
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton onClick={() => refetch()} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            icon={<Receipt />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Paid Invoices"
            value={stats.paidInvoices}
            change={stats.paidPercentage - 50} // Mock change for demo
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Unpaid Invoices"
            value={stats.unpaidInvoices}
            icon={<Warning />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Overdue Invoices"
            value={stats.overdueInvoices}
            icon={<Warning />}
            color="error"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Amount"
            value={formatCurrency(stats.totalAmount)}
            icon={<AttachMoney />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Unpaid Amount"
            value={formatCurrency(stats.unpaidAmount)}
            icon={<AttachMoney />}
            color="warning"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardStats;
