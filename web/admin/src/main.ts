import {
  createIcons,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  KeyRound,
  LayoutGrid,
  LogOut,
  Monitor,
  Moon,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Sun,
  Trash2,
  X,
} from 'lucide';
import './styles.css';

type Config = {
  listen: string;
  upstreamBaseURL: string;
  defaultModel: string;
  opusModel: string;
  sonnetModel: string;
  haikuModel: string;
  keyConcurrencyLimit: number;
  keyQueueTimeout: string;
  upstreamRetryMax: number;
  retry429: boolean;
  upstreamRetryBaseDelay: string;
  upstreamRetryMaxDelay: string;
  schemaCompat: boolean;
  catalogTTL: string;
  searchMode: string;
  budgetPolicy: string;
  errorEventDir: string;
  errorEventMaxAge: string;
  errorEventMaxSize: number;
  adminPassword: string;
  proxyAccessToken: string;
  stickySession: boolean;
  stickySessionTTL: string;
  keyErrorThreshold: number;
  keyErrorWindow: string;
  keyErrorBackoff: string;
};

type KeyStatus = {
  id: string;
  name: string;
  enabled: boolean;
  concurrencyLimit: number;
  active: number;
  stickySessions: number;
  backoffUntil?: string;
  keyPreview: string;
  createdAt?: string;
  updatedAt?: string;
};

type KeyDraft = {
  id: string;
  name: string;
  key: string;
  enabled: boolean;
  concurrencyLimit: number;
};

type StatusResponse = {
  config: Config;
  keys: KeyStatus[];
  managedKeyMode: boolean;
};

type LogDaySummary = {
  date: string;
  hours: number;
  count: number;
  firstEvent: string;
  lastEvent: string;
};

type LogEvent = {
  ts: string;
  event: string;
  status_class: string;
  latency_bucket: string;
  error_class: string;
  message?: string;
};

type LogDayResponse = {
  date: string;
  count: number;
  events: LogEvent[];
};

type ConfigField = {
  key: keyof Config;
  label: string;
  description: string;
  type: 'text' | 'password' | 'number' | 'checkbox' | 'select';
  options?: { value: string; label: string }[];
  section: 'server' | 'models' | 'routing' | 'reliability' | 'security' | 'logs';
};

