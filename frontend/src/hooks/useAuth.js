import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.me()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return { user, loading, login, logout };
};
