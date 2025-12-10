import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Settings, LogOut, User, Bell } from 'lucide-react';
import { SidebarMenu } from './menu';
import useAuthStore from '../../store/auth.store';
import { cn } from '../../utils/cn';
import NotificationCenter from '../ui/NotificationCenter';

function Icon({ name, className }) {
  return <span className={cn('w-5 inline-block text-gray-400', className)}>{name?.slice(0, 1)}</span>;
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const role = user?.role;

  const allowed = (item) => {
    if (!item.roles) return true;
    if (!role) return false;
    return item.roles.includes(role);
  };

  // Role-based quick actions
  const getRoleSpecificActions = () => {
    switch (role) {
      case 'COUNSELLOR':
        return [{ label: 'New Lead', path: '/leads/new' }];
      case 'COLLECTION':
        return [{ label: 'Daily Collections', path: '/collections/daily' }];
      case 'OPERATION':
        return [{ label: 'Disbursement Queue', path: '/disbursement' }];
      default:
        return [];
    }
  };

  const roleActions = getRoleSpecificActions();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        'bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col h-screen shadow-xl sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <motion.div
            initial={false}
            animate={{ opacity: collapsed ? 0 : 1 }}
            className={cn('flex items-center gap-3', collapsed && 'hidden')}
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
              L
            </div>
            <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              LoanCRM
            </div>
          </motion.div>
          
          <div className="flex items-center gap-2">
            {!collapsed && <NotificationCenter />}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </motion.button>
          </div>
        </div>
        
        {/* User Info */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.displayName || user?.username || 'User'}</p>
                  <p className="text-xs text-blue-400 truncate font-medium">{role}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Quick Actions */}
      {roleActions.length > 0 && (
        <div className="p-4 border-b border-gray-700">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Quick Actions
                </p>
                {roleActions.map((action, index) => (
                  <motion.div
                    key={action.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <NavLink
                      to={action.path}
                      className="block w-full p-3 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-center text-sm font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {action.label}
                    </NavLink>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {SidebarMenu.filter(allowed).map((item, index) => {
          const isActive = location.pathname.startsWith(item.path || '#');
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onHoverStart={() => setHoveredItem(item.id)}
              onHoverEnd={() => setHoveredItem(null)}
            >
              <NavLink
                to={item.path || '#'}
                className={({ isActive }) => cn(
                  'flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={cn(
                    'p-1 rounded-md transition-colors',
                    isActive ? 'bg-white/20' : 'group-hover:bg-gray-600'
                  )}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                </motion.div>
                
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-3 font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {/* Tooltip for collapsed state */}
                {collapsed && hoveredItem === item.id && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-xl border border-gray-700"
                  >
                    {item.label}
                  </motion.div>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-0 w-1 h-8 bg-white rounded-l-full"
                  />
                )}
              </NavLink>
              
              {/* Sub-menu */}
              {item.children && !collapsed && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-6 mt-1 space-y-1"
                  >
                    {item.children.filter(allowed).map((child) => (
                      <NavLink
                        key={child.id}
                        to={child.path || '#'}
                        className={({ isActive }) => cn(
                          'block px-3 py-2 rounded-md text-sm transition-colors',
                          isActive
                            ? 'bg-blue-600/20 text-blue-300 font-medium'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        )}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-700 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            'flex items-center px-3 py-2 rounded-lg transition-colors',
            isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          )}
        >
          <Settings className="h-4 w-4" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}
