from app import create_app, db
from app.models import ActivityCategory, ScreenSession

app = create_app('development')

@app.shell_context_processor
def make_shell_context():
    """
    Automatically import models when running 'flask shell'
    Makes it easier to test database operations
    """
    return {
        'db': db,
        'ActivityCategory': ActivityCategory,
        'ScreenSession': ScreenSession
    }

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)