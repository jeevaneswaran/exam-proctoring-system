# How to Create a Custom AI Detection Library

If you want the AI to detect very specific types of objects (like a special kind of calculator, microscopic cheating earpieces, or your university's specific ID card), you essentially need to **teach it what those look like**. This process is called "Training a Custom Model Library."

Since the AI does not have eyes inside your room, **you have to collect the pictures and label them before the code can run.**

Here is the exact step-by-step process you must follow to build your custom library:

## Step 1: Collect Images
You need hundreds of pictures of the objects you want to detect, in different lighting, angles, and backgrounds. 
- Example: If you want to detect calculators, take 100+ pictures of calculators on desks, in hands, from above, from the side, etc.
- **Tip:** You can download thousands of pre-existing pictures from websites like **Roboflow Universe** or **Kaggle** if you don't want to take the photos yourself!

## Step 2: Annotate (Label) the Images
The AI doesn't know what a calculator is until you point to it. You must draw bounding boxes (rectangles) around the objects in every single picture.
- Use a free tool like **Roboflow** (highly recommended) or **CVAT**.
- Upload your images there, draw boxes around the objects, and label them (e.g., "calculator").
- Export the dataset in **YOLOv8/11 format**.

## Step 3: Organize Your Folders
Once you export your labeled images, you will get a `.zip` file containing an `images` folder and a `labels` folder.
Put them inside your backend folder like this:

📁 `backend`
 ┣ 📁 `dataset`
 ┃ ┣ 📁 `images`
 ┃ ┃ ┣ 📁 `train` (Put 80% of your images here)
 ┃ ┃ ┗ 📁 `val`  (Put 20% of your images here)
 ┃ ┗ 📁 `labels`
 ┃ ┃ ┣ 📁 `train` (Put 80% of your label .txt files here)
 ┃ ┃ ┗ 📁 `val`  (Put 20% of your label .txt files here)
 ┣ 📜 `dataset.yaml`
 ┣ 📜 `train_custom_yolo.py`
 ┗ 📜 `flask_proctor_backend.py`

## Step 4: Run the Training Code
I have already written the training code and configuration for you! 

1. Open `backend/dataset.yaml` and update the `names` list at the bottom to match exactly what you labeled your objects.
2. Open your VS Code terminal, stop whatever is running, and type:
   ```bash
   cd ai_proctoring_system/backend
   python train_custom_yolo.py
   ```
3. The AI will spend anywhere from 30 minutes to a few hours "studying" your images (depending on how fast your computer is). 

## Step 5: Plug the New Brain into the System
When training finishes, it will spit out a file called `best.pt`. This is your new custom library!

1. Move that `best.pt` file into your `backend` folder.
2. Open `flask_proctor_backend.py` and change line 16 from:
   `model = YOLO('yolo11n.pt')`
   To:
   `model = YOLO('best.pt')`

Congratulations! Your AI proctoring system is now completely personalized and intelligent enough to detect the specific objects you trained it on.
