from datetime import datetime
from app import db

class ActivityCategory(db.Model):
    """
    Defines categories of screen activities with quality scores
    
    Quality Score Scale:
    - 10: Highly productive (e.g., Work, Learning)
    - 5-7: Moderately valuable (e.g., Communication, Reading)
    - 1-4: Low value (e.g., Social Media scrolling, Mindless browsing)
    """
    __tablename__ = 'activity_categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    quality_score = db.Column(db.Integer, nullable=False)  # 1-10 scale
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship: one category has many sessions
    sessions = db.relationship('ScreenSession', backref='category', lazy='dynamic')
    
    def __repr__(self):
        return f'<ActivityCategory {self.name}: {self.quality_score}>'
    
    def to_dict(self):
        """Convert model to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'quality_score': self.quality_score,
            'created_at': self.created_at.isoformat()
        }


class ScreenSession(db.Model):
    """
    Represents a single screen time session
    """
    __tablename__ = 'screen_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('activity_categories.id'), nullable=False)
    duration_minutes = db.Column(db.Float, nullable=False)  # Duration in minutes
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ScreenSession {self.id}: {self.duration_minutes}min>'
    
    def calculate_weighted_score(self):
        """
        Calculate the quality score for this session
        Formula: (duration_minutes * category_quality_score)
        """
        return self.duration_minutes * self.category.quality_score
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'category_id': self.category_id,
            'category_name': self.category.name,
            'duration_minutes': self.duration_minutes,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'notes': self.notes,
            'quality_score': self.category.quality_score,
            'weighted_score': self.calculate_weighted_score(),
            'created_at': self.created_at.isoformat()
        }