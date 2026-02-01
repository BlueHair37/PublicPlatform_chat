import requests
import base64

# Create a tiny 1x1 red dot png base64
dummy_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

payload = {
    "message": "이 사진 분석해줘",
    "session_id": "debug_session",
    "image_data": dummy_image
}

try:
    print("Sending request...")
    res = requests.post("http://localhost:8000/api/chat", json=payload)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.json()}")
except Exception as e:
    print(f"Request failed: {e}")
