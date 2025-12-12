import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/auth.service';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      
      login: async (username, password) => {
        set({ loading: true });
        try {
          const { token, user } = await authService.login(username, password);
          set({ 
            user, 
            token, 
            isAuthenticated: true,
            loading: false 
          });
          return { token, user };
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
      
      logout: async () => {
        set({ loading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            loading: false 
          });
        }
      },
      
      setAuth: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),
      
      initAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const user = await authService.getCurrentUser();
            set({ token, user, isAuthenticated: true });
            return true;
          } catch (error) {
            localStorage.removeItem('token');
            set({ token: null, user: null, isAuthenticated: false });
            return false;
          }
        }
        return false;
      },
      
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },
      
      hasAnyRole: (roles) => {
        const { user } = get();
        return roles.includes(user?.role);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);

export default useAuthStore;
