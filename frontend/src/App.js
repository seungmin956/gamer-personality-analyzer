// frontend/src/App.js
import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎮 게이머 성향 분석기</h1>
      <p>Docker 환경이 성공적으로 실행되었습니다!</p>
      <div style={{ margin: '20px 0' }}>
        <h2>서비스 상태</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>✅ 프론트엔드: 실행 중</li>
          <li>🔄 백엔드: 준비 중</li>
          <li>🔄 데이터베이스: 준비 중</li>
          <li>🔄 ML 모델: 준비 중</li>
        </ul>
      </div>
      <p>다음 단계: API 연동 및 기능 구현</p>
    </div>
  );
}

export default App;
