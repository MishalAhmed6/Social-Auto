import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className={`layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      <div className="layout-main">
        <Navbar />
        <main className="layout-content">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;

