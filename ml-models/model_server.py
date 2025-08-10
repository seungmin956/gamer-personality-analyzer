# ml-models/model_server.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import pickle
import os
from fastapi.middleware.cors import CORSMiddleware
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import numpy as np
from datetime import datetime
import logging

# FastAPI 앱 생성
app = FastAPI(
    title="면접 성향 분석 ML 서버",
    description="면접 답변을 분석하여 지원자의 성향을 예측하는 API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 전역 변수
model = None
vectorizer = None
personality_types = None

class InterviewRequest(BaseModel):
    """면접 분석 요청 모델"""
    text: str
    user_id: str = "anonymous"

class InterviewResponse(BaseModel):
    """면접 분석 응답 모델"""
    predicted_personality: str
    confidence: float
    all_scores: dict
    analysis_time: float
    user_id: str
    timestamp: str

class ModelTrainer:
    """모델 학습 클래스"""
    
    def __init__(self, data_path="/data/profiles.json"):
        self.data_path = data_path
        self.vectorizer = None
        self.model = None
        self.personality_types = None
    
    def load_data(self):
        """면접 데이터 로드"""
        try:
            with open(self.data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            texts = []
            labels = []
            
            for session in data:
                personality = session['personality_type']
                # 모든 답변을 하나로 합치기
                full_answer = " ".join([qa['answer'] for qa in session['questions_answers']])
                texts.append(full_answer)
                labels.append(personality)
            
            self.personality_types = list(set(labels))
            logger.info(f"데이터 로드 완료: {len(texts)}개 샘플, {len(self.personality_types)}개 성향")
            logger.info(f"성향 목록: {self.personality_types}")
            
            return texts, labels
            
        except FileNotFoundError:
            logger.error(f"데이터 파일을 찾을 수 없습니다: {self.data_path}")
            raise
        except Exception as e:
            logger.error(f"데이터 로드 중 오류: {str(e)}")
            raise
    
    def train_model(self):
        """모델 학습"""
        try:
            texts, labels = self.load_data()
            
            # 데이터 분할
            X_train, X_test, y_train, y_test = train_test_split(
                texts, labels, test_size=0.2, random_state=42
            )
            
            # TF-IDF 벡터화
            logger.info("TF-IDF 벡터화 시작...")
            self.vectorizer = TfidfVectorizer(
                max_features=1000,
                ngram_range=(1, 2),
                min_df=1,
                stop_words=None
            )
            
            X_train_vec = self.vectorizer.fit_transform(X_train)
            X_test_vec = self.vectorizer.transform(X_test)
            
            # 로지스틱 회귀 모델 학습
            logger.info("모델 학습 시작...")
            self.model = LogisticRegression(
                random_state=42,
                max_iter=1000,
                solver='liblinear'
            )
            
            self.model.fit(X_train_vec, y_train)
            
            # 성능 평가
            train_score = self.model.score(X_train_vec, y_train)
            test_score = self.model.score(X_test_vec, y_test)
            
            logger.info(f"모델 학습 완료!")
            logger.info(f"훈련 정확도: {train_score:.3f}")
            logger.info(f"테스트 정확도: {test_score:.3f}")
            
            return True
            
        except Exception as e:
            logger.error(f"모델 학습 중 오류: {str(e)}")
            raise
    
    def save_model(self, model_dir="/app/models"):
        """모델 저장"""
        try:
            os.makedirs(model_dir, exist_ok=True)
            
            # 모델 저장
            with open(f"{model_dir}/personality_model.pkl", 'wb') as f:
                pickle.dump(self.model, f)
            
            # 벡터라이저 저장
            with open(f"{model_dir}/vectorizer.pkl", 'wb') as f:
                pickle.dump(self.vectorizer, f)
            
            # 성향 목록 저장
            with open(f"{model_dir}/personality_types.json", 'w', encoding='utf-8') as f:
                json.dump(self.personality_types, f, ensure_ascii=False)
            
            logger.info(f"모델 저장 완료: {model_dir}")
            
        except Exception as e:
            logger.error(f"모델 저장 중 오류: {str(e)}")
            raise

def load_trained_model(model_dir="/app/models"):
    """학습된 모델 로드"""
    global model, vectorizer, personality_types
    
    try:
        # 모델 로드
        with open(f"{model_dir}/personality_model.pkl", 'rb') as f:
            model = pickle.load(f)
        
        # 벡터라이저 로드
        with open(f"{model_dir}/vectorizer.pkl", 'rb') as f:
            vectorizer = pickle.load(f)
        
        # 성향 목록 로드
        with open(f"{model_dir}/personality_types.json", 'r', encoding='utf-8') as f:
            personality_types = json.load(f)
        
        logger.info("학습된 모델 로드 완료")
        logger.info(f"지원 성향: {personality_types}")
        
        return True
        
    except FileNotFoundError:
        logger.warning("저장된 모델이 없습니다. 새로 학습합니다...")
        return False
    except Exception as e:
        logger.error(f"모델 로드 중 오류: {str(e)}")
        return False

def train_and_save_model():
    """모델 학습 및 저장"""
    try:
        trainer = ModelTrainer()
        trainer.train_model()
        trainer.save_model()
        
        # 전역 변수에 로드
        global model, vectorizer, personality_types
        model = trainer.model
        vectorizer = trainer.vectorizer
        personality_types = trainer.personality_types
        
        logger.info("모델 학습 및 저장 완료")
        
    except Exception as e:
        logger.error(f"모델 학습/저장 실패: {str(e)}")
        raise

@app.on_event("startup")
async def startup_event():
    """서버 시작 시 모델 로드"""
    logger.info("ML 서버 시작...")
    
    # 기존 모델 로드 시도
    if not load_trained_model():
        # 모델이 없으면 새로 학습
        logger.info("새 모델 학습 시작...")
        train_and_save_model()
    
    logger.info("ML 서버 준비 완료!")

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "면접 성향 분석 ML 서버",
        "status": "running",
        "supported_personalities": personality_types,
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "vectorizer_loaded": vectorizer is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/analyze", response_model=InterviewResponse)
async def analyze_personality(request: InterviewRequest):
    """면접 성향 분석"""
    start_time = datetime.now()
    
    if not model or not vectorizer:
        raise HTTPException(status_code=500, detail="모델이 로드되지 않았습니다")
    
    try:
        # 텍스트 전처리 및 벡터화
        text_vector = vectorizer.transform([request.text])
        
        # 예측
        prediction = model.predict(text_vector)[0]
        prediction_proba = model.predict_proba(text_vector)[0]
        
        # 모든 성향별 점수 계산
        all_scores = {}
        for i, personality in enumerate(model.classes_):
            all_scores[personality] = float(prediction_proba[i])
        
        # 최고 점수 (신뢰도)
        confidence = float(max(prediction_proba))
        
        # 분석 시간 계산
        analysis_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"분석 완료: {prediction} (신뢰도: {confidence:.3f})")
        
        return InterviewResponse(
            predicted_personality=prediction,
            confidence=confidence,
            all_scores=all_scores,
            analysis_time=analysis_time,
            user_id=request.user_id,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"분석 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"분석 실패: {str(e)}")

@app.post("/batch_analyze")
async def batch_analyze(texts: list[str]):
    """다중 텍스트 일괄 분석"""
    if not model or not vectorizer:
        raise HTTPException(status_code=500, detail="모델이 로드되지 않았습니다")
    
    try:
        results = []
        
        for i, text in enumerate(texts):
            text_vector = vectorizer.transform([text])
            prediction = model.predict(text_vector)[0]
            confidence = float(max(model.predict_proba(text_vector)[0]))
            
            results.append({
                "index": i,
                "text_preview": text[:50] + "..." if len(text) > 50 else text,
                "predicted_personality": prediction,
                "confidence": confidence
            })
        
        return {
            "total_analyzed": len(texts),
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"일괄 분석 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"일괄 분석 실패: {str(e)}")

@app.get("/model_info")
async def get_model_info():
    """모델 정보 조회"""
    if not model:
        raise HTTPException(status_code=500, detail="모델이 로드되지 않았습니다")
    
    return {
        "model_type": "TF-IDF + Logistic Regression",
        "supported_personalities": personality_types,
        "feature_count": vectorizer.max_features if vectorizer else None,
        "model_classes": model.classes_.tolist() if model else None,
        "training_info": {
            "algorithm": "Logistic Regression",
            "vectorizer": "TF-IDF",
            "ngram_range": "(1, 2)",
            "max_features": 1000
        }
    }

@app.post("/retrain")
async def retrain_model():
    """모델 재학습"""
    try:
        logger.info("모델 재학습 시작...")
        train_and_save_model()
        return {
            "status": "success",
            "message": "모델 재학습 완료",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"재학습 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"재학습 실패: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
