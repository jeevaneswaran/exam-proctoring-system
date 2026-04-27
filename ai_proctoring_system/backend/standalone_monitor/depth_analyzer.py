import cv2
import torch
import numpy as np
import time

class DepthAnalyzer:
    def __init__(self):
        print("  Initializing Depth Engine (MiDaS Small)...")
        # Load MiDaS Small (MiDaS_small) for CPU efficiency
        self.model_type = "MiDaS_small"
        self.midas = torch.hub.load("intel-isl/MiDaS", self.model_type)
        
        # Move model to CPU
        self.device = torch.device("cpu")
        self.midas.to(self.device)
        self.midas.eval()

        # Get transforms
        midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms")
        self.transform = midas_transforms.small_transform if self.model_type == "MiDaS_small" else midas_transforms.dpt_transform

        # Calibration & Thresholds
        self.baseline_depth = None
        self.depth_history = []
        self.HISTORY_SIZE = 10
        
        # Thresholds (relative units from MiDaS)
        self.TOO_FAR_THRESHOLD = 0.5  # Relative change from baseline
        self.SUDDEN_CHANGE_THRESHOLD = 0.3
        
        print("  ✅  Depth Engine Ready")

    def get_depth_map(self, frame):
        """Generates a raw depth map from a BGR frame."""
        img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        input_batch = self.transform(img).to(self.device)

        with torch.no_grad():
            prediction = self.midas(input_batch)
            prediction = torch.nn.functional.interpolate(
                prediction.unsqueeze(1),
                size=frame.shape[:2],
                mode="bicubic",
                align_corners=False,
            ).squeeze()

        depth_map = prediction.cpu().numpy()
        return depth_map

    def analyze(self, frame, face_box=None):
        """
        Processes frame and returns depth-based violations.
        face_box: [x, y, w, h] from face detector
        """
        depth_map = self.get_depth_map(frame)
        
        violations = []
        spatial_info = {
            "avg_depth": np.mean(depth_map),
            "face_depth": None,
            "status": "CALIBRATING..."
        }

        # 1. Calibrate baseline if not set
        if self.baseline_depth is None and face_box is not None:
            fx, fy, fw, fh = face_box
            face_depth_roi = depth_map[fy:fy+fh, fx:fx+fw]
            self.baseline_depth = np.mean(face_depth_roi)
            return [], spatial_info
        
        # 2. Face Depth Monitoring
        if face_box is not None:
            fx, fy, fw, fh = face_box
            # Ensure indices are within bounds
            fy, fh = max(0, fy), min(depth_map.shape[0]-fy, fh)
            fx, fw = max(0, fx), min(depth_map.shape[1]-fx, fw)
            
            face_depth_roi = depth_map[fy:fy+fh, fx:fx+fw]
            current_face_depth = np.mean(face_depth_roi)
            spatial_info["face_depth"] = current_face_depth
            
            # Detect "Too Far" (MiDaS depth values are inverse: higher = closer)
            # If current depth is significantly lower than baseline, they moved away
            if self.baseline_depth and current_face_depth < self.baseline_depth * 0.6:
                violations.append("SPATIAL: Student moved too far from camera")
                spatial_info["status"] = "TOO FAR"
            elif self.baseline_depth and current_face_depth > self.baseline_depth * 1.6:
                violations.append("SPATIAL: Student is too close to camera")
                spatial_info["status"] = "TOO CLOSE"
            else:
                spatial_info["status"] = "NORMAL"

            # 3. Sudden Depth Variation
            self.depth_history.append(current_face_depth)
            if len(self.depth_history) > self.HISTORY_SIZE:
                self.depth_history.pop(0)
                avg_hist = np.mean(self.depth_history[:-1])
                if abs(current_face_depth - avg_hist) > avg_hist * self.SUDDEN_CHANGE_THRESHOLD:
                    violations.append("SPATIAL: Sudden depth shift detected")
        
        # 4. Hidden Person Detection (Background depth clusters)
        # Simple heuristic: if there's a large area with depth similar to a person but no face detected
        # This is complex to do purely with depth, but we can flag if background depth increases suddenly
        
        return violations, spatial_info

    def get_heatmap(self, depth_map):
        """Converts raw depth map to a color heatmap for visualization."""
        depth_min = depth_map.min()
        depth_max = depth_map.max()
        
        if depth_max - depth_min > 0:
            depth_norm = (255 * (depth_map - depth_min) / (depth_max - depth_min)).astype(np.uint8)
        else:
            depth_norm = np.zeros(depth_map.shape, dtype=np.uint8)
            
        color_map = cv2.applyColorMap(depth_norm, cv2.COLORMAP_MAGMA)
        return color_map
