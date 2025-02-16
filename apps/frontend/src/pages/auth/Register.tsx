import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { registerSchema } from '@enhanced-ai-agent/shared';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { LoadingButton } from '@mui/lab';

export const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await registerUser({
        email: data.email,
        username: data.username,
        password: data.password,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Create Account
          </Typography>

          <TextField
            {...register('email')}
            label="Email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message as string}
            autoComplete="email"
          />

          <TextField
            {...register('username')}
            label="Username"
            fullWidth
            margin="normal"
            error={!!errors.username}
            helperText={errors.username?.message as string}
            autoComplete="username"
          />

          <TextField
            {...register('password')}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message as string}
            autoComplete="new-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                {...register('terms')}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="body2">
                I agree to the{' '}
                <Link href="/terms" target="_blank">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank">
                  Privacy Policy
                </Link>
              </Typography>
            }
          />

          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            loading={isLoading}
            sx={{ mt: 3 }}
          >
            Create Account
          </LoadingButton>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
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

export default Register; 