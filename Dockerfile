FROM postgres:16.0
LABEL Name=electricity-db Version=0.1.0
ADD init-db.tar.gz /docker-entrypoint-initdb.d/
