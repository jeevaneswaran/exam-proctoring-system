# AI-Based Online Exam Proctoring System

## Overview
This is a secure, role-based Online Exam Proctoring System built with **React**, **Supabase**, and **Client-Side AI (ONNX)**. It features real-time violation detection (mobile phones, persons) using computer vision entirely in the browser.

## Features
-   **Role-Based Access**: Distinct portals for Student, Teacher, and Admin.
-   **AI Proctoring**: Real-time webcam monitoring using YOLOv8 via ONNX Runtime.
-   **Exam Interface**: Timed exams with violation tracking.
-   **Modern UI**: Sleek, responsive design with "Red, Black, Light Green" theme.

## Setup Instructions

### 1. Prerequisites
-   Node.js (v18+)
-   Supabase Account

### 2. Installation
1.  Navigate to `ai_proctoring_system/frontend`.
2.  Install dependencies:
    ```bash
    npm install
    ```

### 3. Supabase Configuration
1.  Create a new Supabase project.
2.  Go to the **SQL Editor** in Supabase dashboard.
3.  Copy the contents of `supabase_schema.sql` (found in project root) and run it. This will create the necessary tables and RLS policies.
4.  Get your **Project URL** and **Anon Key** from Project Settings > API.
5.  Create a `.env` file in `frontend/` directory:
    ```ini
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

### 4. Running the Application
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## AI Model Setup
The system expects an ONNX model at `/public/models/yolov8n.onnx`. For the demo, if the model is not found, the `ObjectDetection.js` service handles this (check console for logs). You can download `yolov8n.onnx` from the Ultralytics GitHub and place it in `frontend/public/models/`.

## Deployment
The project is ready for **Vercel** or **Netlify**.
-   **Vercel**: Import the `frontend` folder. The `vercel.json` handles routing.
-   **Netlify**: Import the `frontend` folder. Build command: `npm run build`, Publish directory: `dist`.

## Usage
1.  **Register/Login**: Use the specific login pages.
2.  **Student**: Go to Dashboard > Start Mock Exam. Grant webcam permission.
3.  **Proctoring**: The standard green indicator shows active monitoring. If you move out of frame or show a phone (simulated or real if model loaded), a violation is logged.
