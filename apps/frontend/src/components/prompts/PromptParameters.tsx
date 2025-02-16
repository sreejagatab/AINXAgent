import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { useFieldArray, useFormContext } from 'react-hook-form';

export const PromptParameters: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parameters',
  });

  const handleAddParameter = () => {
    append({ name: '', description: '', required: true });
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Parameters</Typography>
          <Button
            startIcon={<Add />}
            onClick={handleAddParameter}
            variant="outlined"
            size="small"
          >
            Add Parameter
          </Button>
        </Box>

        {fields.map((field, index) => (
          <Box key={field.id} sx={{ mb: 2 }}>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={5}>
                <TextField
                  {...register(`parameters.${index}.name`)}
                  label="Name"
                  fullWidth
                  error={!!errors.parameters?.[index]?.name}
                  helperText={errors.parameters?.[index]?.name?.message as string}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register(`parameters.${index}.description`)}
                  label="Description"
                  fullWidth
                  error={!!errors.parameters?.[index]?.description}
                  helperText={errors.parameters?.[index]?.description?.message as string}
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <IconButton
                  onClick={() => remove(index)}
                  color="error"
                  sx={{ mt: 1 }}
                >
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        ))}

        {fields.length === 0 && (
          <Typography color="textSecondary" align="center">
            No parameters defined
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}; 