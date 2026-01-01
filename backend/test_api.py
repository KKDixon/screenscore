import requests
import json
from datetime import datetime

# Base URL for our API
BASE_URL = 'http://127.0.0.1:5000/api'

def print_response(title, response):
    """Helper function to print responses nicely"""
    print(f"\n{'='*60}")
    print(f"TEST: {title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")
    print(f"{'='*60}\n")

def test_categories():
    """Test all category endpoints"""
    print("\n🔵 TESTING CATEGORY ENDPOINTS")
    
    # 1. GET all categories (should be empty initially)
    response = requests.get(f'{BASE_URL}/activities/categories')
    print_response("GET all categories (empty)", response)
    
    # 2. CREATE categories
    categories = [
        {
            'name': 'Work',
            'description': 'Professional work, coding, meetings',
            'quality_score': 10
        },
        {
            'name': 'Learning',
            'description': 'Online courses, reading technical books',
            'quality_score': 9
        },
        {
            'name': 'Social Media',
            'description': 'Instagram, Twitter, TikTok',
            'quality_score': 3
        },
        {
            'name': 'Entertainment',
            'description': 'Netflix, YouTube, Gaming',
            'quality_score': 5
        },
        {
            'name': 'Communication',
            'description': 'Email, Slack, messaging',
            'quality_score': 7
        }
    ]
    
    created_ids = []
    for cat in categories:
        response = requests.post(
            f'{BASE_URL}/activities/categories',
            json=cat
        )
        print_response(f"CREATE category: {cat['name']}", response)
        if response.status_code == 201:
            created_ids.append(response.json()['id'])
    
    # 3. GET all categories (should have data now)
    response = requests.get(f'{BASE_URL}/activities/categories')
    print_response("GET all categories (with data)", response)
    
    # 4. UPDATE a category
    if created_ids:
        response = requests.put(
            f'{BASE_URL}/activities/categories/{created_ids[0]}',
            json={
                'description': 'Updated: Professional work, coding, and important meetings',
                'quality_score': 10
            }
        )
        print_response("UPDATE category", response)
    
    # 5. Try to create duplicate (should fail)
    response = requests.post(
        f'{BASE_URL}/activities/categories',
        json={'name': 'Work', 'quality_score': 10}
    )
    print_response("CREATE duplicate category (should fail)", response)
    
    # 6. Try invalid quality score (should fail)
    response = requests.post(
        f'{BASE_URL}/activities/categories',
        json={'name': 'Invalid', 'quality_score': 15}
    )
    print_response("CREATE with invalid score (should fail)", response)
    
    return created_ids

def test_sessions(category_ids):
    """Test all session endpoints"""
    print("\n🟢 TESTING SESSION ENDPOINTS")
    
    if not category_ids:
        print("⚠️  No categories available. Skipping session tests.")
        return []
    
    # 1. GET all sessions (should be empty)
    response = requests.get(f'{BASE_URL}/activities/sessions')
    print_response("GET all sessions (empty)", response)
    
    # 2. CREATE sessions
    now = datetime.now()
    sessions = [
        {
            'category_id': category_ids[0],  # Work
            'duration_minutes': 120,
            'start_time': '2025-01-15T09:00:00',
            'end_time': '2025-01-15T11:00:00',
            'notes': 'Morning deep work session on backend API'
        },
        {
            'category_id': category_ids[1] if len(category_ids) > 1 else category_ids[0],  # Learning
            'duration_minutes': 45,
            'start_time': '2025-01-15T14:00:00',
            'end_time': '2025-01-15T14:45:00',
            'notes': 'Watched tutorial on Flask blueprints'
        },
        {
            'category_id': category_ids[2] if len(category_ids) > 2 else category_ids[0],  # Social Media
            'duration_minutes': 30,
            'start_time': '2025-01-15T19:00:00',
            'end_time': '2025-01-15T19:30:00',
            'notes': 'Scrolling through Instagram'
        },
        {
            'category_id': category_ids[0],  # Work
            'duration_minutes': 90,
            'start_time': '2025-01-16T10:00:00',
            'end_time': '2025-01-16T11:30:00',
            'notes': 'Client meeting and follow-up tasks'
        }
    ]
    
    session_ids = []
    for session in sessions:
        response = requests.post(
            f'{BASE_URL}/activities/sessions',
            json=session
        )
        print_response(f"CREATE session ({session['duration_minutes']} min)", response)
        if response.status_code == 201:
            session_ids.append(response.json()['id'])
    
    # 3. GET all sessions (should have data)
    response = requests.get(f'{BASE_URL}/activities/sessions')
    print_response("GET all sessions (with data)", response)
    
    # 4. GET filtered sessions by date
    response = requests.get(
        f'{BASE_URL}/activities/sessions',
        params={'start_date': '2025-01-15', 'end_date': '2025-01-15'}
    )
    print_response("GET sessions filtered by date", response)
    
    # 5. UPDATE a session
    if session_ids:
        response = requests.put(
            f'{BASE_URL}/activities/sessions/{session_ids[0]}',
            json={
                'duration_minutes': 150,
                'notes': 'Extended work session - very productive!'
            }
        )
        print_response("UPDATE session", response)
    
    # 6. Try to create session with invalid category (should fail)
    response = requests.post(
        f'{BASE_URL}/activities/sessions',
        json={
            'category_id': 9999,
            'duration_minutes': 60,
            'start_time': '2025-01-15T12:00:00'
        }
    )
    print_response("CREATE session with invalid category (should fail)", response)
    
    return session_ids

