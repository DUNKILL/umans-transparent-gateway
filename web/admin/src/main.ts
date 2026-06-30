import { createIcons, KeyRound, LogOut, Plus, RefreshCw, Save, ShieldCheck, Trash2 } from 'lucide';
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
};

type KeyStatus = {
  id: string;
  name: string;
  enabled: boolean;
  concurrencyLimit: number;
  active: number;
  stickySessions: number;
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
    description: 'HTTP 服务绑定地址。该值写入 config.json 后会热重载到运行时配置，但已启动进程的端口绑定需要重启后才会变化。',
  },
  {
    key: 'upstreamBaseURL',
    label: '上游 API 地址',
    type: 'text',
    section: 'server',
    description: 'Umans-compatible 上游服务的 base URL。新的代理请求、模型目录读取和重试都会使用热重载后的地址。',
  },
  {
    key: 'defaultModel',
    label: '默认模型',
    type: 'text',
    section: 'models',
    description: '请求体缺少 model 字段时用于预算校验的模型 ID，也是安全输出上限计算时的候选模型之一。',
  },
  {
    key: 'opusModel',
    label: 'Opus 映射模型',
    type: 'text',
    section: 'models',
    description: 'Claude Code Opus 档位对应的上游模型。预算保护会把默认、Opus、Sonnet、Haiku 的上限取最保守值。',
  },
  {
    key: 'sonnetModel',
    label: 'Sonnet 映射模型',
    type: 'text',
    section: 'models',
    description: 'Claude Code Sonnet 档位对应的上游模型，通常是主力编码模型。',
  },
  {
    key: 'haikuModel',
    label: 'Haiku 映射模型',
    type: 'text',
    section: 'models',
    description: 'Claude Code Haiku 档位对应的上游模型。若某个 key 未配置独立并发，会使用全局并发限制。',
  },
  {
    key: 'keyConcurrencyLimit',
    label: '全局默认并发',
    type: 'number',
    section: 'routing',
    description: '每个 key 默认允许同时处理的活跃请求数。key.json 中单个 key 的并发数大于 0 时会覆盖此值。',
  },
  {
    key: 'keyQueueTimeout',
    label: '排队等待时间',
    type: 'text',
    section: 'routing',
    description: '当目标 key 并发已满时，请求会先等待这个时长而不是立刻返回 429。粘性会话命中的 key 满载时也使用同一个等待时间，超时后才尝试切换到其他 key。',
  },
  {
    key: 'stickySession',
    label: '启用粘性会话',
    type: 'checkbox',
    section: 'routing',
    description: '开启后，同一客户端 token 在粘性窗口内会优先复用上一次选中的上游 key，减少上下文切换带来的不稳定。',
  },
  {
    key: 'stickySessionTTL',
    label: '粘性会话窗口',
    type: 'text',
    section: 'routing',
    description: '同一客户端 token 记住上次 key 的有效时间，默认 10s。窗口过期后会重新按负载均衡选择当前并发数更小的 key。',
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
    description: '控制是否向上游注入 X-Umans-Websearch-Provider。exa/native/none 会强制覆盖客户端 header，auto 会透传客户端设置。',
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
    description: '请求的 max_tokens 超过模型目录安全上限时，error 会拒绝请求，clamp-visible 会把请求值压到可见上限并返回提示 header。',
  },
  {
    key: 'upstreamRetryMax',
    label: '上游最大重试次数',
    type: 'number',
    section: 'reliability',
    description: '首次请求失败后最多再重试的次数。重试期间会持续占用当前 key 的并发槽，避免把瞬断放大成更多并发。',
  },
  {
    key: 'retry429',
    label: '重试 429',
    type: 'checkbox',
    section: 'reliability',
    description: '默认关闭，避免上游限流时继续放大压力。只有明确知道 429 是短暂队列抖动时才建议开启。',
  },
  {
    key: 'upstreamRetryBaseDelay',
    label: '重试初始延迟',
    type: 'text',
    section: 'reliability',
    description: '第一次重试前等待的时间，使用 Go duration 格式，例如 500ms、2s、1m。',
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
    description: '开启后会把旧 tuple 写法 items: [...] 转为 prefixItems，减少严格上游校验器拒绝工具 schema 的概率。',
  },
  {
    key: 'catalogTTL',
    label: '模型目录缓存时间',
    type: 'text',
    section: 'reliability',
    description: '每个上游 key 的 /v1/models/info 缓存时间。预算保护依赖这个目录，缓存过短会增加上游请求。',
  },
  {
    key: 'adminPassword',
    label: '管理页面访问密码',
    type: 'password',
    section: 'security',
    description: '用于登录 /admin/ 管理页面和调用管理 API。表单留空表示保持当前密码不变。',
  },
  {
    key: 'proxyAccessToken',
    label: '代理访问令牌',
    type: 'password',
    section: 'security',
    description: '托管 key 池启用时必须配置。客户端请求的 Authorization 或 x-api-key 需要与此值一致，网关才会使用 key 池转发。',
  },
  {
    key: 'errorEventDir',
    label: '匿名错误目录',
    type: 'text',
    section: 'logs',
    description: '匿名错误事件 JSONL 的保存目录。只记录事件类型、状态段、延迟段和错误分类，不写请求体、模型输入或 API key。',
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
];

