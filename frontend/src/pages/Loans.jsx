import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Button, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { loansAPI } from '../services/api';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'loan_number', headerName: 'Loan Number', width: 150 },
  { field: 'borrower_name', headerName: 'Borrower', width: 200 },
  { field: 'principal_amount', headerName: 'Amount', width: 130 },
  { field: 'interest_rate', headerName: 'Rate %', width: 100 },
  { field: 'term_months', headerName: 'Term', width: 100 },
  { field: 'status', headerName: 'Status', width: 130 }
];

export default function Loans() {
  const { data, isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: () => loansAPI.getAll().then(res => res.data.data || res.data)
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Loans</Typography>
        <Button variant="contained" startIcon={<Add />}>Create Loan</Button>
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
