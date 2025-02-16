import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { profileSchema } from '../../schemas/validation';
import { useProfile } from '../../hooks/useProfile';
import { useNotification } from '../../hooks/useNotification';

export const UserProfile: React.FC = () => {
  const { user, updateProfile } = useProfile();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = React.useState(false);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      name: user?.name || '',
      bio: user?.bio || '',
      website: user?.website || '',
      location: user?.location || '',
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
      }
      setAvatarFile(file);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      await updateProfile(formData);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Profile Information
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ mt: 2 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} display="flex" justifyContent="center">
              <Box position="relative">
                <Avatar
                  src={avatarFile ? URL.createObjectURL(avatarFile) : user?.avatar}
                  sx={{ width: 100, height: 100 }}
                />
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: -10,
                    right: -10,
                    backgroundColor: 'background.paper',
                  }}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <PhotoCamera />
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    fullWidth
                    error={!!errors.username}
                    helperText={errors.username?.message as string}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message as string}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="bio"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bio"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.bio}
                    helperText={errors.bio?.message as string}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="website"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Website"
                    fullWidth
                    error={!!errors.website}
                    helperText={errors.website?.message as string}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Location"
                    fullWidth
                    error={!!errors.location}
                    helperText={errors.location?.message as string}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                disabled={isLoading}
              >
                Reset
              </Button>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isLoading}
              >
                Save Changes
              </LoadingButton>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}; 