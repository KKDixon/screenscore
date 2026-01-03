# ScreenScore

A full-stack web application that evaluates the **quality** of screen time, not just the quantity. Built with Flask (Python) and React (JavaScript).

![ScreenScore Dashboard](./screen_score\screenshots\dashboard.png)

## 🎯 Project Overview

ScreenScore automatically assigns quality scores to screen time based on activity type (Work, Social Media, Entertainment, etc.), then calculates a daily weighted ScreenScore that reflects how valuable your screen time was overall.

### Key Features

- **Quality-Based Scoring**: Activities are rated 1-10, with higher scores for productive activities
- **Automatic Calculation**: Daily ScreenScore is calculated based on weighted activity durations
- **Session Tracking**: Log screen time sessions with categories, duration, and notes
- **Analytics Dashboard**: Visual insights with charts showing trends and category breakdowns
- **Category Management**: Create and manage custom activity categories


## 📸 Screenshots

### Categories
![Dashboard](./screen_score\screenshots\categories.png)

### Analytics
![Analytics](./screen_score\screenshots\analytics.png)

### Sessions Management
![Sessions](./screen_score\screenshots\sessions.png)

## 🛠️ Tech Stack

### Backend
- **Python 3.10+**
- **Flask** - Web framework
- **Flask-SQLAlchemy** - ORM for database operations
- **Flask-CORS** - Handle Cross-Origin requests
- **SQLite** - Database (development)

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **Chart.js & react-chartjs-2** - Data visualization
- **React Router** - Client-side routing
- **date-fns** - Date manipulation


## 📁 Project Structure
```
screenscore/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── models/              # Database models
│   │   │   └── activity.py      # ActivityCategory & ScreenSession models
│   │   ├── routes/              # API endpoints
│   │   │   ├── activity_routes.py    # CRUD for categories & sessions
│   │   │   └── analytics_routes.py   # Analytics endpoints
│   │   └── services/            # Business logic
│   ├── config.py                # Configuration
│   ├── run.py                   # Application entry point
│   └── requirements.txt         # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   └── Navigation.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Sessions.jsx
│   │   │   ├── Categories.jsx
│   │   │   └── Analytics.jsx
│   │   ├── services/            # API integration
│   │   │   └── api.js
│   │   ├── utils/               # Helper functions
│   │   │   ├── dateHelpers.js
│   │   │   └── scoreHelpers.js
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx             # Entry point
│   ├── package.json             # Node dependencies
│   └── vite.config.js           # Vite configuration
│
├── .gitignore
└── README.md
```

## 🎮 Usage

### 1. Create Categories

Navigate to the Categories page and create activity categories:
- **Work** (Quality: 10/10) - Professional tasks, coding, meetings
- **Learning** (Quality: 9/10) - Online courses, reading technical books
- **Social Media** (Quality: 3/10) - Instagram, Twitter, TikTok
- **Entertainment** (Quality: 5/10) - Netflix, YouTube, Gaming

### 2. Log Sessions

Go to the Sessions page and log your screen time:
- Select a category
- Enter duration in minutes
- Set start/end times
- Add optional notes

### 3. View Your Score

The Dashboard shows:
- Today's ScreenScore (0-100)
- Total screen time
- Session count
- Recent sessions

### 4. Analyze Trends

The Analytics page provides:
- Weekly score trends (line chart)
- Time distribution by category (doughnut chart)
- Session counts by category (bar chart)
- Detailed category breakdown

## 📊 ScreenScore Calculation

The ScreenScore is calculated using a weighted average:
```
ScreenScore = (Σ(duration × quality_score) / Σ(duration)) × 10
```

**Example:**
- 120 min Work (quality: 10) = 1200 points
- 30 min Social Media (quality: 3) = 90 points
- Total: 150 minutes, 1290 points
- Score: (1290 / 150) × 10 = **86/100** ✅