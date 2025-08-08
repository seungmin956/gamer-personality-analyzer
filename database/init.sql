
-- 게이머 프로필 테이블
CREATE TABLE gamer_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    primary_type VARCHAR(50) NOT NULL,
    secondary_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 게임 선호도 테이블
CREATE TABLE game_preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES gamer_profiles(user_id),
    genre VARCHAR(50) NOT NULL,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 플레이 패턴 테이블
CREATE TABLE play_patterns (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES gamer_profiles(user_id),
    session_length VARCHAR(50),
    frequency VARCHAR(50),
    focus VARCHAR(100),
    favorite_moment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI 모델 분석 결과 테이블
CREATE TABLE model_results (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES gamer_profiles(user_id),
    model_name VARCHAR(50) NOT NULL,
    predicted_type VARCHAR(50) NOT NULL,
    confidence_score FLOAT,
    analysis_result JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_gamer_profiles_user_id ON gamer_profiles(user_id);
CREATE INDEX idx_game_preferences_user_id ON game_preferences(user_id);
CREATE INDEX idx_play_patterns_user_id ON play_patterns(user_id);
CREATE INDEX idx_model_results_user_id ON model_results(user_id);
CREATE INDEX idx_model_results_model_name ON model_results(model_name);
