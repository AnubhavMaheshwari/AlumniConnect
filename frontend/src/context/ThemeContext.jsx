import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        // 1️⃣ Prefer saved user choice
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        // 2️⃣ Fallback to OS preference – avoids flash of wrong theme
        if (typeof window !== 'undefined' && window.matchMedia) {
          return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        // 3️⃣ Default to light if all else fails
        return false;
      });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            root.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
