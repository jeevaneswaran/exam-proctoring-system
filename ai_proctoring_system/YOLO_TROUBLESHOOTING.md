# YOLO Backend Troubleshooting Guide

If the proctoring dashboard shows **"YOLO Offline"**, follow these steps to resolve it:

## 1. Verify the Backend is Running
The most common cause is the Flask backend server not being started.
- Open a new terminal.
- Navigate to the `backend` directory:
  ```powershell
  cd "C:\Users\JEEVANESWARAN\Downloads\exam proctoring\ai_proctoring_system\backend"
  ```
- Run the server:
  ```powershell
  python flask_proctor_backend.py
  ```
- Look for the message: `* Running on http://127.0.0.1:5001`.

## 2. Test the Health Endpoint Manually
Check if the server is responsive by opening this URL in your browser:
- `http://127.0.0.1:5001/health`
- You should see: `{"status":"online", ...}`

## 3. Check for Port Conflicts
If the server fails to start with "Address already in use", something else is using port 5001.
- You can kill the existing process or change the port in `flask_proctor_backend.py` (line 197) and also in `frontend/src/components/exam/WebcamProctor.jsx` (line 15).

## 4. Frontend URL Configuration
If you are using a tunnel (like Cloudflare or ngrok), you must update the `BACKEND_URL` in the browser console:
- Open the exam page.
- Press **F12** to open the Console.
- Run: `localStorage.setItem('YOLO_BACKEND_URL', 'https://your-tunnel-url.trycloudflare.com')`
- Refresh the page.

## 5. Verify the Code (If things still fail)
Ensure `backend/flask_proctor_backend.py` has the following endpoint:
```python
@app.route('/health', methods=['GET', 'OPTIONS'])
def health():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
    return jsonify({"status": "online"}), 200
```
