from fastapi import FastAPI, UploadFile, File
from pymongo import MongoClient
import os

app = FastAPI()

client = MongoClient("mongodb://localhost:27017")

db = client["RealVeritas_AI"]
uploads_collection = db["uploads"]

@app.get("/")
def home():
    return {
        "message": "RealVeritas AI Backend Running",
        "database": "Connected"
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    result = uploads_collection.insert_one({
        "filename": file.filename,
        "filepath": file_path
    })

    print("Inserted ID:", result.inserted_id)

    return {
        "message": "File uploaded successfully",
        "filename": file.filename
    }