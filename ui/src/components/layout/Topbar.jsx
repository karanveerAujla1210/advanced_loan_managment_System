import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Sun, Moon, Wifi, WifiOff, User, Settings, LogOut } from 'lucide-react';
import useAuthStore from '../../store/auth.store';
import useThemeStore from '../../store/theme.store';
import { cn } from '../../utils/cn';

export default function Topbar() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const { theme, toggleTheme } = useThemeStore();
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input 
            placeholder="Search anything... (Ctrl+K)" 
            className="pl-10 pr-16 py-2 w-96 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            readOnly
            onClick={() => {
              // This would trigger the command bar
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                ctrlKey: true,
                bubbles: true
              });
              document.dispatchEvent(event);
            }}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <kbd className="inline-flex items-center px-2 py-1 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
            isOnline 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          )}
        >
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>Offline</span>
            </>
          )}
        </motion.div>
        
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          )}
        </motion.button>
        
        {/* User Menu */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.displayName || user?.username || 'Guest'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role || 'User'}
              </div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-4 w-4 text-white" />
            </div>
          </motion.button>
          
          {/* User Dropdown */}
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
            >
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.displayName || user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || 'No email'}
                </p>
              </div>
              
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <User className="h-4 w-4" />
                Profile
              </button>
              
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Settings className="h-4 w-4" />
                Settings
              </button>
              
              <hr className="my-2 border-gray-200 dark:border-gray-700" />
              
              <button 
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}