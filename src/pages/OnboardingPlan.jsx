import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { stripeAPI } from '../api/cloudFunctions';
import { useApp } from '../context/AppContext';
import '../styles/Onboarding.css';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for individuals getting started',
    features: [
      '3 social accounts',
      '10 AI generations/month',
      '10 scheduled posts/month',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$59',
    period: '/month',
    description: 'For growing businesses',
    features: [
      '10 social accounts',
      '150 AI generations/month',
      'Unlimited scheduled posts',
      'Priority support',
      'Analytics dashboard',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$149',
    period: '/month',
    description: 'For agencies managing multiple clients',
    features: [
      '30 social accounts',
      'Unlimited AI generations',
      'Unlimited scheduled posts',
      'Dedicated support',
      'Advanced analytics',
      'Team collaboration',
    ],
  },
];

const OnboardingPlan = () => {
  const { user } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Check if API URL is configured
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const isApiConfigured = apiBaseUrl && !apiBaseUrl.includes('<project>') && apiBaseUrl !== 'http://localhost:5001/<project>/us-central1';

  const handleSelectPlan = async (planId) => {
    if (!user) {
      showToast('Please sign in to continue', 'error');
      return;
    }

    // Check if API is configured
    if (!isApiConfigured) {
      showToast(
        'Cloud Functions API not configured. Please set VITE_API_BASE_URL in .env.local with your Cloud Functions URL.',
        'error'
      );
      console.error('API Base URL not configured:', apiBaseUrl);
      return;
    }

    setLoading(true);
    try {
      const response = await stripeAPI.createCheckoutSession(user.uid, planId);
      if (response.url) {
        // Open Stripe checkout in new tab
        window.open(response.url, '_blank');
        showToast('Redirecting to checkout...', 'info');
        // Note: After checkout, backend webhook will update subscription
        // User should refresh or return to dashboard
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to start checkout. ';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 404) {
          errorMessage += 'Checkout endpoint not found. Please ensure Cloud Functions are deployed.';
        } else if (status === 401 || status === 403) {
          errorMessage += 'Authentication failed. Please sign in again.';
        } else if (status === 500) {
          errorMessage += 'Server error. Please try again later or contact support.';
        } else if (status === 503) {
          // Stripe not configured - allow user to skip
          errorMessage = 'Stripe checkout is not configured. You can skip plan selection for now and continue to the dashboard.';
        } else if (data?.error) {
          errorMessage += data.error;
        } else {
          errorMessage += `Server returned error (${status}).`;
        }
      } else if (error.request) {
        // Request was made but no response received
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'not set';
        const fullUrl = error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown';
        
        errorMessage += `Cannot reach server. `;
        errorMessage += `Trying to connect to: ${fullUrl}. `;
        errorMessage += 'Please verify: 1) VITE_API_BASE_URL in .env.local matches your Cloud Functions URL, 2) Cloud Functions are deployed, 3) No firewall/CORS blocking.';
        
        console.error('Request sent but no response received:', {
          fullURL: fullUrl,
          baseURL: error.config?.baseURL,
          endpoint: error.config?.url,
          method: error.config?.method,
          apiBaseURL: apiUrl,
          code: error.code, // 'ECONNABORTED' for timeout, 'ERR_NETWORK' for network error
        });
        
        // Check if it's a timeout
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. The server may be slow or unreachable.';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Network error. Check your internet connection and ensure Cloud Functions URL is correct.';
        }
      } else if (error.message) {
        // Something else happened
        if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
          errorMessage += 'Network error. Please check VITE_API_BASE_URL in .env.local and ensure Cloud Functions are accessible.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please try again or contact support.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card plan-selection">
        <h1>Choose Your Plan</h1>
        <p className="onboarding-subtitle">
          Select a plan that fits your needs. You can change it later.
        </p>

        <div className="plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <h3>{plan.name}</h3>
              <div className="plan-price">
                <span className="price">{plan.price}</span>
                <span className="period">{plan.period}</span>
              </div>
              <p className="plan-description">{plan.description}</p>
              <ul className="plan-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPlan(plan.id);
                }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleSkip}
          style={{ marginTop: '20px' }}
        >
          Skip for now
        </button>

        <div className="plan-note" style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <p style={{ marginBottom: '8px' }}>
            After completing checkout, return here and refresh to continue.
          </p>
          
          {!isApiConfigured && (
            <div style={{ fontSize: '12px', color: '#e65100', marginTop: '12px', padding: '12px', background: '#fff3e0', borderRadius: '6px', border: '1px solid #ff9800' }}>
              <p style={{ marginBottom: '8px', fontWeight: '600' }}>
                ⚠️ Cloud Functions Not Configured
              </p>
              <p style={{ marginBottom: '4px' }}>
                To enable plan selection, you need to:
              </p>
              <ol style={{ marginLeft: '20px', marginTop: '8px' }}>
                <li>Deploy Cloud Functions with Stripe integration</li>
                <li>Set <code style={{ background: '#fff', padding: '2px 4px', borderRadius: '3px' }}>VITE_API_BASE_URL</code> in <code style={{ background: '#fff', padding: '2px 4px', borderRadius: '3px' }}>.env.local</code></li>
                <li>Configure Stripe API keys in your Cloud Function environment</li>
              </ol>
              <p style={{ marginTop: '8px', fontSize: '11px' }}>
                Current API URL: <code style={{ background: '#fff', padding: '2px 4px' }}>{apiBaseUrl || 'Not set'}</code>
              </p>
            </div>
          )}
          
          {isApiConfigured && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
              <p style={{ marginBottom: '4px' }}>
                <strong>API Configuration:</strong>
              </p>
              <p style={{ margin: '4px 0', fontFamily: 'monospace', fontSize: '11px' }}>
                {apiBaseUrl}
              </p>
              <p style={{ marginTop: '8px', fontSize: '11px' }}>
                If checkout fails, verify this URL points to your deployed Cloud Functions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPlan;