const configFields: ConfigField[] = [
  {
    key: 'listen',
    label: '监听地址',
    type: 'text',
    section: 'server',
    description: 'HTTP 服务绑定地址。写入 config.json 后热重载到运行时配置，但已启动进程的端口绑定需重启才会变化。',
  },
  {
    key: 'upstreamBaseURL',
    label: '上游 API 地址',
    type: 'text',
    section: 'server',
    description: 'Umans-compatible 上游服务的 base URL。新代理请求、模型目录读取和重试都使用热重载后的地址。',
  },
  {
    key: 'defaultModel',
    label: '默认模型',
    type: 'text',
    section: 'models',
    description: '请求体缺少 model 字段时用于预算校验的模型 ID，也是安全输出上限计算的候选模型之一。',
  },
  {
    key: 'opusModel',
    label: 'Opus 映射',
    type: 'text',
    section: 'models',
    description: 'Claude Code Opus 档位对应的上游模型。预算保护取默认/Opus/Sonnet/Haiku 上限的最保守值。',
  },
  {
    key: 'sonnetModel',
    label: 'Sonnet 映射',
    type: 'text',
    section: 'models',
    description: 'Claude Code Sonnet 档位对应的上游模型，通常是主力编码模型。',
  },
  {
    key: 'haikuModel',
    label: 'Haiku 映射',
    type: 'text',
    section: 'models',
    description: 'Claude Code Haiku 档位对应的上游模型。若某 key 未配置独立并发，会使用全局并发限制。',
  },
  {
    key: 'keyConcurrencyLimit',
    label: '全局默认并发',
    type: 'number',
    section: 'routing',
    description: '每个 key 默认允许同时处理的活跃请求数。key.json 中单个 key 并发数大于 0 时覆盖此值。',
  },
  {
    key: 'keyQueueTimeout',
    label: '排队等待时间',
    type: 'text',
    section: 'routing',
    description: '目标 key 并发已满时，请求先等待此时长而非立刻 429。粘性会话命中的 key 满载时同样等待，超时后才切换。',
  },
  {
    key: 'stickySession',
    label: '启用粘性会话',
    type: 'checkbox',
    section: 'routing',
    description: '同一会话在窗口内优先复用上一次选中的上游 key。会话身份优先取请求体 session_id / metadata.user_id / prompt_cache_key，缺失时网关生成并经 X-Umans-Session-Id 下发。',
  },
  {
    key: 'stickySessionTTL',
    label: '粘性窗口',
    type: 'text',
    section: 'routing',
    description: '同一客户端 token 记住上次 key 的有效时间，默认 10s。过期后重新按负载均衡选择并发更小的 key。',
  },
  {
    key: 'keyErrorThreshold',
    label: 'Key 错误阈值',
    type: 'number',
    section: 'routing',
    description: '在 keyErrorWindow 内某上游 key 出错达到此数量时进入退避。设为 0 禁用错误退避。',
  },
  {
    key: 'keyErrorWindow',
    label: 'Key 错误窗口',
    type: 'text',
    section: 'routing',
    description: '计算 key 错误次数的时间窗口，例如 60s。超过此窗口的旧错误会被清除。',
  },
  {
    key: 'keyErrorBackoff',
    label: 'Key 退避时间',
    type: 'text',
    section: 'routing',
    description: 'key 触发错误阈值后，网关在多长时间内不再路由到该 key，例如 30s。',
  },
  {
    key: 'searchMode',
    label: '搜索模式',
    type: 'select',
    section: 'routing',
    options: [
      { value: 'exa', label: 'exa' },
      { value: 'native', label: 'native' },
      { value: 'auto', label: 'auto' },
      { value: 'none', label: 'none' },
    ],
    description: '是否向上游注入 X-Umans-Websearch-Provider。exa/native/none 强制覆盖客户端 header，auto 透传客户端设置。',
  },
  {
    key: 'budgetPolicy',
    label: '输出预算策略',
    type: 'select',
    section: 'routing',
    options: [
      { value: 'error', label: 'error' },
      { value: 'clamp-visible', label: 'clamp-visible' },
    ],
    description: 'max_tokens 超过目录安全上限时，error 拒绝请求，clamp-visible 压到可见上限并返回提示 header。',
  },
  {
    key: 'upstreamRetryMax',
    label: '上游最大重试',
    type: 'number',
    section: 'reliability',
    description: '首次失败后最多再重试次数。重试期间持续占用当前 key 并发槽，避免把瞬断放大成更多并发。',
  },
  {
    key: 'retry429',
    label: '重试 429',
    type: 'checkbox',
    section: 'reliability',
    description: '默认关闭，避免上游限流时继续放大压力。仅在明确知道 429 是短暂队列抖动时才建议开启。',
  },
  {
    key: 'upstreamRetryBaseDelay',
    label: '重试初始延迟',
    type: 'text',
    section: 'reliability',
    description: '第一次重试前等待的时间，Go duration 格式，例如 500ms、2s、1m。',
  },
  {
    key: 'upstreamRetryMaxDelay',
    label: '重试最大延迟',
    type: 'text',
    section: 'reliability',
    description: '指数退避的上限。实际等待时间不会超过此值。',
  },
  {
    key: 'schemaCompat',
    label: 'JSON Schema 兼容',
    type: 'checkbox',
    section: 'reliability',
    description: '把旧 tuple 写法 items: [...] 转为 prefixItems，减少严格上游校验器拒绝工具 schema 的概率。',
  },
  {
    key: 'catalogTTL',
    label: '模型目录缓存',
    type: 'text',
    section: 'reliability',
    description: '每个上游 key 的 /v1/models/info 缓存时间。预算保护依赖此目录，缓存过短会增加上游请求。',
  },
  {
    key: 'adminPassword',
    label: '管理页面密码',
    type: 'password',
    section: 'security',
    description: '用于登录 /admin/ 管理页面和调用管理 API。留空表示保持当前密码不变。',
  },
  {
    key: 'proxyAccessToken',
    label: '代理访问令牌',
    type: 'password',
    section: 'security',
    description: '托管 key 池启用时必须配置。客户端 Authorization 或 x-api-key 需与此值一致，网关才使用 key 池转发。',
  },
  {
    key: 'errorEventDir',
    label: '匿名错误目录',
    type: 'text',
    section: 'logs',
    description: '匿名错误事件 JSONL 保存目录。仅记录事件类型、状态段、延迟段和错误分类，不写请求体、模型输入或 API key。',
  },
  {
    key: 'errorEventMaxAge',
    label: '错误事件保留时间',
    type: 'text',
    section: 'logs',
    description: '超过该时间的错误事件文件会在下一次记录或清理时删除。',
  },
  {
    key: 'errorEventMaxSize',
    label: '错误事件最大总大小',
    type: 'number',
    section: 'logs',
    description: '错误事件目录允许保留的最大字节数，超过后优先删除最旧的 JSONL 文件。',
  },
  {
    key: 'logErrorMessage',
    label: '记录错误详情',
    type: 'checkbox',
    section: 'logs',
    description: '开启后错误事件 JSONL 每条多记一个 message 字段，原样保存 err.Error()（含上游 URL、原因等），可在系统日志页点击行查看。默认关闭以保持匿名。',
  },
];

const sectionNames: Record<ConfigField['section'], string> = {
  server: '服务',
  models: '模型映射',
  routing: '路由与并发',
  reliability: '稳定性',
  security: '访问控制',
  logs: '匿名错误',
};

const sectionOrder: ConfigField['section'][] = ['server', 'models', 'routing', 'reliability', 'security', 'logs'];

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('missing app root');
}

let status: StatusResponse | null = null;
let editingKey: KeyDraft | null = null;
let message: { text: string; kind: 'success' | 'error' | 'info' } = { text: '', kind: 'info' };
let busy = false;
let poller: number | undefined;
let page: 'keys' | 'settings' | 'logs' = 'keys';

// Log page state. logDays is the day index; selectedLogDay is the currently
// chosen YYYYMMDD (empty = none selected); logEvents is the event list for the
// selected day; logsBusy tracks the in-flight fetch for the day detail.
// expandedLogIdx is the index of the row whose message detail is expanded.
let logDays: LogDaySummary[] = [];
let selectedLogDay: string = '';
let logEvents: LogEvent[] = [];
let logsBusy = false;
let expandedLogIdx: number = -1;

type ThemeMode = 'light' | 'dark' | 'system';
let themeMode: ThemeMode = (localStorage.getItem('umans-theme') as ThemeMode) || 'system';
let themeMedia: MediaQueryList | null = null;

type ModalState =
  | { kind: 'none' }
  | { kind: 'key'; draft: KeyDraft }
  | { kind: 'delete'; key: KeyStatus };
