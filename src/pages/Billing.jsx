import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { stripeAPI } from '../api/cloudFunctions';
import { useApp } from '../context/AppContext';
import '../styles/Billing.css';

const Billing = () => {
  const { user } = useAuth();
  const { showToast } = useApp();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const subDocRef = doc(db, 'subscriptions', user.uid);
    const unsubscribe = onSnapshot(subDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setSubscription(docSnap.data());
      } else {
        setSubscription(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleManageBilling = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await stripeAPI.getBillingPortalUrl(user.uid);
      if (response.url) {
        window.open(response.url, '_blank');
        showToast('Opening billing portal...', 'info');
      } else {
        throw new Error('No billing portal URL received');
      }
    } catch (error) {
      console.error('Error getting billing portal URL:', error);
      showToast(
        'Failed to open billing portal. Please try again or contact support.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="billing-container">
      <div className="billing-header">
        <h1>Billing & Subscription</h1>
        <p>Manage your subscription and billing</p>
      </div>

      <div className="billing-content">
        {subscription ? (
          <div className="subscription-card">
            <h2>Current Plan</h2>
            <div className="plan-info">
              <div className="plan-name">{subscription.planId || 'Unknown Plan'}</div>
              {subscription.status && (
                <span className={`plan-status plan-status-${subscription.status}`}>
                  {subscription.status}
                </span>
              )}
            </div>

            {subscription.currentPeriodEnd && (
              <div className="plan-details">
                <p>
                  <strong>Renews on:</strong>{' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            )}

            {subscription.limits && (
              <div className="plan-limits">
                <h3>Plan Limits</h3>
                <ul>
                  {subscription.limits.aiPostsPerMonth && (
                    <li>AI Posts: {subscription.limits.aiPostsPerMonth} per month</li>
                  )}
                  {subscription.limits.connectedAccounts && (
                    <li>
                      Connected Accounts: {subscription.limits.connectedAccounts}
                    </li>
                  )}
                </ul>
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handleManageBilling}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Manage Billing'}
            </button>
          </div>
        ) : (
          <div className="no-subscription">
            <p>You don't have an active subscription.</p>
            <p>Choose a plan to get started with Flacron Social Auto.</p>
            <a href="/onboarding/plan" className="btn btn-primary">
              View Plans
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;

