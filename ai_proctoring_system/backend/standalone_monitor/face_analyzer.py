import cv2
import numpy as np

class FaceAnalyzer:
    def __init__(self):
        # Using built-in Haar Cascades for Python 3.13 compatibility
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

    def process(self, frame):
        img_h, img_w, _ = frame.shape
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        
        analysis = {
            "direction": "FORWARD",
            "eye_status": "NORMAL",
            "detected": False,
            "face_box": None,
            "person_count": len(faces)
        }

        if len(faces) > 0:
            analysis["detected"] = True
            # Take the largest face (assumed to be the candidate)
            (x, y, w, h) = sorted(faces, key=lambda b: b[2]*b[3], reverse=True)[0]
            analysis["face_box"] = [x, y, w, h]
            
            roi_gray = gray[y:y+h, x:x+w]
            eyes = self.eye_cascade.detectMultiScale(roi_gray)
            
            # Simple Logic for Direction Tracking
            center_x = x + w/2
            if center_x < img_w * 0.35:
                analysis["direction"] = "LOOKING RIGHT" # Mirrored
            elif center_x > img_w * 0.65:
                analysis["direction"] = "LOOKING LEFT" # Mirrored
            elif len(eyes) < 1:
                analysis["direction"] = "LOOKING AWAY/CLOSED"
            else:
                analysis["direction"] = "LOOKING FORWARD"

            if len(eyes) < 2:
                analysis["eye_status"] = "PARTIAL/SUSPICIOUS"
            else:
                analysis["eye_status"] = "OK"

        return analysis
