import cv2
import numpy as np
import base64
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# ─── Load Model ──────────────────────────────────────────────────────────────
print("📦 Loading YOLOv8 model...")
model = YOLO('yolov8n.pt')
print("✅ YOLOv8 model loaded. Classes available:", len(model.names))

print("⚙️ Warming up model to prevent first-request timeout...")
dummy_img = np.zeros((640, 640, 3), dtype=np.uint8)
_ = model(dummy_img, verbose=False)
print("✅ Model warm-up complete.")


# ─── State ───────────────────────────────────────────────────────────────────
prev_frame = None
last_face_timestamp = time.time()

# ─── Config ──────────────────────────────────────────────────────────────────
NO_FACE_TIMEOUT   = 10    # seconds before exam stops
MOVE_THRESHOLD    = 8000  # frame-diff sensitivity

# SEPARATE thresholds:
# - Objects (phone, book): LOW threshold = easier to detect
# - Person: HIGH threshold = avoid false positives from reflections/monitors/pictures
CONF_OBJECT = 0.20   # Low — catches phones at odd angles
CONF_PERSON = 0.65   # High — only real persons, not reflections/backgrounds

PROHIBITED_CLASSES = {'cell phone', 'book', 'laptop', 'remote', 'tablet'}

# Find phone class ID so we can print what YOLO returns
PHONE_CLASS_ID = None
for cid, name in model.names.items():
    if name == 'cell phone':
        PHONE_CLASS_ID = cid
        break
print(f"📱 Phone class ID in YOLO: {PHONE_CLASS_ID}")

# Store last received frame for debugging
last_received_frame = None


def decode_image(b64string):
    """Decode base64 image → OpenCV BGR frame, resized to 640px wide."""
    if "," in b64string:
        _, encoded = b64string.split(",", 1)
    else:
        encoded = b64string
    data = base64.b64decode(encoded)
    img = Image.open(io.BytesIO(data)).convert("RGB")
    # Resize to minimum 640px wide so YOLO can detect small objects
    w, h = img.size
    if w < 640:
        ratio = 640 / w
        img = img.resize((640, int(h * ratio)), Image.LANCZOS)
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET', 'OPTIONS'])
def health():
    return jsonify({"status": "online", "model": "yolov8n", "phone_class_id": PHONE_CLASS_ID})


@app.route('/test', methods=['GET'])
def test_detection():
    return jsonify({
        "message": "YOLO model is loaded",
        "total_classes": len(model.names),
        "cell_phone_class_id": PHONE_CLASS_ID,
        "prohibited_classes": list(PROHIBITED_CLASSES),
        "confidence_threshold": CONF_THRESHOLD,
        "tip": "Lower threshold means easier detection. Current: " + str(CONF_THRESHOLD)
    })


@app.route('/debug_frame', methods=['GET'])
def debug_frame():
    """Save last received frame as PNG so you can see what YOLO is working with."""
    global last_received_frame
    if last_received_frame is None:
        return jsonify({"error": "No frame received yet. Start the exam and send at least one frame."}), 404
    path = 'debug_last_frame.png'
    cv2.imwrite(path, last_received_frame)
    return jsonify({
        "saved": path,
        "shape": list(last_received_frame.shape),
        "message": f"Frame saved to backend/{path} — open this file to see what YOLO sees"
    })

