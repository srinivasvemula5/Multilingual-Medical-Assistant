from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from gtts import gTTS
import faiss
import numpy as np
import json
import os
import uuid

app = FastAPI(title="Local Medical Voice Assistant")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://multilingual-medical-assistant-web.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------
# Load data + FAISS
# ------------------------------------------------
with open("health_full_prompts.jsonl", "r", encoding="utf-8") as f:
    data = [json.loads(line) for line in f]

texts = [item["prompt"] for item in data]
embedder = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = [embedder.encode(t) for t in texts]
dimension = len(embeddings[0])
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings).astype("float32"))

def retrieve(query, top_k=3):
    query_lower = query.lower()
    substring_matches = [item for item in data if item["prompt"].lower() in query_lower]
    if substring_matches:
        return substring_matches[:top_k]
    return []

# ------------------------------------------------
# Data model
# ------------------------------------------------
class VoiceInput(BaseModel):
    text: str
    lang: str

# ------------------------------------------------
# Routes
# ------------------------------------------------
@app.get("/")
def root():
    return {"message": "Local Medical Assistant running"}

@app.post("/medical_advice")
def medical_advice(input: VoiceInput):
    query = input.text.strip()
    lang = input.lang or "en"

    if not query:
        return {"reply": "Please say something.", "lang": lang}

    results = retrieve(query)
    if results:
        reply = "\n".join([r["completion"] for r in results])
    else:
        reply = "Sorry, no information available for this query. Please visit the nearest doctor."

    # Generate speech file
    audio_dir = "audio_responses"
    os.makedirs(audio_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}.mp3"
    filepath = os.path.join(audio_dir, filename)

    # Get backend base URL from environment variable
    base_url = os.getenv("RAILWAY_PUBLIC_DOMAIN", "localhost:8000")
    protocol = "https" if "railway" in base_url else "http"

    try:
        tts = gTTS(text=reply, lang=lang if lang in ["en", "hi", "te", "mr"] else "en")
        tts.save(filepath)
        audio_url = f"{protocol}://{base_url}/audio/{filename}"
    except Exception as e:
        print("Speech generation failed:", e)
        audio_url = None

    return {
        "reply": reply,
        "lang": lang,
        "audio": audio_url
    }

# Serve audio files
from fastapi.staticfiles import StaticFiles
os.makedirs("audio_responses", exist_ok=True)
app.mount("/audio", StaticFiles(directory="audio_responses"), name="audio")