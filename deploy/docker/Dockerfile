FROM node:24-alpine AS web
WORKDIR /src
COPY web/admin/package*.json ./web/admin/
RUN cd web/admin && npm ci
COPY web/admin ./web/admin
RUN cd web/admin && npm run build

FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY cmd ./cmd
COPY internal ./internal
COPY --from=web /src/internal/gateway/admin_dist ./internal/gateway/admin_dist
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o /out/umans-gateway ./cmd/gateway

FROM alpine:3.22
RUN apk add --no-cache ca-certificates su-exec tzdata

# Use a neutral /data path for all persistent state so bind mounts are easy to
# map and manage. The entrypoint will fix ownership at runtime when started as
# root and then drop privileges.
ENV UMANS_CONFIG_DIR=/data/config \
    UMANS_ERROR_EVENT_DIR=/data/error-events \
    TZ=Asia/Shanghai
RUN mkdir -p /data/config /data/error-events

WORKDIR /data
EXPOSE 8080

COPY --from=build /out/umans-gateway /usr/local/bin/umans-gateway
COPY deploy/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
