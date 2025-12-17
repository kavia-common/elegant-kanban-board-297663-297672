import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppStateProvider } from './state/store';
import { useTheme } from './hooks/useTheme';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import BoardPage from './pages/BoardPage';
import './App.css';

// PUBLIC_INTERFACE
/**
 * Root App component with theme and state management
 */
function App() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <BrowserRouter>
      <AppStateProvider>
        <AppLayout onThemeToggle={toggleTheme} isDark={isDark}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/board/:id" element={<BoardPage />} />
          </Routes>
        </AppLayout>
      </AppStateProvider>
    </BrowserRouter>
  );
}

export default App;
