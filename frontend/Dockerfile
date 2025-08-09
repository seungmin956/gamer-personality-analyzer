# frontend/Dockerfile 
FROM node:18-alpine

WORKDIR /app

# package.json 복사
COPY package*.json ./

# npm install로 변경 (package-lock.json 없어도 동작)
RUN npm install --only=production

# 앱 코드 복사
COPY . .

# 빌드
RUN npm run build

# 서버 시작
EXPOSE 3000
CMD ["npm", "start"]