@app.route('/proctor/detect', methods=['POST', 'OPTIONS'])
def process_frame():
    global prev_frame, last_face_timestamp, last_received_frame

    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    data = request.json
    image_data = data.get('image')
    if not image_data:
        return jsonify({"error": "No image provided"}), 400

    try:
        frame = decode_image(image_data)
    except Exception as e:
        return jsonify({"error": f"Image decode failed: {str(e)}"}), 400

    # Store for debugging
    last_received_frame = frame.copy()
    print(f"📸 Frame received: {frame.shape[1]}x{frame.shape[0]} px")

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (21, 21), 0)

    # ─── Run YOLO at the LOWEST possible conf to get all candidates ─────
    # Then we filter per-class below with appropriate thresholds
    results = model(frame, verbose=False, conf=CONF_OBJECT)[0]
    all_detected = [(model.names[int(b.cls[0])], round(float(b.conf[0]),2)) for b in results.boxes]
    print(f"  YOLO raw detections: {all_detected if all_detected else 'nothing'}")

    person_count = 0
    violation    = False
    violation_details = {}
    detected_objects  = []

    for box in results.boxes:
        cls_id = int(box.cls[0])
        label  = model.names[cls_id]
        conf   = float(box.conf[0])
        x1, y1, x2, y2 = [round(v) for v in box.xyxy[0].tolist()]

        # ── Per-class confidence gating ──────────────────────────────────
        if label == 'person':
            if conf < CONF_PERSON:   # Ignore low-confidence person detections
                print(f"  ↳ Skipping 'person' at {int(conf*100)}% (below {int(CONF_PERSON*100)}% threshold)")
                continue
            person_count += 1
            detected_objects.append({"name": "person", "accuracy": round(conf,2), "box": [x1,y1,x2,y2]})
            print(f"  ✅ Person confirmed at {int(conf*100)}%")

        elif label in PROHIBITED_CLASSES and conf >= CONF_OBJECT:
            # Prohibited object — add to list AND flag violation
            detected_objects.append({"name": label, "accuracy": round(conf,2), "box": [x1,y1,x2,y2]})
            violation = True
            violation_details = {
                "msg": f"PROHIBITED OBJECT: {label.upper()} ({int(conf*100)}% confidence)",
                "object": label,
                "confidence": round(conf, 2)
            }
            print(f"  ⚠️  VIOLATION: {label} at {int(conf*100)}%!")

        else:
            # Other objects — just show box, no violation
            detected_objects.append({"name": label, "accuracy": round(conf,2), "box": [x1,y1,x2,y2]})

    # ─── Multiple persons (only counted if above strict threshold) ────
    if person_count > 1:
        violation = True
        violation_details = {
            "msg": f"MULTIPLE PERSONS DETECTED ({person_count}) — only 1 allowed",
            "object": "multiple_persons",
            "confidence": 1.0
        }

    # ─── No-face timeout ──────────────────────────────────────────────
    current_time = time.time()
    if person_count > 0:
        last_face_timestamp = current_time

    no_face_duration = current_time - last_face_timestamp
    if no_face_duration > NO_FACE_TIMEOUT:
        return jsonify({
            "action": "STOP_EXAM",
            "reason": f"No face detected for {int(no_face_duration)} seconds.",
            "violation": True
        })

    # ─── Body movement (frame differencing) ──────────────────────────
    movement_alert = False
    if prev_frame is not None:
        delta = cv2.absdiff(prev_frame, gray)
        thresh = cv2.threshold(delta, 25, 255, cv2.THRESH_BINARY)[1]
        if int(np.sum(thresh)) > MOVE_THRESHOLD:
            movement_alert = True
    prev_frame = gray

    # ─── Build response ───────────────────────────────────────────────
    response = {
        "person_count": person_count,
        "violation": violation,
        "violation_details": violation_details,
        "movement_alert": movement_alert,
        "objects": detected_objects,
        "status": "warning" if (violation or movement_alert) else "normal"
    }

    if no_face_duration > 5:
        response["warning"] = f"Face not visible! Auto-stop in {int(NO_FACE_TIMEOUT - no_face_duration)}s"

    return jsonify(response)


if __name__ == "__main__":
    print("🛡️  AI Proctoring Flask Backend — http://localhost:5001")
    print(f"📱  Phone/object threshold: {CONF_OBJECT} ({int(CONF_OBJECT*100)}%)")
    print(f"👤  Person threshold:        {CONF_PERSON} ({int(CONF_PERSON*100)}%) — prevents false positives")
    print("🔗  Test endpoint: http://localhost:5001/test")
    app.run(host='0.0.0.0', port=5001, debug=False)