let modal: ModalState = { kind: 'none' };

function applyTheme(mode: ThemeMode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = mode === 'dark' || (mode === 'system' && prefersDark);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}

function setThemeMode(mode: ThemeMode) {
  themeMode = mode;
  localStorage.setItem('umans-theme', mode);
  applyTheme(mode);
  if (mode === 'system') {
    if (!themeMedia) {
      themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
      themeMedia.addEventListener('change', () => {
        if (themeMode === 'system') applyTheme('system');
      });
    }
  }
  // refresh the switch active state without full re-render
  document.querySelectorAll<HTMLButtonElement>('.theme-switch button').forEach((b) => {
    b.classList.toggle('active', b.dataset.theme === mode);
  });
}

function icon(name: string) {
  return `<i data-lucide="${name}" aria-hidden="true"></i>`;
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  const res = await fetch(path, { ...init, headers, credentials: 'include' });
  if (res.status === 401) {
    throw new Error('AUTH_REQUIRED');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

async function bootstrap() {
  applyTheme(themeMode);
  if (themeMode === 'system') {
    themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    themeMedia.addEventListener('change', () => {
      if (themeMode === 'system') applyTheme('system');
    });
  }
  try {
    await refreshStatus();
    renderApp();
    startPolling();
  } catch (error) {
    if (String((error as Error).message) === 'AUTH_REQUIRED') {
      renderLogin();
      return;
    }
    message = { text: humanError(error), kind: 'error' };
    renderLogin();
  }
}

function startPolling() {
  if (poller) {
    window.clearInterval(poller);
  }
  poller = window.setInterval(() => {
    refreshStatus().then(renderLiveStatus).catch(() => undefined);
  }, 2000);
}

async function refreshStatus() {
  status = await api<StatusResponse>('/admin/api/status');
}

function setMessage(text: string, kind: 'success' | 'error' | 'info' = 'info') {
  message = { text, kind };
}

/* ─────────────────────────  LOGIN  ───────────────────────── */

function renderLogin() {
  app.innerHTML = `
    <main class="login-shell">
      <form class="login-panel" id="login-form">
        <div class="brand-mark">${icon('shield-check')}</div>
        <div>
          <h1>Umans Gateway</h1>
          <p class="sub">Transparent Proxy · Control Panel</p>
        </div>
        <label>
          <span>管理密码</span>
          <input name="password" type="password" autocomplete="current-password" autofocus />
        </label>
        <button class="primary" type="submit">${icon('key-round')}登录控制台</button>
        ${message.text ? `<p class="form-error">${escapeHTML(message.text)}</p>` : ''}
      </form>
    </main>
  `;
  renderIcons();
  document.querySelector<HTMLFormElement>('#login-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api('/admin/api/login', {
        method: 'POST',
        body: JSON.stringify({ password: String(form.get('password') || '') }),
      });
      message = { text: '', kind: 'info' };
      await refreshStatus();
      renderApp();
      startPolling();
    } catch (error) {
      message = { text: humanError(error), kind: 'error' };
      renderLogin();
    }
  });
}

/* ─────────────────────────  APP SHELL  ───────────────────────── */

function renderApp() {
  if (!status) {
    return;
  }
  app.innerHTML = `
    <main class="app-shell">
      <aside class="rail">
        <div class="rail-brand">
          <div class="brand-mark">${icon('shield-check')}</div>
          <div>
            <h1>Umans</h1>
            <p class="sub">Gateway</p>
          </div>
        </div>
        <nav class="nav">
          <button class="nav-item ${page === 'keys' ? 'active' : ''}" data-page="keys">
            ${icon('key-round')} Key 管理
            <span class="nav-count">${status.keys.length}</span>
          </button>
          <button class="nav-item ${page === 'settings' ? 'active' : ''}" data-page="settings">
            ${icon('layout-grid')} 系统设置
          </button>
          <button class="nav-item ${page === 'logs' ? 'active' : ''}" data-page="logs">
            ${icon('file-text')} 系统日志
          </button>
        </nav>
        ${renderRailStats()}
        <div class="rail-foot">
          <div class="theme-switch">
            <button data-theme="light" title="浅色" class="${themeMode === 'light' ? 'active' : ''}">${icon('sun')}</button>
            <button data-theme="system" title="跟随系统" class="${themeMode === 'system' ? 'active' : ''}">${icon('monitor')}</button>
            <button data-theme="dark" title="深色" class="${themeMode === 'dark' ? 'active' : ''}">${icon('moon')}</button>
          </div>
          <button class="logout" id="logout">${icon('log-out')} 退出登录</button>
          <span class="build">Version: 1.2.1</span>
        </div>
      </aside>
      <section class="main">
        <header class="topbar">
          <div class="page-title">
            <p class="eyebrow">${page === 'keys' ? 'KEY POOL' : page === 'settings' ? 'SYSTEM CONFIG' : 'ERROR EVENTS'}</p>
            <h2>${page === 'keys' ? 'Key 管理' : page === 'settings' ? '系统设置' : '系统日志'}</h2>
          </div>
          <div class="topbar-actions">
            <span class="mode-pill ${status.managedKeyMode ? 'on' : ''}">
              <span class="dot"></span>
              ${status.managedKeyMode ? '托管 key 模式' : '客户端 key 透传'}
            </span>
            <button class="ghost" id="refresh">${icon('refresh-cw')}刷新</button>
          </div>
        </header>
        <div class="content">
          ${message.text ? renderNotice() : ''}
          ${page === 'keys' ? renderKeysPage() : page === 'settings' ? renderSettingsPage() : renderLogsPage()}
        </div>
      </section>
    </main>
    ${modal.kind !== 'none' ? renderModal() : ''}
  `;
  bindAppEvents();
  renderIcons();
}

