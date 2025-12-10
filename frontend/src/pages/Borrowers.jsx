import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Button, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { borrowersAPI } from '../services/api';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'first_name', headerName: 'First Name', width: 150 },
  { field: 'last_name', headerName: 'Last Name', width: 150 },
  { field: 'phone', headerName: 'Phone', width: 150 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'status', headerName: 'Status', width: 120 }
];

export default function Borrowers() {
  const { data, isLoading } = useQuery({
    queryKey: ['borrowers'],
    queryFn: () => borrowersAPI.getAll().then(res => res.data.data || res.data)
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Borrowers</Typography>
        <Button variant="contained" startIcon={<Add />}>Add Borrower</Button>
      </Box>
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={data || []}
          columns={columns}
          loading={isLoading}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>
    </Box>
  );
}
