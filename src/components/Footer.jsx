import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">Flacron Social Auto</h3>
            <p className="footer-description">
              Automate your social media presence with AI-powered content generation and scheduling.
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">Product</h4>
            <ul className="footer-links">
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/ai">AI Generator</Link></li>
              <li><Link to="/scheduler">Scheduler</Link></li>
              <li><Link to="/analytics">Analytics</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">Company</h4>
            <ul className="footer-links">
              <li><Link to="/billing">Pricing</Link></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#support">Support</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">Connect</h4>
            <div className="footer-social">
              <a href="#" aria-label="Twitter" className="footer-social-link">
                <FiTwitter />
              </a>
              <a href="#" aria-label="LinkedIn" className="footer-social-link">
                <FiLinkedin />
              </a>
              <a href="#" aria-label="GitHub" className="footer-social-link">
                <FiGithub />
              </a>
              <a href="#" aria-label="Email" className="footer-social-link">
                <FiMail />
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Flacron Social Auto. All rights reserved.
          </p>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <span className="footer-separator">•</span>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

