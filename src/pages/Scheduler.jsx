import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import '../styles/Scheduler.css';

const Scheduler = () => {
  const { user, userProfile } = useAuth();
  const { showToast } = useApp();
  const location = useLocation();
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

  // Form state
  const [formPlatform, setFormPlatform] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');

  useEffect(() => {
    if (!user) return;

    // Load scheduled posts
    const postsRef = collection(db, 'users', user.uid, 'scheduledPosts');
    const q = query(postsRef, orderBy('scheduledAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setScheduledPosts(postsList);
    });

    // Load connected accounts
    const accountsRef = collection(db, 'users', user.uid, 'socialAccounts');
    getDocs(accountsRef).then((snapshot) => {
      const accountsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConnectedAccounts(accountsList);
      if (accountsList.length > 0 && !formPlatform) {
        setFormPlatform(accountsList[0].platform);
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    // Pre-fill from navigation state (from AI or Templates)
    if (location.state?.prefillCaption) {
      setFormCaption(location.state.prefillCaption);
      if (location.state.prefillHashtags) {
        setFormCaption((prev) => `${prev}\n\n${location.state.prefillHashtags}`);
      }
      setShowModal(true);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !formPlatform || !formCaption || !formDate || !formTime) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const scheduledDateTime = new Date(`${formDate}T${formTime}`);
      const postData = {
        platform: formPlatform,
        captionText: formCaption,
        mediaUrl: formMediaUrl || null,
        scheduledAt: scheduledDateTime.toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      if (editingPost) {
        const postDocRef = doc(db, 'users', user.uid, 'scheduledPosts', editingPost);
        await updateDoc(postDocRef, {
          ...postData,
          updatedAt: new Date().toISOString(),
        });
        showToast('Post updated successfully!', 'success');
      } else {
        await addDoc(collection(db, 'users', user.uid, 'scheduledPosts'), postData);
        showToast('Post scheduled successfully!', 'success');
      }

      // Reset form
      setShowModal(false);
      setEditingPost(null);
      setFormCaption('');
      setFormMediaUrl('');
      setFormDate('');
      setFormTime('');
    } catch (error) {
      console.error('Error saving scheduled post:', error);
      showToast('Failed to save post. Please try again.', 'error');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post.id);
    setFormPlatform(post.platform);
    setFormCaption(post.captionText);
    setFormMediaUrl(post.mediaUrl || '');
    const scheduledDate = new Date(post.scheduledAt);
    setFormDate(format(scheduledDate, 'yyyy-MM-dd'));
    setFormTime(format(scheduledDate, 'HH:mm'));
    setShowModal(true);
  };

  const handleDelete = async (postId) => {
    if (!user) return;

    if (!window.confirm('Are you sure you want to delete this scheduled post?')) {
      return;
    }

    try {
      const postDocRef = doc(db, 'users', user.uid, 'scheduledPosts', postId);
      await deleteDoc(postDocRef);
      showToast('Post deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('Failed to delete post. Please try again.', 'error');
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const getPostsForDate = (date) => {
    return scheduledPosts.filter((post) =>
      isSameDay(new Date(post.scheduledAt), date)
    );
  };

  const weekDays = getWeekDays();

  return (
    <div className="scheduler-container">
      <div className="scheduler-header">
        <h1>Scheduler</h1>
        <div className="scheduler-controls">
          <button
            className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button
            className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Schedule Post
          </button>
        </div>
      </div>

      <div className="scheduler-content">
        {viewMode === 'week' ? (
          <div className="week-view">
            <div className="week-navigation">
              <button
                className="btn btn-secondary"
                onClick={() =>
                  setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))
                }
              >
                ← Previous
              </button>
              <h2>{format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM d, yyyy')}</h2>
              <button
                className="btn btn-secondary"
                onClick={() =>
                  setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))
                }
              >
                Next →
              </button>
            </div>
            <div className="week-grid">
              {weekDays.map((day) => {
                const dayPosts = getPostsForDate(day);
                return (
                  <div key={day.toISOString()} className="week-day">
                    <div className="day-header">
                      <h3>{format(day, 'EEE')}</h3>
                      <span className="day-number">{format(day, 'd')}</span>
                    </div>
                    <div className="day-posts">
                      {dayPosts.map((post) => (
                        <div key={post.id} className="scheduled-post-item">
                          <div className="post-platform">{post.platform}</div>
                          <div className="post-time">
                            {format(new Date(post.scheduledAt), 'HH:mm')}
                          </div>
                          <div className="post-actions">
                            <button
                              className="btn btn-small"
                              onClick={() => handleEdit(post)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-small btn-danger"
                              onClick={() => handleDelete(post.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="list-view">
            <h2>Upcoming Posts</h2>
            {scheduledPosts.length === 0 ? (
              <p className="empty-state">No scheduled posts yet.</p>
            ) : (
              <div className="posts-list">
                {scheduledPosts.map((post) => (
                  <div key={post.id} className="scheduled-post-card">
                    <div className="post-info">
                      <div className="post-platform-badge">{post.platform}</div>
                      <div>
                        <h3>{format(new Date(post.scheduledAt), 'MMM d, yyyy HH:mm')}</h3>
                        <p className="post-caption-preview">
                          {post.captionText.substring(0, 100)}
                          {post.captionText.length > 100 ? '...' : ''}
                        </p>
                        <span className={`post-status post-status-${post.status}`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                    <div className="post-actions">
                      <button className="btn btn-small" onClick={() => handleEdit(post)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(post.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false);
          setEditingPost(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingPost ? 'Edit Scheduled Post' : 'Schedule New Post'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="platform">Platform</label>
                <select
                  id="platform"
                  value={formPlatform}
                  onChange={(e) => setFormPlatform(e.target.value)}
                  required
                >
                  <option value="">Select platform</option>
                  {connectedAccounts.map((account) => (
                    <option key={account.id} value={account.platform}>
                      {account.platform}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="caption">Caption</label>
                <textarea
                  id="caption"
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  placeholder="Enter post caption"
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="mediaUrl">Media URL (optional)</label>
                <input
                  type="url"
                  id="mediaUrl"
                  value={formMediaUrl}
                  onChange={(e) => setFormMediaUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="time">Time</label>
                  <input
                    type="time"
                    id="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editingPost ? 'Update' : 'Schedule'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPost(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;

