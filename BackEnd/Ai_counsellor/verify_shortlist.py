
import requests
import json
import os

BASE_URL = "http://127.0.0.1:8000/api"
EMAIL = "test_uni_flow@example.com"
PASSWORD = "password123"

def run_tests():
    # 1. Register/Login
    session = requests.Session()
    register_url = f"{BASE_URL}/register/"
    login_url = f"{BASE_URL}/login/"
    
    # Try login first
    print(f"Attempting login for {EMAIL}...")
    response = session.post(login_url, json={"email": EMAIL, "password": PASSWORD})
    
    if response.status_code != 200:
        print("Login failed, attempting register...")
        reg_response = session.post(register_url, json={
            "email": EMAIL, 
            "password": PASSWORD,
            "first_name": "Test",
            "last_name": "User"
        })
        if reg_response.status_code == 201:
            print("Registration successful.")
            # Login again
            response = session.post(login_url, json={"email": EMAIL, "password": PASSWORD})
        else:
            print(f"Registration failed: {reg_response.text}")
            return

    if response.status_code == 200:
        token = response.json()['access']
        headers = {'Authorization': f'Bearer {token}'}
        print("Login successful.")
    else:
        print(f"Login failed: {response.text}")
        return

    # 1.5 Populate Profile Data (Onboarding)
    print("\nPopulating Profile Data...")
    
    # Academic
    requests.post(f"{BASE_URL}/onboarding/academic/", headers=headers, json={
        "education_level": "Bachelor's",
        "degree_major": "Computer Science",
        "graduation_year": 2024,
        "gpa": "3.8"
    })
    
    # Study Goal
    requests.post(f"{BASE_URL}/onboarding/study-goal/", headers=headers, json={
        "intended_degree": "Master's",
        "field_of_study": "AI & Robotics",
        "target_intake": "Fall 2025",
        "preferred_countries": "United States"
    })
    
    # Budget
    requests.post(f"{BASE_URL}/onboarding/budget/", headers=headers, json={
        "budget_range": "30k-50k",
        "funding_plan": "Self-funded"
    })
    
    # Exams
    requests.post(f"{BASE_URL}/onboarding/exams/", headers=headers, json={
        "ielts_toefl_status": "Completed",
        "ielts_toefl_score": "8.0",
        "gre_gmat_status": "Completed",
        "sop_status": "Draft"
    })
    print("Profile Populated.")

    # 2. Test Recommendations
    print("\nTesting Recommendations Endpoint...")
    rec_url = f"{BASE_URL}/universities/recommendations/"
    resp = requests.get(rec_url, headers=headers)
    if resp.status_code == 200:
        data = resp.json()['data']
        print(f"Success! Found categories: {list(data.keys())}")
        print(f"Dream Count: {len(data['Dream'])}")
        print(f"Target Count: {len(data['Target'])}")
        print(f"Safe Count: {len(data['Safe'])}")
        
        # Pick a university to test locking
        uni_to_lock = None
        if data['Dream']:
            uni_to_lock = data['Dream'][0]
        elif data['Target']:
            uni_to_lock = data['Target'][0]
        elif data['Safe']:
            uni_to_lock = data['Safe'][0]
            
        if not uni_to_lock:
             print("No universities found in any category.")
             return
            
    else:
        print(f"Recommendations failed: {resp.text}")
        return

    # 3. Test Evaluation
    print(f"\nTesting Evaluation Endpoint for {uni_to_lock['name']}...")
    eval_url = f"{BASE_URL}/universities/evaluate/?name={uni_to_lock['name']}"
    resp = requests.get(eval_url, headers=headers)
    if resp.status_code == 200:
        print("Evaluation Success:", resp.json().get('data', {}))
    else:
        print(f"Evaluation failed: {resp.text}")

    # 4. Test Locking
    print(f"\nTesting Locking {uni_to_lock['name']}...")
    shortlist_url = f"{BASE_URL}/universities/shortlist/"
    lock_payload = {
        "action": "lock",
        "university_name": uni_to_lock['name'],
        "category": "Dream",
        "country": uni_to_lock.get('country', 'Unknown')
    }
    resp = requests.post(shortlist_url, json=lock_payload, headers=headers)
    print(f"Lock Response: {resp.text}")

    # 5. Test Unlocking
    print(f"\nTesting Unlocking {uni_to_lock['name']}...")
    unlock_payload = {
        "action": "unlock",
        "university_name": uni_to_lock['name']
    }
    resp = requests.post(shortlist_url, json=unlock_payload, headers=headers)
    print(f"Unlock Response: {resp.text}")

if __name__ == "__main__":
    run_tests()
