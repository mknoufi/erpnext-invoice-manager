import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <LockIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        <Typography component="h1" variant="h3" gutterBottom>
          403 - Unauthorized
        </Typography>
        <Typography variant="h6" color="textSecondary" align="center" paragraph>
          You don't have permission to access this page.
        </Typography>
        <Paper elevation={3} sx={{ p: 4, mt: 3, textAlign: 'center' }}>
          <Typography variant="body1" paragraph>
            The page you are trying to access requires additional permissions.
            Please contact your administrator if you believe this is an error.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/"
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
