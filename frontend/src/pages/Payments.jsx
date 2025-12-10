import { Box, Typography, Button, Paper } from '@mui/material';
import { Add } from '@mui/icons-material';

export default function Payments() {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Payments</Typography>
        <Button variant="contained" startIcon={<Add />}>Record Payment</Button>
      </Box>
      <Paper sx={{ p: 3 }}>
        <Typography>Payment management coming soon...</Typography>
      </Paper>
    </Box>
  );
}
