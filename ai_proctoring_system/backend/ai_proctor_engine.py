import cv2
import base64
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
import uvicorn
import io
from PIL import Image

app = FastAPI(title="AI Proctoring Engine", version="1.0.0")

# Enable CORS so the React frontend can call this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLOv8 nano model (lightweight & fast for real-time CPU inference)
print("Loading YOLOv8 model...")
model = YOLO('yolov8n.pt')
print("YOLOv8 model loaded successfully!")

# Request model for incoming base64 image data
class DetectionRequest(BaseModel):
    image: str

# YOLO COCO class names that are prohibited in an exam
PROHIBITED_CLASSES = {
    'cell phone': 80, 
    'laptop': 70, 
    'book': 50, 
    'remote': 40, 
    'keyboard': 60, 
    'mouse': 40, 
    'tablet': 75,
    'monitor': 70,
    'tv': 70
}

@app.get("/")
async def health_check():
    return {"status": "AI Proctoring Engine is running", "model": "YOLOv8n"}

@app.post("/proctor/detect")
async def detect_cheating(request: DetectionRequest):
    try:
        # --- Decode base64 image from frontend ---
        image_data = request.image
        if "," in image_data:
            _, encoded = image_data.split(",", 1)
        else:
            encoded = image_data

        data = base64.b64decode(encoded)
        img = Image.open(io.BytesIO(data)).convert("RGB")
        frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

        # --- Initialize response ---
        results_data = {
            "objects": [],
            "face_detected": True,
            "alerts": [],
            "risk_score": 0
        }

        # --- Run YOLOv8 inference ---
        yolo_results = model(frame, verbose=False)[0]

        person_count = 0
        detected_objects = []
        cumulative_risk = 0

        for box in yolo_results.boxes:
            cls_id = int(box.cls[0])
            label = yolo_results.names[cls_id]
            conf = float(box.conf[0])
            coords = box.xyxy[0].tolist()  # [x1, y1, x2, y2]

            if label == 'person':
                person_count += 1
                continue 

            # Check if this is a prohibited object
            if label in PROHIBITED_CLASSES and conf > 0.35:
                detected_objects.append({
                    "name": label,
                    "accuracy": f"{conf * 100:.1f}%",
                    "box": [int(c) for c in coords]
                })
                risk = PROHIBITED_CLASSES[label]
                cumulative_risk += risk
                results_data["alerts"].append(f"PROHIBITED OBJECT DETECTED: {label.upper()} ({conf*100:.0f}%)")

        results_data["objects"] = detected_objects

        # --- Face / Person presence logic ---
        if person_count == 0:
            results_data["face_detected"] = False
            results_data["alerts"].append("NO PERSON DETECTED IN FRAME")
            cumulative_risk += 50
        elif person_count > 1:
            results_data["alerts"].append("MULTIPLE PERSONS DETECTED")
            cumulative_risk += 100

        results_data["risk_score"] = min(100, cumulative_risk)
        return results_data

    except Exception as e:
        print(f"Error processing frame: {e}")
        return {
            "objects": [],
            "face_detected": True,
            "alerts": [],
            "error": str(e)
        }

if __name__ == "__main__":
    print("Starting AI Proctoring Engine on http://0.0.0.0:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=False)
