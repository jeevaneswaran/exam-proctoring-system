"""
Neural Sentinel - Standalone Exam Proctoring Monitor
====================================================
Opens a real-time OpenCV window that detects:
  - Your face (Haar Cascade)
  - Gaze direction (left/right/away)
  - Mobile phones, books, laptops, remotes (YOLOv8)
  - Multiple persons in frame

Run:   python proctor_monitor.py
Press:  Q to quit
"""

import cv2
import time
import numpy as np
import argparse
import os
from ultralytics import YOLO
from supabase import create_client, Client
from dotenv import load_dotenv

# ─────────────────────────────────────────────
#  CONFIG & ARGS
# ─────────────────────────────────────────────
parser = argparse.ArgumentParser()
parser.add_argument('--student_id', default='unknown')
parser.add_argument('--exam_id',    default='unknown')
parser.add_argument('--auto', action='store_true', help='Auto start/stop based on Supabase exam status')
args = parser.parse_args()

STUDENT_ID = args.student_id
EXAM_ID    = args.exam_id

# Load environment (should be in the same dir or one level up)
# For dev, we can also use hardcoded values if .env is missing
SUPABASE_URL = "https://kmfeacomvfkwpqhzukbg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZmVhY29tdmZrd3BxaHp1a2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjA2ODksImV4cCI6MjA4NjYzNjY4OX0.U3xhuf8HKpl28hG0oNbJPhv48SYmkgb21CTQNft-NR0"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

PROHIBITED_CLASSES = {
    67: 'MOBILE PHONE',
    73: 'LAPTOP',
    84: 'BOOK',
    65: 'REMOTE',
    63: 'LAPTOP',   # also keyboard
    64: 'MOUSE',
}
CONF_THRESHOLD = 0.30   # Lower = more sensitive
WINDOW_NAME   = f"🔒 Neural Sentinel - {STUDENT_ID[:8]}"


# ─────────────────────────────────────────────
#  DRAWING HELPERS
# ─────────────────────────────────────────────
def draw_rounded_rect(img, pt1, pt2, color, thickness, r=12):
    """Draw a rectangle with rounded corners."""
    x1, y1 = pt1
    x2, y2 = pt2
    cv2.line(img,  (x1 + r, y1), (x2 - r, y1), color, thickness)
    cv2.line(img,  (x1 + r, y2), (x2 - r, y2), color, thickness)
    cv2.line(img,  (x1, y1 + r), (x1, y2 - r), color, thickness)
    cv2.line(img,  (x2, y1 + r), (x2, y2 - r), color, thickness)
    cv2.ellipse(img, (x1 + r, y1 + r), (r, r), 180, 0, 90,  color, thickness)
    cv2.ellipse(img, (x2 - r, y1 + r), (r, r), 270, 0, 90,  color, thickness)
    cv2.ellipse(img, (x1 + r, y2 - r), (r, r), 90,  0, 90,  color, thickness)
    cv2.ellipse(img, (x2 - r, y2 - r), (r, r), 0,   0, 90,  color, thickness)

def alpha_blend_rect(img, pt1, pt2, color_bgr, alpha=0.45):
    """Draw a semi-transparent filled rectangle."""
    overlay = img.copy()
    cv2.rectangle(overlay, pt1, pt2, color_bgr, -1)
    cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)

def put_text_with_bg(img, text, pos, font_scale=0.55, thickness=1,
                     fg=(255,255,255), bg=(0,0,0), padding=6):
    """Draw text with a solid background pill."""
    (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_DUPLEX, font_scale, thickness)
    x, y = pos
    cv2.rectangle(img, (x - padding, y - th - padding),
                  (x + tw + padding, y + padding), bg, -1)
    cv2.putText(img, text, (x, y), cv2.FONT_HERSHEY_DUPLEX,
                font_scale, fg, thickness, cv2.LINE_AA)


