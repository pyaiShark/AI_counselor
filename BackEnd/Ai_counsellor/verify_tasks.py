import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def verify_task_mgmt():
    print("--- Starting AI Task Management Verification ---")
    
    # login
    email = "test_uni_flow@example.com"
    password = "password123"
    
    login_resp = requests.post(f"{BASE_URL}/login/", json={"email": email, "password": password})
    if login_resp.status_code != 200:
        print("Login failed")
        return False
    
    token = login_resp.json()['access']
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Clear existing tasks for clean test
    # (Assuming we can't easily clear, just list current ones)
    tasks_resp = requests.get(f"{BASE_URL}/tasks/", headers=headers)
    initial_tasks = tasks_resp.json()['data']
    print(f"Initial Active Tasks Count: {len([t for t in initial_tasks if not t['is_completed']])}")

    # 2. Ask to list tasks
    print("\nRequesting AI to list tasks...")
    chat_resp = requests.post(f"{BASE_URL}/chat/", json={"message": "list my current todos"}, headers=headers)
    if chat_resp.status_code == 200:
        print(f"AI Response: {chat_resp.json()['data']['response']}")
    else:
        print(f"Chat failed: {chat_resp.text}")

    # 3. Ask to create a task
    print("\nRequesting AI to create a new task...")
    chat_resp = requests.post(f"{BASE_URL}/chat/", json={"message": "I want to add a new todo: 'Buy GRE prep books'"}, headers=headers)
    if chat_resp.status_code == 200:
        resp_data = chat_resp.json()['data']
        print(f"AI Response: {resp_data['response']}")
        
        # Verify if task was actually created in DB
        tasks_after = requests.get(f"{BASE_URL}/tasks/", headers=headers).json()['data']
        if any(t['title'] == 'Buy GRE prep books' for t in tasks_after):
             print("SUCCESS: Task created in database.")
        else:
             print("FAILURE: Task not found in database.")
    else:
        print(f"Chat failed: {chat_resp.text}")

    # 4. Fill up to limit and test rejection
    # (Simplified: if we already have many, this will trigger)
    active_count = len([t for t in requests.get(f"{BASE_URL}/tasks/", headers=headers).json()['data'] if not t['is_completed']])
    if active_count < 5:
        print(f"\nAdding more tasks to reach limit... (Current: {active_count})")
        for i in range(5 - active_count):
            requests.post(f"{BASE_URL}/tasks/", json={"title": f"DUMMY TASK {i}"}, headers=headers)
    
    print("\nRequesting task creation while AT LIMIT (>=5)...")
    chat_resp = requests.post(f"{BASE_URL}/chat/", json={"message": "One more todo: 'Study for 5 hours'"}, headers=headers)
    if chat_resp.status_code == 200:
        resp_text = chat_resp.json()['data']['response']
        print(f"AI Response: {resp_text}")
        if "complete" in resp_text.lower() and "previous" in resp_text.lower():
            print("SUCCESS: AI correctly rejected task creation and explained why.")
        else:
            print("WARNING: AI might not have rejected correctly.")
    
    return True

if __name__ == "__main__":
    verify_task_mgmt()
