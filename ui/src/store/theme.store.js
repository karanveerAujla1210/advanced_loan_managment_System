import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const themes = {
  light: {
    name: 'Light',
    value: 'light',
    colors: {
      primary: '#2563EB',
      secondary: '#7C3AED',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#1F2937'
    }
  },
  dark: {
    name: 'Dark',
    value: 'dark',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB'
    }
  },
  system: {
    name: 'System',
    value: 'system',
    colors: null
  }
};

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system',
      actualTheme: 'light',
      themes,
      sidebarCollapsed: false,
      animations: true,
      reducedMotion: false,
      fontSize: 'medium',
      colorScheme: 'default',
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        let newTheme;
        
        if (currentTheme === 'light') {
          newTheme = 'dark';
        } else if (currentTheme === 'dark') {
          newTheme = 'system';
        } else {
          newTheme = 'light';
        }
        
        get().setTheme(newTheme);
      },
      
      setTheme: (theme) => {
        set({ theme });
        get().applyTheme(theme);
      },
      
      applyTheme: (theme) => {
        let actualTheme = theme;
        
        if (theme === 'system') {
          actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        set({ actualTheme });
        
        const root = document.documentElement;
        
        if (actualTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        
        const colorScheme = get().colorScheme;
        root.setAttribute('data-color-scheme', colorScheme);
        
        const fontSize = get().fontSize;
        root.setAttribute('data-font-size', fontSize);
        
        const reducedMotion = get().reducedMotion;
        if (reducedMotion) {
          root.classList.add('reduce-motion');
        } else {
          root.classList.remove('reduce-motion');
        }
      },
      
      initializeTheme: () => {
        const { theme } = get();
        
        if (theme === 'system') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleChange = () => {
            if (get().theme === 'system') {
              get().applyTheme('system');
            }
          };
          
          mediaQuery.addEventListener('change', handleChange);
        }
        
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
          set({ reducedMotion: true, animations: false });
        }
        
        get().applyTheme(theme);
      },
      
      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },
      
      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },
      
      setAnimations: (enabled) => {
        set({ animations: enabled });
        const root = document.documentElement;
        if (!enabled) {
          root.classList.add('reduce-motion');
        } else {
          root.classList.remove('reduce-motion');
        }
      },
      
      setFontSize: (size) => {
        set({ fontSize: size });
        document.documentElement.setAttribute('data-font-size', size);
      },
      
      setColorScheme: (scheme) => {
        set({ colorScheme: scheme });
        document.documentElement.setAttribute('data-color-scheme', scheme);
      },
      
      isDark: () => get().actualTheme === 'dark',
      isLight: () => get().actualTheme === 'light',
      
      getCurrentTheme: () => {
        const { theme, actualTheme } = get();
        return themes[actualTheme] || themes[theme] || themes.light;
      }
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        animations: state.animations,
        reducedMotion: state.reducedMotion,
        fontSize: state.fontSize,
        colorScheme: state.colorScheme
      })
    }
  )
);

export default useThemeStore;