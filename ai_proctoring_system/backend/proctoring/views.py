import cv2
import numpy as np
import base64
from rest_framework.views import APIView
from rest_framework.response import Response
from ultralytics import YOLO
from PIL import Image
import io

import subprocess
import os
import signal
import sys

# Global variable to track the proctoring process
proctoring_process = None

# Load YOLOv8 model - using 'yolov8n.pt' (nano) for performance
# It will automatically download on first run
model = YOLO('yolov8n.pt')

class ProctoringAIView(APIView):
    def post(self, request):
        try:
            # Get frame from request
            frame_data = request.data.get('frame')
            print(f"--- Frame Received: {len(frame_data) if frame_data else 0} bytes ---")
            if not frame_data:
                return Response({'error': 'No frame provided'}, status=400)

            # Decode base64 image
            header, encoded = frame_data.split(",", 1)
            image_data = base64.b64decode(encoded)
            
            # Convert to OpenCV format
            image = Image.open(io.BytesIO(image_data))
            frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

            # Run YOLOv8 inference with LOWER confidence for better detection
            results = model(frame, conf=0.25)[0]
            
            detections = []
            alerts = []
            
            device_detected = False
            person_count = 0
            
            # Expanded list of suspicious objects in COCO dataset
            prohibited_classes = [
                'cell phone', 'laptop', 'remote', 'book', 'keyboard', 
                'mouse', 'bottle', 'backpack', 'handbag', 'tablet', 'cup'
            ]
            
            for box in results.boxes:
                cls = int(box.cls[0])
                name = results.names[cls]
                conf = float(box.conf[0])
                xyxy = box.xyxy[0].tolist() # [x1, y1, x2, y2]
                
                detections.append({
                    'object': name,
                    'confidence': conf,
                    'box': xyxy
                })
                
                if name == 'person':
                    person_count += 1
                
                # Check against expanded prohibited list
                if name in prohibited_classes:
                    device_detected = True
                    alerts.append(f"It seems you're breaching the proctoring protocols. Please concentrate and focus on the exam. Failure to do so will lead to termination of the session.")

            # Proctoring Logic & Risk Score Calculation
            risk_score = 0
            
            if person_count == 0:
                alerts.append("NO CANDIDATE DETECTED")
                risk_score += 40
            elif person_count > 1:
                alerts.append("MULTIPLE PEOPLE DETECTED")
                risk_score += 60

            if device_detected:
                risk_score += 50

            # Mock Gaze/Head Movement Detection
            # In a real scenario, we'd use pose/landmarks. 
            # Here we simulate by checking if the person is severely off-center
            for box in results.boxes:
                if int(box.cls[0]) == 0: # Person
                    x1, y1, x2, y2 = box.xyxy[0]
                    center_x = (x1 + x2) / 2 / frame.shape[1]
                    if center_x < 0.3 or center_x > 0.7:
                        alerts.append("Unusual head movement/Looking away detected")
                        risk_score += 20

            status = 'normal'
            if risk_score > 70:
                status = 'critical'
            elif risk_score > 30:
                status = 'suspicious'

            return Response({
                'detections': detections,
                'alerts': alerts,
                'status': status,
                'risk_score': min(risk_score, 100)
            })

        except Exception as e:
            return Response({'error': str(e)}, status=500)

class StartProctorView(APIView):
    def post(self, request):
        global proctoring_process
        
        # If already running, stop it first
        if proctoring_process and proctoring_process.poll() is None:
            try:
                if os.name == 'nt': # Windows
                    subprocess.call(['taskkill', '/F', '/T', '/PID', str(proctoring_process.pid)])
                else:
                    os.killpg(os.getpgid(proctoring_process.pid), signal.SIGTERM)
            except:
                pass

        try:
            student_id = request.data.get('student_id', 'unknown')
            exam_id = request.data.get('exam_id', 'unknown')
            
            # Find the script path
            script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'standalone_monitor', 'proctor_monitor.py')
            
            # Start the process
            # We use sys.executable to ensure we use the same python interpreter
            proctoring_process = subprocess.Popen(
                [sys.executable, script_path, '--student_id', student_id, '--exam_id', exam_id],
                creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
            )
            
            return Response({'status': 'started', 'pid': proctoring_process.pid})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class StopProctorView(APIView):
    def post(self, request):
        global proctoring_process
        if proctoring_process and proctoring_process.poll() is None:
            try:
                if os.name == 'nt':
                    subprocess.call(['taskkill', '/F', '/T', '/PID', str(proctoring_process.pid)])
                else:
                    os.killpg(os.getpgid(proctoring_process.pid), signal.SIGTERM)
                proctoring_process = None
                return Response({'status': 'stopped'})
            except Exception as e:
                return Response({'error': str(e)}, status=500)
        return Response({'status': 'not_running'})
