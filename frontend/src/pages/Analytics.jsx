import { useState, useEffect } from 'react';
import { getWeeklySummary, getCategoryBreakdown } from '../services/api';
import { formatDateForDisplay, formatDateForAPI, getDaysAgo } from '../utils/dateHelpers';
import { getScoreColor, formatDuration, calculatePercentage } from '../utils/scoreHelpers';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Analytics() {
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = formatDateForAPI(new Date());
      const startDate = formatDateForAPI(getDaysAgo(parseInt(timeRange) - 1));

      const [weeklyData, categoryData] = await Promise.all([
        getWeeklySummary(endDate),
        getCategoryBreakdown(startDate, endDate)
      ]);

      setWeeklySummary(weeklyData);
      setCategoryBreakdown(categoryData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  const weeklyChartData = {
    labels: weeklySummary?.daily_scores.map(day => formatDateForDisplay(day.date)) || [],
    datasets: [
      {
        label: 'Daily ScreenScore',
        data: weeklySummary?.daily_scores.map(day => day.screen_score) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  };

  const weeklyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly ScreenScore Trend',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Score: ${Math.round(context.parsed.y)}/100`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value;
          }
        }
      }
    }
  };

  const categoryDoughnutData = {
    labels: categoryBreakdown?.breakdown.map(cat => cat.category) || [],
    datasets: [
      {
        label: 'Time Spent',
        data: categoryBreakdown?.breakdown.map(cat => cat.total_duration) || [],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
          '#14b8a6',
          '#f97316'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const categoryDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Time Distribution by Category',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${formatDuration(value)}`;
          }
        }
      }
    }
  };

  const categoryBarData = {
    labels: categoryBreakdown?.breakdown.map(cat => cat.category) || [],
    datasets: [
      {
        label: 'Sessions',
        data: categoryBreakdown?.breakdown.map(cat => cat.session_count) || [],
        backgroundColor: '#3b82f6',
      }
    ]
  };

  const categoryBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Sessions by Category',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const averageScore = weeklySummary?.daily_scores.length > 0
    ? weeklySummary.daily_scores.reduce((sum, day) => sum + day.screen_score, 0) / weeklySummary.daily_scores.length
    : 0;

  const totalTime = categoryBreakdown?.total_time || 0;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1>Analytics & Insights</h1>
          <p className="text-gray">Track your screen time patterns and quality over time</p>
        </div>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="time-range-select"
        >
          <option value="7">Last 7 Days</option>
          <option value="14">Last 14 Days</option>
          <option value="30">Last 30 Days</option>
        </select>
      </div>

      <div className="stats-overview">
        <div className="card stat-card">
          <h4 className="stat-label">Average Score</h4>
          <p className="stat-value" style={{ color: getScoreColor(averageScore) }}>
            {Math.round(averageScore)}/100
          </p>
        </div>
        <div className="card stat-card">
          <h4 className="stat-label">Total Screen Time</h4>
          <p className="stat-value">{formatDuration(totalTime)}</p>
        </div>
        <div className="card stat-card">
          <h4 className="stat-label">Total Sessions</h4>
          <p className="stat-value">
            {categoryBreakdown?.breakdown.reduce((sum, cat) => sum + cat.session_count, 0) || 0}
          </p>
        </div>
        <div className="card stat-card">
          <h4 className="stat-label">Categories Used</h4>
          <p className="stat-value">{categoryBreakdown?.breakdown.length || 0}</p>
        </div>
      </div>

      <div className="chart-section">
        <div className="card chart-card">
          <div className="chart-container">
            <Line data={weeklyChartData} options={weeklyChartOptions} />
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <div className="chart-container">
            <Doughnut data={categoryDoughnutData} options={categoryDoughnutOptions} />
          </div>
        </div>
        <div className="card chart-card">
          <div className="chart-container">
            <Bar data={categoryBarData} options={categoryBarOptions} />
          </div>
        </div>
      </div>

      <div className="category-details">
        <h2 className="mb-md">Category Breakdown</h2>
        <div className="card">
          {categoryBreakdown?.breakdown.length === 0 ? (
            <p className="text-gray text-center">No data available for the selected time range</p>
          ) : (
            <div className="breakdown-list">
              {categoryBreakdown?.breakdown.map((cat, index) => (
                <div key={index} className="breakdown-item">
                  <div className="breakdown-info">
                    <h4>{cat.category}</h4>
                    <span className="breakdown-stats text-gray">
                      {cat.session_count} sessions • Quality: {cat.quality_score}/10
                    </span>
                  </div>
                  <div className="breakdown-metrics">
                    <span className="breakdown-duration">{formatDuration(cat.total_duration)}</span>
                    <span className="breakdown-percentage">{cat.percentage}%</span>
                  </div>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-bar-fill"
                      style={{ 
                        width: `${cat.percentage}%`,
                        backgroundColor: getScoreColor(cat.quality_score * 10)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;