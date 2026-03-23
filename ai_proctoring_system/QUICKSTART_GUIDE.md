# AI Proctoring System - Quickstart Guide

Welcome back! Here is a complete overview of the system state and how to get everything running again.

## 1. System Overview

- **Frontend:** React + Vite (deployed previously on Vercel, but runs perfectly locally via `npm run dev`).
    - Connects to Supabase for authentication, storage, and database features.
    - Handles local webcam rendering and face detection (MediaPipe).
- **Backend:** Flask + YOLOv8 (`python flask_proctor_backend.py`).
    - Receives frames from the frontend and performs advanced object detection (phones, books) and movement tracking.
- **Database:** Supabase (PostgreSQL).
    - Handles users, roles, courses, exams, violation logs, and study materials.

## 2. Setting Up the Database (Supabase)

If your Supabase project expired or you need to start fresh, I have consolidated all the SQL we wrote into **one single script**.
1. Open your Supabase Dashboard -> SQL Editor.
2. Open the file `ai_proctoring_system/database/FULL_SETUP.sql`.
3. Copy the entire contents and run it. This will create all your tables, rules, and triggers.

## 3. Starting the AI Proctoring Backend (YOLO)

The backend must be running for object detection and proctoring tracking to work.

1. Open a new terminal in VS Code.
2. Navigate to the backend folder:
   ```bash
   cd ai_proctoring_system/backend
   ```
3. Activate your Python environment (if you are using one), then start the Flask server:
   ```bash
   python flask_proctor_backend.py
   ```
   *(This will run on `http://localhost:5001`)*

## 4. Connecting Frontend to Backend (The Tunnel)

Since your frontend runs in the browser or on Vercel, it needs a way to securely connect to your `localhost:5001` backend without triggering security blocks.

1. Open a **second terminal** in VS Code.
2. Start a local tunnel linking to port 5001:
   ```bash
   npx -y localtunnel --port 5001
   ```
3. It will generate a URL (like `https://some-random-words.loca.lt`). Copy this URL.

## 5. Starting the Frontend

1. Open a **third terminal**.
2. Navigate to the frontend folder:
   ```bash
   cd ai_proctoring_system/frontend
   ```
3. Open your `.env` or `.env.production` file and update `VITE_API_BASE_URL` with your new localtunnel URL from Step 4.
4. Run the frontend:
   ```bash
   npm run dev
   ```

## 6. Where We Left Off

Last time we worked, we established the **entire Exam Lifecycle Flow**:
- **Start Exam:** Automatically requests camera permissions, initial validation, begins MediaPipe face tracking, and immediately starts securely piping frames to the YOLO Backend. 
- **During Exam:** Constantly scans for mobile phones, books, multiple faces, and tab/window switching. Logs occurrences to Supabase instantly.
- **Submit Exam:** Immediately stops the webcam, cleans up permissions, drops backend connections, and auto-routes the student to the Review/Results page. 

You are ready to continue coding tests, adding more teacher administration tools, or deploying!
