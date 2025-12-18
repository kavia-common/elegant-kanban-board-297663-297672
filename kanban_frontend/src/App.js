import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useBoardStore from './stores/boardStore';
import useColumnStore from './stores/columnStore';
import useCardStore from './stores/cardStore';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import BoardPage from './pages/BoardPage';
import './App.css';

// PUBLIC_INTERFACE
/**
 * Main App component with routing and store initialization
 */
function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  const initBoard = useBoardStore((state) => state.init);
  const initColumn = useColumnStore((state) => state.init);
  const initCard = useCardStore((state) => state.init);

  useEffect(() => {
    const initializeStores = async () => {
      try {
        // Initialize all stores
        await Promise.all([
          initBoard(),
          initColumn(),
          initCard()
        ]);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing stores:', error);
        setIsInitialized(true); // Still render the app
      }
    };

    initializeStores();
  }, [initBoard, initColumn, initCard]);

  if (!isInitialized) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="board/:id" element={<BoardPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
