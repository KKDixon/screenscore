/**
 * Get color based on screen score (0-100 scale)
 * @param {number} score - Screen score (0-100)
 * @returns {string} Hex color code
 * @example
 * getScoreColor(85) // '#10b981' (green)
 * getScoreColor(45) // '#f59e0b' (orange)
 */
export const getScoreColor = (score) => {
  if (score >= 80) return '#10b981'; // Green - Excellent
  if (score >= 60) return '#c3ff00ff'; // Yellow - Good
  if (score >= 40) return '#f59e0b'; // Orange - Fair
  return '#ef4444'; // Red - Poor
};

/**
 * Get text label based on screen score
 * @param {number} score - Screen score (0-100)
 * @returns {string} Label text
 * @example
 * getScoreLabel(85) // 'Excellent'
 * getScoreLabel(45) // 'Fair'
 */
export const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
};


/**
 * Get color based on quality score (1-10 scale)
 * @param {number} score - Quality score (1-10)
 * @returns {string} Hex color code
 * @example
 * getQualityColor(10) // '#10b981' (green - high quality)
 * getQualityColor(3) // '#f59e0b' (orange - low quality)
 */
export const getQualityColor = (score) => {
  if (score >= 8) return '#10b981'; // Green - High quality
  if (score >= 5) return '#c3ff00ff'; // Yellow - Medium quality
  return '#f59e0b'; // Orange - Low quality
};



/**
 * Format duration in minutes to readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "2h 30m")
 * @example
 * formatDuration(150) // '2h 30m'
 * formatDuration(45) // '45m'
 * formatDuration(120) // '2h'
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
};


/**
 * Calculate percentage with rounding
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 * @example
 * calculatePercentage(30, 120) // 25
 * calculatePercentage(0, 100) // 0
 */
export const calculatePercentage = (part, total) => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};