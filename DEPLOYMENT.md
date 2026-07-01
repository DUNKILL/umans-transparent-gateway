# 部署说明

本文面向服务器部署。网关支持两种 key 模式：

- 未配置托管 key 时，客户端请求里的 `Authorization: Bearer <key>` 或 `x-api-key: <key>` 会直接透传到上游。
- 在 `/admin/` 添加托管 key 后，网关会从 `config/key.json` 里的 key 池按粘性会话和负载均衡选择上游 key。

运行配置在 `config/config.json`，托管 key 在 `config/key.json`。两个文件不存在时会在启动时自动创建。

## 方式一：直接二进制

Linux amd64:

```bash
sudo mkdir -p /var/lib/umans-gateway/config
sudo cp config/config.example.json /var/lib/umans-gateway/config/config.json
sudo cp config/key.example.json /var/lib/umans-gateway/config/key.json
sudo install -m 0755 umans-gateway-linux-amd64 /usr/local/bin/umans-gateway
cd /var/lib/umans-gateway
/usr/local/bin/umans-gateway
```

Linux arm64:

```bash
sudo mkdir -p /var/lib/umans-gateway/config
sudo cp config/config.example.json /var/lib/umans-gateway/config/config.json
sudo cp config/key.example.json /var/lib/umans-gateway/config/key.json
sudo install -m 0755 umans-gateway-linux-arm64 /usr/local/bin/umans-gateway
cd /var/lib/umans-gateway
/usr/local/bin/umans-gateway
```

启动后访问：

```text
http://your-server:8080/admin/
```

默认管理密码是 `change-me`，对外暴露前必须修改。

## systemd

模板在：

```text
deploy/systemd/umans-gateway.service
```

安装示例：

```bash
sudo useradd --system --home /var/lib/umans-gateway --shell /usr/sbin/nologin umans-gateway
sudo mkdir -p /var/lib/umans-gateway/config
sudo cp config/config.example.json /var/lib/umans-gateway/config/config.json
sudo cp config/key.example.json /var/lib/umans-gateway/config/key.json
sudo chown -R umans-gateway:umans-gateway /var/lib/umans-gateway
sudo chmod 0700 /var/lib/umans-gateway/config
sudo chmod 0600 /var/lib/umans-gateway/config/*.json
sudo install -m 0755 umans-gateway-linux-amd64 /usr/local/bin/umans-gateway
sudo cp deploy/systemd/umans-gateway.service /etc/systemd/system/umans-gateway.service
sudo systemctl daemon-reload
sudo systemctl enable --now umans-gateway
```

## Docker Compose

模板在：

```text
deploy/docker/docker-compose.yml
deploy/docker/Dockerfile
```

运行：

```bash
mkdir -p config
cp -n config/config.example.json config/config.json
cp -n config/key.example.json config/key.json
docker compose -f deploy/docker/docker-compose.yml up -d --build
curl http://127.0.0.1:8080/healthz
```

Docker Compose 会把本地 `config/` 挂载到容器的 `/data/config`，`error-events` 则使用命名卷持久化。

默认入口脚本以 root 启动，自动把 `/data` 目录属主改为 `PUID/PGID` 指定的用户，然后降权运行网关。这样绑定挂载的本地目录无需提前改成容器镜像的 UID 也能被程序读写。如果你的宿主机用户不是 `1000:1000`，在 `deploy/docker/docker-compose.yml` 中修改 `PUID`/`PGID` 即可。

可用的环境变量示例：

| 变量 | 说明 | 默认值 |
|---|---|---|
| `PUID` | 运行时用户 UID | `1000` |
| `PGID` | 运行时用户 GID | `1000` |
| `UMANS_LOG_LEVEL` | 控制台日志级别（`DEBUG`/`INFO`/`WARN`/`ERROR`） | `INFO` |
| `UMANS_UPSTREAM_TIMEOUT` | 单个上游请求硬超时 | `5m` |
| `UMANS_CONFIG_DIR` | 配置文件目录 | `/data/config` |
| `UMANS_ERROR_EVENT_DIR` | 错误事件 JSONL 目录 | `/data/error-events` |

## Claude Code / ccswitch

把 Claude Code base URL 指向服务器：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-xxxx-or-proxy-token",
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

说明：

- 未配置托管 key 时，`ANTHROPIC_AUTH_TOKEN` 应填写真实上游 API key。
- 配置托管 key 后必须设置 `proxyAccessToken`；`ANTHROPIC_AUTH_TOKEN` 应填写该代理访问令牌。
- 配置托管 key 但 `proxyAccessToken` 为空时，代理请求会返回 401，不会使用托管 key 池。
- `ENABLE_TOOL_SEARCH=false` 复刻 Umans CLI。Umans server-side search 由 `X-Umans-Websearch-Provider` 控制。
- 同 key 并发默认 `4`；托管 key 可独立设置并发上限。
- 并发满载时请求先等待 `keyQueueTimeout`，默认 `50s`，超时后才返回 429 或从粘性 key 切换到其他 key。
- `umans-glm-5.2[1m]` 这类 Claude Code 时长后缀会由网关清洗成基础模型 ID 再转发。

## 配置

示例文件：

```text
config/config.example.json
config/key.example.json
```

`config/config.json` 中的主要字段：

```json
{
  "listen": "0.0.0.0:8080",
  "upstreamBaseURL": "https://api.code.umans.ai",
  "adminPassword": "change-me",
  "proxyAccessToken": "",
  "keyConcurrencyLimit": 4,
  "keyQueueTimeout": "50s",
  "stickySession": true,
  "stickySessionTTL": "10s",
  "searchMode": "exa",
  "budgetPolicy": "error"
}
```

完整中文说明可在管理页面的全局配置表单中查看。
