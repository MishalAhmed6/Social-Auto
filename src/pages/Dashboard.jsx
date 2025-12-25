import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FiUsers, FiCreditCard, FiCalendar, FiZap, FiFileText, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
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
  const unsubscribeRef = useRef(null);

  // Load subscription data
  const loadSubscription = async () => {
    if (!user) return;
    try {
      const subDocRef = doc(db, 'subscriptions', user.uid);
      const subDocSnap = await getDoc(subDocRef);
      if (subDocSnap.exists()) {
        const data = subDocSnap.data();
        console.log('Subscription data loaded:', data);
        setSubscription(data);
      } else {
        console.log('No subscription document found');
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscription(null);
    }
  };

  // Handle checkout sync
  useEffect(() => {
    if (!user) return;

    const checkoutSuccess = searchParams.get('checkout');
    if (checkoutSuccess === 'success' && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      navigate('/dashboard', { replace: true });
      
      stripeAPI.syncSubscription(user.uid)
        .then((response) => {
          console.log('Sync response:', response);
          showToast('Subscription synced successfully!', 'success');
          // Reload subscription after sync
          setTimeout(() => {
            loadSubscription();
          }, 1500);
        })
        .catch((error) => {
          console.error('Error syncing subscription:', error);
          showToast(error.response?.data?.error || 'Syncing subscription...', 'info');
          // Try to reload anyway
          setTimeout(() => {
            loadSubscription();
          }, 1500);
        });
    }
  }, [user, searchParams, navigate, showToast]);

  // Main data loading effect
  useEffect(() => {
    if (!user) return;

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

    // Set up subscription listener with proper cleanup
    let unsubscribe = null;
    try {
      const subDocRef = doc(db, 'subscriptions', user.uid);
      unsubscribe = onSnapshot(
        subDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Subscription updated:', data);
            setSubscription(data);
          } else {
            setSubscription(null);
          }
        },
        (error) => {
          console.error('Subscription listener error:', error);
          // Fallback to manual load on error
          loadSubscription();
        }
      );
      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error('Error setting up subscription listener:', error);
      // Fallback to manual load
      loadSubscription();
    }

    loadAccounts();
    loadNextPost();
    loadSubscription();

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user]);

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

