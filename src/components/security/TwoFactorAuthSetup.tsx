import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  LinearProgress,
  Alert,
  Paper
} from '@mui/material';
import { useSecurity } from '../../contexts/SecurityContext';
import { QRCodeSVG } from 'qrcode.react';

interface TwoFactorAuthSetupProps {
  open: boolean;
  onClose: () => void;
}

const TwoFactorAuthSetup: React.FC<TwoFactorAuthSetupProps> = ({ open, onClose }) => {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  
  const { state: _state } = useSecurity();

  // Initialize 2FA setup
  useEffect(() => {
    if (open && step === 'setup') {
      const initialize2FA = async () => {
        setIsLoading(true);
        try {
          // TODO: Replace with actual API call to generate 2FA secret
          // const response = await api.get('/auth/2fa/setup');
          // setQrCodeUrl(response.data.qrCodeUrl);
          // setSecret(response.data.secret);
          
          // Mock data for development
          setQrCodeUrl('otpauth://totp/InvoiceManager:admin@example.com?secret=JBSWY3DPEHPK3PXP&issuer=InvoiceManager');
          setSecret('JBSWY3DPEHPK3PXP');
        } catch (err) {
          setError('Failed to initialize 2FA setup');
          console.error('2FA setup error:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      initialize2FA();
    }
  }, [open, step]);

  const handleVerify = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // TODO: Replace with actual API call to verify 2FA
      // const response = await api.post('/auth/2fa/verify', { code: verificationCode });
      // setRecoveryCodes(response.data.recoveryCodes);
      
      // Mock successful verification
      setRecoveryCodes([
        'abcd-efgh-ijkl-mnop',
        'qrst-uvwx-yz12-3456',
        '7890-1234-5678-9012',
        '3456-7890-1234-5678',
        '9012-3456-7890-1234'
      ]);
      
      setStep('verify');
    } catch (err) {
      setError('Invalid verification code. Please try again.');
      console.error('2FA verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onClose();
    setStep('setup');
    setVerificationCode('');
    setError('');
  };

  const handleDownloadRecoveryCodes = () => {
    const element = document.createElement('a');
    const file = new Blob([recoveryCodes.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'invoice-manager-recovery-codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {step === 'setup' ? 'Set Up Two-Factor Authentication' : '2FA Setup Complete'}
      </DialogTitle>
      
      <DialogContent>
        {isLoading && <LinearProgress />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {step === 'setup' ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" paragraph>
              Scan the QR code below with your authenticator app (like Google Authenticator or Authy).
            </Typography>
            
            {qrCodeUrl && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <QRCodeSVG value={qrCodeUrl} size={200} />
              </Box>
            )}
            
            <Typography variant="body2" color="textSecondary" paragraph>
              Or enter this secret key manually:
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: 'background.paper' }}>
              <Typography variant="body1" fontFamily="monospace">
                {secret}
              </Typography>
            </Paper>
            
            <Typography variant="body2" color="textSecondary" paragraph>
              After scanning the QR code, enter the 6-digit code from your authenticator app to verify setup.
            </Typography>
            
            <TextField
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              margin="normal"
              placeholder="000000"
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                maxLength: 6,
                style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em' },
              }}
            />
          </Box>
        ) : (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              Two-factor authentication has been successfully enabled for your account.
            </Alert>
            
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Save these recovery codes in a secure place
              </Typography>
              <Typography variant="body2" paragraph>
                These codes can be used to access your account if you lose access to your authenticator app.
                Each code can only be used once.
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: 'background.paper' }}>
                {recoveryCodes.map((code, index) => (
                  <Typography key={index} variant="body1" fontFamily="monospace" gutterBottom>
                    {code}
                  </Typography>
                ))}
              </Paper>
              
              <Button
                variant="outlined"
                size="small"
                onClick={handleDownloadRecoveryCodes}
                fullWidth
              >
                Download Recovery Codes
              </Button>
            </Alert>
            
            <Typography variant="body2" color="error" paragraph>
              <strong>Important:</strong> Store these codes in a secure place. If you lose access to your
              authenticator app and don't have these recovery codes, you may be locked out of your account.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={isLoading}>
          {step === 'setup' ? 'Cancel' : 'Close'}
        </Button>
        
        {step === 'setup' ? (
          <Button 
            onClick={handleVerify} 
            variant="contained" 
            color="primary"
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify and Enable'}
          </Button>
        ) : (
          <Button 
            onClick={handleComplete} 
            variant="contained" 
            color="primary"
          >
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TwoFactorAuthSetup;
