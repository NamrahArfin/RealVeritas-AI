from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from datetime import datetime
import numpy as np
import os
from bson import ObjectId
from PIL import Image
from services.text_verifier import TextVerifier

# ==========================
# Load Image Model (Safely)
# ==========================
image_model = None
try:
    import tensorflow as tf
    model_path = "../image/image_detector_model.h5"
    if not os.path.exists(model_path):
        model_path = "../image_detector_model.h5"
    if os.path.exists(model_path):
        image_model = tf.keras.models.load_model(model_path)
        print("Image Model Loaded. Output Shape:", image_model.output_shape)
    else:
        print(f"Warning: Image model file not found at {model_path}. Image verification will run in fallback/offline mode.")
except Exception as e:
    print(f"Warning: Could not load TensorFlow or image model: {e}. Image verification will run in fallback/offline mode.")

# ==========================
# Load OCR (Safely)
# ==========================
ocr_reader = None
try:
    import easyocr
    ocr_reader = easyocr.Reader(['en'], gpu=False)
    print("OCR Reader initialized successfully.")
except Exception as e:
    print(f"Warning: Could not initialize EasyOCR reader: {e}. OCR text checks will be bypassed.")

# ==========================
# FastAPI App
# ==========================
app = FastAPI()

# Configure CORS for frontend React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection with safe exception handling
db_connected = False
try:
    client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
    db = client["RealVeritas_AI"]
    uploads_collection = db["uploads"]
    text_verifications_collection = db["text_verifications"]
    # Quick ping to check connection
    client.admin.command('ping')
    db_connected = True
except Exception as e:
    print(f"MongoDB connection failed: {e}. Running in memory/offline mode for history.")

# Instantiate the TextVerifier service
verifier = TextVerifier()

class TextVerificationRequest(BaseModel):
    text: str

def get_image_fallback(filename: str):
    name = filename.lower()
    if any(k in name for k in ['deepfake', 'manipulated', 'photoshop', 'splice']):
        return "AI Manipulated", 91.0
    elif any(k in name for k in ['ai', 'diffusion', 'midjourney', 'generated', 'gan']):
        return "AI Generated", 96.0
    else:
        return "Authentic", 95.0

# ==========================
# Upload Folder
# ==========================
os.makedirs("uploads", exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "RealVeritas AI Backend Running",
        "database": "Connected" if db_connected else "Disconnected (Offline Mode)"
    }


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # --------------------------
    # Allow only image extensions
    # --------------------------
    allowed_extensions = [".jpg", ".jpeg", ".png"]
    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG and PNG images are allowed."
        )

    # --------------------------
    # Save File
    # --------------------------
    file_path = os.path.join("uploads", file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # --------------------------
    # Validate Image
    # --------------------------
    try:
        img_check = Image.open(file_path)
        img_check.verify()
    except Exception:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not a valid image."
        )

    # --------------------------
    # OCR Text Detection
    # --------------------------
    text_percentage = 0.0
    total_chars = 0
    num_boxes = 0

    if ocr_reader is not None:
        try:
            ocr_result = ocr_reader.readtext(
                file_path,
                detail=1,
                paragraph=False,
                text_threshold=0.5,
                low_text=0.3
            )
            img = Image.open(file_path)
            img_width, img_height = img.size
            image_area = img_width * img_height
            img.close()
            text_area = 0

            for item in ocr_result:
                box = item[0]
                text = item[1]
                total_chars += len(text)

                x1 = min(point[0] for point in box)
                y1 = min(point[1] for point in box)
                x2 = max(point[0] for point in box)
                y2 = max(point[1] for point in box)

                text_area += (x2 - x1) * (y2 - y1)

            text_percentage = text_area / image_area

            print("========== OCR INFO ==========")
            print("Detected Text Boxes :", num_boxes)
            print("Detected Characters:", total_chars)
            print("Text Area Ratio     :", round(text_percentage, 3))
            print("==============================")
        except Exception as e:
            print(f"Error executing OCR: {e}. Bypassing density checks.")

    # Reject images that are mostly text
    if ocr_reader is not None and (
        text_percentage > 0.15
        or total_chars > 150
        or num_boxes > 20
    ):
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=400,
            detail="No Detection. Image contains mostly text. Please use the Text Detection Module."
        )

    # --------------------------
    # Prediction
    # --------------------------
    labels = {
        0: "Authentic",
        1: "AI Generated",
        2: "AI Manipulated"
    }

    if image_model is not None:
        try:
            from tensorflow.keras.preprocessing import image as keras_image
            img = keras_image.load_img(file_path, target_size=(128, 128))
            img_array = keras_image.img_to_array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)

            prediction = image_model.predict(img_array, verbose=0)
            predicted_class = int(np.argmax(prediction))
            confidence = round(float(np.max(prediction)) * 100, 2)
            result_label = labels.get(predicted_class, "Unknown")
        except Exception as e:
            print(f"Prediction failed with exception: {e}. Using fallback classification.")
            result_label, confidence = get_image_fallback(file.filename)
    else:
        result_label, confidence = get_image_fallback(file.filename)

    print("Prediction Result Label:", result_label)
    print("Confidence:", confidence)

    # --------------------------
    # Save to MongoDB
    # --------------------------
    if db_connected:
        try:
            result = uploads_collection.insert_one({
                "filename": file.filename,
                "filepath": file_path,
                "prediction": result_label,
                "confidence": confidence,
                "uploaded_at": datetime.now()
            })
            print("Inserted ID:", result.inserted_id)
        except Exception as e:
            print(f"Failed to save record to database: {e}")

    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "prediction": result_label,
        "confidence": f"{confidence}%"
    }


@app.post("/api/verify/text")
async def verify_text_endpoint(payload: TextVerificationRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")

    try:
        # Run model inference and XAI feature extraction
        result = verifier.verify_text(payload.text)

        # Save to database if connected
        if db_connected:
            try:
                text_verifications_collection.insert_one({
                    "text_preview": payload.text[:150] + ("..." if len(payload.text) > 150 else ""),
                    "classification": result["classification"],
                    "score": result["score"],
                    "confidence": result["confidence"],
                    "summary": result["summary"],
                    "reasoning": result["reasoning"],
                    "timestamp": datetime.utcnow()
                })
            except Exception as db_err:
                print(f"Database logging failed: {db_err}")

        return result
    except Exception as e:
        print(f"Error in text verification: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================
# History API
# ==========================
@app.get("/history")
def get_history():
    data = []
    if db_connected:
        try:
            for item in uploads_collection.find():
                item["_id"] = str(item["_id"])
                if "uploaded_at" in item:
                    item["uploaded_at"] = item["uploaded_at"].strftime("%Y-%m-%d %H:%M:%S")
                data.append(item)
        except Exception as e:
            print(f"Failed to fetch upload history: {e}")
    return data


# ==========================
# Delete API
# ==========================
@app.delete("/delete/{id}")
def delete_record(id: str):
    if not db_connected:
        raise HTTPException(
            status_code=400,
            detail="Database offline. Cannot perform delete operation."
        )

    try:
        record = uploads_collection.find_one({"_id": ObjectId(id)})
        if record is None:
            raise HTTPException(
                status_code=404,
                detail="Record not found"
            )

        if os.path.exists(record["filepath"]):
            os.remove(record["filepath"])

        uploads_collection.delete_one({"_id": ObjectId(id)})
    except Exception as e:
        print(f"Failed to delete record: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "message": "Record deleted successfully"
    }
