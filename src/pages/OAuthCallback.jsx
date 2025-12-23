import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/Auth.css';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const platform = searchParams.get('platform') || searchParams.get('state');

    if (error) {
      showToast(`OAuth error: ${error}`, 'error');
      setTimeout(() => {
        window.close();
        navigate('/accounts');
      }, 2000);
      return;
    }

    if (code) {
      // Success - the backend Cloud Function should handle the code exchange
      showToast('Account connected successfully!', 'success');
      setTimeout(() => {
        window.close();
        navigate('/accounts');
      }, 2000);
    } else {
      // No code or error - something went wrong
      showToast('OAuth authorization incomplete', 'error');
      setTimeout(() => {
        window.close();
        navigate('/accounts');
      }, 2000);
    }
  }, [searchParams, navigate, showToast]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Connecting Account...</h1>
        <p className="auth-subtitle">Please wait while we connect your account.</p>
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;

