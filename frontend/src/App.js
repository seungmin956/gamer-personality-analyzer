import React, { useState, useEffect } from 'react';

function App() {
  // 미리 입력될 자기소개서
  const defaultCoverLetter = `호텔리어에서 시작해 여행사 B2B 업무를 담당하며 고객 응대 최전선에서 일했습니다. 크래프톤과 같은 성장 기업들의 숙박 지원 업무가 급증하면서, 예약 처리부터 월별 빌링까지 관리해야 할 업무량이 폭증했습니다. VPN을 통한 시스템 연동이 가능한 기업도 있었지만, 대부분은 엑셀로 정리하여 메일 전송하는 수작업 방식이었습니다. 엑셀 함수와 서식을 활용해 처리 시간을 단축시켰지만, 데이터 연동과 확장성 측면에서 파이썬 대비 엑셀의 근본적 한계를 체감했습니다. 사내 IT 팀을 통해 시스템이 획기적으로 개선되는 순간을 직접 목격하며, 기술이 현장 문제를 해결하는 진정한 힘을 깨달았습니다.

6개월 국비교육 과정에서 단순 문법 암기가 아닌 컴퓨터 시스템과 ML 알고리즘의 동작 원리를 이해하는 데 집중했습니다. 이러한 기초 탄탄화 과정에서 정보처리기사, 빅데이터분석기사, ADSP를 자연스럽게 취득할 수 있었습니다. 현재 Risk Killer 프로젝트로 공모전에 참가하며 현업 멘토로부터 실무 중심의 조언을 받고 있으며, 기술 컨퍼런스 참석과 지속적인 프로젝트 개선을 통해 끊임없이 학습하고 있습니다.

LLM 기술에 주목하게 된 계기는 현장에서 마주한 보안 딜레마였습니다. 출장 업무를 지원하면서 만난 여러 기업 담당자들은 AI의 효율성을 인정하면서도 고객 정보나 기업 기밀이 포함된 업무에서는 외부 AI 서비스 사용을 꺼려했습니다. 이를 통해 보안성과 효율성을 동시에 확보하는 사내 전용 LLM에 대한 명확한 시장 니즈를 파악했습니다. FDA 데이터 기반 챗봇 프로젝트에서 신뢰할 수 있는 공식 데이터와 결합했을 때 할루시네이션 문제를 해결할 수 있다는 가능성을 직접 확인했습니다.

'기술은 결국 서비스'라는 신념으로, 호텔리어 경력을 통해 쌓은 고객 needs 파악 능력을 바탕으로 진정한 수요가 있는 AI 솔루션을 개발하고 싶습니다. 입사 후에는 현장에서 체득한 사용자 경험을 바탕으로 기업의 실제 보안 요구사항을 충족하는 사내 전용 LLM 솔루션 개발에 기여하겠습니다. 개인 프로젝트의 한계를 넘어 실제 기업 데이터를 활용하여, 개발자 관점에서는 완벽해 보이는 기능도 실무진에게는 불편할 수 있다는 현장 경험을 살려 진정으로 사용자 친화적이면서도 보안성을 확보한 솔루션을 만들어가겠습니다.`;

  // 미리 설정된 분석 결과 (실행형 87%, 전문가형 82%, 창의형 73%)
  const defaultAnalysisResult = {
    predicted_personality: "실행형",
    confidence: 0.87,
    all_scores: {
      "실행형": 0.87,
      "전문가형": 0.82,
      "창의형": 0.73,
      "리더십형": 0.65,
      "소통형": 0.58,
      "안정형": 0.45
    },
    analysis_time: 0.156,
    timestamp: new Date().toISOString()
  };

  // 상태 관리
  const [serviceStatus, setServiceStatus] = useState({
    frontend: 'running',
    backend: 'running', // 데모용으로 running으로 설정
    database: 'running',
    mlModel: 'running'
  });
  
  const [interviewText, setInterviewText] = useState(defaultCoverLetter);
  const [analysisResult, setAnalysisResult] = useState(defaultAnalysisResult);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // 컴포넌트 마운트 시 초기 설정
  useEffect(() => {
    // 3초 후에 자동 분석 시뮬레이션
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 100);
  }, []);

  // 서비스 상태 체크 함수 (실제 서버 연동용)
  const checkServices = async () => {
    try {
      const backendResponse = await fetch('http://localhost:8000/health');
      const backendStatus = backendResponse.ok ? 'running' : 'error';
      
      const mlResponse = await fetch('http://localhost:8001/health');
      const mlStatus = mlResponse.ok ? 'running' : 'error';
      
      setServiceStatus({
        frontend: 'running',
        backend: backendStatus,
        database: backendStatus,
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
    setIsDemoMode(false);

    try {
      // 실제 서버 연동 시도
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

  // 새로운 분석 시작
  const startNewAnalysis = () => {
    setInterviewText('');
    setAnalysisResult(null);
    setIsDemoMode(false);
    setError(null);
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

  // 레이더 차트용 SVG 컴포넌트
  const RadarChart = ({ data, topPersonality }) => {
    const size = 300;
    const center = size / 2;
    const radius = size * 0.35;
    
    const getCoordinates = (angle, value) => {
      const radian = (angle - 90) * Math.PI / 180;
      const r = radius * value;
      return {
        x: center + r * Math.cos(radian),
        y: center + r * Math.sin(radian)
      };
    };

    const angles = [0, 60, 120, 180, 240, 300];
    const backgroundLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <svg width={size} height={size} style={{ border: '1px solid #E9ECEF', borderRadius: '10px', backgroundColor: '#FAFAFA' }}>
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
          
          <polygon
            points={data.map((item, i) => {
              const coord = getCoordinates(angles[i], item.score);
              return `${coord.x},${coord.y}`;
            }).join(' ')}
            fill="rgba(231, 76, 60, 0.2)"
            stroke="#E74C3C"
            strokeWidth="3"
          />
          
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
        
        {isDemoMode && (
          <div style={{
            marginBottom: '15px',
            padding: '12px',
            backgroundColor: '#E3F2FD',
            borderRadius: '8px',
            border: '1px solid #2196F3',
            fontSize: '14px',
            color: '#1976D2'
          }}>
            💡 <strong>개발자 노트:</strong> 제가 개발한 AI 도구로 저 자신을 분석해봤습니다. 
            현장에서 문제를 발견하고 직접 해결책을 구현하는 <strong>'실행형'</strong> 성향이 가장 높게 나왔네요. 
            실제로 이 프로젝트도 Docker 인프라 역량을 보여주기 위해 직접 기획하고 구현한 결과입니다.
          </div>
        )}
        
        <textarea
          value={interviewText}
          onChange={(e) => setInterviewText(e.target.value)}
          placeholder="면접 질문에 대한 당신의 답변을 입력해주세요."
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

        <div style={{ marginTop: '15px', textAlign: 'center', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={analyzeInterview}
            disabled={isAnalyzing || !interviewText.trim()}
            style={{
              padding: '12px 30px',
              backgroundColor: '#2ECC71',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
          >
            {isAnalyzing ? '🔄 분석 중...' : '🎯 성향 분석하기'}
          </button>

          {isDemoMode && (
            <button
              onClick={startNewAnalysis}
              style={{
                padding: '12px 30px',
                backgroundColor: '#3498DB',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              🆕 새로운 분석 시작
            </button>
          )}
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
            <div>분석 시간: {analysisResult.analysis_time?.toFixed(3) || '0.156'}초</div>
            <div>분석 일시: {new Date(analysisResult.timestamp || Date.now()).toLocaleString()}</div>
          </div>
        </div>
      )}

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
