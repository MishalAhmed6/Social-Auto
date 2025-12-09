import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { oauthAPI } from '../api/cloudFunctions';
import { useApp } from '../context/AppContext';
import '../styles/Accounts.css';

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'facebook', name: 'Facebook', icon: '👥' },
  { id: 'twitter', name: 'Twitter', icon: '🐦' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
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
        // Open OAuth URL in new window
        window.open(response.url, '_blank', 'width=600,height=700');
        showToast(`Opening ${platform} authorization...`, 'info');
      } else {
        throw new Error('No OAuth URL received');
      }
    } catch (error) {
      console.error('Error getting OAuth URL:', error);
      showToast(`Failed to connect ${platform}. Please try again.`, 'error');
    } finally {
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
      icon: '🔗',
    };
  };

  return (
    <div className="accounts-container">
      <div className="accounts-header">
        <h1>Connected Accounts</h1>
        <p>Manage your social media accounts</p>
      </div>

      <div className="accounts-section">
        <h2>Connect New Account</h2>
        <div className="platforms-grid">
          {platforms.map((platform) => {
            const isConnected = accounts.some((acc) => acc.platform === platform.id);
            return (
              <div key={platform.id} className="platform-card">
                <div className="platform-icon">{platform.icon}</div>
                <h3>{platform.name}</h3>
                {isConnected ? (
                  <span className="connected-badge">Connected</span>
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
          <p className="empty-state">No accounts connected yet.</p>
        ) : (
          <div className="accounts-list">
            {accounts.map((account) => {
              const platformInfo = getPlatformInfo(account.platform);
              return (
                <div key={account.id} className="account-card">
                  <div className="account-info">
                    <div className="account-icon">{platformInfo.icon}</div>
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
                    Disconnect
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

