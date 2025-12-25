import { useEffect, useState } from 'react';
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
  FiLinkedin,
  FiTrendingUp,
  FiClock,
  FiShield,
  FiGlobe
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import '../styles/Landing.css';

const Landing = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Add scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.feature-card, .platform-card, .how-it-works-card, .benefit-item');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const features = [
    {
      icon: FiZap,
      title: 'AI-Powered Content Generation',
      description: 'Create compelling social media posts in seconds using cutting-edge AI. Choose from professional, casual, humorous, or inspirational tones tailored to your brand voice.',
      color: '#FF6B35',
    },
    {
      icon: FiCalendar,
      title: 'Smart Post Scheduling',
      description: 'Plan and schedule your content weeks in advance. Our intelligent calendar helps you maintain consistent posting across all your social platforms.',
      color: '#3B82F6',
    },
    {
      icon: FiUsers,
      title: 'Multi-Platform Management',
      description: 'Connect Instagram, Facebook, Twitter, and LinkedIn from one unified dashboard. Manage multiple accounts effortlessly.',
      color: '#10B981',
    },
    {
      icon: FiBarChart2,
      title: 'Performance Analytics',
      description: 'Track engagement, reach, and performance metrics. Make data-driven decisions to grow your social media presence.',
      color: '#8B5CF6',
    },
    {
      icon: FiTrendingUp,
      title: 'Growth Optimization',
      description: 'AI-powered insights help you identify the best times to post and optimize your content strategy for maximum engagement.',
      color: '#F59E0B',
    },
    {
      icon: FiShield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security ensures your accounts and data are protected. OAuth 2.0 authentication keeps everything safe.',
      color: '#EF4444',
    },
  ];

  const platforms = [
    { icon: FiInstagram, name: 'Instagram' },
    { icon: FiFacebook, name: 'Facebook' },
    { icon: FiTwitter, name: 'Twitter' },
    { icon: FiLinkedin, name: 'LinkedIn' },
  ];

  const benefits = [
    'Save 10+ hours per week on content creation and scheduling',
    'Maintain consistent brand voice across all platforms automatically',
    'Schedule posts weeks in advance with our intuitive calendar',
    'Track performance with real-time analytics and insights',
    'Manage unlimited accounts from one unified dashboard',
    'Generate unlimited AI content with premium plans',
    'Access professional templates and content libraries',
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Sign Up & Connect',
      description: 'Create your account in 30 seconds and connect your social media profiles securely.',
    },
    {
      step: '02',
      title: 'Generate Content',
      description: 'Use AI to create engaging posts tailored to your niche, goals, and preferred tone.',
    },
    {
      step: '03',
      title: 'Schedule & Publish',
      description: 'Plan your content calendar and let Flacron automatically publish at optimal times.',
    },
    {
      step: '04',
      title: 'Analyze & Grow',
      description: 'Track performance metrics and optimize your strategy with data-driven insights.',
    },
  ];

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-background"></div>
        <div className="landing-container">
          <div className={`hero-content ${isVisible ? 'fade-in-up' : ''}`}>
            <div className="hero-badge">
              <FiGlobe /> Trusted by 10,000+ businesses worldwide
            </div>
            <h1 className="hero-title">
              Automate Your Social Media
              <span className="gradient-text"> with AI Power</span>
            </h1>
            <p className="hero-subtitle">
              The all-in-one platform that transforms how you create, schedule, and manage social media content. 
              Generate AI-powered posts, schedule across multiple platforms, and track performance — all from one intuitive dashboard.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  Go to Dashboard <FiArrowRight />
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-large">
                    Get Started Free <FiArrowRight />
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-large">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <div className="hero-separator"></div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value" data-count="10000">10,000+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" data-count="1000000">1M+</div>
                <div className="stat-label">Posts Scheduled</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" data-count="50">50+</div>
                <div className="stat-label">Countries</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" data-count="99">99.9%</div>
                <div className="stat-label">Uptime</div>
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
                <div 
                  key={index} 
                  className="feature-card"
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    '--feature-color': feature.color 
                  }}
                >
                  <div className="feature-icon" style={{ background: `${feature.color}15`, color: feature.color }}>
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

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Social Media Strategy?</h2>
            <p className="cta-subtitle">
              Join thousands of professionals and businesses who trust Flacron Social Auto.
            </p>
            {!user ? (
              <Link to="/signup" className="btn btn-primary btn-large btn-glow">
                Get Started Free <FiArrowRight />
              </Link>
            ) : (
              <Link to="/dashboard" className="btn btn-primary btn-large btn-glow">
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

