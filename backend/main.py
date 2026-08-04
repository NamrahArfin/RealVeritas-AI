from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import os
from datetime import datetime
from services.text_verifier import TextVerifier

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
    db_connected = False

# Instantiate the TextVerifier service
verifier = TextVerifier()

class TextVerificationRequest(BaseModel):
    text: str

@app.get("/")
def home():
    return {
        "message": "RealVeritas AI Backend Running",
        "database": "Connected" if db_connected else "Disconnected (Offline Mode)"
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = f"uploads/{file.filename}"
    
    os.makedirs("uploads", exist_ok=True)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    if db_connected:
        try:
            result = uploads_collection.insert_one({
                "filename": file.filename,
                "filepath": file_path,
                "timestamp": datetime.utcnow()
            })
            print("Inserted ID:", result.inserted_id)
        except Exception as e:
            print(f"Failed to log upload to DB: {e}")

    return {
        "message": "File uploaded successfully",
        "filename": file.filename
    }

@app.post("/api/verify/text")
async def verify_text(payload: TextVerificationRequest):
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