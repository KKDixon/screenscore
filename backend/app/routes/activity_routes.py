from flask import Blueprint, request, jsonify
from app import db
from app.models import ActivityCategory, ScreenSession
from datetime import datetime

activity_bp = Blueprint('activities', __name__)

# ==================== ACTIVITY CATEGORIES ====================

@activity_bp.route('/categories', methods=['GET'])
def get_categories():
    """
    GET all activity categories
    Returns: List of all categories with their quality scores
    """
    categories = ActivityCategory.query.all()
    return jsonify([cat.to_dict() for cat in categories]), 200


@activity_bp.route('/categories', methods=['POST'])
def create_category():
    """
    POST a new activity category
    Request Body: {
        "name": "Work",
        "description": "Professional work and coding",
        "quality_score": 10
    }
    """
    data = request.get_json()
    
    # Validation
    if not data or 'name' not in data or 'quality_score' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    if not (1 <= data['quality_score'] <= 10):
        return jsonify({'error': 'Quality score must be between 1 and 10'}), 400
    
    # Check if category already exists
    if ActivityCategory.query.filter_by(name=data['name']).first():
        return jsonify({'error': 'Category already exists'}), 409
    
    # Create new category
    category = ActivityCategory(
        name=data['name'],
        description=data.get('description', ''),
        quality_score=data['quality_score']
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify(category.to_dict()), 201


@activity_bp.route('/categories/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    """
    UPDATE an existing category
    """
    category = ActivityCategory.query.get_or_404(category_id)
    data = request.get_json()
    
    if 'name' in data:
        category.name = data['name']
    if 'description' in data:
        category.description = data['description']
    if 'quality_score' in data:
        if not (1 <= data['quality_score'] <= 10):
            return jsonify({'error': 'Quality score must be between 1 and 10'}), 400
        category.quality_score = data['quality_score']
    
    db.session.commit()
    return jsonify(category.to_dict()), 200


@activity_bp.route('/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    """
    DELETE a category
    """
    category = ActivityCategory.query.get_or_404(category_id)
    
    # Check if category has sessions
    if category.sessions.count() > 0:
        return jsonify({'error': 'Cannot delete category with existing sessions'}), 400
    
    db.session.delete(category)
    db.session.commit()
    return jsonify({'message': 'Category deleted successfully'}), 200


# ==================== SCREEN SESSIONS ====================

@activity_bp.route('/sessions', methods=['GET'])
def get_sessions():
    """
    GET all screen sessions with optional date filtering
    Query params: ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    """
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = ScreenSession.query
    
    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
            query = query.filter(ScreenSession.start_time >= start)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format'}), 400
    
    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
            query = query.filter(ScreenSession.start_time <= end)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format'}), 400
    
    sessions = query.order_by(ScreenSession.start_time.desc()).all()
    return jsonify([session.to_dict() for session in sessions]), 200


@activity_bp.route('/sessions', methods=['POST'])
def create_session():
    """
    POST a new screen session
    Request Body: {
        "category_id": 1,
        "duration_minutes": 45.5,
        "start_time": "2025-01-15T09:00:00",
        "end_time": "2025-01-15T09:45:30",
        "notes": "Morning work session"
    }
    """
    data = request.get_json()
    
    # Validation
    required_fields = ['category_id', 'duration_minutes', 'start_time']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Verify category exists
    category = ActivityCategory.query.get(data['category_id'])
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    # Parse datetime
    try:
        start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        end_time = None
        if 'end_time' in data:
            end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Invalid datetime format'}), 400
    
    # Create session
    session = ScreenSession(
        category_id=data['category_id'],
        duration_minutes=data['duration_minutes'],
        start_time=start_time,
        end_time=end_time,
        notes=data.get('notes', '')
    )
    
    db.session.add(session)
    db.session.commit()
    
    return jsonify(session.to_dict()), 201


@activity_bp.route('/sessions/<int:session_id>', methods=['PUT'])
def update_session(session_id):
    """
    UPDATE an existing session
    """
    session = ScreenSession.query.get_or_404(session_id)
    data = request.get_json()
    
    if 'category_id' in data:
        category = ActivityCategory.query.get(data['category_id'])
        if not category:
            return jsonify({'error': 'Category not found'}), 404
        session.category_id = data['category_id']
    
    if 'duration_minutes' in data:
        session.duration_minutes = data['duration_minutes']
    
    if 'start_time' in data:
        try:
            session.start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid start_time format'}), 400
    
    if 'end_time' in data:
        try:
            session.end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid end_time format'}), 400
    
    if 'notes' in data:
        session.notes = data['notes']
    
    db.session.commit()
    return jsonify(session.to_dict()), 200


@activity_bp.route('/sessions/<int:session_id>', methods=['DELETE'])
def delete_session(session_id):
    """
    DELETE a session
    """
    session = ScreenSession.query.get_or_404(session_id)
    db.session.delete(session)
    db.session.commit()
    return jsonify({'message': 'Session deleted successfully'}), 200