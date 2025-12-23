import { Link } from 'react-router-dom';
import { 
  FiZap, 
  FiUsers, 
  FiCalendar, 
  FiBarChart2, 
  FiCheck, 
  FiArrowRight,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiLinkedin
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import '../styles/Landing.css';

const Landing = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: FiZap,
      title: 'AI-Powered Content',
      description: 'Generate engaging social media posts in seconds with advanced AI technology.',
    },
    {
      icon: FiCalendar,
      title: 'Smart Scheduling',
      description: 'Schedule posts across multiple platforms with our intuitive calendar interface.',
    },
    {
      icon: FiUsers,
      title: 'Multi-Platform',
      description: 'Connect and manage Instagram, Facebook, Twitter, and LinkedIn all in one place.',
    },
    {
      icon: FiBarChart2,
      title: 'Analytics Dashboard',
      description: 'Track performance and engagement metrics to optimize your social media strategy.',
    },
  ];

  const platforms = [
    { icon: FiInstagram, name: 'Instagram' },
    { icon: FiFacebook, name: 'Facebook' },
    { icon: FiTwitter, name: 'Twitter' },
    { icon: FiLinkedin, name: 'LinkedIn' },
  ];

  const benefits = [
    'Save 10+ hours per week on content creation',
    'Maintain consistent brand voice across platforms',
    'Schedule posts weeks in advance',
    'Track performance with detailed analytics',
    'Manage multiple accounts from one dashboard',
  ];

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="hero-content">
            <h1 className="hero-title">
              FLACRON SOCIAL AUTO
            </h1>
            <p className="hero-subtitle">
              Professional social media automation with AI-powered precision. 
              Generate content, schedule posts, and manage multiple accounts — all in one platform.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  Go to Dashboard <FiArrowRight />
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-large">
                    Get Started Now
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-large">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value">10,000+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">1M+</div>
                <div className="stat-label">Posts Scheduled</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">50+</div>
                <div className="stat-label">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need to Automate Your Social Media</h2>
            <p className="section-subtitle">
              Powerful features designed to save you time and grow your online presence
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <Icon />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="section-header">
            <h2 className="section-title">Connect Your Favorite Platforms</h2>
            <p className="section-subtitle">
              Manage all your social media accounts from one unified dashboard
            </p>
          </div>
          <div className="platforms-grid">
            {platforms.map((platform, index) => {
              const Icon = platform.icon;
              return (
                <div key={index} className="platform-card">
                  <div className="platform-icon">
                    <Icon />
                  </div>
                  <h3 className="platform-name">{platform.name}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="section-title">Why Choose Flacron Social Auto?</h2>
              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <li key={index} className="benefit-item">
                    <FiCheck className="benefit-icon" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              {!user && (
                <Link to="/signup" className="btn btn-primary btn-large">
                  Get Started Now <FiArrowRight />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Social Media Strategy?</h2>
            <p className="cta-subtitle">
              Join thousands of professionals and businesses who trust Flacron Social Auto.
            </p>
            {!user ? (
              <Link to="/signup" className="btn btn-primary btn-large">
                Get Started Now <FiArrowRight />
              </Link>
            ) : (
              <Link to="/dashboard" className="btn btn-primary btn-large">
                Go to Dashboard <FiArrowRight />
              </Link>
            )}
            <div className="cta-features">
              <span>• 30-second setup</span>
              <span>• Professional-grade automation</span>
              <span>• Instant AI content generation</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

