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

  // 성향별 색상 반환 함수 (최고 성향은 빨간색, 나머지는 회색)
  const getPersonalityColor = (personality, isTop = false) => {
    if (isTop) {
      return '#E74C3C'; // 빨간색 (최고 성향)
    }
    
    // 직무 중심 성향별 기본 색상 (회색 계열)
    const colors = {
      '리더십형': '#7F8C8D',
      '전문가형': '#95A5A6', 
      '소통형': '#85929E',
      '실행형': '#99A3A4',
      '창의형': '#A6ACAF',
      '안정형': '#B2BABB'
    };
    return colors[personality] || '#95A5A6';
  };

  // 레이더 차트용 SVG 컴포넌트
  const RadarChart = ({ data, topPersonality }) => {
    const size = 300;
    const center = size / 2;
    const radius = size * 0.35;
    
    // 6각형의 각 꼭짓점 좌표 계산
    const getCoordinates = (angle, value) => {
      const radian = (angle - 90) * Math.PI / 180; // -90도로 시작 (12시 방향)
      const r = radius * value;
      return {
        x: center + r * Math.cos(radian),
        y: center + r * Math.sin(radian)
      };
    };

    // 6개 성향의 각도 (60도씩)
    const angles = [0, 60, 120, 180, 240, 300];
    
    // 배경 육각형 (격자)
    const backgroundLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <svg width={size} height={size} style={{ border: '1px solid #E9ECEF', borderRadius: '10px', backgroundColor: '#FAFAFA' }}>
          {/* 배경 격자 */}
          {backgroundLevels.map((level, i) => (
            <polygon
              key={i}
              points={angles.map((angle, j) => {
                const coord = getCoordinates(angle, level);
                return `${coord.x},${coord.y}`;
              }).join(' ')}
              fill="none"
              stroke="#E9ECEF"
              strokeWidth="1"
            />
          ))}
          
          {/* 축선 */}
          {angles.map((angle, i) => {
            const coord = getCoordinates(angle, 1);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={coord.x}
                y2={coord.y}
                stroke="#E9ECEF"
                strokeWidth="1"
              />
            );
          })}
          
          {/* 데이터 영역 */}
          <polygon
            points={data.map((item, i) => {
              const coord = getCoordinates(angles[i], item.score);
              return `${coord.x},${coord.y}`;
            }).join(' ')}
            fill="rgba(231, 76, 60, 0.2)"
            stroke="#E74C3C"
            strokeWidth="3"
          />
          
          {/* 데이터 포인트 */}
          {data.map((item, i) => {
            const coord = getCoordinates(angles[i], item.score);
            const isTop = item.personality === topPersonality;
            return (
              <circle
                key={i}
                cx={coord.x}
                cy={coord.y}
                r={isTop ? 8 : 5}
                fill={isTop ? '#E74C3C' : '#95A5A6'}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          
          {/* 라벨 */}
          {data.map((item, i) => {
            const coord = getCoordinates(angles[i], 1.15);
            const isTop = item.personality === topPersonality;
            return (
              <text
                key={i}
                x={coord.x}
                y={coord.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight={isTop ? "bold" : "normal"}
                fill={isTop ? '#E74C3C' : '#2C3E50'}
              >
                {item.personality}
              </text>
            );
          })}
          
          {/* 중앙 텍스트 */}
          <text
            x={center}
            y={center - 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#2C3E50"
          >
            성향 분석
          </text>
          <text
            x={center}
            y={center + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fill="#7F8C8D"
          >
            결과
          </text>
        </svg>
      </div>
    );
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
          🙎 지원자 성향 분석기
        </h1>
        <p style={{ color: '#7F8C8D' }}>
          AI 기반 면접 답변 분석으로 지원자의 성향을 파악해보세요!
        </p>
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
        <>
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
              backgroundColor: '#E74C3C',
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

            {/* 레이더 차트 */}
            <div>
              <h4 style={{ color: '#2C3E50', marginBottom: '15px', textAlign: 'center' }}>📈 전체 성향 분석</h4>
              <RadarChart 
                data={Object.entries(analysisResult.all_scores).map(([personality, score]) => ({
                  personality,
                  score
                }))}
                topPersonality={analysisResult.predicted_personality}
              />
            </div>

            {/* 상세 점수 표 */}
            <div style={{ marginTop: '30px' }}>
              <h4 style={{ color: '#2C3E50', marginBottom: '15px' }}>📋 상세 점수</h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                {Object.entries(analysisResult.all_scores)
                  .sort(([,a], [,b]) => b - a)
                  .map(([personality, score]) => {
                    const isTop = personality === analysisResult.predicted_personality;
                    return (
                      <div key={personality} style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: isTop ? '#FFE6E6' : '#F8F9FA',
                        borderRadius: '5px',
                        border: isTop ? '2px solid #E74C3C' : '1px solid #E9ECEF'
                      }}>
                        <div style={{ 
                          width: '80px', 
                          fontWeight: isTop ? 'bold' : 'normal',
                          color: isTop ? '#E74C3C' : '#2C3E50'
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
                            backgroundColor: isTop ? '#E74C3C' : '#95A5A6',
                            borderRadius: '10px',
                            transition: 'width 0.5s ease'
                          }} />
                        </div>
                        <div style={{ 
                          width: '50px', 
                          textAlign: 'right',
                          fontSize: '14px',
                          fontWeight: isTop ? 'bold' : 'normal',
                          color: isTop ? '#E74C3C' : '#6C757D'
                        }}>
                          {(score * 100).toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
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
              <div>분석 시간: {analysisResult.analysis_time?.toFixed(3) || '0.000'}초</div>
              <div>분석 일시: {new Date(analysisResult.timestamp || Date.now()).toLocaleString()}</div>
            </div>
          </div>
        </>
      )}

      {/* 시스템 상태 표시 */}
      <div style={{ 
        backgroundColor: '#F8F9FA', 
        padding: '15px', 
        borderRadius: '10px',
        border: '1px solid #E9ECEF',
        marginTop: '20px'
      }}>
        <h3 style={{ color: '#2C3E50', marginBottom: '15px' }}>📡 시스템 상태</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          {Object.entries(serviceStatus).map(([service, status]) => (
            <div key={service} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              backgroundColor: 'white',
              borderRadius: '5px',
              border: '1px solid #E9ECEF'
            }}>
              <span style={{ marginRight: '8px' }}>{getStatusIcon(status)}</span>
              <div>
                <div style={{ fontSize: '12px', color: '#6C757D' }}>
                  {service === 'mlModel' ? 'ML 모델' : 
                   service === 'backend' ? '백엔드' :
                   service === 'database' ? '데이터' : '프론트엔드'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2C3E50' }}>
                  {getStatusText(status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 기술 스택 정보 */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '30px', 
        padding: '15px',
        backgroundColor: '#E8F6F3',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#27AE60'
      }}>
        📌 Docker + React + FastAPI + ML 기반 면접 성향 분석 시스템<br/>
        TF-IDF + Logistic Regression 모델로 6가지 성향 분류
      </div>
    </div>
  );
}

export default App;
