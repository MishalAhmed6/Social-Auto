import { useEffect, useState } from 'react';
import { FiCalendar, FiUpload, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs } from 'firebase/firestore';
import { db, storage } from '../utils/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import Dropdown from '../components/Dropdown';
import '../styles/Scheduler.css';

const Scheduler = () => {
  const { user, userProfile } = useAuth();
  const { showToast } = useApp();
  const location = useLocation();
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

  // Form state
  const [formPlatform, setFormPlatform] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [formMediaFile, setFormMediaFile] = useState(null);
  const [formMediaPreview, setFormMediaPreview] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      showToast('Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, MOV)', 'error');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      showToast('File size must be less than 100MB', 'error');
      return;
    }

    setFormMediaFile(file);
    setFormMediaUrl(''); // Clear URL if file is selected

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setFormMediaFile(null);
    setFormMediaPreview(null);
  };

  const handlePreview = () => {
    if (!formPlatform || !formCaption || !formDate || !formTime) {
      showToast('Please fill in all required fields before preview', 'error');
      return;
    }
    setShowPreview(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !formPlatform || !formCaption || !formDate || !formTime) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setUploadingMedia(true);
      let finalMediaUrl = formMediaUrl || null;

      // Upload file to Firebase Storage if file is selected
      if (formMediaFile) {
        const fileExtension = formMediaFile.name.split('.').pop();
        const fileName = `posts/${user.uid}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const storageRef = ref(storage, fileName);
        
        await uploadBytes(storageRef, formMediaFile);
        finalMediaUrl = await getDownloadURL(storageRef);
      }

      const scheduledDateTime = new Date(`${formDate}T${formTime}`);
      const postData = {
        platform: formPlatform,
        captionText: formCaption,
        mediaUrl: finalMediaUrl,
        mediaType: formMediaFile ? formMediaFile.type : (formMediaUrl ? 'url' : null),
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
      setShowPreview(false);
      setEditingPost(null);
      setFormCaption('');
      setFormMediaUrl('');
      setFormMediaFile(null);
      setFormMediaPreview(null);
      setFormDate('');
      setFormTime('');
    } catch (error) {
      console.error('Error saving scheduled post:', error);
      showToast('Failed to save post. Please try again.', 'error');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post.id);
    setFormPlatform(post.platform);
    setFormCaption(post.captionText);
    setFormMediaUrl(post.mediaUrl || '');
    setFormMediaFile(null);
    setFormMediaPreview(post.mediaUrl || null);
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
        <div className="scheduler-header-icon">
          <FiCalendar />
        </div>
        <div style={{ flex: 1 }}>
          <h1>Post Scheduler</h1>
          <p>Schedule and manage your social media posts</p>
        </div>
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
                <Dropdown
                  label="Platform"
                  value={formPlatform}
                  onChange={setFormPlatform}
                  options={connectedAccounts.length > 0 
                    ? connectedAccounts.map(acc => ({
                        value: acc.platform,
                        label: acc.platform.charAt(0).toUpperCase() + acc.platform.slice(1)
                      }))
                    : []
                  }
                  placeholder="Select platform"
                  required
                  disabled={connectedAccounts.length === 0}
                />
                {connectedAccounts.length === 0 && (
                  <p className="form-hint" style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                    No connected accounts. <a href="/accounts" style={{ color: 'var(--primary)' }}>Connect an account</a> first.
                  </p>
                )}
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
                  className="input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="media">Media (optional)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  <input
                    type="file"
                    id="media"
                    accept="image/*,video/mp4,video/quicktime"
                    onChange={handleFileChange}
                    className="input"
                    style={{ padding: '8px' }}
                    disabled={uploadingMedia}
                  />
                  {formMediaPreview && (
                    <div style={{ position: 'relative', marginTop: 'var(--spacing-sm)' }}>
                      {formMediaPreview.startsWith('data:video') || formMediaPreview.includes('.mp4') || formMediaPreview.includes('.mov') ? (
                        <video src={formMediaPreview} controls style={{ width: '100%', maxHeight: '300px', borderRadius: 'var(--radius)', objectFit: 'contain' }} />
                      ) : (
                        <img src={formMediaPreview} alt="Preview" style={{ width: '100%', maxHeight: '300px', borderRadius: 'var(--radius)', objectFit: 'contain' }} />
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                  {!formMediaFile && (
                    <input
                      type="url"
                      value={formMediaUrl}
                      onChange={(e) => setFormMediaUrl(e.target.value)}
                      placeholder="Or enter media URL (https://...)"
                      className="input"
                      style={{ marginTop: formMediaPreview ? 'var(--spacing-sm)' : '0' }}
                    />
                  )}
                </div>
                <p className="form-hint">Upload an image or video, or paste a URL. Max file size: 100MB</p>
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
                    className="input"
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
                    className="input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePreview}
                >
                  Preview
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploadingMedia}>
                  {uploadingMedia ? 'Uploading...' : (editingPost ? 'Update' : 'Schedule')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setShowPreview(false);
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

      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal-content post-preview-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Post Preview</h2>
            <div className="post-preview">
              <div className="preview-platform">
                <span className="post-platform-badge">{formPlatform}</span>
                <span className="preview-date">
                  {formDate && formTime
                    ? format(new Date(`${formDate}T${formTime}`), 'MMM d, yyyy HH:mm')
                    : 'Date not set'}
                </span>
              </div>
              {(formMediaPreview || formMediaUrl) && (
                <div className="preview-media">
                  {(formMediaPreview || formMediaUrl)?.startsWith('data:video') || (formMediaPreview || formMediaUrl)?.includes('.mp4') || (formMediaPreview || formMediaUrl)?.includes('.mov') ? (
                    <video src={formMediaPreview || formMediaUrl} controls style={{ width: '100%', borderRadius: 'var(--radius)' }} />
                  ) : (
                    <img src={formMediaPreview || formMediaUrl} alt="Post preview" onError={(e) => {
                      e.target.style.display = 'none';
                    }} />
                  )}
                </div>
              )}
              <div className="preview-caption">
                {formCaption.split('\n').map((line, idx) => (
                  <p key={idx}>{line || '\u00A0'}</p>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPreview(false)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowPreview(false);
                  document.querySelector('form')?.requestSubmit();
                }}
              >
                {editingPost ? 'Update Post' : 'Schedule Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;

