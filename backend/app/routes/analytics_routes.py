from flask import Blueprint, request, jsonify
from app import db
from app.models import ScreenSession, ActivityCategory
from sqlalchemy import func
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/daily-score', methods=['GET'])
def get_daily_score():
    """
    Calculate the weighted ScreenScore for a specific date
    Query param: ?date=YYYY-MM-DD (defaults to today)
    
    Formula: 
    ScreenScore = Σ(duration * quality_score) / Σ(duration) * 10
    This normalizes the score to a 0-100 scale
    """
    date_str = request.args.get('date')
    
    if date_str:
        try:
            target_date = datetime.fromisoformat(date_str).date()
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    else:
        target_date = datetime.now().date()
    
    # Get all sessions for the target date
    start_of_day = datetime.combine(target_date, datetime.min.time())
    end_of_day = datetime.combine(target_date, datetime.max.time())
    
    sessions = ScreenSession.query.filter(
        ScreenSession.start_time >= start_of_day,
        ScreenSession.start_time <= end_of_day
    ).all()
    
    if not sessions:
        return jsonify({
            'date': target_date.isoformat(),
            'screen_score': 0,
            'total_duration': 0,
            'session_count': 0,
            'message': 'No sessions recorded for this date'
        }), 200
    
    # Calculate weighted score
    total_weighted_score = sum(session.calculate_weighted_score() for session in sessions)
    total_duration = sum(session.duration_minutes for session in sessions)
    
    # Normalize to 0-100 scale
    screen_score = (total_weighted_score / total_duration) * 10 if total_duration > 0 else 0
    
    return jsonify({
        'date': target_date.isoformat(),
        'screen_score': round(screen_score, 2),
        'total_duration': round(total_duration, 2),
        'session_count': len(sessions),
        'sessions': [session.to_dict() for session in sessions]
    }), 200


@analytics_bp.route('/weekly-summary', methods=['GET'])
def get_weekly_summary():
    """
    Get a 7-day summary ending on the specified date
    Query param: ?end_date=YYYY-MM-DD (defaults to today)
    """
    date_str = request.args.get('end_date')
    
    if date_str:
        try:
            end_date = datetime.fromisoformat(date_str).date()
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    else:
        end_date = datetime.now().date()
    
    start_date = end_date - timedelta(days=6)
    
    # Get sessions for the week
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())
    
    sessions = ScreenSession.query.filter(
        ScreenSession.start_time >= start_datetime,
        ScreenSession.start_time <= end_datetime
    ).all()
    
    # Group by date
    daily_data = {}
    for i in range(7):
        current_date = start_date + timedelta(days=i)
        daily_data[current_date.isoformat()] = {
            'date': current_date.isoformat(),
            'total_duration': 0,
            'weighted_score_sum': 0,
            'session_count': 0
        }
    
    for session in sessions:
        date_key = session.start_time.date().isoformat()
        if date_key in daily_data:
            daily_data[date_key]['total_duration'] += session.duration_minutes
            daily_data[date_key]['weighted_score_sum'] += session.calculate_weighted_score()
            daily_data[date_key]['session_count'] += 1
    
    # Calculate daily scores
    for date_key in daily_data:
        duration = daily_data[date_key]['total_duration']
        weighted_sum = daily_data[date_key]['weighted_score_sum']
        daily_data[date_key]['screen_score'] = round(
            (weighted_sum / duration) * 10 if duration > 0 else 0, 2
        )
    
    return jsonify({
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'daily_scores': list(daily_data.values())
    }), 200


@analytics_bp.route('/category-breakdown', methods=['GET'])
def get_category_breakdown():
    """
    Get time distribution across categories
    Query params: ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    """
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    
    query = ScreenSession.query
    
    if start_date_str:
        try:
            start_date = datetime.fromisoformat(start_date_str)
            query = query.filter(ScreenSession.start_time >= start_date)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format'}), 400
    
    if end_date_str:
        try:
            end_date = datetime.fromisoformat(end_date_str)
            query = query.filter(ScreenSession.start_time <= end_date)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format'}), 400
    
    # Aggregate by category
    results = db.session.query(
        ActivityCategory.name,
        ActivityCategory.quality_score,
        func.sum(ScreenSession.duration_minutes).label('total_duration'),
        func.count(ScreenSession.id).label('session_count')
    ).join(
        ScreenSession, ActivityCategory.id == ScreenSession.category_id
    ).group_by(
        ActivityCategory.id
    ).all()
    
    breakdown = []
    total_time = 0
    
    for name, quality_score, duration, count in results:
        total_time += duration or 0
        breakdown.append({
            'category': name,
            'quality_score': quality_score,
            'total_duration': round(duration or 0, 2),
            'session_count': count
        })
    
    # Calculate percentages
    for item in breakdown:
        item['percentage'] = round((item['total_duration'] / total_time) * 100, 2) if total_time > 0 else 0
    
    return jsonify({
        'total_time': round(total_time, 2),
        'breakdown': breakdown
    }), 200