import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FiUsers, FiCreditCard, FiCalendar, FiZap, FiFileText, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { stripeAPI } from '../api/cloudFunctions';
import { useApp } from '../context/AppContext';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [connectedAccountsCount, setConnectedAccountsCount] = useState(0);
  const [nextScheduledPost, setNextScheduledPost] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    // Check if redirected from successful checkout (only sync once)
    const checkoutSuccess = searchParams.get('checkout');
    if (checkoutSuccess === 'success' && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      
      // Remove checkout param from URL to prevent re-syncing on refresh
      navigate('/dashboard', { replace: true });
      
      // Sync subscription after checkout
      stripeAPI.syncSubscription(user.uid)
        .then((response) => {
          console.log('Sync response:', response);
          showToast('Subscription synced successfully!', 'success');
          // Reload subscription after a short delay
          setTimeout(() => {
            loadSubscription();
          }, 1000);
        })
        .catch((error) => {
          console.error('Error syncing subscription:', error);
          console.error('Error details:', error.response?.data || error.message);
          // Try to reload anyway in case it was written
          setTimeout(() => {
            loadSubscription();
          }, 1000);
          showToast(error.response?.data?.error || 'Syncing subscription... Please refresh if it doesn\'t appear.', 'info');
        });
    }

    // Load connected accounts count
    const loadAccounts = async () => {
      try {
        const accountsRef = collection(db, 'users', user.uid, 'socialAccounts');
        const accountsSnap = await getDocs(accountsRef);
        setConnectedAccountsCount(accountsSnap.size);
      } catch (error) {
        console.error('Error loading accounts:', error);
      }
    };

    // Load next scheduled post
    const loadNextPost = async () => {
      try {
        const postsRef = collection(db, 'users', user.uid, 'scheduledPosts');
        const q = query(postsRef, orderBy('scheduledAt', 'asc'), limit(1));
        const postsSnap = await getDocs(q);
        if (!postsSnap.empty) {
          const post = postsSnap.docs[0].data();
          setNextScheduledPost(post);
        }
      } catch (error) {
        console.error('Error loading next post:', error);
      }
    };


    loadAccounts();
    loadNextPost();
    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    try {
      const subDocRef = doc(db, 'subscriptions', user.uid);
      const subDocSnap = await getDoc(subDocRef);
      console.log('Subscription doc exists:', subDocSnap.exists());
      if (subDocSnap.exists()) {
        const data = subDocSnap.data();
        console.log('Subscription data:', data);
        setSubscription(data);
      } else {
        console.log('No subscription document found for user:', user.uid);
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      console.error('Error details:', error.message);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {userProfile?.name || user?.email}</p>
      </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="dashboard-card-icon">
                <FiUsers />
              </div>
              <h3>Connected Accounts</h3>
              <div className="card-value">{connectedAccountsCount}</div>
              <Link to="/accounts" className="card-link">
                Manage Accounts <FiArrowRight />
              </Link>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-icon">
                <FiCreditCard />
              </div>
              <h3>Current Plan</h3>
              <div className="card-value">
                {subscription?.planId ? subscription.planId.charAt(0).toUpperCase() + subscription.planId.slice(1) : 'No plan'}
              </div>
              {subscription?.status && (
                <div style={{ fontSize: '12px', color: subscription.status === 'active' ? '#4caf50' : '#999', marginTop: '4px' }}>
                  {subscription.status}
                </div>
              )}
              <Link to="/billing" className="card-link">
                View Billing <FiArrowRight />
              </Link>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-icon">
                <FiCalendar />
              </div>
              <h3>Next Scheduled Post</h3>
              <div className="card-value">
                {nextScheduledPost
                  ? new Date(nextScheduledPost.scheduledAt).toLocaleDateString()
                  : 'None'}
              </div>
              <Link to="/scheduler" className="card-link">
                View Scheduler <FiArrowRight />
              </Link>
            </div>
          </div>

      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
            <div className="actions-grid">
              <Link to="/ai" className="action-card">
                <div className="action-card-icon">
                  <FiZap />
                </div>
                <h3>Create AI Post</h3>
                <p>Generate content with AI</p>
              </Link>
              <Link to="/accounts" className="action-card">
                <div className="action-card-icon">
                  <FiUsers />
                </div>
                <h3>Connect Account</h3>
                <p>Add a social media account</p>
              </Link>
              <Link to="/templates" className="action-card">
                <div className="action-card-icon">
                  <FiFileText />
                </div>
                <h3>Go to Templates</h3>
                <p>Manage your post templates</p>
              </Link>
            </div>
      </div>
    </div>
  );
};

export default Dashboard;

