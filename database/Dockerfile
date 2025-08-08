
FROM postgres:15

# 한글 지원을 위한 로케일 설정
RUN apt-get update && \
    apt-get install -y locales && \
    echo "ko_KR.UTF-8 UTF-8" >> /etc/locale.gen && \
    locale-gen

ENV LANG ko_KR.UTF-8
ENV LANGUAGE ko_KR:ko
ENV LC_ALL ko_KR.UTF-8

# 초기화 스크립트 복사
COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432
