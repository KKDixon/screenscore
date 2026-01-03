import { format, parseISO, startOfWeek, endOfWeek, subDays } from 'date-fns';

/**
 * Format date to YYYY-MM-DD (for API calls)
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string
 */
export const formatDateForAPI = (date) => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Format date for display (e.g., "Jan 15, 2025")
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

/**
 * Format datetime for display (e.g., "Jan 15, 2025 2:30 PM")
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted datetime string
 */
export const formatDateTimeForDisplay = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy h:mm a');
};

/**
 * Format time for display (e.g., "2:30 PM")
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted time string
 */
export const formatTimeForDisplay = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'h:mm a');
};

/**
 * Get date range for current week (Monday to Sunday)
 * @returns {Object} {start: Date, end: Date}
 */
export const getCurrentWeekRange = () => {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 })
  };
};

/**
 * Get date N days ago
 * @param {number} days - Number of days to go back
 * @returns {Date} Date object
 */
export const getDaysAgo = (days) => {
  return subDays(new Date(), days);
};

/**
 * Get today's date
 * @returns {Date} Today's date
 */
export const getToday = () => {
  return new Date();
};

/**
 * Convert ISO date string to Date object
 * @param {string} dateString - ISO date string
 * @returns {Date} Date object
 */
export const parseDate = (dateString) => {
  return parseISO(dateString);
};