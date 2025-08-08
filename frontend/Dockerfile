
FROM node:18-alpine

WORKDIR /app

# package.json 복사 및 의존성 설치
COPY package*.json ./
RUN npm ci --only=production

# 앱 코드 복사
COPY . .

# 빌드
RUN npm run build

# 서버 시작
EXPOSE 3000
CMD ["npm", "start"]
