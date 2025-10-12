import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useSpeechSynthesis } from "react-speech-kit";
import "./VoiceAssistant.css"; // import CSS here

interface BackendResponse {
  reply: string;
  lang: string;
  audio?: string;
}

const LANGUAGE_OPTIONS = [
  { value: "te", label: "Telugu" },
  { value: "hi", label: "Hindi" },
  { value: "mr", label: "Marathi" },
  { value: "en", label: "English" },
];

const SILENCE_TIMEOUT_MS = 1500;

const Airogyam: React.FC = () => {
  const [response, setResponse] = useState<string>("");
  const [lang, setLang] = useState<string>("te");
  const [autoSend, setAutoSend] = useState<boolean>(true);
  const { speak, voices } = useSpeechSynthesis();
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const lastTranscriptRef = useRef<string>("");
  const silenceTimerRef = useRef<number | null>(null);
  const autoSendRef = useRef<number | null>(null);

  const getVoiceForLang = (lang: string) => {
    return voices.find((v) => v.lang.toLowerCase().startsWith(lang)) || voices[0];
  };

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("⚠️ Your browser doesn't support Speech Recognition. Use Chrome or Edge.");
    }
  }, []);

  useEffect(() => {
    if (transcript && transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;
      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = window.setTimeout(() => {
        if (listening) {
          SpeechRecognition.stopListening();
          if (autoSend) {
            if (autoSendRef.current) window.clearTimeout(autoSendRef.current);
            autoSendRef.current = window.setTimeout(() => {
              handleSend();
            }, 300);
          }
        }
      }, SILENCE_TIMEOUT_MS);
    }
    return () => {
      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
      if (autoSendRef.current) window.clearTimeout(autoSendRef.current);
    };
  }, [transcript, listening, autoSend]);

  const handleStart = () => {
    resetTranscript();
    setResponse("");
    SpeechRecognition.startListening({
      continuous: true,
      language: lang,
    });
  };

  const handleSend = async () => {
    const text = transcript.trim();
    if (!text) {
      setResponse("⚠️ Please say something first.");
      return;
    }
    try {
      setResponse("⏳ Processing your request...");
      const res = await axios.post<BackendResponse>("http://localhost:8000/medical_advice", { text, lang }, { timeout: 20000 });
      const reply = res.data.reply || "No reply from assistant.";
      setResponse(reply);

      if (res.data.audio) {
        const audio = new Audio(res.data.audio);
        audio.play().catch(() => speak({ text: reply, voice: getVoiceForLang(lang) }));
      } else {
        speak({ text: reply, voice: getVoiceForLang(lang) });
      }
      resetTranscript();
    } catch (error) {
      console.error("Error contacting backend:", error);
      setResponse("⚠️ Unable to reach backend. Check if it's running on port 8000.");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1>🎙️ Airogyam - Multilingual Medical Assistant</h1>

        <div className="controls">
          <label htmlFor="lang-select">Language: </label>
          <select id="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="auto-send">
            <input type="checkbox" checked={autoSend} onChange={(e) => setAutoSend(e.target.checked)} />
            Auto-send on silence
          </label>
        </div>

        <p className="status">{listening ? "🎧 Listening..." : "Not listening"}</p>

        <div className="buttons">
          <button onClick={handleStart}>🎤 Start</button>
          <button onClick={() => SpeechRecognition.stopListening()}>⏹ Stop</button>
          <button onClick={handleSend}>📤 Send</button>
          <button onClick={resetTranscript}>🔁 Reset</button>
        </div>

        <div className="responses">
          <p><strong>You said:</strong> {transcript || <em>...waiting for input</em>}</p>
          <p><strong>Assistant:</strong> {response || <em>...waiting for response</em>}</p>
        </div>

        <small className="note">(Auto-stop after {SILENCE_TIMEOUT_MS / 1000}s of silence)</small>
      </div>
    </div>
  );
};

export default Airogyam;
