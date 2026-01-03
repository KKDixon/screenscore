import { useState, useEffect } from 'react';
import { getSessions, createSession, updateSession, deleteSession, getCategories } from '../services/api';
import { formatDateTimeForDisplay, formatDateForAPI, getToday } from '../utils/dateHelpers';
import { formatDuration, getQualityColor } from '../utils/scoreHelpers';
import './Sessions.css';

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    duration_minutes: '',
    start_time: '',
    end_time: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsData, categoriesData] = await Promise.all([
        getSessions(),
        getCategories()
      ]);
      setSessions(sessionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sessionData = {
        ...formData,
        duration_minutes: parseFloat(formData.duration_minutes),
        category_id: parseInt(formData.category_id)
      };

      if (editingSession) {
        await updateSession(editingSession.id, sessionData);
      } else {
        await createSession(sessionData);
      }

      setShowModal(false);
      setEditingSession(null);
      setFormData({
        category_id: '',
        duration_minutes: '',
        start_time: '',
        end_time: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session');
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      category_id: session.category_id,
      duration_minutes: session.duration_minutes,
      start_time: session.start_time.slice(0, 16),
      end_time: session.end_time ? session.end_time.slice(0, 16) : '',
      notes: session.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }
    try {
      await deleteSession(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  };

  const openModal = () => {
    setEditingSession(null);
    setFormData({
      category_id: '',
      duration_minutes: '',
      start_time: '',
      end_time: '',
      notes: ''
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="sessions-page">
      <div className="sessions-header">
        <h1>Screen Sessions</h1>
        <button onClick={openModal} className="btn btn-primary">
          Add Session
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray mb-md">No sessions recorded yet.</p>
          <button onClick={openModal} className="btn btn-primary">
            Create Your First Session
          </button>
        </div>
      ) : (
        <div className="sessions-grid">
          {sessions.map((session) => (
            <div key={session.id} className="card session-item">
              <div className="session-item-header">
                <div>
                  <h3>{session.category_name}</h3>
                  <span 
                    className="quality-badge"
                    style={{ backgroundColor: getQualityColor(session.quality_score) }}
                  >
                    Quality: {session.quality_score}/10
                  </span>
                </div>
                <div className="session-actions">
                  <button onClick={() => handleEdit(session)} className="btn btn-small btn-secondary">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(session.id)} className="btn btn-small btn-danger">
                    Delete
                  </button>
                </div>
              </div>
              <div className="session-item-details">
                <p><strong>Duration:</strong> {formatDuration(session.duration_minutes)}</p>
                <p><strong>Start:</strong> {formatDateTimeForDisplay(session.start_time)}</p>
                {session.end_time && (
                  <p><strong>End:</strong> {formatDateTimeForDisplay(session.end_time)}</p>
                )}
                {session.notes && (
                  <p className="session-item-notes"><strong>Notes:</strong> {session.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingSession ? 'Edit Session' : 'Add New Session'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} (Quality: {cat.quality_score}/10)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Duration (minutes) *</label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  min="1"
                  step="0.1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Time</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Optional notes about this session..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSession ? 'Update' : 'Create'} Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sessions;