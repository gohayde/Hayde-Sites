/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import NewBuild from './components/NewBuild';
import InfoSpy from './components/InfoSpy';
import ManageBuilds from './components/ManageBuilds';
import Templates from './components/Templates';
import SettingsPage from './components/SettingsPage';
import LeadGenerator from './components/LeadGenerator';
import Sidebar from './components/layout/Sidebar';

export default function App() {
  const [activePage, setActivePage] = useState('new-build');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('haydeSiteTheme');
    if (savedTheme) setTheme(savedTheme);
    
    const savedSidebar = localStorage.getItem('sidebarCollapsed');
    if (savedSidebar === 'true') setSidebarCollapsed(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('haydeSiteTheme', theme);
  }, [theme]);

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('sidebarCollapsed', String(next));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`flex min-h-screen ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        sidebarCollapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
      />

      <main className="main-content">
        {activePage === 'new-build' && <NewBuild onNavigate={setActivePage} />}
        {activePage === 'info-spy' && <InfoSpy onNavigate={setActivePage} />}
        {activePage === 'lead-generator' && <LeadGenerator />}
        {activePage === 'manage-builds' && <ManageBuilds onNavigate={setActivePage} />}
        {activePage === 'templates' && <Templates />}
        {activePage === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}
