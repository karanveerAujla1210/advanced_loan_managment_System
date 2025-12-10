import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { authAPI } from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.login({ username, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Loan Management System
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
          Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
            Login
          </Button>
        </Box>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Default: admin / admin123
        </Typography>
      </Paper>
    </Container>
  );
}
