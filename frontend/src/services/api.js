import axios from 'axios';

// Base URL for API calls
// The proxy in vite.config.js will forward /api/* to http://localhost:5000
const API_BASE_URL = '/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors to console for debugging
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);


// ==================== CATEGORIES ====================

/**
 * Get all activity categories
 * @returns {Promise<Array>} Array of category objects
 */
export const getCategories = async () => {
  const response = await api.get('/activities/categories');
  return response.data;
};


/**
 * Create a new category
 * @param {Object} categoryData - {name, description, quality_score}
 * @returns {Promise<Object>} Created category object
 */
export const createCategory = async (categoryData) => {
  const response = await api.post('/activities/categories', categoryData);
  return response.data;
};


/**
 * Update an existing category
 * @param {number} id - Category ID
 * @param {Object} categoryData - Updated data
 * @returns {Promise<Object>} Updated category object
 */
export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/activities/categories/${id}`, categoryData);
  return response.data;
};

/**
 * Delete a category
 * @param {number} id - Category ID
 * @returns {Promise<Object>} Success message
 */
export const deleteCategory = async (id) => {
  const response = await api.delete(`/activities/categories/${id}`);
  return response.data;
};



// ==================== SESSIONS ====================

/**
 * Get all screen sessions with optional date filtering
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of session objects
 */
export const getSessions = async (startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const response = await api.get('/activities/sessions', { params });
  return response.data;
};

/**
 * Create a new session
 * @param {Object} sessionData - {category_id, duration_minutes, start_time, end_time?, notes?}
 * @returns {Promise<Object>} Created session object
 */
export const createSession = async (sessionData) => {
  const response = await api.post('/activities/sessions', sessionData);
  return response.data;
};

/**
 * Update an existing session
 * @param {number} id - Session ID
 * @param {Object} sessionData - Updated data
 * @returns {Promise<Object>} Updated session object
 */
export const updateSession = async (id, sessionData) => {
  const response = await api.put(`/activities/sessions/${id}`, sessionData);
  return response.data;
};

/**
 * Delete a session
 * @param {number} id - Session ID
 * @returns {Promise<Object>} Success message
 */
export const deleteSession = async (id) => {
  const response = await api.delete(`/activities/sessions/${id}`);
  return response.data;
};


// ==================== ANALYTICS ====================

/**
 * Get daily screen score for a specific date
 * @param {string} date - Date (YYYY-MM-DD), defaults to today if not provided
 * @returns {Promise<Object>} Daily score data
 */
export const getDailyScore = async (date = null) => {
  const params = date ? { date } : {};
  const response = await api.get('/analytics/daily-score', { params });
  return response.data;
};

/**
 * Get weekly summary ending on a specific date
 * @param {string} endDate - End date (YYYY-MM-DD), defaults to today
 * @returns {Promise<Object>} Weekly summary data
 */
export const getWeeklySummary = async (endDate = null) => {
  const params = endDate ? { end_date: endDate } : {};
  const response = await api.get('/analytics/weekly-summary', { params });
  return response.data;
};

/**
 * Get category breakdown for a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Category breakdown data
 */
export const getCategoryBreakdown = async (startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const response = await api.get('/analytics/category-breakdown', { params });
  return response.data;
};

// Export the axios instance as default
export default api;