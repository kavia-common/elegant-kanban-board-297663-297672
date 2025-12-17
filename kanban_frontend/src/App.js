import React from 'react';
import { AppStateProvider } from './state/store';
import { useTheme } from './hooks/useTheme';
import AppLayout from './components/AppLayout';
import BoardPage from './pages/BoardPage';
import './App.css';

// PUBLIC_INTERFACE
/**
 * Root App component with theme and state management
 */
function App() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <AppStateProvider>
      <AppLayout onThemeToggle={toggleTheme} isDark={isDark}>
        <BoardPage />
      </AppLayout>
    </AppStateProvider>
  );
}

export default App;
