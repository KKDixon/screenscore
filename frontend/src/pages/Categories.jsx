import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import { getQualityColor } from '../utils/scoreHelpers';
import './Categories.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quality_score: 5
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quality_score' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', quality_score: 5 });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.error || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      quality_score: category.quality_score
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error.response?.data?.error || 'Failed to delete category');
    }
  };

  const openModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', quality_score: 5 });
    setShowModal(true);
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div>
          <h1>Activity Categories</h1>
          <p className="text-gray">Manage your screen time activity categories and quality scores</p>
        </div>
        <button onClick={openModal} className="btn btn-primary">
          Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray mb-md">No categories yet.</p>
          <button onClick={openModal} className="btn btn-primary">
            Create Your First Category
          </button>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="card category-card">
              <div className="category-header">
                <h3>{category.name}</h3>
                <span 
                  className="quality-score-badge"
                  style={{ backgroundColor: getQualityColor(category.quality_score) }}
                >
                  {category.quality_score}/10
                </span>
              </div>
              
              {category.description && (
                <p className="category-description text-gray">{category.description}</p>
              )}

              <div className="category-actions">
                <button onClick={() => handleEdit(category)} className="btn btn-small btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleDelete(category.id)} className="btn btn-small btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Work, Social Media, Learning"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description of this category..."
                />
              </div>

              <div className="form-group">
                <label>Quality Score: {formData.quality_score}/10</label>
                <input
                  type="range"
                  name="quality_score"
                  value={formData.quality_score}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="quality-slider"
                />
                <div className="quality-slider-labels">
                  <span>1 (Low Quality)</span>
                  <span>10 (High Quality)</span>
                </div>
                <p className="text-gray" style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-sm)' }}>
                  Rate how valuable this activity is (1-10). Higher scores improve your overall ScreenScore.
                </p>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;