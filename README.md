# 🩺 Airogyam — Multilingual Medical Voice Assistant

**Airogyam** is a local AI-powered medical voice assistant built with **FastAPI** that provides instant, offline, and multilingual health guidance.  
It leverages **SentenceTransformer + FAISS** for intelligent query retrieval and **gTTS** for generating voice responses in multiple languages — all running locally for maximum privacy.

---

## 🚀 Features

- 🎙️ **Voice-enabled** — Converts medical responses into speech using Google Text-to-Speech (gTTS).  
- 🌐 **Multilingual support** — Handles English, Hindi, Telugu, and Marathi.  
- 🤖 **Smart query retrieval** — Uses FAISS with `SentenceTransformer` for efficient semantic search.  
- 🔒 **Privacy-first** — Works locally without sending data to external APIs.  
- ⚡ **Built with FastAPI** — Lightweight, fast, and easy to deploy.

---

## 🧠 Tech Stack

- **Backend:** FastAPI  
- **AI/NLP:** SentenceTransformer (`all-MiniLM-L6-v2`), FAISS  
- **Voice:** gTTS (Google Text-to-Speech)  
- **Data Handling:** JSONL for health-related prompts  
- **Deployment:** Uvicorn server

---
Interface

<img width="1065" height="754" alt="Screenshot 2025-11-05 150711" src="https://github.com/user-attachments/assets/c0a200a8-5236-417f-b31e-d1de534af051" />

---

## 📦 Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/srinivasvemula5/Multilingual-Medical-Assistant.git
cd Multilingual-Medical-Assistant
2️⃣ Create a virtual environment
bash
Copy code
python -m venv venv
venv\Scripts\activate   # On Windows
# or
source venv/bin/activate  # On Mac/Linux
3️⃣ Install dependencies
bash
Copy code
pip install -r requirements.txt
▶️ Running the Application
Start the FastAPI server:

bash
Copy code
uvicorn main:app --reload
Open your browser and visit:

cpp
Copy code
http://127.0.0.1:8000
🧩 API Endpoints
GET /
Health check endpoint — confirms the server is running.

POST /medical_advice
Takes a text input and language, returns a medical reply and audio file.

Example request:
json
Copy code
{
  "text": "What should I do for a fever?",
  "lang": "en"
}
Example response:
json
Copy code
{
  "reply": "Drink plenty of water and rest. Consult a doctor if fever persists.",
  "lang": "en",
  "audio": "http://127.0.0.1:8000/audio/filename.mp3"
}
🗂️ Project Structure
bash
Copy code
├── main.py                  # FastAPI backend
├── health_full_prompts.jsonl # Dataset for prompts/responses
├── requirements.txt         # Python dependencies
├── audio_responses/         # Generated voice replies
└── README.md                # Project documentation
🌍 Supported Languages
English (en)

Hindi (hi)

Telugu (te)

Marathi (mr)

💡 Future Improvements

Integrate local TTS for full offline use

Expand the medical knowledge base

Add more Indian languages


👨‍💻 Author
Srinivas Vemula
️