def test_analytics():
    """Test all analytics endpoints"""
    print("\n🟡 TESTING ANALYTICS ENDPOINTS")
    
    # 1. GET daily score for specific date
    response = requests.get(
        f'{BASE_URL}/analytics/daily-score',
        params={'date': '2025-01-15'}
    )
    print_response("GET daily score for 2025-01-15", response)
    
    # 2. GET daily score for today (no data)
    response = requests.get(f'{BASE_URL}/analytics/daily-score')
    print_response("GET daily score for today", response)
    
    # 3. GET weekly summary
    response = requests.get(
        f'{BASE_URL}/analytics/weekly-summary',
        params={'end_date': '2025-01-16'}
    )
    print_response("GET weekly summary", response)
    
    # 4. GET category breakdown
    response = requests.get(f'{BASE_URL}/analytics/category-breakdown')
    print_response("GET category breakdown (all time)", response)
    
    # 5. GET category breakdown with date filter
    response = requests.get(
        f'{BASE_URL}/analytics/category-breakdown',
        params={'start_date': '2025-01-15', 'end_date': '2025-01-15'}
    )
    print_response("GET category breakdown (filtered)", response)

def test_delete_operations(category_ids, session_ids):
    """Test delete operations"""
    print("\n🔴 TESTING DELETE OPERATIONS")
    
    # 1. Try to delete category with sessions (should fail)
    if category_ids:
        response = requests.delete(
            f'{BASE_URL}/activities/categories/{category_ids[0]}'
        )
        print_response("DELETE category with sessions (should fail)", response)
    
    # 2. DELETE sessions
    for session_id in session_ids:
        response = requests.delete(
            f'{BASE_URL}/activities/sessions/{session_id}'
        )
        print_response(f"DELETE session {session_id}", response)
    
    # 3. DELETE category (should work now)
    if category_ids and len(category_ids) > 4:
        response = requests.delete(
            f'{BASE_URL}/activities/categories/{category_ids[4]}'
        )
        print_response(f"DELETE category {category_ids[4]}", response)
    
    # 4. Try to delete non-existent resource (should get 404)
    response = requests.delete(f'{BASE_URL}/activities/categories/9999')
    print_response("DELETE non-existent category (should 404)", response)

def run_all_tests():
    """Run complete test suite"""
    print("\n" + "="*60)
    print("🚀 STARTING API TEST SUITE")
    print("="*60)
    
    try:
        # Install requests if not already installed
        import requests
    except ImportError:
        print("\n❌ 'requests' library not found!")
        print("Installing it now...")
        import subprocess
        subprocess.check_call(['pip', 'install', 'requests'])
        import requests
    
    # Run tests in order
    category_ids = test_categories()
    session_ids = test_sessions(category_ids)
    test_analytics()
    test_delete_operations(category_ids, session_ids)
    
    print("\n" + "="*60)
    print("✅ TEST SUITE COMPLETED!")
    print("="*60)
    print("\nCheck the output above for any failures.")
    print("Status codes to look for:")
    print("  200 - Success (GET, PUT, DELETE)")
    print("  201 - Created (POST)")
    print("  400 - Bad Request (validation error)")
    print("  404 - Not Found")
    print("  409 - Conflict (duplicate)")

if __name__ == '__main__':
    run_all_tests()