FROM golang:1.22.3-bullseye

WORKDIR /app
COPY main.go ./
COPY go.sum ./
COPY go.mod ./
COPY server ./server
COPY start_server.sh ./
COPY ui/dist ./ui/dist

EXPOSE 3000

RUN go mod download
ENTRYPOINT [ "/bin/bash", "./start_server.sh" ]