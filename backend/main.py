from fastapi import FastAPI, UploadFile, File, HTTPException
from pymongo import MongoClient
from datetime import datetime
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import os
from bson import ObjectId
from PIL import Image
import easyocr

# ==========================
# Load Model
# ==========================
model = tf.keras.models.load_model("../image_detector_model.h5")
print("Model Output Shape:", model.output_shape)

# ==========================
# Load OCR
# ==========================
reader = easyocr.Reader(['en'], gpu=False)

# ==========================
# FastAPI App
# ==========================
app = FastAPI()

# ==========================
# MongoDB
# ==========================
client = MongoClient("mongodb://localhost:27017")
db = client["RealVeritas_AI"]
uploads_collection = db["uploads"]

# ==========================
# Upload Folder
# ==========================
os.makedirs("uploads", exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "RealVeritas AI Backend Running",
        "database": "Connected"
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
    ocr_result = reader.readtext(
        file_path,
        detail=1,
        paragraph=False,
        text_threshold=0.5,
        low_text=0.3
    )

    # Image size
    
    img = Image.open(file_path)
    img_width, img_height = img.size
    image_area = img_width * img_height
    img.close()
    text_area = 0
    total_chars = 0

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
    print("Detected Text Boxes :", len(ocr_result))
    print("Detected Characters:", total_chars)
    print("Text Area Ratio     :", round(text_percentage, 3))
    print("==============================")

    # Reject images that are mostly text
    if (
        text_percentage > 0.15
        or total_chars > 150
        or len(ocr_result) > 20
    ):

        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=400,
            detail="No Detection. Image contains mostly text. Please use the Text Detection Module."
        )

    # --------------------------
    # Image Preprocessing
    # --------------------------
    img = image.load_img(file_path, target_size=(128, 128))

    img_array = image.img_to_array(img)

    img_array = img_array / 255.0

    img_array = np.expand_dims(img_array, axis=0)

    # --------------------------
    # Prediction
    # --------------------------
    prediction = model.predict(img_array, verbose=0)

    predicted_class = np.argmax(prediction)

    confidence = round(float(np.max(prediction)) * 100, 2)

    labels = {
        0: "Authentic",
        1: "AI Generated",
        2: "AI Manipulated"
    }

    result_label = labels[predicted_class]

    print("Prediction:", prediction)
    print("Predicted Class:", predicted_class)
    print("Label:", result_label)
    print("Confidence:", confidence)

    # --------------------------
    # Save to MongoDB
    # --------------------------
    result = uploads_collection.insert_one({
        "filename": file.filename,
        "filepath": file_path,
        "prediction": result_label,
        "confidence": confidence,
        "uploaded_at": datetime.now()
    })

    print("Inserted ID:", result.inserted_id)

    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "prediction": result_label,
        "confidence": f"{confidence}%"
    }


# ==========================
# History API
# ==========================
@app.get("/history")
def get_history():

    data = []

    for item in uploads_collection.find():

        item["_id"] = str(item["_id"])

        if "uploaded_at" in item:
            item["uploaded_at"] = item["uploaded_at"].strftime("%Y-%m-%d %H:%M:%S")

        data.append(item)

    return data


# ==========================
# Delete API
# ==========================
@app.delete("/delete/{id}")
def delete_record(id: str):

    record = uploads_collection.find_one({"_id": ObjectId(id)})

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Record not found"
        )

    if os.path.exists(record["filepath"]):
        os.remove(record["filepath"])

    uploads_collection.delete_one({"_id": ObjectId(id)})

    return {
        "message": "Record deleted successfully"
    }