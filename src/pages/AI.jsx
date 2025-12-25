import { useState } from 'react';
import { FiZap, FiSave, FiCalendar, FiEdit2, FiX, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../api/cloudFunctions';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../components/Dropdown';
import '../styles/AI.css';

const tones = [
  'Professional',
  'Casual',
  'Friendly',
  'Humorous',
  'Inspirational',
  'Educational',
];

const nicheOptions = [
  'Fitness',
  'Technology',
  'Fashion',
  'Food & Beverage',
  'Travel',
  'Health & Wellness',
  'Beauty',
  'Education',
  'Business',
  'Entertainment',
  'Sports',
  'Real Estate',
  'Finance',
  'E-commerce',
  'Custom',
];

const goalOptions = [
  'Increase engagement',
  'Promote product',
  'Build brand awareness',
  'Drive website traffic',
  'Generate leads',
  'Share educational content',
  'Announce new feature',
  'Run promotion',
  'Build community',
  'Showcase testimonials',
  'Custom',
];

const platformOptions = [
  'All',
  'Instagram',
  'Facebook',
  'Twitter',
  'LinkedIn',
];

const AI = () => {
  const { user } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [platform, setPlatform] = useState('All');
  const [niche, setNiche] = useState('');
  const [nicheIsCustom, setNicheIsCustom] = useState(false);
  const [customNiche, setCustomNiche] = useState('');
  const [goal, setGoal] = useState('');
  const [goalIsCustom, setGoalIsCustom] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [tone, setTone] = useState('Professional');
  const [count, setCount] = useState(1);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editHashtags, setEditHashtags] = useState('');

  const handleNicheChange = (value) => {
    if (value === 'Custom') {
      setNicheIsCustom(true);
      setNiche('');
      setCustomNiche('');
    } else {
      setNicheIsCustom(false);
      setNiche(value);
      setCustomNiche('');
    }
  };

  const handleGoalChange = (value) => {
    if (value === 'Custom') {
      setGoalIsCustom(true);
      setGoal('');
      setCustomGoal('');
    } else {
      setGoalIsCustom(false);
      setGoal(value);
      setCustomGoal('');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    const finalNiche = nicheIsCustom ? customNiche : niche;
    const finalGoal = goalIsCustom ? customGoal : goal;
    
    if (!finalNiche || !finalGoal) {
      showToast('Please fill in niche and goal', 'error');
      return;
    }

    if (!user) {
      showToast('Please sign in to continue', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await aiAPI.generatePosts(user.uid, finalNiche, finalGoal, tone, count, platform);
      if (Array.isArray(response)) {
        setGeneratedPosts(response);
        showToast(`Generated ${response.length} posts!`, 'success');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating posts:', error);
      
      // Extract actual error message from API response
      let errorMessage = 'Failed to generate posts. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 403) {
        errorMessage = error.response.data?.error || 'Access denied. Please check your subscription or plan limits.';
      } else if (error.response?.status === 503) {
        errorMessage = error.response.data?.error || 'AI service is temporarily unavailable. Please try again later.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Invalid request. Please check your inputs.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsTemplate = async (post) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'postTemplates'), {
        title: post.title,
        captionText: post.captionText,
        hashtags: post.hashtags || [],
        createdAt: new Date().toISOString(),
      });
      showToast('Template saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving template:', error);
      showToast('Failed to save template. Please try again.', 'error');
    }
  };

  const handleSchedule = (post) => {
    navigate('/scheduler', {
      state: {
        prefillCaption: post.captionText,
        prefillHashtags: post.hashtags?.join(' ') || '',
      },
    });
  };

  const handleEdit = (post, index) => {
    setEditingPost(index);
    setEditTitle(post.title || '');
    setEditCaption(post.captionText || '');
    setEditHashtags(post.hashtags?.join(' ') || '');
  };

  const handleSaveEdit = () => {
    if (editingPost === null) return;

    const updatedPosts = [...generatedPosts];
    updatedPosts[editingPost] = {
      ...updatedPosts[editingPost],
      title: editTitle,
      captionText: editCaption,
      hashtags: editHashtags.split(' ').filter((tag) => tag.trim()),
    };
    setGeneratedPosts(updatedPosts);
    setEditingPost(null);
    showToast('Post updated!', 'success');
  };

  const handleDelete = (index) => {
    const updatedPosts = generatedPosts.filter((_, i) => i !== index);
    setGeneratedPosts(updatedPosts);
    showToast('Post removed', 'success');
  };

  return (
    <div className="ai-container">
      <div className="ai-header">
        <div className="ai-header-icon">
          <FiZap />
        </div>
        <h1>AI Content Generator</h1>
        <p>Generate engaging social media posts with AI</p>
      </div>

      <div className="ai-form-section">
        <form onSubmit={handleGenerate} className="ai-form">
          <div className="form-row">
            <div className="form-group">
              <Dropdown
                label="Platform"
                value={platform}
                onChange={setPlatform}
                options={platformOptions}
                placeholder="Select platform"
                required
              />
            </div>

            <div className="form-group">
              {!nicheIsCustom ? (
                <Dropdown
                  label="Niche / Industry"
                  value={niche}
                  onChange={handleNicheChange}
                  options={nicheOptions}
                  placeholder="Select niche or choose custom"
                  required
                />
              ) : (
                <div>
                  <label htmlFor="customNiche">Niche / Industry (Custom)</label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-end' }}>
                    <input
                      type="text"
                      id="customNiche"
                      value={customNiche}
                      onChange={(e) => setCustomNiche(e.target.value)}
                      placeholder="Enter your custom niche"
                      required
                      className="input"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setNicheIsCustom(false);
                        setCustomNiche('');
                        setNiche('');
                      }}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              {!goalIsCustom ? (
                <Dropdown
                  label="Content Goal"
                  value={goal}
                  onChange={handleGoalChange}
                  options={goalOptions}
                  placeholder="Select goal or choose custom"
                  required
                />
              ) : (
                <div>
                  <label htmlFor="customGoal">Content Goal (Custom)</label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-end' }}>
                    <input
                      type="text"
                      id="customGoal"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      placeholder="Enter your custom goal"
                      required
                      className="input"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setGoalIsCustom(false);
                        setCustomGoal('');
                        setGoal('');
                      }}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <Dropdown
                label="Tone"
                value={tone}
                onChange={setTone}
                options={tones}
                placeholder="Select tone"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="count">Number of Posts</label>
              <input
                type="number"
                id="count"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                min="1"
                max="10"
                required
                className="input"
              />
            </div>
            <div className="form-group"></div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FiZap /> {loading ? 'Generating...' : 'Generate Posts'}
          </button>
        </form>
      </div>

      {generatedPosts.length > 0 && (
        <div className="ai-results-section">
          <h2>Generated Posts ({generatedPosts.length})</h2>
          <div className="posts-grid">
            {generatedPosts.map((post, index) => (
              <div key={index} className="post-card">
                {editingPost === index ? (
                  <div className="edit-mode">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title"
                      className="edit-input"
                    />
                    <textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Caption"
                      className="edit-textarea"
                      rows="4"
                    />
                    <input
                      type="text"
                      value={editHashtags}
                      onChange={(e) => setEditHashtags(e.target.value)}
                      placeholder="Hashtags (space-separated)"
                      className="edit-input"
                    />
                    <div className="edit-actions">
                      <button
                        className="btn btn-primary"
                        onClick={handleSaveEdit}
                      >
                        <FiCheck /> Save
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setEditingPost(null)}
                      >
                        <FiX /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{post.title || `Post ${index + 1}`}</h3>
                    <p className="post-caption">{post.captionText}</p>
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="post-hashtags">
                        {post.hashtags.map((tag, idx) => (
                          <span key={idx} className="hashtag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="post-actions">
                      <button
                        className="btn btn-small"
                        onClick={() => handleEdit(post, index)}
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button
                        className="btn btn-small"
                        onClick={() => handleSaveAsTemplate(post)}
                      >
                        <FiSave /> Save Template
                      </button>
                      <button
                        className="btn btn-small"
                        onClick={() => handleSchedule(post)}
                      >
                        <FiCalendar /> Schedule
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(index)}
                      >
                        <FiX /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AI;

