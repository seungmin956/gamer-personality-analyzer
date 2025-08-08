
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import pandas as pd

app = FastAPI(title="Gamer Personality Analyzer API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Gamer Personality Analyzer API", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",  # TODO: 실제 DB 연결 확인
        "ml_models": "ready"      # TODO: 실제 ML 서비스 확인
    }

@app.post("/analyze")
async def analyze_gamer_personality(user_input: dict):
    """게이머 성향 분석 API"""
    try:
        # TODO: ML 모델 호출 및 분석
        return {
            "user_id": "test_user",
            "analysis": {
                "primary_type": "collector",
                "confidence": 0.85,
                "secondary_type": "explorer",
                "recommendations": ["RPG 게임 추천", "수집형 콘텐츠 게임"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
