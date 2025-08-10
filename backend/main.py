
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
