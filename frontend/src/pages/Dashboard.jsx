import { Grid, Paper, Typography, Box } from '@mui/material';
import { People, AccountBalance, Payment, TrendingUp } from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Paper sx={{ p: 3 }}>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography color="textSecondary" gutterBottom>{title}</Typography>
        <Typography variant="h4">{value}</Typography>
      </Box>
      <Box sx={{ color, fontSize: 48 }}>{icon}</Box>
    </Box>
  </Paper>
);

export default function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Borrowers" value="0" icon={<People />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Loans" value="0" icon={<AccountBalance />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Disbursed" value="₹0" icon={<TrendingUp />} color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Collections" value="₹0" icon={<Payment />} color="#9c27b0" />
        </Grid>
      </Grid>
    </Box>
  );
}
