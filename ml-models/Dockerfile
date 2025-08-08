
FROM python:3.11-slim

WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 모델 캐시 디렉토리 생성
RUN mkdir -p /app/models

# 앱 코드 복사
COPY . .

# 포트 노출
EXPOSE 8001

# 서버 시작
CMD ["uvicorn", "model_server:app", "--host", "0.0.0.0", "--port", "8001"]
