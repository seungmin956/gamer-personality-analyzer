import json
import pandas as pd
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import numpy as np
import time

def load_interview_data(filename="interview_dataset.json"):
    """면접 데이터 로드 및 전처리"""
    
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 텍스트와 라벨 추출
    texts = []
    labels = []
    
    for session in data:
        personality = session['personality_type']
        
        # 모든 답변을 하나로 합치기
        full_answer = " ".join([qa['answer'] for qa in session['questions_answers']])
        
        texts.append(full_answer)
        labels.append(personality)
    
    return texts, labels

def test_baseline_model(X_train, X_test, y_train, y_test):
    """기준 모델 (TF-IDF + Logistic Regression) 테스트"""
    
    print("🔧 기준 모델 (TF-IDF + Logistic Regression) 테스트 중...")
    
    # TF-IDF 벡터화
    vectorizer = TfidfVectorizer(max_features=1000, stop_words=None)
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    # 로지스틱 회귀 학습
    start_time = time.time()
    lr_model = LogisticRegression(random_state=42, max_iter=1000)
    lr_model.fit(X_train_tfidf, y_train)
    
    # 예측
    y_pred = lr_model.predict(X_test_tfidf)
    training_time = time.time() - start_time
    
    # 성능 평가
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"✅ 기준 모델 결과:")
    print(f"   정확도: {accuracy:.3f}")
    print(f"   학습 시간: {training_time:.2f}초")
    print(f"   분류 리포트:")
    print(classification_report(y_test, y_pred, zero_division=0))
    
    return accuracy

def test_huggingface_model(texts, labels, model_name):
    """Hugging Face 모델 테스트"""
    
    print(f"\n🤖 {model_name} 모델 테스트 중...")
    
    try:
        # 감정 분석 파이프라인 (한국어 모델의 경우)
        if "klue" in model_name or "beomi" in model_name:
            # 한국어 모델용 - 직접 분류기 구성
            classifier = pipeline(
                "text-classification", 
                model=model_name,
                tokenizer=model_name,
                return_all_scores=True
            )
        else:
            # 영어 모델용
            classifier = pipeline(
                "zero-shot-classification",
                model=model_name
            )
        
        # 샘플 테스트 (전체 데이터는 시간이 너무 오래 걸림)
        sample_size = min(10, len(texts))
        sample_texts = texts[:sample_size]
        sample_labels = labels[:sample_size]
        
        predictions = []
        start_time = time.time()
        
        personality_types = ["적극형", "신중형", "논리형", "감성형", "리더형", "팔로워형"]
        
        for text in sample_texts:
            if "zero-shot" in str(type(classifier)):
                # Zero-shot 분류
                result = classifier(text, personality_types)
                predicted_label = result['labels'][0]
            else:
                # 일반 분류 (임시로 감정 기반 매핑)
                result = classifier(text[:512])  # 토큰 길이 제한
                
                # 감정 점수를 성향으로 매핑 (임시)
                if isinstance(result, list) and len(result) > 0:
                    score = result[0]['score'] if result[0]['label'] == 'POSITIVE' else 1 - result[0]['score']
                    if score > 0.7:
                        predicted_label = "적극형"
                    elif score > 0.5:
                        predicted_label = "논리형"
                    else:
                        predicted_label = "신중형"
                else:
                    predicted_label = "논리형"  # 기본값
            
            predictions.append(predicted_label)
        
        inference_time = time.time() - start_time
        
        # 정확도 계산
        correct = sum(1 for true, pred in zip(sample_labels, predictions) if true == pred)
        accuracy = correct / len(sample_labels)
        
        print(f"✅ {model_name} 결과:")
        print(f"   정확도: {accuracy:.3f} (샘플 {sample_size}개)")
        print(f"   추론 시간: {inference_time:.2f}초")
        print(f"   평균 추론 시간/텍스트: {inference_time/sample_size:.3f}초")
        
        # 예측 결과 샘플 출력
        print(f"   예측 샘플:")
        for i in range(min(3, len(sample_texts))):
            print(f"      실제: {sample_labels[i]} → 예측: {predictions[i]}")
        
        return accuracy
        
    except Exception as e:
        print(f"❌ {model_name} 테스트 실패: {str(e)}")
        return 0.0

def comprehensive_model_test():
    """종합 모델 성능 비교"""
    
    print("🎯 면접 성향 분석 모델 성능 비교 테스트")
    print("=" * 50)
    
    # 데이터 로드
    try:
        texts, labels = load_interview_data()
        print(f"📊 데이터 로드 완료: {len(texts)}개 샘플, {len(set(labels))}개 성향")
        
        # 성향별 분포 확인
        label_counts = pd.Series(labels).value_counts()
        print(f"성향별 분포:")
        for personality, count in label_counts.items():
            print(f"   {personality}: {count}개")
        
    except FileNotFoundError:
        print("❌ interview_dataset.json 파일을 찾을 수 없습니다.")
        print("먼저 interview_data_generator.py를 실행해주세요.")
        return
    
    # 데이터 분할
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )
    
    print(f"\n📈 학습/테스트 분할: {len(X_train)}/{len(X_test)}")
    
    # 모델 성능 비교
    results = {}
    
    # 1. 기준 모델
    baseline_acc = test_baseline_model(X_train, X_test, y_train, y_test)
    results["Baseline (TF-IDF + LR)"] = baseline_acc
    
    # 2. Hugging Face 모델들
    models_to_test = [
        "cardiffnlp/twitter-roberta-base-sentiment-latest",
        "facebook/bart-large-mnli"
    ]
    
    for model_name in models_to_test:
        try:
            acc = test_huggingface_model(texts, labels, model_name)
            results[model_name] = acc
        except Exception as e:
            print(f"⚠️ {model_name} 건너뛰기: {str(e)}")
    
    # 결과 요약
    print("\n🏆 종합 결과:")
    print("=" * 50)
    for model, accuracy in sorted(results.items(), key=lambda x: x[1], reverse=True):
        print(f"{model}: {accuracy:.3f}")
    
    # 최고 성능 모델
    best_model = max(results.items(), key=lambda x: x[1])
    print(f"\n🥇 최고 성능: {best_model[0]} (정확도: {best_model[1]:.3f})")
    
    # 개선 방안 제안
    print(f"\n💡 개선 방안:")
    print(f"   1. 더 많은 학습 데이터 수집")
    print(f"   2. 한국어 특화 모델 활용 (KcELECTRA, KoBERT)")
    print(f"   3. 파인튜닝으로 성향 분류 특화")
    print(f"   4. 앙상블 모델 구성")

if __name__ == "__main__":
    comprehensive_model_test()