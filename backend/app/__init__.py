from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

def create_app(config_name='development'):
    """
    Application factory pattern
    This allows us to create multiple instances of the app with different configs
    """
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)  # Enable CORS for frontend communication
    
    # Register blueprints (route collections)
    from app.routes import activity_bp, analytics_bp
    app.register_blueprint(activity_bp, url_prefix='/api/activities')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app