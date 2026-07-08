(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const u of o.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&a(u)}).observe(document,{childList:!0,subtree:!0});function n(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(s){if(s.ep)return;s.ep=!0;const o=n(s);fetch(s.href,o)}})();/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=(e,t,n=[])=>{const a=document.createElementNS("http://www.w3.org/2000/svg",e);return Object.keys(t).forEach(s=>{a.setAttribute(s,String(t[s]))}),n.length&&n.forEach(s=>{const o=z(...s);a.appendChild(o)}),a};var ie=([e,t,n])=>z(e,t,n);/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oe=e=>Array.from(e.attributes).reduce((t,n)=>(t[n.name]=n.value,t),{}),ce=e=>typeof e=="string"?e:!e||!e.class?"":e.class&&typeof e.class=="string"?e.class.split(" "):e.class&&Array.isArray(e.class)?e.class:"",re=e=>e.flatMap(ce).map(n=>n.trim()).filter(Boolean).filter((n,a,s)=>s.indexOf(n)===a).join(" "),le=e=>e.replace(/(\w)(\w*)(_|-|\s*)/g,(t,n,a)=>n.toUpperCase()+a.toLowerCase()),B=(e,{nameAttr:t,icons:n,attrs:a})=>{var _;const s=e.getAttribute(t);if(s==null)return;const o=le(s),u=n[o];if(!u)return console.warn(`${e.outerHTML} icon name was not found in the provided icons object.`);const k=oe(e),[c,l,L]=u,R={...l,"data-lucide":s,...a,...k},j=re(["lucide",`lucide-${s}`,k,a]);j&&Object.assign(R,{class:j});const ae=ie([c,R,L]);return(_=e.parentNode)==null?void 0:_.replaceChild(ae,e)};/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de=["svg",y,[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pe=["svg",y,[["circle",{cx:"12",cy:"12",r:"10"}],["path",{d:"m9 12 2 2 4-4"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ue=["svg",y,[["circle",{cx:"12",cy:"12",r:"10"}],["polyline",{points:"12 6 12 12 16 14"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ye=["svg",y,[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4"}],["path",{d:"M10 9H8"}],["path",{d:"M16 13H8"}],["path",{d:"M16 17H8"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=["svg",y,[["path",{d:"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const he=["svg",y,[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fe=["svg",y,[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"}],["polyline",{points:"16 17 21 12 16 7"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ve=["svg",y,[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ge=["svg",y,[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke=["svg",y,[["path",{d:"M5 12h14"}],["path",{d:"M12 5v14"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const be=["svg",y,[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"}],["path",{d:"M21 3v5h-5"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"}],["path",{d:"M8 16H3v5"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e=["svg",y,[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const we=["svg",y,[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{d:"m9 12 2 2 4-4"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xe=["svg",y,[["circle",{cx:"12",cy:"12",r:"4"}],["path",{d:"M12 2v2"}],["path",{d:"M12 20v2"}],["path",{d:"m4.93 4.93 1.41 1.41"}],["path",{d:"m17.66 17.66 1.41 1.41"}],["path",{d:"M2 12h2"}],["path",{d:"M20 12h2"}],["path",{d:"m6.34 17.66-1.41 1.41"}],["path",{d:"m19.07 4.93-1.41 1.41"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=["svg",y,[["path",{d:"M3 6h18"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=["svg",y,[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"}],["path",{d:"M12 9v4"}],["path",{d:"M12 17h.01"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Me=["svg",y,[["path",{d:"M18 6 6 18"}],["path",{d:"m6 6 12 12"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee=({icons:e={},nameAttr:t="data-lucide",attrs:n={}}={})=>{if(!Object.values(e).length)throw new Error(`Please provide an icons object.
If you want to use all the icons you can import it like:
 \`import { createIcons, icons } from 'lucide';
lucide.createIcons({icons});\``);if(typeof document>"u")throw new Error("`createIcons()` only works in a browser environment.");const a=document.querySelectorAll(`[${t}]`);if(Array.from(a).forEach(s=>B(s,{nameAttr:t,icons:e,attrs:n})),t==="data-lucide"){const s=document.querySelectorAll("[icon-name]");s.length>0&&(console.warn("[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide"),Array.from(s).forEach(o=>B(o,{nameAttr:"icon-name",icons:e,attrs:n})))}},Q=[{key:"listen",label:"监听地址",type:"text",section:"server",description:"HTTP 服务绑定地址。写入 config.json 后热重载到运行时配置，但已启动进程的端口绑定需重启才会变化。"},{key:"upstreamBaseURL",label:"上游 API 地址",type:"text",section:"server",description:"Umans-compatible 上游服务的 base URL。新代理请求、模型目录读取和重试都使用热重载后的地址。"},{key:"defaultModel",label:"默认模型",type:"text",section:"models",description:"请求体缺少 model 字段时用于预算校验的模型 ID，也是安全输出上限计算的候选模型之一。"},{key:"opusModel",label:"Opus 映射",type:"text",section:"models",description:"Claude Code Opus 档位对应的上游模型。预算保护取默认/Opus/Sonnet/Haiku 上限的最保守值。"},{key:"sonnetModel",label:"Sonnet 映射",type:"text",section:"models",description:"Claude Code Sonnet 档位对应的上游模型，通常是主力编码模型。"},{key:"haikuModel",label:"Haiku 映射",type:"text",section:"models",description:"Claude Code Haiku 档位对应的上游模型。若某 key 未配置独立并发，会使用全局并发限制。"},{key:"keyConcurrencyLimit",label:"全局默认并发",type:"number",section:"routing",description:"每个 key 默认允许同时处理的活跃请求数。key.json 中单个 key 并发数大于 0 时覆盖此值。"},{key:"keyQueueTimeout",label:"排队等待时间",type:"text",section:"routing",description:"目标 key 并发已满时，请求先等待此时长而非立刻 429。粘性会话命中的 key 满载时同样等待，超时后才切换。"},{key:"stickySession",label:"启用粘性会话",type:"checkbox",section:"routing",description:"同一会话在窗口内优先复用上一次选中的上游 key。会话身份优先取请求体 session_id / metadata.user_id / prompt_cache_key，缺失时网关生成并经 X-Umans-Session-Id 下发。"},{key:"stickySessionTTL",label:"粘性窗口",type:"text",section:"routing",description:"同一客户端 token 记住上次 key 的有效时间，默认 10s。过期后重新按负载均衡选择并发更小的 key。"},{key:"keyErrorThreshold",label:"Key 错误阈值",type:"number",section:"routing",description:"在 keyErrorWindow 内某上游 key 出错达到此数量时进入退避。设为 0 禁用错误退避。"},{key:"keyErrorWindow",label:"Key 错误窗口",type:"text",section:"routing",description:"计算 key 错误次数的时间窗口，例如 60s。超过此窗口的旧错误会被清除。"},{key:"keyErrorBackoff",label:"Key 退避时间",type:"text",section:"routing",description:"key 触发错误阈值后，网关在多长时间内不再路由到该 key，例如 30s。"},{key:"searchMode",label:"搜索模式",type:"select",section:"routing",options:[{value:"exa",label:"exa"},{value:"native",label:"native"},{value:"auto",label:"auto"},{value:"none",label:"none"}],description:"是否向上游注入 X-Umans-Websearch-Provider。exa/native/none 强制覆盖客户端 header，auto 透传客户端设置。"},{key:"budgetPolicy",label:"输出预算策略",type:"select",section:"routing",options:[{value:"error",label:"error"},{value:"clamp-visible",label:"clamp-visible"}],description:"max_tokens 超过目录安全上限时，error 拒绝请求，clamp-visible 压到可见上限并返回提示 header。"},{key:"upstreamRetryMax",label:"上游最大重试",type:"number",section:"reliability",description:"首次失败后最多再重试次数。重试期间持续占用当前 key 并发槽，避免把瞬断放大成更多并发。"},{key:"retry429",label:"重试 429",type:"checkbox",section:"reliability",description:"默认关闭，避免上游限流时继续放大压力。仅在明确知道 429 是短暂队列抖动时才建议开启。"},{key:"upstreamRetryBaseDelay",label:"重试初始延迟",type:"text",section:"reliability",description:"第一次重试前等待的时间，Go duration 格式，例如 500ms、2s、1m。"},{key:"upstreamRetryMaxDelay",label:"重试最大延迟",type:"text",section:"reliability",description:"指数退避的上限。实际等待时间不会超过此值。"},{key:"schemaCompat",label:"JSON Schema 兼容",type:"checkbox",section:"reliability",description:"把旧 tuple 写法 items: [...] 转为 prefixItems，减少严格上游校验器拒绝工具 schema 的概率。"},{key:"catalogTTL",label:"模型目录缓存",type:"text",section:"reliability",description:"每个上游 key 的 /v1/models/info 缓存时间。预算保护依赖此目录，缓存过短会增加上游请求。"},{key:"adminPassword",label:"管理页面密码",type:"password",section:"security",description:"用于登录 /admin/ 管理页面和调用管理 API。留空表示保持当前密码不变。"},{key:"proxyAccessToken",label:"代理访问令牌",type:"password",section:"security",description:"托管 key 池启用时必须配置。客户端 Authorization 或 x-api-key 需与此值一致，网关才使用 key 池转发。"},{key:"errorEventDir",label:"匿名错误目录",type:"text",section:"logs",description:"匿名错误事件 JSONL 保存目录。仅记录事件类型、状态段、延迟段和错误分类，不写请求体、模型输入或 API key。"},{key:"errorEventMaxAge",label:"错误事件保留时间",type:"text",section:"logs",description:"超过该时间的错误事件文件会在下一次记录或清理时删除。"},{key:"errorEventMaxSize",label:"错误事件最大总大小",type:"number",section:"logs",description:"错误事件目录允许保留的最大字节数，超过后优先删除最旧的 JSONL 文件。"},{key:"logErrorMessage",label:"记录错误详情",type:"checkbox",section:"logs",description:"开启后错误事件 JSONL 每条多记一个 message 字段，原样保存 err.Error()（含上游 URL、原因等），可在系统日志页点击行查看。默认关闭以保持匿名。"}],Te={server:"服务",models:"模型映射",routing:"路由与并发",reliability:"稳定性",security:"访问控制",logs:"匿名错误"},Ae=["server","models","routing","reliability","security","logs"],K=document.querySelector("#app");if(!K)throw new Error("missing app root");let i=null,M=null,v={text:"",kind:"info"},I=!1,D,f="keys",O=[],S="",A=[],C=!1,N=-1,b=localStorage.getItem("umans-theme")||"system",E=null,p={kind:"none"};function P(e){const t=window.matchMedia("(prefers-color-scheme: dark)").matches,n=e==="dark"||e==="system"&&t;document.documentElement.setAttribute("data-theme",n?"dark":"light")}function Ce(e){b=e,localStorage.setItem("umans-theme",e),P(e),e==="system"&&(E||(E=window.matchMedia("(prefers-color-scheme: dark)"),E.addEventListener("change",()=>{b==="system"&&P("system")}))),document.querySelectorAll(".theme-switch button").forEach(t=>{t.classList.toggle("active",t.dataset.theme===e)})}function r(e){return`<i data-lucide="${e}" aria-hidden="true"></i>`}async function g(e,t={}){const n=new Headers(t.headers);t.body&&!n.has("content-type")&&n.set("content-type","application/json");const a=await fetch(e,{...t,headers:n,credentials:"include"});if(a.status===401)throw new Error("AUTH_REQUIRED");if(!a.ok){const s=await a.text();throw new Error(s||`HTTP ${a.status}`)}return await a.json()}async function Ne(){P(b),b==="system"&&(E=window.matchMedia("(prefers-color-scheme: dark)"),E.addEventListener("change",()=>{b==="system"&&P("system")}));try{await w(),d(),W()}catch(e){if(String(e.message)==="AUTH_REQUIRED"){q();return}v={text:x(e),kind:"error"},q()}}function W(){D&&window.clearInterval(D),D=window.setInterval(()=>{w().then(Fe).catch(()=>{})},2e3)}async function w(){i=await g("/admin/api/status")}function h(e,t="info"){v={text:e,kind:t}}function q(){var e;K.innerHTML=`
    <main class="login-shell">
      <form class="login-panel" id="login-form">
        <div class="brand-mark">${r("shield-check")}</div>
        <div>
          <h1>Umans Gateway</h1>
          <p class="sub">Transparent Proxy · Control Panel</p>
        </div>
        <label>
          <span>管理密码</span>
          <input name="password" type="password" autocomplete="current-password" autofocus />
        </label>
        <button class="primary" type="submit">${r("key-round")}登录控制台</button>
        ${v.text?`<p class="form-error">${m(v.text)}</p>`:""}
      </form>
    </main>
  `,U(),(e=document.querySelector("#login-form"))==null||e.addEventListener("submit",async t=>{t.preventDefault();const n=new FormData(t.currentTarget);try{await g("/admin/api/login",{method:"POST",body:JSON.stringify({password:String(n.get("password")||"")})}),v={text:"",kind:"info"},await w(),d(),W()}catch(a){v={text:x(a),kind:"error"},q()}})}function d(){i&&(K.innerHTML=`
    <main class="app-shell">
      <aside class="rail">
        <div class="rail-brand">
          <div class="brand-mark">${r("shield-check")}</div>
          <div>
            <h1>Umans</h1>
            <p class="sub">Gateway</p>
          </div>
        </div>
        <nav class="nav">
          <button class="nav-item ${f==="keys"?"active":""}" data-page="keys">
            ${r("key-round")} Key 管理
            <span class="nav-count">${i.keys.length}</span>
          </button>
          <button class="nav-item ${f==="settings"?"active":""}" data-page="settings">
            ${r("layout-grid")} 系统设置
          </button>
          <button class="nav-item ${f==="logs"?"active":""}" data-page="logs">
            ${r("file-text")} 系统日志
          </button>
        </nav>
        ${X()}
        <div class="rail-foot">
          <div class="theme-switch">
            <button data-theme="light" title="浅色" class="${b==="light"?"active":""}">${r("sun")}</button>
            <button data-theme="system" title="跟随系统" class="${b==="system"?"active":""}">${r("monitor")}</button>
            <button data-theme="dark" title="深色" class="${b==="dark"?"active":""}">${r("moon")}</button>
          </div>
          <button class="logout" id="logout">${r("log-out")} 退出登录</button>
          <span class="build">Version: 1.2.1</span>
        </div>
      </aside>
      <section class="main">
        <header class="topbar">
          <div class="page-title">
            <p class="eyebrow">${f==="keys"?"KEY POOL":f==="settings"?"SYSTEM CONFIG":"ERROR EVENTS"}</p>
            <h2>${f==="keys"?"Key 管理":f==="settings"?"系统设置":"系统日志"}</h2>
          </div>
          <div class="topbar-actions">
            <span class="mode-pill ${i.managedKeyMode?"on":""}">
              <span class="dot"></span>
              ${i.managedKeyMode?"托管 key 模式":"客户端 key 透传"}
            </span>
            <button class="ghost" id="refresh">${r("refresh-cw")}刷新</button>
          </div>
        </header>
        <div class="content">
          ${v.text?Pe():""}
          ${f==="keys"?qe():f==="settings"?De():Ie()}
        </div>
      </section>
    </main>
    ${p.kind!=="none"?_e():""}
  `,ze(),U())}function X(){const e=(i==null?void 0:i.keys.reduce((s,o)=>s+o.active,0))||0,t=(i==null?void 0:i.keys.filter(s=>s.enabled).length)||0,n=(i==null?void 0:i.keys.reduce((s,o)=>s+(o.enabled?o.concurrencyLimit:0),0))||0,a=(i==null?void 0:i.keys.filter(s=>s.backoffUntil&&new Date(s.backoffUntil).getTime()>Date.now()).length)||0;return`
    <div class="rail-section">
      <h3>Live Telemetry</h3>
      <div class="rail-stat"><span class="k">活跃请求</span><span class="v ${e>0?"accent":""}">${e}</span></div>
      <div class="rail-stat"><span class="k">启用 key</span><span class="v">${t}</span></div>
      <div class="rail-stat"><span class="k">总并发上限</span><span class="v">${n}</span></div>
      <div class="rail-stat"><span class="k">退避中</span><span class="v ${a>0?"warn":""}">${a}</span></div>
    </div>
  `}function Pe(){const e=v.kind==="success"?"check-circle-2":v.kind==="error"?"alert-triangle":"activity";return`<div class="notice ${v.kind}">${r(e)}<span>${m(v.text)}</span></div>`}function qe(){return`
    <section class="telemetry">${ee()}</section>
    <section class="panel keys-panel">
      <div class="panel-head">
        <div>
          <h3>Key 池</h3>
          <p class="ph-sub">托管上游 API key，按粘性会话与负载均衡选择转发</p>
        </div>
        <div class="ph-actions">
          <button class="outline" id="new-key">${r("plus")}新增 key</button>
        </div>
      </div>
      ${Ve(i.keys)}
    </section>
  `}function De(){return`
    <form class="panel" id="config-form">
      <div class="panel-head">
        <div>
          <h3>全局配置</h3>
          <p class="ph-sub">写入 config.json 并热重载到运行时</p>
        </div>
      </div>
      <div class="config-sections">
        ${Re(i.config)}
      </div>
      <div class="save-bar">
        <span class="sb-note">保存后立即热重载，无需重启进程</span>
        <button class="primary" type="submit" ${I?"disabled":""}>${r("save")}保存配置</button>
      </div>
    </form>
  `}function Ie(){return`
    <section class="panel logs-panel">
      <div class="panel-head">
        <div>
          <h3>错误事件日志</h3>
          <p class="ph-sub">按天浏览错误事件。开启"记录错误详情"后可点击行查看完整错误信息</p>
        </div>
      </div>
      <div class="logs-layout">
        <aside class="logs-days">
          ${Oe()}
        </aside>
        <div class="logs-events">
          ${He()}
        </div>
      </div>
    </section>
  `}function Oe(){return O.length?`
    <ul class="day-list">
      ${O.map(e=>`
          <li>
            <button class="day-item ${e.date===S?"active":""}" data-date="${$(e.date)}">
              <span class="day-date">${Z(e.date)}</span>
              <span class="day-meta">
                <span class="day-count">${e.count}</span> 事件 · ${e.hours} 个小时文件
              </span>
            </button>
          </li>
        `).join("")}
    </ul>
  `:`
      <div class="empty-state">
        <div class="es-icon">${r("file-text")}</div>
        暂无错误事件记录。
      </div>
    `}function He(){return C?'<div class="logs-events" id="logs-events"><div class="empty-state">加载中…</div></div>':S?A.length?`
    <div class="logs-events" id="logs-events">
      <div class="logs-head">
        <span class="logs-date">${Z(S)}</span>
        <span class="logs-total">共 ${A.length} 条事件</span>
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
            ${Y()}
          </tbody>
        </table>
      </div>
    </div>
  `:`
      <div class="logs-events" id="logs-events">
        <div class="empty-state">
          <div class="es-icon">${r("file-text")}</div>
          ${m(S)} 当天无事件记录。
        </div>
      </div>
    `:`
      <div class="logs-events" id="logs-events">
        <div class="empty-state">
          <div class="es-icon">${r("file-text")}</div>
          从左侧选择一个日期查看当天的事件。
        </div>
      </div>
    `}function Y(){return A.map((e,t)=>{const n=Ke(e),a=t===N,s=!!e.message;return`
        <tr class="log-row ${a?"expanded":""} ${s?"clickable":""}" data-log-idx="${t}">
          <td class="log-ts">${Ue(e.ts)}</td>
          <td><span class="log-event">${m(e.event)}</span></td>
          <td><span class="pill ${n.cls}"><span class="dot"></span>${m(e.status_class||"none")}</span></td>
          <td class="log-lat">${m(e.latency_bucket||"unknown")}</td>
          <td class="log-cls">${m(e.error_class||"other")}${s?` <span class="log-expand-hint">${a?"收起":"详情"}</span>`:""}</td>
        </tr>
        ${a&&s?`
          <tr class="log-detail-row">
            <td colspan="5">
              <div class="log-detail">
                <span class="log-detail-label">错误详情</span>
                <pre class="log-detail-msg">${m(e.message||"")}</pre>
              </div>
            </td>
          </tr>
        `:""}
      `}).join("")}function Ke(e){const t=e.status_class||"";return t==="5xx"?{cls:"danger"}:t==="4xx"?{cls:"warn"}:t==="2xx"?{cls:"enabled"}:{cls:""}}function Z(e){const t=Number(e.slice(0,4)),n=Number(e.slice(4,6)),a=Number(e.slice(6,8));if(!t||!n||!a)return e;const s=new Date(t,n-1,a),o=["周日","周一","周二","周三","周四","周五","周六"][s.getDay()];return`${t}-${T(n)}-${T(a)} ${o}`}function Ue(e){const t=new Date(e);return isNaN(t.getTime())?e:`${T(t.getHours())}:${T(t.getMinutes())}:${T(t.getSeconds())}`}function T(e){return e<10?"0"+e:String(e)}async function V(){C=!0,d();try{O=(await g("/admin/api/logs")).days||[]}catch(e){h(x(e),"error")}finally{C=!1,d()}}async function J(e){S=e,A=[],N=-1,C=!0,d();try{A=(await g(`/admin/api/logs/${encodeURIComponent(e)}`)).events||[]}catch(t){h(x(t),"error")}finally{C=!1,d()}}function ee(){const e=(i==null?void 0:i.keys.reduce((o,u)=>o+u.active,0))||0,t=(i==null?void 0:i.keys.filter(o=>o.enabled).length)||0,n=(i==null?void 0:i.keys.reduce((o,u)=>o+(u.enabled?u.concurrencyLimit:0),0))||0,a=(i==null?void 0:i.keys.filter(o=>o.backoffUntil&&new Date(o.backoffUntil).getTime()>Date.now()).length)||0,s=n>0?Math.round(e/n*100):0;return`
    <article class="tel">
      <span class="k">Active Requests</span>
      <span class="v ${e>0?"accent":""}">${e}</span>
      <span class="desc">所有托管 key 当前占用</span>
      <span class="spark">${s}% LOAD</span>
    </article>
    <article class="tel">
      <span class="k">Enabled Keys</span>
      <span class="v">${t}</span>
      <span class="desc">${i!=null&&i.managedKeyMode?"参与负载均衡选择":"未启用托管池"}</span>
    </article>
    <article class="tel">
      <span class="k">Concurrency Cap</span>
      <span class="v">${n}</span>
      <span class="desc">已启用 key 并发上限合计</span>
    </article>
    <article class="tel">
      <span class="k">Keys in Backoff</span>
      <span class="v ${a>0?"warn":""}">${a}</span>
      <span class="desc">错误退避中，暂不路由</span>
    </article>
  `}function Re(e){return Ae.map((t,n)=>{const a=Q.filter(s=>s.section===t);return`
      <div class="config-card">
        <div class="config-card-head">
          <span class="ch-num">0${n+1}</span>
          <h3>${Te[t]}</h3>
        </div>
        <div class="config-card-body">
          ${a.map(s=>je(s,e)).join("")}
        </div>
      </div>
    `}).join("")}function je(e,t){const n=t[e.key],a=`name="${e.key}" id="cfg-${e.key}"`;let s="";if(e.type==="checkbox")s=`<label class="switch"><input ${a} type="checkbox" ${n?"checked":""} /><span></span></label>`;else if(e.type==="select")s=`
      <select ${a}>
        ${(e.options||[]).map(o=>`<option value="${o.value}" ${n===o.value?"selected":""}>${o.label}</option>`).join("")}
      </select>
    `;else{const o=e.key==="adminPassword"?"":String(n??"");s=`<input ${a} type="${e.type}" value="${$(o)}" ${e.type==="number"?'min="0"':""} />`}return`
    <label class="config-field" for="cfg-${e.key}">
      <span class="field-title">${e.label}</span>
      ${s}
      <span class="field-help">${e.description}</span>
    </label>
  `}function _e(){if(p.kind==="key"){const e=p.draft,t=!!e.id;return`
      <div class="overlay" id="overlay">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal-head">
            <span class="mh-icon">${r("key-round")}</span>
            <div>
              <h3>${t?"编辑 Key":"新增 Key"}</h3>
              <p class="mh-sub">${t?"修改名称、密钥或并发上限，留空保持密钥不变":"添加一个托管上游 API key"}</p>
            </div>
          </div>
          <form class="modal-body" id="key-form">
            <div class="modal-field">
              <label><span>名称</span><input name="name" value="${$(e.name)}" placeholder="例如 GLM 主 key" /></label>
            </div>
            <div class="modal-field">
              <label><span>API key</span><input name="key" type="password" value="${$(e.key)}" placeholder="${t?"留空保持不变":"sk-..."}" /></label>
            </div>
            <div class="modal-field row">
              <label><span>并发上限</span><input name="concurrencyLimit" type="number" min="0" value="${e.concurrencyLimit}" /></label>
              <label class="inline"><input name="enabled" type="checkbox" ${e.enabled?"checked":""} /><span>启用此 key</span></label>
            </div>
          </form>
          <div class="modal-foot">
            <button class="ghost" type="button" id="modal-cancel">${r("x")}取消</button>
            <button class="primary" type="submit" form="key-form">${r("save")}${t?"保存更改":"添加"}</button>
          </div>
        </div>
      </div>
    `}if(p.kind==="delete"){const e=p.key;return`
      <div class="overlay" id="overlay">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal-head danger-head">
            <span class="mh-icon">${r("alert-triangle")}</span>
            <div>
              <h3>删除 Key</h3>
              <p class="mh-sub">此操作不可撤销，请确认删除对象</p>
            </div>
          </div>
          <div class="modal-body">
            <p class="confirm-msg">确定要删除 <strong>${m(e.name)}</strong> 吗？删除后该 key 立即从负载均衡池移除。</p>
            <div class="confirm-detail">
              <strong>${m(e.name)}</strong>
              ${m(e.id)} · ${m(e.keyPreview)}
            </div>
          </div>
          <div class="modal-foot">
            <button class="ghost" type="button" id="modal-cancel">${r("x")}取消</button>
            <button class="danger" type="button" id="modal-confirm-delete">${r("trash-2")}确认删除</button>
          </div>
        </div>
      </div>
    `}return""}function F(e){p={kind:"key",draft:e},d(),setTimeout(()=>{var t;return(t=document.querySelector('#key-form input[name="name"]'))==null?void 0:t.focus()},30)}function Be(e){p={kind:"delete",key:e},d()}function H(){p={kind:"none"},d()}function Ve(e){return e.length?`
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
          ${e.map(t=>`
            <tr data-key-id="${$(t.id)}">
              <td><strong>${m(t.name)}</strong><span class="key-id">${m(t.id)}</span></td>
              <td><span class="key-prev">${m(t.keyPreview)}</span></td>
              <td><span class="pill ${t.enabled?"enabled":""}"><span class="dot"></span>${t.enabled?"启用":"停用"}</span></td>
              <td class="key-load-cell">${ne(t)}</td>
              <td class="key-sticky-cell">${t.stickySessions}</td>
              <td class="key-backoff-cell">${te(t)}</td>
              <td>
                <div class="row-actions">
                  <button class="ghost edit-key" data-id="${$(t.id)}">编辑</button>
                  <button class="danger delete-key" data-id="${$(t.id)}">${r("trash-2")}</button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `:`
      <div class="empty-state">
        <div class="es-icon">${r("key-round")}</div>
        未添加托管 key，代理接口按客户端传入的 API key 透传。
      </div>
    `}function te(e){if(!e.backoffUntil)return'<span class="pill"><span class="dot"></span>正常</span>';const t=new Date(e.backoffUntil),n=Math.max(0,t.getTime()-Date.now());return n<=0?'<span class="pill"><span class="dot"></span>正常</span>':`<span class="pill warn"><span class="dot"></span>退避 ${Math.ceil(n/1e3)}s</span><button class="ghost reset-backoff" data-id="${$(e.id)}" title="结束退避">${r("check-circle-2")}恢复</button>`}function ne(e){const t=Je(e);return`
    <div class="meter ${t>=100?"full":t>=80?"high":""}"><span style="width:${t}%"></span></div>
    <small>${e.active} / ${e.concurrencyLimit}</small>
  `}function Je(e){return Math.min(100,Math.round(e.active/Math.max(1,e.concurrencyLimit)*100))}function Fe(){if(!i||!document.querySelector(".app-shell"))return;const e=document.querySelector(".mode-pill");e&&(e.classList.toggle("on",i.managedKeyMode),e.innerHTML=`<span class="dot"></span> ${i.managedKeyMode?"托管 key 模式":"客户端 key 透传"}`);const t=document.querySelector(".telemetry");t&&(t.innerHTML=ee());const n=document.querySelector(".rail-section");n&&(n.outerHTML=X());const a=document.querySelector(".nav-count");a&&(a.textContent=String(i.keys.length)),Ge(i.keys)}function Ge(e){const t=new Map(e.map(n=>[n.id,n]));document.querySelectorAll("tr[data-key-id]").forEach(n=>{const a=n.dataset.keyId||"",s=t.get(a);if(!s)return;const o=n.querySelector(".key-load-cell");o&&(o.innerHTML=ne(s));const u=n.querySelector(".key-sticky-cell");u&&(u.textContent=String(s.stickySessions));const k=n.querySelector(".key-backoff-cell");k&&(k.innerHTML=te(s));const c=n.querySelector(".pill");c&&(c.className=`pill ${s.enabled?"enabled":""}`,c.innerHTML=`<span class="dot"></span>${s.enabled?"启用":"停用"}`)})}function ze(){var e,t,n,a,s,o,u,k;(e=document.querySelector("#refresh"))==null||e.addEventListener("click",async()=>{await w(),h(""),f==="logs"?(await V(),S&&await J(S)):d()}),(t=document.querySelector("#logout"))==null||t.addEventListener("click",async()=>{await g("/admin/api/logout",{method:"POST"}).catch(()=>{}),i=null,h(""),q()}),(n=document.querySelector("#new-key"))==null||n.addEventListener("click",()=>{F({id:"",name:"",key:"",enabled:!0,concurrencyLimit:(i==null?void 0:i.config.keyConcurrencyLimit)||4})}),(a=document.querySelector("#config-form"))==null||a.addEventListener("submit",Qe),(s=document.querySelector("#key-form"))==null||s.addEventListener("submit",We),document.querySelectorAll(".nav-item").forEach(c=>{c.addEventListener("click",()=>{const l=c.dataset.page;l&&l!==f&&(f=l,h(""),M=null,p={kind:"none"},d(),l==="logs"&&V())})}),document.querySelectorAll(".theme-switch button").forEach(c=>{c.addEventListener("click",()=>{const l=c.dataset.theme;l&&Ce(l)})}),document.querySelectorAll(".edit-key").forEach(c=>{c.addEventListener("click",()=>{const l=i==null?void 0:i.keys.find(L=>L.id===c.dataset.id);l&&(M={id:l.id,name:l.name,key:"",enabled:l.enabled,concurrencyLimit:l.concurrencyLimit},F(M))})}),document.querySelectorAll(".delete-key").forEach(c=>{c.addEventListener("click",()=>{const l=i==null?void 0:i.keys.find(L=>L.id===c.dataset.id);l&&Be(l)})}),document.querySelectorAll(".reset-backoff").forEach(c=>{c.addEventListener("click",async()=>{const l=c.dataset.id||"";if(l)try{await g(`/admin/api/keys/${encodeURIComponent(l)}/reset_backoff`,{method:"POST"}),await w(),h("已手动结束退避","success"),d()}catch(L){h(x(L),"error"),d()}})}),document.querySelectorAll(".day-item").forEach(c=>{c.addEventListener("click",()=>{const l=c.dataset.date||"";l&&J(l)})}),se(),(o=document.querySelector("#modal-cancel"))==null||o.addEventListener("click",H),(u=document.querySelector("#overlay"))==null||u.addEventListener("click",c=>{c.target===c.currentTarget&&H()}),(k=document.querySelector("#modal-confirm-delete"))==null||k.addEventListener("click",Xe),p.kind!=="none"?document.addEventListener("keydown",G):document.removeEventListener("keydown",G)}function se(){document.querySelectorAll(".log-row").forEach(e=>{e.addEventListener("click",()=>{const t=Number(e.dataset.logIdx);if(Number.isNaN(t))return;N=N===t?-1:t;const n=document.querySelector("#logs-events tbody");n?(n.innerHTML=Y(),se(),U()):d()})})}function G(e){e.key==="Escape"&&p.kind!=="none"&&H()}async function Qe(e){if(e.preventDefault(),!i)return;const t=new FormData(e.currentTarget),n={...i.config};for(const a of Q)a.type==="checkbox"?n[a.key]=t.has(a.key):a.type==="number"?n[a.key]=Number(t.get(a.key)||0):n[a.key]=String(t.get(a.key)||"");I=!0,d();try{await g("/admin/api/config",{method:"PUT",body:JSON.stringify(n)}),await w(),h("配置已保存，运行时设置已热重载","success")}catch(a){h(x(a),"error")}finally{I=!1,d()}}async function We(e){if(e.preventDefault(),p.kind!=="key")return;const t=new FormData(e.currentTarget),n={id:p.draft.id,name:String(t.get("name")||""),key:String(t.get("key")||""),enabled:t.has("enabled"),concurrencyLimit:Number(t.get("concurrencyLimit")||0)};try{n.id?await g(`/admin/api/keys/${encodeURIComponent(n.id)}`,{method:"PUT",body:JSON.stringify(n)}):await g("/admin/api/keys",{method:"POST",body:JSON.stringify(n)}),M=null,p={kind:"none"},await w(),h(n.id?"key 已更新":"key 已添加","success"),d()}catch(a){h(x(a),"error"),p={kind:"none"},d()}}async function Xe(){if(p.kind!=="delete")return;const e=p.key.id;try{await g(`/admin/api/keys/${encodeURIComponent(e)}`,{method:"DELETE"}),M=null,p={kind:"none"},await w(),h("key 已删除","success"),d()}catch(t){h(x(t),"error"),p={kind:"none"},d()}}function U(){Ee({icons:{Activity:de,AlertTriangle:Se,CheckCircle2:pe,Clock:ue,FileText:ye,KeyRound:me,LayoutGrid:he,LogOut:fe,Monitor:ve,Moon:ge,Plus:ke,RefreshCw:be,Save:$e,ShieldCheck:we,Sun:xe,Trash2:Le,X:Me}})}function x(e){var n;const t=e instanceof Error?e.message:String(e);if(t==="AUTH_REQUIRED")return"请先登录管理页面";try{return((n=JSON.parse(t).error)==null?void 0:n.message)||t}catch{return t}}function m(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]||t)}function $(e){return m(e).replace(/`/g,"&#96;")}Ne();
