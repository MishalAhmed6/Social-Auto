import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, signOut, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          Flacron Social Auto
        </Link>
        <div className="navbar-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/accounts">Accounts</Link>
          <Link to="/ai">AI Generator</Link>
          <Link to="/templates">Templates</Link>
          <Link to="/scheduler">Scheduler</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/billing">Billing</Link>
        </div>
        <div className="navbar-user">
          <span>{userProfile?.name || user.email}</span>
          <button className="btn btn-small" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

