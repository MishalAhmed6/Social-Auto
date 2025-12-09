import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Templates.css';

const Templates = () => {
  const { user } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editHashtags, setEditHashtags] = useState('');

  useEffect(() => {
    if (!user) return;

    const templatesRef = collection(db, 'users', user.uid, 'postTemplates');
    const unsubscribe = onSnapshot(templatesRef, (snapshot) => {
      const templatesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTemplates(templatesList);
    });

    return () => unsubscribe();
  }, [user]);

  const handleEdit = (template) => {
    setEditingTemplate(template.id);
    setEditTitle(template.title || '');
    setEditCaption(template.captionText || '');
    setEditHashtags(template.hashtags?.join(' ') || '');
  };

  const handleSaveEdit = async () => {
    if (!user || !editingTemplate) return;

    try {
      const templateDocRef = doc(db, 'users', user.uid, 'postTemplates', editingTemplate);
      await updateDoc(templateDocRef, {
        title: editTitle,
        captionText: editCaption,
        hashtags: editHashtags.split(' ').filter((tag) => tag.trim()),
        updatedAt: new Date().toISOString(),
      });
      setEditingTemplate(null);
      showToast('Template updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating template:', error);
      showToast('Failed to update template. Please try again.', 'error');
    }
  };

  const handleDelete = async (templateId) => {
    if (!user) return;

    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const templateDocRef = doc(db, 'users', user.uid, 'postTemplates', templateId);
      await deleteDoc(templateDocRef);
      showToast('Template deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting template:', error);
      showToast('Failed to delete template. Please try again.', 'error');
    }
  };

  const handleSchedule = (template) => {
    navigate('/scheduler', {
      state: {
        prefillCaption: template.captionText,
        prefillHashtags: template.hashtags?.join(' ') || '',
      },
    });
  };

  return (
    <div className="templates-container">
      <div className="templates-header">
        <h1>Post Templates</h1>
        <p>Manage your saved post templates</p>
      </div>

      {templates.length === 0 ? (
        <div className="empty-state">
          <p>No templates yet. Create templates from AI-generated posts or save them manually.</p>
        </div>
      ) : (
        <div className="templates-grid">
          {templates.map((template) => (
            <div key={template.id} className="template-card">
              {editingTemplate === template.id ? (
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
                    <button className="btn btn-primary" onClick={handleSaveEdit}>
                      Save
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditingTemplate(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{template.title || 'Untitled Template'}</h3>
                  <p className="template-caption">{template.captionText}</p>
                  {template.hashtags && template.hashtags.length > 0 && (
                    <div className="template-hashtags">
                      {template.hashtags.map((tag, idx) => (
                        <span key={idx} className="hashtag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {template.createdAt && (
                    <p className="template-meta">
                      Created: {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  )}
                  <div className="template-actions">
                    <button className="btn btn-small" onClick={() => handleEdit(template)}>
                      Edit
                    </button>
                    <button className="btn btn-small" onClick={() => handleSchedule(template)}>
                      Schedule
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(template.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Templates;

