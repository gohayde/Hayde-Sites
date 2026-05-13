import React from 'react';
import { 
  PlusCircle, 
  Search, 
  FolderOpen, 
  LayoutTemplate, 
  Settings, 
  Menu,
  Users
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ activePage, setActivePage, sidebarCollapsed, toggleSidebar }: SidebarProps) {
  const navItems = [
    { id: 'new-build', label: 'New Build', icon: <PlusCircle size={18} /> },
    { id: 'info-spy', label: 'Info Spy', icon: <Search size={18} /> },
    { id: 'lead-generator', label: 'Lead Generator', icon: <Users size={18} /> },
    { id: 'manage-builds', label: 'Manage Builds', icon: <FolderOpen size={18} /> },
    { id: 'templates', label: 'Templates', icon: <LayoutTemplate size={18} /> },
  ];

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-top">
        <a href="#" className="sidebar-brand" onClick={(e) => { e.preventDefault(); setActivePage('new-build'); }}>
          <div className="brand-logo flex items-center justify-center bg-accent/10 rounded-xl w-8 h-8 text-accent font-bold text-xl">H</div>
        </a>
        <button className="sidebar-toggle" onClick={toggleSidebar} title="Toggle sidebar">
          <Menu size={18} />
        </button>
      </div>

      <div className="sidebar-section flex-1">
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <a 
              key={item.id}
              href="#" 
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActivePage(item.id); }}
            >
              {item.icon}
              <span className="nav-label">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <nav className="sidebar-nav">
          <a 
            href="#" 
            className={`nav-item ${activePage === 'settings' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActivePage('settings'); }}
          >
            <Settings size={18} />
            <span className="nav-label">Settings</span>
          </a>
        </nav>
      </div>
    </aside>
  );
}
