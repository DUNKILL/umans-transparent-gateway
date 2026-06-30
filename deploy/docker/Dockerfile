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
RUN adduser -D -H -s /sbin/nologin umans-gateway && mkdir -p /var/lib/umans-gateway/config && chown -R umans-gateway:umans-gateway /var/lib/umans-gateway
USER umans-gateway
WORKDIR /var/lib/umans-gateway
EXPOSE 8080
COPY --from=build /out/umans-gateway /usr/local/bin/umans-gateway
ENTRYPOINT ["/usr/local/bin/umans-gateway"]
