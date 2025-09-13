import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useCashier } from '../contexts/CashierContext';
import { useNavigate } from 'react-router-dom';

const CashierLogin: React.FC = () => {
  const { state, pinLogin } = useCashier();
  const [pin, setPin] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const ok = await pinLogin(pin);
    if (ok) navigate('/cashier');
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 2 }}>
      <Paper sx={{ p: 3, width: '100%', maxWidth: 420 }} elevation={3}>
        <Typography variant="h5" align="center" gutterBottom>
          Cashier PIN Login
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
          Enter your secure PIN to begin your shift
        </Typography>
        {state.error && <Alert severity="error" sx={{ mb: 2 }}>{state.error}</Alert>}
        <TextField
          fullWidth
          type="password"
          label="PIN"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', style: { letterSpacing: '0.4em', fontSize: '1.5rem', textAlign: 'center' } }}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          margin="normal"
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleLogin}
          disabled={state.isLoading || pin.length < 4}
          startIcon={state.isLoading ? <CircularProgress size={20} /> : undefined}
          sx={{ mt: 2 }}
        >
          {state.isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </Paper>
    </Box>
  );
};

export default CashierLogin;


