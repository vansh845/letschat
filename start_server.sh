#!/bin/bash

set -e
tmpFile=$(mktemp)
go build -o "$tmpFile" main.go
DB_HOST=db DB_PORT=5432 DB_USER=postgres DB_PASSWORD=ec2xpostgres DB_NAME=letschat exec "$tmpFile" "$@"