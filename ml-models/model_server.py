# ml-models/model_server.py 
from fastapi import FastAPI
from transformers import pipeline

app = FastAPI()

@app.post("/analyze_personality")
async def analyze_personality(interview_text: str):
    # 면접 텍스트 → 성향 분류
    return {"personality": "적극형", "confidence": 0.85}