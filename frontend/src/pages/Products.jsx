import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Button, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { productsAPI } from '../services/api';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Product Name', width: 200 },
  { field: 'code', headerName: 'Code', width: 120 },
  { field: 'interest_rate', headerName: 'Interest Rate %', width: 150 },
  { field: 'min_principal', headerName: 'Min Amount', width: 130 },
  { field: 'max_principal', headerName: 'Max Amount', width: 130 },
  { field: 'min_term_months', headerName: 'Min Term', width: 100 },
  { field: 'max_term_months', headerName: 'Max Term', width: 100 }
];

export default function Products() {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll().then(res => res.data.data || res.data)
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Loan Products</Typography>
        <Button variant="contained" startIcon={<Add />}>Add Product</Button>
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
