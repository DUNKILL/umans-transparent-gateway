# Umans Transparent Gateway

[![Go](https://img.shields.io/badge/Go-1.26-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![API](https://img.shields.io/badge/API-Anthropic%20%7C%20OpenAI-blue)](#api-surface)
[![Keys](https://img.shields.io/badge/API%20keys-passthrough%20or%20managed-green)](#security-boundary)

Self-hosted transparent gateway for Umans-compatible coding model APIs.

It lets you point Claude Code, OpenAI SDK clients, ccswitch, or other tools at a server you control, while preserving the visible behavior exposed by the Umans CLI: compatible API paths, server-side search header forwarding, raw image/tool payload passthrough, model suffix normalization, managed-key load balancing, per-key concurrency protection, and short retries for transient upstream failures.

> Copyright ©️生🐟

## Responsible Use

This project is only a convenience gateway for self-hosted API compatibility. It does not distribute, resell, bypass, or expand any upstream service entitlement. Use it with your own valid API key, respect upstream terms and rate/concurrency limits, and do not use it for abuse, credential sharing, spam, scraping, or policy evasion.

## 使用边界

本项目只是为了方便自托管中转和 API 兼容接入，不提供分发、转售、绕过或扩展任何上游服务权益的能力。请使用你自己的合法 API key，遵守上游条款、速率限制和并发限制，不要用于滥用、共享凭据、垃圾请求、批量抓取或规避策略。

## Recommended Upstream

[Try Umans Code with my referral link](https://app.umans.ai/register?ref=CWM9Z5KJ). Umans Code is a hosted open-model coding endpoint for tools such as Claude Code, OpenCode, Cursor, Zed, and Pi. Their public pages currently describe hosted GLM 5.2 and Kimi K2.7-Code plans; in practice, the GLM/Kimi routes are fast and work well for coding agents. GLM is text-first here, but the 400k-class context experience is still excellent for large coding sessions.

## 推荐上游

[通过我的推荐链接试用 Umans Code](https://app.umans.ai/register?ref=CWM9Z5KJ)。Umans Code 是面向 Claude Code、OpenCode、Cursor、Zed、Pi 等工具的托管开源模型 coding endpoint。它的公开页面目前主打 GLM 5.2 和 Kimi K2.7-Code；实际体验里 GLM/Kimi 路线速度快、编码代理体验好。GLM 在这里偏文字路线，但 400k 级上下文用来跑大工程会话很舒服。

## Language

- [English](#english)
- [中文](#中文)

---

## English

### Why This Exists

The Umans CLI is useful, but some users do not want to run external installer or launcher scripts on their primary machine. This gateway moves the integration point to a server-side Go service:

- clients call standard-compatible HTTP APIs;
- user API keys can be passed through per request, or upstream keys can be managed server-side in `config/key.json`;
- the gateway does not implement login or key acquisition;
- local machines do not need to run the Umans CLI.

### Features

- **Anthropic Messages API passthrough**: `POST /v1/messages`
- **Anthropic token counting passthrough**: `POST /v1/messages/count_tokens`
- **OpenAI Chat Completions passthrough**: `POST /v1/chat/completions`
- **OpenAI Responses compatibility layer**: `POST /v1/responses`
- **Model catalog passthrough**: `GET /v1/models`, `GET /v1/models/info`
- **SSE streaming**: preserved for Messages and Chat Completions
- **WebSocket bridge**: `GET /ws`
- **Embedded admin UI**: `GET /admin/` with password-protected management APIs
- **Managed upstream key pool**: add/delete keys in `config/key.json`, with per-key concurrency limits
- **Sticky sessions and load balancing**: 10s sticky window by default; when the sticky key is full, the gateway waits for the configured queue timeout before switching; otherwise it prefers keys with lower active concurrency
- **Image/tool/reasoning payload preservation**: unknown fields and image blocks are forwarded
- **Server-side search header forwarding**: `X-Umans-Websearch-Provider`
- **Per-key concurrency queue**: default 4 active requests per API key and 50s queue timeout
- **Transient upstream retry**: default 2 retries for temporary unavailable, `5xx`, `502`, `503`, `504`, and `529`; `429` retry is opt-in
- **Claude Code model suffix cleanup**: `umans-glm-5.2[1m]` is forwarded as `umans-glm-5.2`
- **JSON Schema compatibility**: optional old tuple-style `items: [...]` cleanup for strict upstream validators

### Quick Start

```bash
go run ./cmd/gateway
```

Health check:

```bash
curl http://127.0.0.1:8080/healthz
```

Admin UI:

```text
http://127.0.0.1:8080/admin/
```

Default admin password is `change-me`; change it in `config/config.json` or the admin UI before exposing the service.

Example Anthropic Messages call:

```bash
curl http://127.0.0.1:8080/v1/messages \
  -H "x-api-key: $UMANS_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "model": "umans-glm-5.2",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Say hello."}]
  }'
```

Example OpenAI Chat Completions call:

```bash
curl http://127.0.0.1:8080/v1/chat/completions \
  -H "authorization: Bearer $UMANS_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "model": "umans-glm-5.2",
    "messages": [{"role": "user", "content": "Say hello."}]
  }'
```

### Configuration

Runtime configuration now lives in `config/config.json`; managed upstream keys live in `config/key.json`. If either file is missing, the gateway creates it on startup. Most fields are hot-reloaded for new requests; `listen` is written to the config file but still requires a process restart to re-bind the server socket.

| JSON field | Default | Description |
| --- | --- | --- |
| `listen` | `0.0.0.0:8080` | HTTP listen address; restart required after changing |
| `upstreamBaseURL` | `https://api.code.umans.ai` | Upstream Umans-compatible API base URL |
| `adminPassword` | `change-me` | Password for `/admin/`; change this before exposing the service |
| `proxyAccessToken` | empty | Required client token when managed keys are enabled; requests must send this value via `Authorization` or `x-api-key` |
| `keyConcurrencyLimit` | `4` | Default active request limit per key; individual managed keys may override it |
| `keyQueueTimeout` | `50s` | Max time a request waits for a key slot; sticky-session waiting uses this same value |
| `stickySession` | `true` | Reuse the previous managed key for the same client token within the sticky window |
| `stickySessionTTL` | `10s` | Sticky session window |
| `searchMode` | `exa` | `exa`, `native`, `auto`, or `none`; forced modes inject `X-Umans-Websearch-Provider` upstream |
| `budgetPolicy` | `error` | `error` or `clamp-visible` for output token budget handling |
| `upstreamRetryMax` | `2` | Retry count after the first upstream attempt |
| `retry429` | `false` | Opt in to retrying upstream `429`; keep `false` to avoid amplifying concurrency limit hits |
| `upstreamRetryBaseDelay` | `2s` | Initial retry delay |
| `upstreamRetryMaxDelay` | `5s` | Maximum retry delay |
| `schemaCompat` | `true` | Convert old tuple-style JSON Schema `items: [...]` into `prefixItems` for strict validators |
| `catalogTTL` | `10m` | Model catalog cache TTL |

### Claude Code / ccswitch

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-xxxx",
    "ANTHROPIC_BASE_URL": "http://your-server:8080",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "umans-glm-5.2",
    "ANTHROPIC_DEFAULT_OPUS_MODEL_NAME": "GLM 5.2",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "umans-glm-5.2",
    "ANTHROPIC_DEFAULT_SONNET_MODEL_NAME": "GLM 5.2",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "umans-glm-5.2",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME": "GLM 5.2",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "90",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "405504",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "131071",
    "CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING": "1",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "CLAUDE_CODE_ATTRIBUTION_HEADER": "0",
    "DISABLE_NON_ESSENTIAL_MODEL_CALLS": "1",
    "ENABLE_TOOL_SEARCH": "false"
  },
  "includeCoAuthoredBy": false,
  "model": "sonnet",
  "effortLevel": "xhigh"
}
```

`CLAUDE_CODE_AUTO_COMPACT_WINDOW=405504` is the GLM 5.2 context window setting. `CLAUDE_CODE_MAX_OUTPUT_TOKENS=131071` is the output cap, not the context window.

### API Surface

```text
POST /v1/messages
POST /v1/messages/count_tokens
POST /v1/chat/completions
POST /v1/responses
GET  /v1/models
GET  /v1/models/info
GET  /v1/usage
GET  /healthz
GET  /ws
GET  /admin/
```

`/v1/messages` and `/v1/chat/completions` are raw proxy paths. `/v1/responses` is a compatibility layer that converts OpenAI Responses-shaped input to Chat Completions upstream and converts the response back to a Responses-shaped object.

### Security Boundary

- API keys are accepted per request via `Authorization: Bearer <key>` or `x-api-key: <key>`.
- Without managed keys, the client-provided key is forwarded to the upstream service and is not persisted by this gateway.
- With managed keys, upstream keys are stored locally in `config/key.json`; protect this file with filesystem permissions and set a strong `adminPassword`.
- Per-key concurrency uses an in-memory HMAC bucket, not the plaintext key.
- The admin page at `/admin/` is protected by `adminPassword`; static assets are public, management APIs are not.
- The gateway does not run Umans installer scripts.
- The gateway does not write `~/.umans`, `~/.claude`, or `/usr/local/bin`.
- Image recognition, server-side search, and compaction are not reimplemented locally; the gateway forwards the request semantics exposed by the Umans-compatible upstream.

### Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for direct binary, systemd, and Docker Compose deployment.

### Development

```bash
go test ./...
go build ./cmd/gateway
```

### License

MIT. See [LICENSE](LICENSE).

### Disclaimer

This project is an independent transparent gateway implementation. It is not affiliated with Umans, Anthropic, or OpenAI.

---

## 中文

### 项目定位

Umans CLI 本身能用，但如果你不想在主力机器上运行外部 installer 或 launcher 脚本，可以把接入点移到服务器侧：客户端只调用标准兼容 API，API key 可以每次请求透传，也可以由服务器侧 `config/key.json` 托管，本机不需要运行 Umans CLI。

### 功能

- **Anthropic Messages API 透传**：`POST /v1/messages`
- **Anthropic token counting 透传**：`POST /v1/messages/count_tokens`
- **OpenAI Chat Completions 透传**：`POST /v1/chat/completions`
- **OpenAI Responses 兼容层**：`POST /v1/responses`
- **模型目录透传**：`GET /v1/models`、`GET /v1/models/info`
- **SSE 流式输出**：保留 Messages 和 Chat Completions 流式行为
- **WebSocket bridge**：`GET /ws`
- **内置管理页面**：`GET /admin/`，管理 API 需要访问密码
- **托管上游 key 池**：在 `config/key.json` 中添加/删除 key，并支持每个 key 独立并发上限
- **粘性会话与负载均衡**：默认 10 秒粘性窗口；粘性 key 满载时先等待配置的排队时间，超时后再切换；普通选择优先使用当前活跃并发更低的 key
- **图片、工具、reasoning 字段保留**：未知字段和图片块原样转发
- **服务器搜索 header 转发**：`X-Umans-Websearch-Provider`
- **按 key 并发队列**：默认每个 API key 同时 4 个请求，默认排队等待 50 秒
- **上游瞬断自动重试**：默认对临时不可用、`5xx`、`502`、`503`、`504`、`529` 重试 2 次；`429` 需显式开启
- **Claude Code 模型后缀清洗**：`umans-glm-5.2[1m]` 会按 `umans-glm-5.2` 转发
- **JSON Schema 兼容清洗**：可选地把旧 tuple 写法 `items: [...]` 转成严格校验器接受的 `prefixItems`

### 快速开始

```bash
go run ./cmd/gateway
```

健康检查：

```bash
curl http://127.0.0.1:8080/healthz
```

管理页面：

```text
http://127.0.0.1:8080/admin/
```

默认管理密码是 `change-me`，对外暴露前请在 `config/config.json` 或管理页面中修改。

Anthropic Messages 示例：

```bash
curl http://127.0.0.1:8080/v1/messages \
  -H "x-api-key: $UMANS_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "model": "umans-glm-5.2",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Say hello."}]
  }'
```

OpenAI Chat Completions 示例：

```bash
curl http://127.0.0.1:8080/v1/chat/completions \
  -H "authorization: Bearer $UMANS_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "model": "umans-glm-5.2",
    "messages": [{"role": "user", "content": "Say hello."}]
  }'
```

### 配置

运行配置现在位于 `config/config.json`；托管上游 key 位于 `config/key.json`。如果文件不存在，网关启动时会自动创建。大部分字段会对新请求热重载；`listen` 会写入配置文件，但变更监听端口仍需要重启进程。

| JSON 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `listen` | `0.0.0.0:8080` | HTTP 监听地址；修改后需要重启才会重新绑定端口 |
| `upstreamBaseURL` | `https://api.code.umans.ai` | Umans-compatible 上游 API base URL |
| `adminPassword` | `change-me` | `/admin/` 管理页面访问密码；对外暴露前务必修改 |
| `proxyAccessToken` | 空 | 托管 key 池启用时必须设置；客户端请求需通过 `Authorization` 或 `x-api-key` 发送这个值 |
| `keyConcurrencyLimit` | `4` | 每个 key 的默认活跃请求上限；单个托管 key 可覆盖 |
| `keyQueueTimeout` | `50s` | 并发满载时请求等待 key 槽的最长时间；粘性会话等待也使用同一个值 |
| `stickySession` | `true` | 同一客户端 token 在粘性窗口内优先复用上一次选中的托管 key |
| `stickySessionTTL` | `10s` | 粘性会话窗口 |
| `searchMode` | `exa` | `exa`、`native`、`auto` 或 `none`；强制模式会向上游注入 `X-Umans-Websearch-Provider` |
| `budgetPolicy` | `error` | 输出 token 预算策略：`error` 或 `clamp-visible` |
| `upstreamRetryMax` | `2` | 首次上游请求失败后的重试次数 |
| `retry429` | `false` | 是否重试上游 `429`；保持 `false` 可避免放大并发限流命中 |
| `upstreamRetryBaseDelay` | `2s` | 初始重试等待时间 |
| `upstreamRetryMaxDelay` | `5s` | 最大重试等待时间 |
| `schemaCompat` | `true` | 将旧 tuple-style JSON Schema `items: [...]` 转成严格校验器接受的 `prefixItems` |
| `catalogTTL` | `10m` | 模型目录缓存时间 |

### Claude Code / ccswitch

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-xxxx",
    "ANTHROPIC_BASE_URL": "http://your-server:8080",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "umans-glm-5.2",
    "ANTHROPIC_DEFAULT_OPUS_MODEL_NAME": "GLM 5.2",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "umans-glm-5.2",
    "ANTHROPIC_DEFAULT_SONNET_MODEL_NAME": "GLM 5.2",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "umans-glm-5.2",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME": "GLM 5.2",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "90",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "405504",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "131071",
    "CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING": "1",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "CLAUDE_CODE_ATTRIBUTION_HEADER": "0",
    "DISABLE_NON_ESSENTIAL_MODEL_CALLS": "1",
    "ENABLE_TOOL_SEARCH": "false"
  },
  "includeCoAuthoredBy": false,
  "model": "sonnet",
  "effortLevel": "xhigh"
}
```

`CLAUDE_CODE_AUTO_COMPACT_WINDOW=405504` 是 GLM 5.2 上下文窗口设置。`CLAUDE_CODE_MAX_OUTPUT_TOKENS=131071` 是输出上限，不是上下文窗口。

### API Surface

```text
POST /v1/messages
POST /v1/messages/count_tokens
POST /v1/chat/completions
POST /v1/responses
GET  /v1/models
GET  /v1/models/info
GET  /v1/usage
GET  /healthz
GET  /ws
GET  /admin/
```

`/v1/messages` 和 `/v1/chat/completions` 是 raw proxy，保留未知字段、工具、thinking/reasoning、图片和 SSE。`/v1/responses` 是兼容层：对外接受 OpenAI Responses 风格，内部转换到 Chat Completions，再转回 Responses 风格。

### 安全边界

- API key 通过 `Authorization: Bearer <key>` 或 `x-api-key: <key>` 每请求传入。
- 未启用托管 key 时，客户端传入的 API key 只转发给上游，不由本服务持久化保存。
- 启用托管 key 时，上游 key 会保存在本机 `config/key.json`；请保护文件权限，并设置强管理密码。
- 同 key 并发控制使用内存 HMAC bucket，不使用明文 key 做桶 ID。
- `/admin/` 管理页面由 `adminPassword` 保护；静态资源可访问，管理 API 不可匿名调用。
- 不运行 Umans installer 脚本。
- 不写 `~/.umans`、`~/.claude` 或 `/usr/local/bin`。
- 图片识别、服务器搜索和 compaction 不在本地重做；网关只转发 Umans-compatible 上游暴露的请求语义。

### 部署

直接二进制、systemd 和 Docker Compose 部署方式见 [DEPLOYMENT.md](DEPLOYMENT.md)。

### 开发

```bash
go test ./...
go build ./cmd/gateway
```

### License

MIT，见 [LICENSE](LICENSE)。

### Disclaimer

本项目是独立的透明网关实现，不隶属于 Umans、Anthropic 或 OpenAI。
