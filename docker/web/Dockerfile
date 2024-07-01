FROM golang:1.22-bullseye

WORKDIR /app
COPY . .

EXPOSE 3000

RUN go mod download
ENTRYPOINT [ "/bin/bash", "./start_server.sh" ]