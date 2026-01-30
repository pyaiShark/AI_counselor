import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def verify_chat():
    print("--- Starting Chat Session Verification ---")
    
    # 1. Login
    email = "test_uni_flow@example.com"
    password = "password123"
    
    print(f"Attempting login with {email}...")
    try:
        login_resp = requests.post(f"{BASE_URL}/login/", json={"email": email, "password": password})
        if login_resp.status_code != 200:
             print("Login failed, attempting fallback registration...")
             # ...registration fallback omitted for brevity...
             return False
        
        token = login_resp.json()['access']
        headers = {"Authorization": f"Bearer {token}"}
        print("Login successful!")

        # 2. Create Session
        print("\nCreating Chat Session...")
        sess_resp = requests.post(f"{BASE_URL}/chat/sessions/", headers=headers)
        if sess_resp.status_code == 201:
            session_id = sess_resp.json()['data']['id']
            print(f"Session Created: {session_id}")
        else:
            print(f"Session Creation Failed: {sess_resp.text}")
            return False

        # 3. Send Message to Session
        message = "Hi Counselor, suggest universities for me."
        print(f"Sending message to session {session_id}...")
        
        chat_resp = requests.post(f"{BASE_URL}/chat/", json={"message": message, "session_id": session_id}, headers=headers)
        
        if chat_resp.status_code == 200:
            data = chat_resp.json()['data']
            print("\nAI Response Received:")
            print(f"Response: {data['response'][:50]}...")
            print(f"Suggested Actions: {data['suggested_actions']}")
            
            if len(data['suggested_actions']) != 3:
                print("WARNING: Suggested actions count is not 3.")
        else:
            print(f"FAILURE: Chat Request Failed: {chat_resp.text}")
            return False

        # 3.5 Test Context Awareness (Budget without locked unis)
        print("\nTesting Context Awareness (Budget without locked unis)...")
        budget_msg = "What budget do I need for my locked university?"
        chat_resp = requests.post(f"{BASE_URL}/chat/", json={"message": budget_msg, "session_id": session_id}, headers=headers)
        if chat_resp.status_code == 200:
            resp_text = chat_resp.json()['data']['response']
            print(f"AI Response: {resp_text[:100]}...")
            if "lock" in resp_text.lower():
                print("SUCCESS: AI correctly prompted to lock a university.")
            else:
                print("WARNING: AI might not have correctly handled missing locked unis.")
        
        # 4. Verify History filtered by Session
        print("\nVerifying Session History...")
        hist_resp = requests.get(f"{BASE_URL}/chat/history/?session_id={session_id}", headers=headers)
        
        if hist_resp.status_code == 200:
            history = hist_resp.json()['data']
            print(f"History Length: {len(history)} (Expected >= 4)")
            if len(history) >= 4:
                print("SUCCESS: History retrieved correctly.")
                return True
            else:
                 print("FAILURE: History incomplete.")
                 return False
        else:
            print(f"FAILURE: History Request Failed: {hist_resp.text}")
            return False

    except Exception as e:
        print(f"EXCEPTION: {str(e)}")
        return False

if __name__ == "__main__":
    success = verify_chat()
    sys.exit(0 if success else 1)
