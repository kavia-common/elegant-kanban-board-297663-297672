import React from 'react';
import { Outlet } from 'react-router-dom';
import useUIStore from '../stores/uiStore';
import Header from './Header';
import Sidebar from './Sidebar';
import Main from './Main';
import './AppLayout.css';

// PUBLIC_INTERFACE
/**
 * AppLayout component providing the main application structure
 * Contains Header, Sidebar, and Main content area
 */
const AppLayout = () => {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <div className="app-layout">
      <Header />
      <div className="app-body">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={toggleSidebar} 
        />
        <Main collapsed={sidebarCollapsed}>
          <Outlet />
        </Main>
      </div>
    </div>
  );
};

export default AppLayout;
