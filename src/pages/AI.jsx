import { useState } from 'react';
import { FiZap, FiSave, FiCalendar, FiEdit2, FiX, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../api/cloudFunctions';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AI.css';

const tones = [
  'Professional',
  'Casual',
  'Friendly',
  'Humorous',
  'Inspirational',
  'Educational',
];

const AI = () => {
  const { user } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [niche, setNiche] = useState('');
  const [goal, setGoal] = useState('');
  const [tone, setTone] = useState('Professional');
  const [count, setCount] = useState(7);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editHashtags, setEditHashtags] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!niche || !goal) {
      showToast('Please fill in niche and goal', 'error');
      return;
    }

    if (!user) {
      showToast('Please sign in to continue', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await aiAPI.generatePosts(user.uid, niche, goal, tone, count);
      if (Array.isArray(response)) {
        setGeneratedPosts(response);
        showToast(`Generated ${response.length} posts!`, 'success');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating posts:', error);
      showToast(
        'Failed to generate posts. Please check your plan limits or try again.',
        'error'
      );
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
              <label htmlFor="niche">Niche / Industry</label>
              <input
                type="text"
                id="niche"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g., Fitness, Tech, Fashion"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="goal">Content Goal</label>
              <input
                type="text"
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Increase engagement, Promote product"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tone">Tone</label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                {tones.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="count">Number of Posts</label>
              <input
                type="number"
                id="count"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                min="7"
                max="30"
                required
              />
            </div>
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

