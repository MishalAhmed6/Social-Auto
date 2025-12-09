import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const [connectedAccountsCount, setConnectedAccountsCount] = useState(0);
  const [nextScheduledPost, setNextScheduledPost] = useState(null);
  const [subscription, setSubscription] = useState(null);

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

    // Load subscription info
    const loadSubscription = async () => {
      try {
        const subDocRef = doc(db, 'subscriptions', user.uid);
        const subDocSnap = await getDoc(subDocRef);
        if (subDocSnap.exists()) {
          setSubscription(subDocSnap.data());
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      }
    };

    loadAccounts();
    loadNextPost();
    loadSubscription();
  }, [user]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {userProfile?.name || user?.email}</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Connected Accounts</h3>
          <div className="card-value">{connectedAccountsCount}</div>
          <Link to="/accounts" className="card-link">
            Manage Accounts →
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>Current Plan</h3>
          <div className="card-value">
            {subscription?.planId || 'No plan'}
          </div>
          <Link to="/billing" className="card-link">
            View Billing →
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>Next Scheduled Post</h3>
          <div className="card-value">
            {nextScheduledPost
              ? new Date(nextScheduledPost.scheduledAt).toLocaleDateString()
              : 'None'}
          </div>
          <Link to="/scheduler" className="card-link">
            View Scheduler →
          </Link>
        </div>
      </div>

      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/ai" className="action-card">
            <h3>Create AI Post</h3>
            <p>Generate content with AI</p>
          </Link>
          <Link to="/accounts" className="action-card">
            <h3>Connect Account</h3>
            <p>Add a social media account</p>
          </Link>
          <Link to="/templates" className="action-card">
            <h3>Go to Templates</h3>
            <p>Manage your post templates</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

