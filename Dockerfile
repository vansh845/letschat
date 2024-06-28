FROM postgres
ENV POSTGRES_USER postgres
ENV POSTGRES_PASSWORD=odinxpostgres
ENV POSTGRES_DB=letschat

COPY createTables.sql /docker-entrypoint-initdb.d
