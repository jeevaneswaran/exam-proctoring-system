import os
from ultralytics import YOLO

# ==============================================================================
# AI PROCTORING SYSTEM - CUSTOM YOLO TRAINING SCRIPT
# ==============================================================================
# Use this script to "create a new library" (train a custom AI model) 
# so the proctoring system can detect specific objects you want 
# (e.g., specific calculators, smartwatches, earpieces, ID cards).
# ==============================================================================

def train_custom_model():
    print("🚀 Initializing Custom AI Training Process...")

    # 1. Load the base model (starting with the pre-trained 'brain')
    # We use yolo11n.pt as the foundation so it already knows basic shapes.
    model = YOLO("yolo11n.pt") 

    # 2. Start Training!
    # Update 'dataset/data.yaml' with the path to your labeled images.
    print("⏳ Beginning training on your custom image library...")
    results = model.train(
        data="dataset/data.yaml",   # Path to your dataset configuration file
        epochs=50,             # Number of times it reviews the whole dataset (50-100 is good)
        imgsz=640,             # Image size to train on
        batch=16,              # How many images it processes at once
        name="custom_proctor", # Name of the folder where results will be saved
        device="cpu"           # Use '0' if you have an NVIDIA GPU, otherwise 'cpu'
    )

    print("✅ Training Complete!")
    print("Your new custom library (model weights) is saved in: runs/detect/custom_proctor/weights/best.pt")
    print("Update 'flask_proctor_backend.py' to use 'best.pt' instead of 'yolo11n.pt'!")

if __name__ == '__main__':
    train_custom_model()
