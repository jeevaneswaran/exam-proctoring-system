from ultralytics import YOLO
import cv2

class ObjectAnalyzer:
    def __init__(self, model_path='yolov8n.pt'):
        # Using yolov8n.pt (nano) for real-time performance
        # It will load from project root if it exists, otherwise it will download
        self.model = YOLO(model_path)
        # Class list: 67 is 'cell phone' in COCO dataset
        self.target_classes = [67] 

    def analyze(self, frame):
        # Run YOLOv8 inference
        results = self.model(frame, conf=0.3, verbose=False)[0]
        
        detections = []
        for box in results.boxes:
            cls = int(box.cls[0])
            name = results.names[cls]
            conf = float(box.conf[0])
            
            if cls in self.target_classes:
                xyxy = box.xyxy[0].tolist() # [x1, y1, x2, y2]
                detections.append({
                    "object": "MOBILE PHONE",
                    "confidence": conf,
                    "box": [int(x) for x in xyxy]
                })

        return detections