const sectionNames: Record<ConfigField['section'], string> = {
  server: '服务',
  models: '模型映射',
  routing: '路由与并发',
  reliability: '稳定性',
  security: '访问控制',
  logs: '匿名错误',
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('missing app root');
}

let status: StatusResponse | null = null;
let editingKey: KeyDraft | null = null;
let message = '';
let busy = false;
let poller: number | undefined;

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
  try {
    await refreshStatus();
    renderApp();
    startPolling();
  } catch (error) {
    if (String((error as Error).message) === 'AUTH_REQUIRED') {
      renderLogin();
      return;
    }
    message = humanError(error);
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

function renderLogin() {
  app.innerHTML = `
    <main class="login-shell">
      <form class="login-panel" id="login-form">
        <div class="brand-mark">${icon('shield-check')}</div>
        <h1>Umans Gateway</h1>
        <label>
          <span>管理密码</span>
          <input name="password" type="password" autocomplete="current-password" autofocus />
        </label>
        <button class="primary" type="submit">${icon('key-round')}登录</button>
        ${message ? `<p class="form-error">${escapeHTML(message)}</p>` : ''}
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
      message = '';
      await refreshStatus();
      renderApp();
      startPolling();
    } catch (error) {
      message = humanError(error);
      renderLogin();
    }
  });
}

function renderApp() {
  if (!status) {
    return;
  }
  app.innerHTML = `
    <main class="app-shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">UMANS TRANSPARENT GATEWAY</p>
          <h1>运行配置与 Key 池</h1>
        </div>
        <div class="topbar-actions">
          <span class="mode ${status.managedKeyMode ? 'on' : ''}">${status.managedKeyMode ? '托管 key 模式' : '客户端 key 透传'}</span>
          <button class="ghost" id="refresh">${icon('refresh-cw')}刷新</button>
          <button class="ghost" id="logout">${icon('log-out')}退出</button>
        </div>
      </header>
      ${message ? `<div class="notice">${escapeHTML(message)}</div>` : ''}
      <section class="metrics">
        ${renderMetrics()}
      </section>
      <section class="workspace">
        <form class="panel config-panel" id="config-form">
          <div class="panel-head">
            <h2>全局配置</h2>
            <button class="primary" type="submit" ${busy ? 'disabled' : ''}>${icon('save')}保存配置</button>
          </div>
          ${renderConfigFields(status.config)}
        </form>
        <section class="panel keys-panel">
          <div class="panel-head">
            <h2>Key 管理</h2>
            <button class="ghost" id="new-key">${icon('plus')}新增 key</button>
          </div>
          ${renderKeyForm()}
          ${renderKeyTable(status.keys)}
        </section>
      </section>
    </main>
  `;
  bindAppEvents();
  renderIcons();
}

function renderLiveStatus() {
  if (!status || !document.querySelector('.app-shell')) {
    return;
  }
  const mode = document.querySelector<HTMLElement>('.mode');
  if (mode) {
    mode.classList.toggle('on', status.managedKeyMode);
    mode.textContent = status.managedKeyMode ? '托管 key 模式' : '客户端 key 透传';
  }
  const metrics = document.querySelector<HTMLElement>('.metrics');
  if (metrics) {
    metrics.innerHTML = renderMetrics();
  }
  updateKeyRows(status.keys);
}

function renderMetrics() {
  const totalActive = status?.keys.reduce((sum, key) => sum + key.active, 0) || 0;
  const enabled = status?.keys.filter((key) => key.enabled).length || 0;
  const totalLimit = status?.keys.reduce((sum, key) => sum + (key.enabled ? key.concurrencyLimit : 0), 0) || 0;
  return `
    <article>
      <span>活跃请求</span>
      <strong>${totalActive}</strong>
      <small>所有托管 key 当前占用</small>
    </article>
    <article>
      <span>启用 key</span>
      <strong>${enabled}</strong>
      <small>${status?.managedKeyMode ? '用于负载均衡选择' : '未启用托管池'}</small>
    </article>
    <article>
      <span>总并发上限</span>
      <strong>${totalLimit}</strong>
      <small>已启用 key 的并发上限合计</small>
    </article>
  `;
}

function renderConfigFields(config: Config) {
  return (Object.keys(sectionNames) as ConfigField['section'][]).map((section) => {
    const fields = configFields.filter((field) => field.section === section);
    return `
      <fieldset>
        <legend>${sectionNames[section]}</legend>
        <div class="field-grid">
          ${fields.map((field) => renderConfigField(field, config)).join('')}
        </div>
      </fieldset>
    `;
  }).join('');
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
        ${(field.options || []).map((option) => `<option value="${option.value}" ${value === option.value ? 'selected' : ''}>${option.label}</option>`).join('')}
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

function renderKeyForm() {
  const draft = editingKey || { id: '', name: '', key: '', enabled: true, concurrencyLimit: status?.config.keyConcurrencyLimit || 4 };
  return `
    <form class="key-form" id="key-form">
      <input type="hidden" name="id" value="${escapeAttr(draft.id)}" />
      <label>
        <span>名称</span>
        <input name="name" value="${escapeAttr(draft.name)}" placeholder="例如 GLM 主 key" />
      </label>
      <label>
        <span>API key</span>
        <input name="key" type="password" value="${escapeAttr(draft.key)}" placeholder="${draft.id ? '留空保持不变' : 'sk-...'}" />
      </label>
      <label>
        <span>并发上限</span>
        <input name="concurrencyLimit" type="number" min="0" value="${draft.concurrencyLimit}" />
      </label>
      <label class="inline-check">
        <input name="enabled" type="checkbox" ${draft.enabled ? 'checked' : ''} />
        <span>启用</span>
      </label>
      <button class="primary" type="submit">${icon('save')}${draft.id ? '更新' : '添加'}</button>
      ${draft.id ? '<button class="ghost" type="button" id="cancel-edit">取消</button>' : ''}
    </form>
    <p class="key-help">并发上限填 0 表示使用全局默认值；实时活跃数来自当前运行时内存状态，不写入 key.json。</p>
  `;
}

function renderKeyTable(keys: KeyStatus[]) {
  if (!keys.length) {
    return '<div class="empty-state">未添加托管 key，代理接口仍按客户端传入的 API key 透传。</div>';
  }
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>名称</th>
            <th>Key</th>
            <th>状态</th>
            <th>活跃/上限</th>
            <th>粘性会话</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${keys.map((key) => `
            <tr data-key-id="${escapeAttr(key.id)}">
              <td><strong>${escapeHTML(key.name)}</strong><small>${escapeHTML(key.id)}</small></td>
              <td>${escapeHTML(key.keyPreview)}</td>
              <td><span class="pill ${key.enabled ? 'enabled' : ''}">${key.enabled ? '启用' : '停用'}</span></td>
              <td class="key-load-cell">${renderKeyLoad(key)}</td>
              <td class="key-sticky-cell">${key.stickySessions}</td>
              <td class="row-actions">
                <button class="ghost edit-key" data-id="${escapeAttr(key.id)}">编辑</button>
                <button class="danger delete-key" data-id="${escapeAttr(key.id)}">${icon('trash-2')}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderKeyLoad(key: KeyStatus) {
  return `
    <div class="meter"><span style="width:${keyLoadPercent(key)}%"></span></div>
    <small>${key.active} / ${key.concurrencyLimit}</small>
  `;
}

function keyLoadPercent(key: KeyStatus) {
  return Math.min(100, Math.round((key.active / Math.max(1, key.concurrencyLimit)) * 100));
}

function updateKeyRows(keys: KeyStatus[]) {
  const byId = new Map(keys.map((key) => [key.id, key]));
  document.querySelectorAll<HTMLTableRowElement>('tr[data-key-id]').forEach((row) => {
    const id = row.dataset.keyId || '';
    const key = byId.get(id);
    if (!key) {
      return;
    }
    const load = row.querySelector<HTMLElement>('.key-load-cell');
    if (load) {
      load.innerHTML = renderKeyLoad(key);
    }
    const sticky = row.querySelector<HTMLElement>('.key-sticky-cell');
    if (sticky) {
      sticky.textContent = String(key.stickySessions);
    }
  });
}

function bindAppEvents() {
  document.querySelector('#refresh')?.addEventListener('click', async () => {
    await refreshStatus();
    message = '';
    renderApp();
  });
  document.querySelector('#logout')?.addEventListener('click', async () => {
    await api('/admin/api/logout', { method: 'POST' }).catch(() => undefined);
    status = null;
    message = '';
    renderLogin();
  });
  document.querySelector('#new-key')?.addEventListener('click', () => {
    editingKey = null;
    renderApp();
  });
  document.querySelector('#cancel-edit')?.addEventListener('click', () => {
    editingKey = null;
    renderApp();
  });
  document.querySelector<HTMLFormElement>('#config-form')?.addEventListener('submit', saveConfig);
  document.querySelector<HTMLFormElement>('#key-form')?.addEventListener('submit', saveKey);
  document.querySelectorAll<HTMLButtonElement>('.edit-key').forEach((button) => {
    button.addEventListener('click', () => {
      const key = status?.keys.find((item) => item.id === button.dataset.id);
      if (!key) return;
      editingKey = { id: key.id, name: key.name, key: '', enabled: key.enabled, concurrencyLimit: key.concurrencyLimit };
      renderApp();
    });
  });
  document.querySelectorAll<HTMLButtonElement>('.delete-key').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id || '';
      if (!id || !window.confirm('确定删除这个 key？')) return;
      try {
        await api(`/admin/api/keys/${encodeURIComponent(id)}`, { method: 'DELETE' });
        editingKey = null;
        await refreshStatus();
        message = 'key 已删除';
        renderApp();
      } catch (error) {
        message = humanError(error);
        renderApp();
      }
    });
  });
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
    message = '配置已保存，运行时设置已热重载';
  } catch (error) {
    message = humanError(error);
  } finally {
    busy = false;
    renderApp();
  }
}

async function saveKey(event: SubmitEvent) {
  event.preventDefault();
  const form = new FormData(event.currentTarget as HTMLFormElement);
  const draft: KeyDraft = {
    id: String(form.get('id') || ''),
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
    await refreshStatus();
    message = draft.id ? 'key 已更新' : 'key 已添加';
    renderApp();
  } catch (error) {
    message = humanError(error);
    renderApp();
  }
}

function renderIcons() {
  createIcons({
    icons: {
      KeyRound,
      LogOut,
      Plus,
      RefreshCw,
      Save,
      ShieldCheck,
      Trash2,
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
