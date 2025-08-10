// frontend/src/App.js
import React, { useState, useEffect } from 'react';

function App() {
  // 상태 관리
  const [serviceStatus, setServiceStatus] = useState({
    frontend: 'running',
    backend: 'checking',
    database: 'checking',
    mlModel: 'checking'
  });
  
  const [interviewText, setInterviewText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 시 서비스 상태 체크
  useEffect(() => {
    checkServices();
  }, []);

  // 서비스 상태 체크 함수
  const checkServices = async () => {
    try {
      // 백엔드 헬스체크
      const backendResponse = await fetch('http://localhost:8000/health');
      const backendStatus = backendResponse.ok ? 'running' : 'error';
      
      // ML 서버 헬스체크  
      const mlResponse = await fetch('http://localhost:8001/health');
      const mlStatus = mlResponse.ok ? 'running' : 'error';
      
      setServiceStatus({
        frontend: 'running',
        backend: backendStatus,
        database: backendStatus, // 백엔드가 정상이면 DB도 정상으로 가정
        mlModel: mlStatus
      });
    } catch (error) {
      console.error('서비스 상태 체크 실패:', error);
      setServiceStatus({
        frontend: 'running',
        backend: 'error',
        database: 'error', 
        mlModel: 'error'
      });
    }
  };

  // 면접 분석 함수
  const analyzeInterview = async () => {
    if (!interviewText.trim()) {
      setError('면접 답변을 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8001/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: interviewText,
          user_id: 'demo_user'
        })
      });

      if (!response.ok) {
        throw new Error('분석 요청 실패');
      }

      const result = await response.json();
      setAnalysisResult(result);
      
    } catch (error) {
      console.error('분석 실패:', error);
      setError('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 상태 아이콘 반환 함수
  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return '✅';
      case 'checking': return '🔄';
      case 'error': return '❌';
      default: return '⚠️';
    }
  };

  // 상태 텍스트 반환 함수
  const getStatusText = (status) => {
    switch (status) {
      case 'running': return '실행 중';
      case 'checking': return '확인 중';
      case 'error': return '오류';
      default: return '알 수 없음';
    }
  };

  // 성향별 색상 반환 함수
  const getPersonalityColor = (personality) => {
    const colors = {
      '적극형': '#FF6B6B',
      '신중형': '#4ECDC4', 
      '논리형': '#45B7D1',
      '감성형': '#96CEB4',
      '리더형': '#FFEAA7',
      '팔로워형': '#DDA0DD'
    };
    return colors[personality] || '#95A5A6';
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2C3E50', marginBottom: '10px' }}>
          🎮 면접 성향 분석기
        </h1>
        <p style={{ color: '#7F8C8D' }}>
          AI 기반 면접 답변 분석으로 당신의 성향을 찾아보세요!
        </p>
      </div>

      {/* 서비스 상태 */}
      <div style={{ 
        backgroundColor: '#F8F9FA', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: '#2C3E50', marginBottom: '15px' }}>🔧 서비스 상태</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {getStatusIcon(serviceStatus.frontend)} 프론트엔드: {getStatusText(serviceStatus.frontend)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {getStatusIcon(serviceStatus.backend)} 백엔드: {getStatusText(serviceStatus.backend)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {getStatusIcon(serviceStatus.database)} 데이터베이스: {getStatusText(serviceStatus.database)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {getStatusIcon(serviceStatus.mlModel)} ML 모델: {getStatusText(serviceStatus.mlModel)}
          </div>
        </div>
        
        <button 
          onClick={checkServices}
          style={{
            marginTop: '15px',
            padding: '8px 16px',
            backgroundColor: '#3498DB',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 상태 새로고침
        </button>
      </div>

      {/* 면접 분석 섹션 */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        padding: '20px', 
        borderRadius: '10px',
        border: '1px solid #E9ECEF',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: '#2C3E50', marginBottom: '15px' }}>💬 면접 답변 분석</h2>
        
        <textarea
          value={interviewText}
          onChange={(e) => setInterviewText(e.target.value)}
          placeholder="면접 질문에 대한 당신의 답변을 입력해주세요. 예: '저는 팀을 이끌어나가는 것을 좋아하고, 새로운 도전을 즐깁니다. 문제가 발생했을 때 논리적으로 분석해서 해결책을 찾는 편입니다.'"
          style={{
            width: '100%',
            height: '120px',
            padding: '15px',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <button
            onClick={analyzeInterview}
            disabled={isAnalyzing || !interviewText.trim() || serviceStatus.mlModel !== 'running'}
            style={{
              padding: '12px 30px',
              backgroundColor: serviceStatus.mlModel === 'running' ? '#2ECC71' : '#95A5A6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: serviceStatus.mlModel === 'running' ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.3s'
            }}
          >
            {isAnalyzing ? '🔄 분석 중...' : '🎯 성향 분석하기'}
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#FFE6E6',
            color: '#D63031',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* 분석 결과 */}
      {analysisResult && (
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          padding: '20px', 
          borderRadius: '10px',
          border: '1px solid #E9ECEF'
        }}>
          <h2 style={{ color: '#2C3E50', marginBottom: '20px' }}>📊 분석 결과</h2>
          
          {/* 주 성향 */}
          <div style={{
            textAlign: 'center',
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: getPersonalityColor(analysisResult.predicted_personality),
            borderRadius: '10px',
            color: 'white'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>
              🎯 당신의 주요 성향
            </h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
              {analysisResult.predicted_personality}
            </div>
            <div style={{ fontSize: '18px', opacity: 0.9 }}>
              신뢰도: {(analysisResult.confidence * 100).toFixed(1)}%
            </div>
          </div>

          {/* 전체 성향 점수 */}
          <div>
            <h4 style={{ color: '#2C3E50', marginBottom: '15px' }}>📈 전체 성향 분석</h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              {Object.entries(analysisResult.all_scores)
                .sort(([,a], [,b]) => b - a)
                .map(([personality, score]) => (
                  <div key={personality} style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    padding: '8px',
                    backgroundColor: '#F8F9FA',
                    borderRadius: '5px'
                  }}>
                    <div style={{ 
                      width: '80px', 
                      fontWeight: 'bold',
                      color: getPersonalityColor(personality)
                    }}>
                      {personality}
                    </div>
                    <div style={{ 
                      flex: 1, 
                      height: '20px', 
                      backgroundColor: '#E9ECEF',
                      borderRadius: '10px',
                      margin: '0 10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${score * 100}%`,
                        backgroundColor: getPersonalityColor(personality),
                        borderRadius: '10px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <div style={{ 
                      width: '50px', 
                      textAlign: 'right',
                      fontSize: '14px',
                      color: '#6C757D'
                    }}>
                      {(score * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 분석 정보 */}
          <div style={{ 
            marginTop: '20px', 
            padding: '15px',
            backgroundColor: '#F8F9FA',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#6C757D'
          }}>
            <div>분석 시간: {analysisResult.analysis_time.toFixed(3)}초</div>
            <div>분석 일시: {new Date(analysisResult.timestamp).toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* 푸터 */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '40px',
        padding: '20px',
        color: '#7F8C8D',
        fontSize: '14px'
      }}>
        <p>🚀 Docker + React + FastAPI + ML 기반 면접 성향 분석 시스템</p>
        <p>TF-IDF + Logistic Regression 모델로 6가지 성향 분류</p>
      </div>
    </div>
  );
}

export default App;
