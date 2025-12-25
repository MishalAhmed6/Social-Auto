import { useEffect, useState } from 'react';
import { FiInstagram, FiFacebook, FiTwitter, FiLinkedin, FiTrash2, FiCheck, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { oauthAPI } from '../api/cloudFunctions';
import { useApp } from '../context/AppContext';
import '../styles/Accounts.css';

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: FiInstagram, color: '#E4405F' },
  { id: 'facebook', name: 'Facebook', icon: FiFacebook, color: '#1877F2' },
  { id: 'twitter', name: 'Twitter', icon: FiTwitter, color: '#1DA1F2' },
  { id: 'linkedin', name: 'LinkedIn', icon: FiLinkedin, color: '#0077B5' },
];

const Accounts = () => {
  const { user } = useAuth();
  const { showToast } = useApp();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const accountsRef = collection(db, 'users', user.uid, 'socialAccounts');
    const unsubscribe = onSnapshot(accountsRef, (snapshot) => {
      const accountsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAccounts(accountsList);
    });

    return () => unsubscribe();
  }, [user]);

  const handleConnect = async (platform) => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await oauthAPI.getOAuthUrl(platform, user.uid);
      if (response.url) {
        // Open OAuth URL in new window with callback handler
        const popup = window.open(
          response.url,
          'oauth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Listen for OAuth completion
        const checkInterval = setInterval(() => {
          try {
            if (popup.closed) {
              clearInterval(checkInterval);
              setLoading(false);
              // Firestore listener will automatically update UI when account is added
            }
          } catch (e) {
            // Cross-origin error - popup might have redirected
            clearInterval(checkInterval);
            setLoading(false);
          }
        }, 500);

        // Cleanup after 5 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          setLoading(false);
        }, 300000);

        showToast(`Opening ${platform} authorization...`, 'info');
      } else {
        throw new Error('No OAuth URL received');
      }
    } catch (error) {
      console.error('Error getting OAuth URL:', error);
      let errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      
      // Provide more helpful error messages
      if (errorMessage.includes('not configured') || errorMessage.includes('OAuth')) {
        errorMessage = `${platform} OAuth is not configured. Please add OAuth credentials to functions/.env file. See OAUTH_SETUP.md for instructions.`;
      } else if (error.response?.status === 503) {
        errorMessage = error.response.data.error || errorMessage;
      } else if (error.response?.status === 404) {
        errorMessage = 'OAuth endpoint not found. Make sure Cloud Functions are running.';
      } else if (!error.response) {
        errorMessage = `Cannot reach server. Check that emulator is running and VITE_API_BASE_URL is correct.`;
      }
      
      showToast(`Failed to connect ${platform}: ${errorMessage}`, 'error');
      setLoading(false);
    }
  };

  const handleDisconnect = async (accountId) => {
    if (!user) return;

    if (!window.confirm('Are you sure you want to disconnect this account?')) {
      return;
    }

    try {
      const accountDocRef = doc(db, 'users', user.uid, 'socialAccounts', accountId);
      await deleteDoc(accountDocRef);
      showToast('Account disconnected successfully', 'success');
    } catch (error) {
      console.error('Error disconnecting account:', error);
      showToast('Failed to disconnect account. Please try again.', 'error');
    }
  };

  const getPlatformInfo = (platformId) => {
    return platforms.find((p) => p.id === platformId) || {
      id: platformId,
      name: platformId,
      icon: FiLinkedin,
      color: '#666',
    };
  };

  return (
    <div className="accounts-container">
      <div className="accounts-header">
        <div className="accounts-header-icon">
          <FiUsers />
        </div>
        <div>
          <h1>Connected Accounts</h1>
          <p>Manage your social media accounts</p>
        </div>
      </div>

      <div className="accounts-section">
        <h2>Connect New Account</h2>
        <div className="platforms-grid">
          {platforms.map((platform) => {
            const isConnected = accounts.some((acc) => acc.platform === platform.id);
            const Icon = platform.icon;
            return (
              <div key={platform.id} className="platform-card">
                <div className="platform-icon" style={{ color: platform.color }}>
                  <Icon />
                </div>
                <h3>{platform.name}</h3>
                {isConnected ? (
                  <span className="connected-badge">
                    <FiCheck /> Connected
                  </span>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleConnect(platform.id)}
                    disabled={loading}
                  >
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="accounts-section">
        <h2>Your Accounts</h2>
        {accounts.length === 0 ? (
          <div className="empty-state">
            <p style={{ marginBottom: '12px' }}>No accounts connected yet.</p>
            <p style={{ fontSize: '14px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
              Click "Connect" above to link your social media accounts. Make sure your Cloud Functions are deployed and OAuth redirect URLs are configured in your platform settings.
            </p>
          </div>
        ) : (
          <div className="accounts-list">
            {accounts.map((account) => {
              const platformInfo = getPlatformInfo(account.platform);
              const Icon = platformInfo.icon;
              return (
                <div key={account.id} className="account-card">
                  <div className="account-info">
                    <div className="account-icon" style={{ color: platformInfo.color }}>
                      <Icon />
                    </div>
                    <div>
                      <h3>{platformInfo.name}</h3>
                      <p className="account-name">{account.accountName || account.platform}</p>
                      {account.lastUpdated && (
                        <p className="account-meta">
                          Last updated: {new Date(account.lastUpdated).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDisconnect(account.id)}
                  >
                    <FiTrash2 /> Disconnect
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Accounts;

