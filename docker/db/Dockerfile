FROM postgres
ENV POSTGRES_USER postgres
ENV POSTGRES_PASSWORD=ec2xpostgres
ENV POSTGRES_DB=letschat

COPY docker/db/createTables.sql /docker-entrypoint-initdb.d