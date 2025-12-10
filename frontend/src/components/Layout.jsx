import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, IconButton } from '@mui/material';
import { Dashboard, People, AccountBalance, Payment, Category, Logout } from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Borrowers', icon: <People />, path: '/borrowers' },
  { text: 'Loans', icon: <AccountBalance />, path: '/loans' },
  { text: 'Payments', icon: <Payment />, path: '/payments' },
  { text: 'Products', icon: <Category />, path: '/products' }
];

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Loan Management System
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" sx={{ width: drawerWidth, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}>
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem button key={item.text} component={Link} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
