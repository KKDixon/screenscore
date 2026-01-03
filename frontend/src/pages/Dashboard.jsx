import { useState, useEffect } from 'react';
import { getDailyScore, getSessions } from '../services/api';
import { formatDateForAPI, formatTimeForDisplay } from '../utils/dateHelpers';
import { getScoreColor, getScoreLabel, formatDuration } from '../utils/scoreHelpers';
import './Dashboard.css';

function Dashboard() {
  const [dailyScore, setDailyScore] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = formatDateForAPI(new Date());
      
      const [scoreData, sessionsData] = await Promise.all([
        getDailyScore(today),
        getSessions()
      ]);
      
      setDailyScore(scoreData);
      setRecentSessions(sessionsData.slice(0, 5));
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="mb-lg">Dashboard</h1>
      
      <div className="score-section mb-xl">
        <div className="card score-card">
          <h2 className="mb-md">Today's ScreenScore</h2>
          <div className="score-display">
            <div 
              className="score-circle"
              style={{ 
                backgroundColor: getScoreColor(dailyScore?.screen_score || 0)
              }}
            >
              <span className="score-value">
                {Math.round(dailyScore?.screen_score || 0)}
              </span>
              <span className="score-max">/100</span>
            </div>
            <div className="score-info">
              <p className="score-label" style={{ color: getScoreColor(dailyScore?.screen_score || 0) }}>
                {getScoreLabel(dailyScore?.screen_score || 0)}
              </p>
              <p className="text-gray">
                {dailyScore?.session_count || 0} sessions today
              </p>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="card stat-card">
            <h4 className="stat-label">Total Screen Time</h4>
            <p className="stat-value">
              {formatDuration(dailyScore?.total_duration || 0)}
            </p>
          </div>
          
          <div className="card stat-card">
            <h4 className="stat-label">Sessions</h4>
            <p className="stat-value">
              {dailyScore?.session_count || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="recent-sessions">
        <h2 className="mb-md">Recent Sessions</h2>
        {recentSessions.length === 0 ? (
          <div className="card text-center">
            <p className="text-gray">No sessions recorded today.</p>
            <p className="text-gray mb-md">Start tracking your screen time to see your score!</p>
            <button className="btn btn-primary" onClick={() => window.location.href = '/sessions'}>
              Add Your First Session
            </button>
          </div>
        ) : (
          <div className="sessions-list">
            {recentSessions.map((session) => (
              <div key={session.id} className="card session-card">
                <div className="session-header">
                  <h4>{session.category_name}</h4>
                  <span 
                    className="quality-badge"
                    style={{ 
                      backgroundColor: getScoreColor(session.quality_score * 10)
                    }}
                  >
                    {session.quality_score}/10
                  </span>
                </div>
                <div className="session-details">
                  <span className="session-time">
                    {formatTimeForDisplay(session.start_time)}
                  </span>
                  <span className="session-duration">
                    {formatDuration(session.duration_minutes)}
                  </span>
                </div>
                {session.notes && (
                  <p className="session-notes text-gray">{session.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;