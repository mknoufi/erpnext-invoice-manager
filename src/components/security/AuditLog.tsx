import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useSecurity } from '../../contexts/SecurityContext';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning';
  details?: Record<string, any>;
}

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    status: '',
    entityType: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { hasPermission } = useSecurity();

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchAuditLogs = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // TODO: Replace with actual API call
        // const response = await api.get('/audit-logs', { params: { ...filters, search: searchTerm } });
        // setLogs(response.data);
        
        // Mock data
        const mockLogs: AuditLogEntry[] = [
          {
            id: '1',
            timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
            userId: 'user1',
            userEmail: 'admin@example.com',
            action: 'USER_LOGIN',
            entityType: 'User',
            entityId: 'user1',
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            status: 'success',
            details: { method: 'password' }
          },
          // Add more mock entries as needed
        ];
        
        setLogs(mockLogs);
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
        setError('Failed to load audit logs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAuditLogs();
  }, [filters, searchTerm]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  const handleRefresh = () => {
    // Refresh logs
    setPage(0);
    // The useEffect will trigger a refetch
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getActionLabel = (action: string) => {
    // Convert action code to readable format
    return action
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = Object.values(log).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesFilters = Object.entries(filters).every(([key, value]) => 
      !value || String(log[key as keyof typeof filters]).toLowerCase() === value.toLowerCase()
    );
    
    return matchesSearch && matchesFilters;
  });

  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Check if user has permission to view audit logs
  if (!hasPermission('canViewAuditLogs')) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          You don't have permission to view audit logs.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Audit Logs
        </Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
            sx={{ minWidth: 200, flexGrow: 1 }}
          />
          
          <TextField
            select
            size="small"
            label="Action"
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Actions</MenuItem>
            <MenuItem value="USER_LOGIN">User Login</MenuItem>
            <MenuItem value="USER_LOGOUT">User Logout</MenuItem>
            <MenuItem value="PASSWORD_CHANGE">Password Change</MenuItem>
            <MenuItem value="INVOICE_CREATE">Invoice Create</MenuItem>
            <MenuItem value="INVOICE_UPDATE">Invoice Update</MenuItem>
            <MenuItem value="INVOICE_DELETE">Invoice Delete</MenuItem>
          </TextField>
          
          <TextField
            select
            size="small"
            label="Status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
          </TextField>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TableContainer>
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>IP Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Tooltip title={log.timestamp.toLocaleString()}>
                        <span>{formatDistanceToNow(log.timestamp, { addSuffix: true })}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{log.userEmail}</TableCell>
                    <TableCell>{getActionLabel(log.action)}</TableCell>
                    <TableCell>
                      {log.entityType} {log.entityId}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={log.status}
                        color={getStatusColor(log.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default AuditLog;