function renderRailStats() {
  const totalActive = status?.keys.reduce((s, k) => s + k.active, 0) || 0;
  const enabled = status?.keys.filter((k) => k.enabled).length || 0;
  const totalLimit = status?.keys.reduce((s, k) => s + (k.enabled ? k.concurrencyLimit : 0), 0) || 0;
  const inBackoff = status?.keys.filter((k) => k.backoffUntil && new Date(k.backoffUntil).getTime() > Date.now()).length || 0;
  return `
    <div class="rail-section">
      <h3>Live Telemetry</h3>
      <div class="rail-stat"><span class="k">活跃请求</span><span class="v ${totalActive > 0 ? 'accent' : ''}">${totalActive}</span></div>
      <div class="rail-stat"><span class="k">启用 key</span><span class="v">${enabled}</span></div>
      <div class="rail-stat"><span class="k">总并发上限</span><span class="v">${totalLimit}</span></div>
      <div class="rail-stat"><span class="k">退避中</span><span class="v ${inBackoff > 0 ? 'warn' : ''}">${inBackoff}</span></div>
    </div>
  `;
}

function renderNotice() {
  const ic = message.kind === 'success' ? 'check-circle-2' : message.kind === 'error' ? 'alert-triangle' : 'activity';
  return `<div class="notice ${message.kind}">${icon(ic)}<span>${escapeHTML(message.text)}</span></div>`;
}

/* ─────────────────────────  KEYS PAGE  ───────────────────────── */

function renderKeysPage() {
  return `
    <section class="telemetry">${renderTelemetry()}</section>
    <section class="panel keys-panel">
      <div class="panel-head">
        <div>
          <h3>Key 池</h3>
          <p class="ph-sub">托管上游 API key，按粘性会话与负载均衡选择转发</p>
        </div>
        <div class="ph-actions">
          <button class="outline" id="new-key">${icon('plus')}新增 key</button>
        </div>
      </div>
      ${renderKeyTable(status!.keys)}
    </section>
  `;
}

function renderSettingsPage() {
  return `
    <form class="panel" id="config-form">
      <div class="panel-head">
        <div>
          <h3>全局配置</h3>
          <p class="ph-sub">写入 config.json 并热重载到运行时</p>
        </div>
      </div>
      <div class="config-sections">
        ${renderConfigSections(status!.config)}
      </div>
      <div class="save-bar">
        <span class="sb-note">保存后立即热重载，无需重启进程</span>
        <button class="primary" type="submit" ${busy ? 'disabled' : ''}>${icon('save')}保存配置</button>
      </div>
    </form>
  `;
}

/* ─────────────────────────  LOGS PAGE  ───────────────────────── */

function renderLogsPage() {
  return `
    <section class="panel logs-panel">
      <div class="panel-head">
        <div>
          <h3>错误事件日志</h3>
          <p class="ph-sub">按天浏览错误事件。开启"记录错误详情"后可点击行查看完整错误信息</p>
        </div>
      </div>
      <div class="logs-layout">
        <aside class="logs-days">
          ${renderLogDays()}
        </aside>
        <div class="logs-events">
          ${renderLogEvents()}
        </div>
      </div>
    </section>
  `;
}

function renderLogDays() {
  if (!logDays.length) {
    return `
      <div class="empty-state">
        <div class="es-icon">${icon('file-text')}</div>
        暂无错误事件记录。
      </div>
    `;
  }
  return `
    <ul class="day-list">
      ${logDays
        .map((d) => {
          const active = d.date === selectedLogDay;
          return `
          <li>
            <button class="day-item ${active ? 'active' : ''}" data-date="${escapeAttr(d.date)}">
              <span class="day-date">${formatLogDate(d.date)}</span>
              <span class="day-meta">
                <span class="day-count">${d.count}</span> 事件 · ${d.hours} 个小时文件
              </span>
            </button>
          </li>
        `;
        })
        .join('')}
    </ul>
  `;
}

