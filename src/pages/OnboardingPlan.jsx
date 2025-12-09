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
      '5 AI posts per month',
      '1 connected account',
      'Basic scheduling',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79',
    period: '/month',
    description: 'For growing businesses',
    features: [
      '50 AI posts per month',
      '5 connected accounts',
      'Advanced scheduling',
      'Priority support',
      'Analytics dashboard',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$199',
    period: '/month',
    description: 'For agencies managing multiple clients',
    features: [
      'Unlimited AI posts',
      'Unlimited accounts',
      'White-label options',
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

  const handleSelectPlan = async (planId) => {
    if (!user) {
      showToast('Please sign in to continue', 'error');
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
      showToast(
        'Failed to start checkout. Please try again or contact support.',
        'error'
      );
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

        <p className="plan-note" style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          After completing checkout, return here and refresh to continue.
        </p>
      </div>
    </div>
  );
};

export default OnboardingPlan;

