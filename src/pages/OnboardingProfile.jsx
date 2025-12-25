import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useApp } from '../context/AppContext';
import Dropdown from '../components/Dropdown';
import '../styles/Onboarding.css';

const businessCategories = [
  'E-commerce',
  'SaaS',
  'Agency',
  'Personal Brand',
  'Non-profit',
  'Education',
  'Healthcare',
  'Real Estate',
  'Food & Beverage',
  'Fitness',
  'Other',
];

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

const OnboardingProfile = () => {
  const { user, userProfile, loadUserProfile } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [timezone, setTimezone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setBusinessCategory(userProfile.businessCategory || '');
      setTimezone(userProfile.timezone || '');
    } else if (user) {
      setName(user.displayName || '');
    }
  }, [user, userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !businessCategory || !timezone) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        name,
        businessCategory,
        timezone,
        updatedAt: new Date().toISOString(),
      });

      await loadUserProfile(user.uid);
      showToast('Profile updated successfully!', 'success');
      navigate('/onboarding/plan');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h1>Complete Your Profile</h1>
        <p className="onboarding-subtitle">Tell us a bit about yourself</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="input"
            />
          </div>

          <div className="form-group">
            <Dropdown
              label="Business Category"
              value={businessCategory}
              onChange={setBusinessCategory}
              options={businessCategories}
              placeholder="Select a category"
              required
            />
          </div>

          <div className="form-group">
            <Dropdown
              label="Timezone"
              value={timezone}
              onChange={setTimezone}
              options={timezones}
              placeholder="Select your timezone"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingProfile;

