"""
Quick YOLO Phone Detection Test
Run this directly: python test_phone_detection.py
It opens your webcam and shows live YOLO detections.
Press Q to quit.
"""
import cv2
from ultralytics import YOLO

print("📦 Loading YOLOv8 model...")
model = YOLO('yolov8n.pt')
print("✅ Model loaded")
print("📷 Opening webcam...")

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Could not open webcam!")
    exit(1)

print("=" * 50)
print("✅ Camera is open!")
print("👉 Hold your PHONE in front of the camera")
print("👉 It will draw a RED box if phone is detected")
print("👉 Press Q to quit")
print("=" * 50)

PROHIBITED = {'cell phone', 'book', 'laptop', 'remote'}
CONF = 0.20  # Very low threshold for testing

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Run YOLO
    results = model(frame, verbose=False, conf=CONF)[0]

    phone_found = False
    for box in results.boxes:
        cls_id = int(box.cls[0])
        label  = model.names[cls_id]
        conf   = float(box.conf[0])
        x1, y1, x2, y2 = [int(v) for v in box.xyxy[0]]

        if label in PROHIBITED:
            phone_found = True
            # Red box for prohibited objects
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 3)
            cv2.rectangle(frame, (x1, y1-24), (x1+len(label)*11+60, y1), (0, 0, 200), -1)
            cv2.putText(frame, f"! {label.upper()} {int(conf*100)}%",
                        (x1+4, y1-6), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255,255,255), 2)
            print(f"  ⚠️  DETECTED: {label} at {int(conf*100)}% confidence!")
        elif label == 'person':
            # Green box for person
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 200, 0), 2)
            cv2.putText(frame, f"USER {int(conf*100)}%",
                        (x1+4, y1-6), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 2)

    # Status text on screen
    status = "PHONE DETECTED!" if phone_found else "Looking for objects..."
    color  = (0, 0, 255) if phone_found else (200, 200, 200)
    cv2.putText(frame, status, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
    cv2.putText(frame, "Press Q to quit", (10, frame.shape[0]-10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (150,150,150), 1)

    cv2.imshow("YOLO Phone Detection Test", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("Done.")
