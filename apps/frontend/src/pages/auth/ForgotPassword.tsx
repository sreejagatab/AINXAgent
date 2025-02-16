import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  TextField,
  Typography,
  Link,
} from '@mui/material';
import { forgotPasswordSchema } from '@enhanced-ai-agent/shared';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { LoadingButton } from '@mui/lab';
import { useNotification } from '../../hooks/useNotification';

export const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useAuth();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setEmailSent(true);
      showNotification('Password reset instructions sent to your email', 'success');
    } catch (error) {
      showNotification('Failed to send reset instructions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Reset Password
          </Typography>

          <Typography variant="body2" sx={{ mb: 3 }} align="center" color="text.secondary">
            Enter your email address and we'll send you instructions to reset your password.
          </Typography>

          <TextField
            {...register('email')}
            label="Email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message as string}
            autoComplete="email"
            disabled={emailSent}
          />

          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            loading={isLoading}
            disabled={emailSent}
            sx={{ mt: 3 }}
          >
            {emailSent ? 'Instructions Sent' : 'Send Instructions'}
          </LoadingButton>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Remember your password?{' '}
              <Link component={RouterLink} to="/login">
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Card>
    </AuthLayout>
  );
};

export default ForgotPassword; 