function renderLogEvents() {
  // The container is updated in place by renderLogEventsInto when toggling a
  // row's expansion, so the element keeps a stable id for partial re-render.
  if (logsBusy) {
    return `<div class="logs-events" id="logs-events"><div class="empty-state">加载中…</div></div>`;
  }
  if (!selectedLogDay) {
    return `
      <div class="logs-events" id="logs-events">
        <div class="empty-state">
          <div class="es-icon">${icon('file-text')}</div>
          从左侧选择一个日期查看当天的事件。
        </div>
      </div>
    `;
  }
  if (!logEvents.length) {
    return `
      <div class="logs-events" id="logs-events">
        <div class="empty-state">
          <div class="es-icon">${icon('file-text')}</div>
          ${escapeHTML(selectedLogDay)} 当天无事件记录。
        </div>
      </div>
    `;
  }
  return `
    <div class="logs-events" id="logs-events">
      <div class="logs-head">
        <span class="logs-date">${formatLogDate(selectedLogDay)}</span>
        <span class="logs-total">共 ${logEvents.length} 条事件</span>
      </div>
      <div class="table-wrap">
        <table class="logs-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>事件</th>
              <th>状态</th>
              <th>延迟</th>
              <th>分类</th>
            </tr>
          </thead>
          <tbody>
            ${renderLogEventsBody()}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// renderLogEventsBody returns the inner HTML of the events table tbody. It is
// isolated so toggling a row's expansion can update just this fragment without
// re-rendering the whole app (which would reset scroll position).
function renderLogEventsBody() {
  return logEvents
    .map((ev, i) => {
      const sev = logEventSeverity(ev);
      const expanded = i === expandedLogIdx;
      const hasMsg = !!ev.message;
      return `
        <tr class="log-row ${expanded ? 'expanded' : ''} ${hasMsg ? 'clickable' : ''}" data-log-idx="${i}">
          <td class="log-ts">${formatLogTs(ev.ts)}</td>
          <td><span class="log-event">${escapeHTML(ev.event)}</span></td>
          <td><span class="pill ${sev.cls}"><span class="dot"></span>${escapeHTML(ev.status_class || 'none')}</span></td>
          <td class="log-lat">${escapeHTML(ev.latency_bucket || 'unknown')}</td>
          <td class="log-cls">${escapeHTML(ev.error_class || 'other')}${hasMsg ? ` <span class="log-expand-hint">${expanded ? '收起' : '详情'}</span>` : ''}</td>
        </tr>
        ${expanded && hasMsg ? `
          <tr class="log-detail-row">
            <td colspan="5">
              <div class="log-detail">
                <span class="log-detail-label">错误详情</span>
                <pre class="log-detail-msg">${escapeHTML(ev.message || '')}</pre>
              </div>
            </td>
          </tr>
        ` : ''}
      `;
    })
    .join('');
}

// logEventSeverity maps an event's status class to a pill style. 5xx and 4xx
// get danger/warn treatments; everything else stays neutral.
function logEventSeverity(ev: LogEvent): { cls: string } {
  const s = ev.status_class || '';
  if (s === '5xx') return { cls: 'danger' };
  if (s === '4xx') return { cls: 'warn' };
  if (s === '2xx') return { cls: 'enabled' };
  return { cls: '' };
}

// formatLogDate turns a YYYYMMDD string into a localized, readable date. It
// parses in the local timezone so the weekday matches the user's view.
function formatLogDate(date: string): string {
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(4, 6));
  const d = Number(date.slice(6, 8));
  if (!y || !m || !d) return date;
  const dt = new Date(y, m - 1, d);
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dt.getDay()];
  return `${y}-${pad2(m)}-${pad2(d)} ${weekday}`;
}

// formatLogTs renders an RFC3339Nano timestamp as HH:MM:SS in local time.
function formatLogTs(ts: string): string {
  const t = new Date(ts);
  if (isNaN(t.getTime())) return ts;
  return `${pad2(t.getHours())}:${pad2(t.getMinutes())}:${pad2(t.getSeconds())}`;
}

function pad2(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

async function refreshLogDays() {
  logsBusy = true;
  renderApp();
  try {
    const res = await api<{ days: LogDaySummary[] }>('/admin/api/logs');
    logDays = res.days || [];
  } catch (error) {
    setMessage(humanError(error), 'error');
  } finally {
    logsBusy = false;
    renderApp();
  }
}

async function selectLogDay(date: string) {
  selectedLogDay = date;
  logEvents = [];
  expandedLogIdx = -1;
  logsBusy = true;
  renderApp();
  try {
    const res = await api<LogDayResponse>(`/admin/api/logs/${encodeURIComponent(date)}`);
    logEvents = res.events || [];
  } catch (error) {
    setMessage(humanError(error), 'error');
  } finally {
    logsBusy = false;
    renderApp();
  }
}

function renderTelemetry() {
  const totalActive = status?.keys.reduce((s, k) => s + k.active, 0) || 0;
  const enabled = status?.keys.filter((k) => k.enabled).length || 0;
  const totalLimit = status?.keys.reduce((s, k) => s + (k.enabled ? k.concurrencyLimit : 0), 0) || 0;
  const inBackoff = status?.keys.filter((k) => k.backoffUntil && new Date(k.backoffUntil).getTime() > Date.now()).length || 0;
  const loadPct = totalLimit > 0 ? Math.round((totalActive / totalLimit) * 100) : 0;
  return `
    <article class="tel">
      <span class="k">Active Requests</span>
      <span class="v ${totalActive > 0 ? 'accent' : ''}">${totalActive}</span>
      <span class="desc">所有托管 key 当前占用</span>
      <span class="spark">${loadPct}% LOAD</span>
    </article>
    <article class="tel">
      <span class="k">Enabled Keys</span>
      <span class="v">${enabled}</span>
      <span class="desc">${status?.managedKeyMode ? '参与负载均衡选择' : '未启用托管池'}</span>
    </article>
    <article class="tel">
      <span class="k">Concurrency Cap</span>
      <span class="v">${totalLimit}</span>
      <span class="desc">已启用 key 并发上限合计</span>
    </article>
    <article class="tel">
      <span class="k">Keys in Backoff</span>
      <span class="v ${inBackoff > 0 ? 'warn' : ''}">${inBackoff}</span>
      <span class="desc">错误退避中，暂不路由</span>
    </article>
  `;
}

/* ─────────────────────────  CONFIG FIELDS  ───────────────────────── */

function renderConfigSections(config: Config) {
  return sectionOrder
    .map((section, i) => {
      const fields = configFields.filter((f) => f.section === section);
      return `
      <div class="config-card">
        <div class="config-card-head">
          <span class="ch-num">0${i + 1}</span>
          <h3>${sectionNames[section]}</h3>
        </div>
        <div class="config-card-body">
          ${fields.map((f) => renderConfigField(f, config)).join('')}
        </div>
      </div>
    `;
    })
    .join('');
}

function renderConfigField(field: ConfigField, config: Config) {
  const value = config[field.key];
  const common = `name="${field.key}" id="cfg-${field.key}"`;
  let control = '';
  if (field.type === 'checkbox') {
    control = `<label class="switch"><input ${common} type="checkbox" ${value ? 'checked' : ''} /><span></span></label>`;
  } else if (field.type === 'select') {
    control = `
      <select ${common}>
        ${(field.options || []).map((o) => `<option value="${o.value}" ${value === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
      </select>
    `;
  } else {
    const inputValue = field.key === 'adminPassword' ? '' : String(value ?? '');
    control = `<input ${common} type="${field.type}" value="${escapeAttr(inputValue)}" ${field.type === 'number' ? 'min="0"' : ''} />`;
  }
  return `
    <label class="config-field" for="cfg-${field.key}">
      <span class="field-title">${field.label}</span>
      ${control}
      <span class="field-help">${field.description}</span>
    </label>
  `;
}

/* ─────────────────────────  MODAL  ───────────────────────── */

function renderModal() {
  if (modal.kind === 'key') {
    const draft = modal.draft;
    const isEdit = !!draft.id;
    return `
      <div class="overlay" id="overlay">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal-head">
            <span class="mh-icon">${icon('key-round')}</span>
            <div>
              <h3>${isEdit ? '编辑 Key' : '新增 Key'}</h3>
              <p class="mh-sub">${isEdit ? '修改名称、密钥或并发上限，留空保持密钥不变' : '添加一个托管上游 API key'}</p>
            </div>
          </div>
          <form class="modal-body" id="key-form">
            <div class="modal-field">
              <label><span>名称</span><input name="name" value="${escapeAttr(draft.name)}" placeholder="例如 GLM 主 key" /></label>
            </div>
            <div class="modal-field">
              <label><span>API key</span><input name="key" type="password" value="${escapeAttr(draft.key)}" placeholder="${isEdit ? '留空保持不变' : 'sk-...'}" /></label>
            </div>
            <div class="modal-field row">
              <label><span>并发上限</span><input name="concurrencyLimit" type="number" min="0" value="${draft.concurrencyLimit}" /></label>
              <label class="inline"><input name="enabled" type="checkbox" ${draft.enabled ? 'checked' : ''} /><span>启用此 key</span></label>
            </div>
          </form>
          <div class="modal-foot">
            <button class="ghost" type="button" id="modal-cancel">${icon('x')}取消</button>
            <button class="primary" type="submit" form="key-form">${icon('save')}${isEdit ? '保存更改' : '添加'}</button>
          </div>
        </div>
      </div>
    `;
  }
  if (modal.kind === 'delete') {
    const key = modal.key;
    return `
      <div class="overlay" id="overlay">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal-head danger-head">
            <span class="mh-icon">${icon('alert-triangle')}</span>
            <div>
              <h3>删除 Key</h3>
              <p class="mh-sub">此操作不可撤销，请确认删除对象</p>
            </div>
          </div>
          <div class="modal-body">
            <p class="confirm-msg">确定要删除 <strong>${escapeHTML(key.name)}</strong> 吗？删除后该 key 立即从负载均衡池移除。</p>
            <div class="confirm-detail">
              <strong>${escapeHTML(key.name)}</strong>
              ${escapeHTML(key.id)} · ${escapeHTML(key.keyPreview)}
            </div>
          </div>
          <div class="modal-foot">
            <button class="ghost" type="button" id="modal-cancel">${icon('x')}取消</button>
            <button class="danger" type="button" id="modal-confirm-delete">${icon('trash-2')}确认删除</button>
          </div>
        </div>
      </div>
    `;
  }
  return '';
}

function openKeyModal(draft: KeyDraft) {
  modal = { kind: 'key', draft };
  renderApp();
  setTimeout(() => document.querySelector<HTMLInputElement>('#key-form input[name="name"]')?.focus(), 30);
}

function openDeleteModal(key: KeyStatus) {
  modal = { kind: 'delete', key };
  renderApp();
}

function closeModal() {
  modal = { kind: 'none' };
  renderApp();
}

function renderKeyTable(keys: KeyStatus[]) {
  if (!keys.length) {
    return `
      <div class="empty-state">
        <div class="es-icon">${icon('key-round')}</div>
        未添加托管 key，代理接口按客户端传入的 API key 透传。
      </div>
    `;
  }
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>名称</th>
            <th>Key</th>
            <th>状态</th>
            <th>负载</th>
            <th>粘性</th>
            <th>退避</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${keys.map((key) => `
            <tr data-key-id="${escapeAttr(key.id)}">
              <td><strong>${escapeHTML(key.name)}</strong><span class="key-id">${escapeHTML(key.id)}</span></td>
              <td><span class="key-prev">${escapeHTML(key.keyPreview)}</span></td>
              <td><span class="pill ${key.enabled ? 'enabled' : ''}"><span class="dot"></span>${key.enabled ? '启用' : '停用'}</span></td>
              <td class="key-load-cell">${renderKeyLoad(key)}</td>
              <td class="key-sticky-cell">${key.stickySessions}</td>
              <td class="key-backoff-cell">${renderKeyBackoff(key)}</td>
              <td>
                <div class="row-actions">
                  <button class="ghost edit-key" data-id="${escapeAttr(key.id)}">编辑</button>
                  <button class="danger delete-key" data-id="${escapeAttr(key.id)}">${icon('trash-2')}</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderKeyBackoff(key: KeyStatus) {
  if (!key.backoffUntil) {
    return '<span class="pill"><span class="dot"></span>正常</span>';
  }
  const until = new Date(key.backoffUntil);
  const left = Math.max(0, until.getTime() - Date.now());
  if (left <= 0) {
    return '<span class="pill"><span class="dot"></span>正常</span>';
  }
  const seconds = Math.ceil(left / 1000);
  return `<span class="pill warn"><span class="dot"></span>退避 ${seconds}s</span><button class="ghost reset-backoff" data-id="${escapeAttr(key.id)}" title="结束退避">${icon('check-circle-2')}恢复</button>`;
}

function renderKeyLoad(key: KeyStatus) {
  const pct = keyLoadPercent(key);
  const cls = pct >= 100 ? 'full' : pct >= 80 ? 'high' : '';
  return `
    <div class="meter ${cls}"><span style="width:${pct}%"></span></div>
    <small>${key.active} / ${key.concurrencyLimit}</small>
  `;
}

function keyLoadPercent(key: KeyStatus) {
  return Math.min(100, Math.round((key.active / Math.max(1, key.concurrencyLimit)) * 100));
}

function renderLiveStatus() {
  if (!status || !document.querySelector('.app-shell')) {
    return;
  }
  const modePill = document.querySelector<HTMLElement>('.mode-pill');
  if (modePill) {
    modePill.classList.toggle('on', status.managedKeyMode);
    modePill.innerHTML = `<span class="dot"></span> ${status.managedKeyMode ? '托管 key 模式' : '客户端 key 透传'}`;
  }
  const telemetry = document.querySelector<HTMLElement>('.telemetry');
  if (telemetry) {
    telemetry.innerHTML = renderTelemetry();
  }
  const railSection = document.querySelector<HTMLElement>('.rail-section');
  if (railSection) {
    railSection.outerHTML = renderRailStats();
  }
  const navCount = document.querySelector<HTMLElement>('.nav-count');
  if (navCount) {
    navCount.textContent = String(status.keys.length);
  }
  updateKeyRows(status.keys);
}

function updateKeyRows(keys: KeyStatus[]) {
  const byId = new Map(keys.map((k) => [k.id, k]));
  document.querySelectorAll<HTMLTableRowElement>('tr[data-key-id]').forEach((row) => {
    const id = row.dataset.keyId || '';
    const key = byId.get(id);
    if (!key) return;
    const load = row.querySelector<HTMLElement>('.key-load-cell');
    if (load) load.innerHTML = renderKeyLoad(key);
    const sticky = row.querySelector<HTMLElement>('.key-sticky-cell');
    if (sticky) sticky.textContent = String(key.stickySessions);
    const backoff = row.querySelector<HTMLElement>('.key-backoff-cell');
    if (backoff) backoff.innerHTML = renderKeyBackoff(key);
    const pill = row.querySelector<HTMLElement>('.pill');
    if (pill) {
      pill.className = `pill ${key.enabled ? 'enabled' : ''}`;
      pill.innerHTML = `<span class="dot"></span>${key.enabled ? '启用' : '停用'}`;
    }
  });
}

/* ─────────────────────────  EVENTS  ───────────────────────── */

function bindAppEvents() {
  document.querySelector('#refresh')?.addEventListener('click', async () => {
    await refreshStatus();
    setMessage('');
    // On the logs page, also reload the day index and the currently selected
    // day's events so the global refresh is the single source of truth.
    if (page === 'logs') {
      await refreshLogDays();
      if (selectedLogDay) {
        await selectLogDay(selectedLogDay);
      }
    } else {
      renderApp();
    }
  });
  document.querySelector('#logout')?.addEventListener('click', async () => {
    await api('/admin/api/logout', { method: 'POST' }).catch(() => undefined);
    status = null;
    setMessage('');
    renderLogin();
  });
  document.querySelector('#new-key')?.addEventListener('click', () => {
    openKeyModal({ id: '', name: '', key: '', enabled: true, concurrencyLimit: status?.config.keyConcurrencyLimit || 4 });
  });
  document.querySelector<HTMLFormElement>('#config-form')?.addEventListener('submit', saveConfig);
  document.querySelector<HTMLFormElement>('#key-form')?.addEventListener('submit', saveKey);
  document.querySelectorAll<HTMLButtonElement>('.nav-item').forEach((tab) => {
    tab.addEventListener('click', () => {
      const next = tab.dataset.page as 'keys' | 'settings' | 'logs';
      if (next && next !== page) {
        page = next;
        setMessage('');
        editingKey = null;
        modal = { kind: 'none' };
        renderApp();
        if (next === 'logs') {
          refreshLogDays();
        }
      }
    });
  });
  document.querySelectorAll<HTMLButtonElement>('.theme-switch button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.theme as ThemeMode;
      if (mode) setThemeMode(mode);
    });
  });
  document.querySelectorAll<HTMLButtonElement>('.edit-key').forEach((button) => {
    button.addEventListener('click', () => {
      const key = status?.keys.find((item) => item.id === button.dataset.id);
      if (!key) return;
      editingKey = { id: key.id, name: key.name, key: '', enabled: key.enabled, concurrencyLimit: key.concurrencyLimit };
      openKeyModal(editingKey);
    });
  });
  document.querySelectorAll<HTMLButtonElement>('.delete-key').forEach((button) => {
    button.addEventListener('click', () => {
      const key = status?.keys.find((item) => item.id === button.dataset.id);
      if (!key) return;
      openDeleteModal(key);
    });
  });
  document.querySelectorAll<HTMLButtonElement>('.reset-backoff').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id || '';
      if (!id) return;
      try {
        await api(`/admin/api/keys/${encodeURIComponent(id)}/reset_backoff`, { method: 'POST' });
        await refreshStatus();
        setMessage('已手动结束退避', 'success');
        renderApp();
      } catch (error) {
        setMessage(humanError(error), 'error');
        renderApp();
      }
    });
  });
  // logs page events
  document.querySelectorAll<HTMLButtonElement>('.day-item').forEach((button) => {
    button.addEventListener('click', () => {
      const date = button.dataset.date || '';
      if (date) selectLogDay(date);
    });
  });
  bindLogRowEvents();
  // modal interactions
  document.querySelector('#modal-cancel')?.addEventListener('click', closeModal);
  document.querySelector('#overlay')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeModal();
  });
  document.querySelector('#modal-confirm-delete')?.addEventListener('click', confirmDeleteKey);
  if (modal.kind !== 'none') {
    document.addEventListener('keydown', onModalKeydown);
  } else {
    document.removeEventListener('keydown', onModalKeydown);
  }
}

// bindLogRowEvents attaches click handlers to log table rows. It is called
// both from bindAppEvents (initial render) and after a partial re-render of
// the events container (so newly created rows are clickable). Toggling a row
// updates only #logs-events instead of the whole app, preserving scroll
// position.
function bindLogRowEvents() {
  document.querySelectorAll<HTMLTableRowElement>('.log-row').forEach((row) => {
    row.addEventListener('click', () => {
      const idx = Number(row.dataset.logIdx);
      if (Number.isNaN(idx)) return;
      expandedLogIdx = expandedLogIdx === idx ? -1 : idx;
      const container = document.querySelector('#logs-events');
      if (container) {
        container.innerHTML = renderLogEvents();
        bindLogRowEvents();
        renderIcons();
      } else {
        renderApp();
      }
    });
  });
}

function onModalKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && modal.kind !== 'none') {
    closeModal();
  }
}

async function saveConfig(event: SubmitEvent) {
  event.preventDefault();
  if (!status) return;
  const form = new FormData(event.currentTarget as HTMLFormElement);
  const next = { ...status.config };
  for (const field of configFields) {
    if (field.type === 'checkbox') {
      (next[field.key] as boolean) = form.has(field.key);
    } else if (field.type === 'number') {
      (next[field.key] as number) = Number(form.get(field.key) || 0);
    } else {
      (next[field.key] as string) = String(form.get(field.key) || '');
    }
  }
  busy = true;
  renderApp();
  try {
    await api('/admin/api/config', { method: 'PUT', body: JSON.stringify(next) });
    await refreshStatus();
    setMessage('配置已保存，运行时设置已热重载', 'success');
  } catch (error) {
    setMessage(humanError(error), 'error');
  } finally {
    busy = false;
    renderApp();
  }
}

async function saveKey(event: SubmitEvent) {
  event.preventDefault();
  if (modal.kind !== 'key') return;
  const form = new FormData(event.currentTarget as HTMLFormElement);
  const draft: KeyDraft = {
    id: modal.draft.id,
    name: String(form.get('name') || ''),
    key: String(form.get('key') || ''),
    enabled: form.has('enabled'),
    concurrencyLimit: Number(form.get('concurrencyLimit') || 0),
  };
  try {
    if (draft.id) {
      await api(`/admin/api/keys/${encodeURIComponent(draft.id)}`, { method: 'PUT', body: JSON.stringify(draft) });
    } else {
      await api('/admin/api/keys', { method: 'POST', body: JSON.stringify(draft) });
    }
    editingKey = null;
    modal = { kind: 'none' };
    await refreshStatus();
    setMessage(draft.id ? 'key 已更新' : 'key 已添加', 'success');
    renderApp();
  } catch (error) {
    setMessage(humanError(error), 'error');
    modal = { kind: 'none' };
    renderApp();
  }
}

async function confirmDeleteKey() {
  if (modal.kind !== 'delete') return;
  const id = modal.key.id;
  try {
    await api(`/admin/api/keys/${encodeURIComponent(id)}`, { method: 'DELETE' });
    editingKey = null;
    modal = { kind: 'none' };
    await refreshStatus();
    setMessage('key 已删除', 'success');
    renderApp();
  } catch (error) {
    setMessage(humanError(error), 'error');
    modal = { kind: 'none' };
    renderApp();
  }
}

function renderIcons() {
  createIcons({
    icons: {
      Activity,
      AlertTriangle,
      CheckCircle2,
      Clock,
      FileText,
      KeyRound,
      LayoutGrid,
      LogOut,
      Monitor,
      Moon,
      Plus,
      RefreshCw,
      Save,
      ShieldCheck,
      Sun,
      Trash2,
      X,
    },
  });
}

function humanError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw === 'AUTH_REQUIRED') {
    return '请先登录管理页面';
  }
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string } };
    return parsed.error?.message || raw;
  } catch {
    return raw;
  }
}

function escapeHTML(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char] || char);
}

function escapeAttr(value: string) {
  return escapeHTML(value).replace(/`/g, '&#96;');
}

bootstrap();
