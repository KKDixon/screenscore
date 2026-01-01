import os
from datetime import timedelta

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///screenscore.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    
class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}