# ─────────────────────────────────────────────
#  MAIN MONITOR
# ─────────────────────────────────────────────
def main():
    print("\n" + "="*55)
    print("  🔒  Neural Sentinel  |  Exam Proctoring Monitor")
    print("="*55)

    # Load YOLOv8
    print("  Loading YOLOv8n model...")
    yolo = YOLO('yolov8n.pt')
    print("  ✅  YOLOv8n ready")

    # Load face & eye cascade
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_eye.xml')
    print("  ✅  Face detector ready")

    # Open webcam — try multiple backends to fix Windows black screen
    cap = None
    BACKENDS = [cv2.CAP_MSMF, cv2.CAP_DSHOW, cv2.CAP_ANY]
    BACKEND_NAMES = ['MSMF', 'DSHOW', 'ANY']

    for idx in [0, 1, 2]:
        for backend, bname in zip(BACKENDS, BACKEND_NAMES):
            print(f"  Trying camera {idx} with backend {bname}...")
            cap = cv2.VideoCapture(idx, backend)
            if not cap.isOpened():
                cap.release()
                cap = None
                continue

            # Warm-up: flush the first 30 blank frames Windows sends
            print(f"  Warming up camera {idx} ({bname})...")
            good = False
            for _ in range(40):
                ret, frame = cap.read()
                if ret and frame is not None and frame.mean() > 3:  # Not black
                    good = True
                    break

            if good:
                print(f"  ✅  Camera {idx} ({bname}) connected — live feed confirmed")
                break
            else:
                cap.release()
                cap = None

        if cap is not None:
            break

    if cap is None:
        print("\n  ❌  No camera found or camera is in use by another app.")
        print("  Tips:")
        print("    • Close your browser tab that uses the webcam first")
        print("    • Make sure no other apps are using the camera")
        print("    • Try reconnecting your webcam")
        return

    def get_remote_active():
        try:
            resp = supabase.table("proctoring_status").select("is_active").eq("student_id", STUDENT_ID).eq("exam_id", EXAM_ID).limit(1).execute()
            data = getattr(resp, 'data', None) or (resp.get('data') if isinstance(resp, dict) else None)
            if data and len(data) > 0:
                return bool(data[0].get('is_active'))
        except Exception:
            pass
        return True

    # If running in auto mode, wait for remote exam start (is_active=True)
    if args.auto:
        print("  Auto mode: waiting for exam to start on the server...")
        while True:
            if get_remote_active():
                print("  Detected exam active — starting monitor")
                break
            time.sleep(3)

    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)

    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    print(f"\n  Camera: {w}x{h}")
    print("  Press  Q  to quit safely\n")

    # Create resizable window and keep it persistent so closing it won't kill the process
    cv2.namedWindow(WINDOW_NAME, cv2.WINDOW_NORMAL)

    # Violation counters
    violation_log = []
    yolo_every    = 3    # Run YOLO every N frames (saves CPU)
    frame_idx     = 0
    last_yolo_det = []   # Cache last YOLO results between frames

    last_heartbeat = 0
    heartbeat_every = 5 # seconds

    while True:
        ret, frame = cap.read()
        if not ret or frame is None:
            # Camera disconnected or in use (e.g., user clicked browser). Don't exit: try to reconnect.
            print("  [WARN] Camera read failed — attempting to reconnect...")
            cv2.destroyAllWindows()
            cap.release()
            cap = None
            reconnect_start = time.time()
            reconnected = False
            while time.time() - reconnect_start < 30:  # try for 30 seconds
                for idx in [0, 1, 2]:
                    for backend, bname in zip(BACKENDS, BACKEND_NAMES):
                        try:
                            cap = cv2.VideoCapture(idx, backend)
                            if not cap.isOpened():
                                cap.release()
                                cap = None
                                continue

                            # flush a few frames
                            good = False
                            for _ in range(15):
                                r, f = cap.read()
                                if r and f is not None and f.mean() > 3:
                                    good = True
                                    break
                            if good:
                                reconnected = True
                                print(f"  ✅  Reconnected camera {idx} ({bname})")
                                break
                            else:
                                cap.release()
                                cap = None
                        except Exception:
                            cap = None
                    if reconnected:
                        break
                if reconnected:
                    break
                # Check remote status while waiting; if exam ended, exit
                if args.auto and not get_remote_active():
                    print("  Exam ended on server while reconnecting — exiting")
                    return
                time.sleep(2)

            if not reconnected:
                print("  Failed to reconnect camera — will keep retrying. Press 'q' to exit.")
                # create a placeholder black frame to continue the UI loop
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
            else:
                ret, frame = cap.read()
            
        # ── 0. HEARTBEAT ──────────────────────────────────────────
        if time.time() - last_heartbeat > heartbeat_every:
            try:
                supabase.table("proctoring_status").upsert({
                    "student_id": STUDENT_ID,
                    "exam_id":    EXAM_ID,
                    "is_active":  True,
                    "last_heartbeat": "now()"
                }).execute()
                last_heartbeat = time.time()
            except:
                pass # Silently fail if net is down

        frame = cv2.flip(frame, 1)   # Mirror so it feels natural
        display = frame.copy()
        frame_idx += 1

        # ── 1. FACE DETECTION (every frame) ──────────────────────
        gray  = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2,
                                              minNeighbors=5, minSize=(60, 60))

        face_detected   = len(faces) > 0
        multi_person    = len(faces) > 1
        gaze_direction  = "FORWARD"
        eye_status      = "OK"
        violations_this_frame = []

        if face_detected:
            # Largest face = exam candidate
            fx, fy, fw, fh = sorted(faces, key=lambda b: b[2]*b[3], reverse=True)[0]
            cx = fx + fw / 2

            # Gaze estimation from face centre position
            if cx < w * 0.30:
                gaze_direction = "LOOKING RIGHT ▶"
                violations_this_frame.append("GAZE SHIFT: Looking Right")
            elif cx > w * 0.70:
                gaze_direction = "LOOKING LEFT  ◀"
                violations_this_frame.append("GAZE SHIFT: Looking Left")
            else:
                # Check eyes inside face ROI
                roi_gray = gray[fy:fy+fh, fx:fx+fw]
                eyes = eye_cascade.detectMultiScale(roi_gray, scaleFactor=1.1,
                                                    minNeighbors=3, minSize=(20, 20))
                if len(eyes) < 1:
                    gaze_direction = "LOOKING AWAY ↑"
                    violations_this_frame.append("GAZE: Eyes not visible")
                    eye_status = "NOT VISIBLE"
                elif len(eyes) < 2:
                    eye_status = "PARTIAL"

            # Draw face box
            col = (0, 220, 0) if gaze_direction == "FORWARD" else (0, 120, 255)
            draw_rounded_rect(display, (fx, fy), (fx+fw, fy+fh), col, 2)
            put_text_with_bg(display, f"STUDENT  {gaze_direction}",
                             (fx, fy - 10), 0.45, 1, fg=(255,255,255), bg=col)

            # Draw other faces (suspicious)
            for (x, y, ww, hh) in faces[1:]:
                draw_rounded_rect(display, (x, y), (x+ww, y+hh), (0, 0, 220), 2)
                put_text_with_bg(display, "UNKNOWN PERSON",
                                 (x, y - 10), 0.45, 1, fg=(255,255,255), bg=(0,0,200))

        else:
            gaze_direction = "NOT DETECTED"
            violations_this_frame.append("FACE: Not visible in frame")

        if multi_person:
            violations_this_frame.append("ALERT: Multiple persons detected")

        # ── 2. YOLO OBJECT DETECTION (every 3rd frame) ───────────
        if frame_idx % yolo_every == 0:
            yolo_results = yolo(frame, conf=CONF_THRESHOLD, verbose=False)[0]
            new_det = []
            for box in yolo_results.boxes:
                cls_id = int(box.cls[0])
                conf   = float(box.conf[0])
                if cls_id in PROHIBITED_CLASSES:
                    coords = [int(c) for c in box.xyxy[0].tolist()]
                    new_det.append({
                        'label': PROHIBITED_CLASSES[cls_id],
                        'conf':  conf,
                        'box':   coords
                    })
            last_yolo_det = new_det

        # Draw YOLO detections (cached)
        for det in last_yolo_det:
            x1, y1, x2, y2 = det['box']
            pct = f"{det['conf']*100:.0f}%"
            cv2.rectangle(display, (x1, y1), (x2, y2), (0, 50, 255), 3)
            # Glow effect
            cv2.rectangle(display, (x1-2, y1-2), (x2+2, y2+2), (0, 100, 255), 1)
            put_text_with_bg(display, f"⚠ {det['label']}  {pct}",
                             (x1, max(y1 - 12, 18)), 0.5, 1,
                             fg=(255, 255, 255), bg=(0, 0, 200))
            
            violations_this_frame.append(f"PROHIBITED OBJECT: {det['label']} detected")

        # ── 3. HUD OVERLAY ────────────────────────────────────────
        # Top-left status panel
        panel_h = 115
        alpha_blend_rect(display, (0, 0), (260, panel_h), (10, 10, 10), 0.65)
        cv2.putText(display, "NEURAL SENTINEL  v2.0",
                    (10, 22), cv2.FONT_HERSHEY_DUPLEX, 0.5, (80, 200, 255), 1)

        face_col  = (0, 200, 0) if face_detected else (0, 0, 255)
        gaze_col  = (0, 200, 0) if gaze_direction == "FORWARD" else (0, 100, 255)
        obj_col   = (0, 0, 255) if last_yolo_det else (0, 200, 0)

        cv2.putText(display, f"FACE  : {'DETECTED' if face_detected else 'MISSING'}",
                    (10, 46), cv2.FONT_HERSHEY_DUPLEX, 0.48, face_col, 1)
        cv2.putText(display, f"GAZE  : {gaze_direction}",
                    (10, 66), cv2.FONT_HERSHEY_DUPLEX, 0.48, gaze_col, 1)
        cv2.putText(display, f"EYES  : {eye_status}",
                    (10, 86), cv2.FONT_HERSHEY_DUPLEX, 0.48, (200, 200, 200), 1)
        cv2.putText(display, f"OBJECT: {'DETECTED' if last_yolo_det else 'CLEAR'}",
                    (10, 106), cv2.FONT_HERSHEY_DUPLEX, 0.48, obj_col, 1)

        # FPS display
        fps_text = f"FPS: {cap.get(cv2.CAP_PROP_FPS):.0f}"
        cv2.putText(display, fps_text, (w - 90, 22),
                    cv2.FONT_HERSHEY_DUPLEX, 0.45, (150, 150, 150), 1)

        # ── 4. VIOLATION BANNER ───────────────────────────────────
        if violations_this_frame:
            # Red alert bar at the bottom
            alpha_blend_rect(display, (0, h - 65), (w, h), (0, 0, 220), 0.80)
            cv2.rectangle(display, (0, h - 65), (w, h), (0, 0, 200), 2)

            cv2.putText(display, "⚠  MALPRACTICE DETECTED  —  DON'T DO THIS!",
                        (30, h - 42), cv2.FONT_HERSHEY_DUPLEX, 0.65, (255, 255, 255), 2)
            cv2.putText(display, violations_this_frame[0].upper(),
                        (30, h - 18), cv2.FONT_HERSHEY_DUPLEX, 0.45, (255, 200, 200), 1)

            # Red border
            cv2.rectangle(display, (0, 0), (w - 1, h - 1), (0, 0, 255), 4)

            violation_log.append({
                'time': time.strftime('%H:%M:%S'),
                'events': violations_this_frame
            })
            
            # Sync to Supabase
            try:
                # Calculate risk score based on detection severity
                base_risk = 20
                if multi_person: base_risk = 70
                elif last_yolo_det: base_risk = 60
                elif gaze_direction != "FORWARD": base_risk = 40
                
                print(f"  [SYNC] Logging violations: {', '.join(violations_this_frame)}")
                supabase.table("violation_logs").insert({
                    "student_id": STUDENT_ID,
                    "exam_id":    EXAM_ID,
                    "violation_type": " | ".join(violations_this_frame),
                    "risk_score": base_risk
                }).execute()
            except Exception as e:
                print(f"  [ERROR] Sync failed: {e}")
            except:
                pass
        else:
            # Green secure border
            cv2.rectangle(display, (0, 0), (w - 1, h - 1), (0, 200, 80), 2)
            put_text_with_bg(display, "✔  SECURE  —  NO VIOLATIONS",
                             (int(w/2) - 130, h - 15), 0.50, 1,
                             fg=(255, 255, 255), bg=(0, 140, 50))

        cv2.imshow(WINDOW_NAME, display)

        # If user clicks the window close button, OpenCV marks it invisible.
        # Recreate the window and continue monitoring instead of exiting.
        try:
            visible = cv2.getWindowProperty(WINDOW_NAME, cv2.WND_PROP_VISIBLE)
        except Exception:
            visible = 1

        if visible < 1:
            print("  [WARN] Window was closed by user — recreating window and continuing monitor.")
            cv2.namedWindow(WINDOW_NAME, cv2.WINDOW_NORMAL)
            # If running in auto mode and exam ended remotely, exit
            if args.auto and not get_remote_active():
                print("  Exam ended on server — exiting")
                break
            # small pause to avoid busy-looping
            time.sleep(0.3)
            continue

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    print(f"\n  Session ended.  Total violation events: {len(violation_log)}")
    if violation_log:
        print("\n  Violation Log:")
        for v in violation_log[-10:]:
            print(f"    [{v['time']}] {' | '.join(v['events'])}")

if __name__ == '__main__':
    main()
