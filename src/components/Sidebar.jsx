import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiLayout, 
  FiUsers, 
  FiZap, 
  FiFileText, 
  FiCalendar, 
  FiBarChart2, 
  FiCreditCard,
  FiChevronLeft,
  FiChevronRight,
  FiMenu
} from 'react-icons/fi';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: FiLayout, label: 'Dashboard' },
    { path: '/accounts', icon: FiUsers, label: 'Accounts' },
    { path: '/ai', icon: FiZap, label: 'AI Generator' },
    { path: '/templates', icon: FiFileText, label: 'Templates' },
    { path: '/scheduler', icon: FiCalendar, label: 'Scheduler' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
    { path: '/billing', icon: FiCreditCard, label: 'Billing' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && (
          <Link to="/dashboard" className="sidebar-logo">
            <FiZap className="sidebar-logo-icon" />
            <span>Flacron</span>
          </Link>
        )}
        <button 
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-menu-item ${isActive(item.path) ? 'active' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className="sidebar-menu-icon" />
                  {!isCollapsed && <span className="sidebar-menu-label">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

