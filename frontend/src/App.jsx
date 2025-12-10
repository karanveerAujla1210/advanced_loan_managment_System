import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Borrowers from './pages/Borrowers';
import Loans from './pages/Loans';
import Payments from './pages/Payments';
import Products from './pages/Products';
import Layout from './components/Layout';
import { useAuth } from './hooks/useAuth';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  }
});

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="borrowers" element={<Borrowers />} />
            <Route path="loans" element={<Loans />} />
            <Route path="payments" element={<Payments />} />
            <Route path="products" element={<Products />} />
          </Route>
        </Routes>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
