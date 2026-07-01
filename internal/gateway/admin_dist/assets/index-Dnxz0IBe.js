(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const p of o.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&s(p)}).observe(document,{childList:!0,subtree:!0});function n(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(a){if(a.ep)return;a.ep=!0;const o=n(a);fetch(a.href,o)}})();/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=(e,t,n=[])=>{const s=document.createElementNS("http://www.w3.org/2000/svg",e);return Object.keys(t).forEach(a=>{s.setAttribute(a,String(t[a]))}),n.length&&n.forEach(a=>{const o=D(...a);s.appendChild(o)}),s};var z=([e,t,n])=>D(e,t,n);/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=e=>Array.from(e.attributes).reduce((t,n)=>(t[n.name]=n.value,t),{}),W=e=>typeof e=="string"?e:!e||!e.class?"":e.class&&typeof e.class=="string"?e.class.split(" "):e.class&&Array.isArray(e.class)?e.class:"",X=e=>e.flatMap(W).map(n=>n.trim()).filter(Boolean).filter((n,s,a)=>a.indexOf(n)===s).join(" "),Y=e=>e.replace(/(\w)(\w*)(_|-|\s*)/g,(t,n,s)=>n.toUpperCase()+s.toLowerCase()),N=(e,{nameAttr:t,icons:n,attrs:s})=>{var K;const a=e.getAttribute(t);if(a==null)return;const o=Y(a),p=n[o];if(!p)return console.warn(`${e.outerHTML} icon name was not found in the provided icons object.`);const k=Q(e),[c,l,$]=p,O={...l,"data-lucide":a,...s,...k},I=X(["lucide",`lucide-${a}`,k,s]);I&&Object.assign(O,{class:I});const G=z([c,O,$]);return(K=e.parentNode)==null?void 0:K.replaceChild(G,e)};/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=["svg",u,[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=["svg",u,[["circle",{cx:"12",cy:"12",r:"10"}],["path",{d:"m9 12 2 2 4-4"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=["svg",u,[["path",{d:"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ne=["svg",u,[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ae=["svg",u,[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"}],["polyline",{points:"16 17 21 12 16 7"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se=["svg",u,[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ie=["svg",u,[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oe=["svg",u,[["path",{d:"M5 12h14"}],["path",{d:"M12 5v14"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ce=["svg",u,[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"}],["path",{d:"M21 3v5h-5"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"}],["path",{d:"M8 16H3v5"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const re=["svg",u,[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const le=["svg",u,[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{d:"m9 12 2 2 4-4"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de=["svg",u,[["circle",{cx:"12",cy:"12",r:"4"}],["path",{d:"M12 2v2"}],["path",{d:"M12 20v2"}],["path",{d:"m4.93 4.93 1.41 1.41"}],["path",{d:"m17.66 17.66 1.41 1.41"}],["path",{d:"M2 12h2"}],["path",{d:"M20 12h2"}],["path",{d:"m6.34 17.66-1.41 1.41"}],["path",{d:"m19.07 4.93-1.41 1.41"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pe=["svg",u,[["path",{d:"M3 6h18"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ye=["svg",u,[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"}],["path",{d:"M12 9v4"}],["path",{d:"M12 17h.01"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ue=["svg",u,[["path",{d:"M18 6 6 18"}],["path",{d:"m6 6 12 12"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=({icons:e={},nameAttr:t="data-lucide",attrs:n={}}={})=>{if(!Object.values(e).length)throw new Error(`Please provide an icons object.
If you want to use all the icons you can import it like:
 \`import { createIcons, icons } from 'lucide';
lucide.createIcons({icons});\``);if(typeof document>"u")throw new Error("`createIcons()` only works in a browser environment.");const s=document.querySelectorAll(`[${t}]`);if(Array.from(s).forEach(a=>N(a,{nameAttr:t,icons:e,attrs:n})),t==="data-lucide"){const a=document.querySelectorAll("[icon-name]");a.length>0&&(console.warn("[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide"),Array.from(a).forEach(o=>N(o,{nameAttr:"icon-name",icons:e,attrs:n})))}},R=[{key:"listen",label:"监听地址",type:"text",section:"server",description:"HTTP 服务绑定地址。写入 config.json 后热重载到运行时配置，但已启动进程的端口绑定需重启才会变化。"},{key:"upstreamBaseURL",label:"上游 API 地址",type:"text",section:"server",description:"Umans-compatible 上游服务的 base URL。新代理请求、模型目录读取和重试都使用热重载后的地址。"},{key:"defaultModel",label:"默认模型",type:"text",section:"models",description:"请求体缺少 model 字段时用于预算校验的模型 ID，也是安全输出上限计算的候选模型之一。"},{key:"opusModel",label:"Opus 映射",type:"text",section:"models",description:"Claude Code Opus 档位对应的上游模型。预算保护取默认/Opus/Sonnet/Haiku 上限的最保守值。"},{key:"sonnetModel",label:"Sonnet 映射",type:"text",section:"models",description:"Claude Code Sonnet 档位对应的上游模型，通常是主力编码模型。"},{key:"haikuModel",label:"Haiku 映射",type:"text",section:"models",description:"Claude Code Haiku 档位对应的上游模型。若某 key 未配置独立并发，会使用全局并发限制。"},{key:"keyConcurrencyLimit",label:"全局默认并发",type:"number",section:"routing",description:"每个 key 默认允许同时处理的活跃请求数。key.json 中单个 key 并发数大于 0 时覆盖此值。"},{key:"keyQueueTimeout",label:"排队等待时间",type:"text",section:"routing",description:"目标 key 并发已满时，请求先等待此时长而非立刻 429。粘性会话命中的 key 满载时同样等待，超时后才切换。"},{key:"stickySession",label:"启用粘性会话",type:"checkbox",section:"routing",description:"同一会话在窗口内优先复用上一次选中的上游 key。会话身份优先取请求体 session_id / metadata.user_id / prompt_cache_key，缺失时网关生成并经 X-Umans-Session-Id 下发。"},{key:"stickySessionTTL",label:"粘性窗口",type:"text",section:"routing",description:"同一客户端 token 记住上次 key 的有效时间，默认 10s。过期后重新按负载均衡选择并发更小的 key。"},{key:"keyErrorThreshold",label:"Key 错误阈值",type:"number",section:"routing",description:"在 keyErrorWindow 内某上游 key 出错达到此数量时进入退避。设为 0 禁用错误退避。"},{key:"keyErrorWindow",label:"Key 错误窗口",type:"text",section:"routing",description:"计算 key 错误次数的时间窗口，例如 60s。超过此窗口的旧错误会被清除。"},{key:"keyErrorBackoff",label:"Key 退避时间",type:"text",section:"routing",description:"key 触发错误阈值后，网关在多长时间内不再路由到该 key，例如 30s。"},{key:"searchMode",label:"搜索模式",type:"select",section:"routing",options:[{value:"exa",label:"exa"},{value:"native",label:"native"},{value:"auto",label:"auto"},{value:"none",label:"none"}],description:"是否向上游注入 X-Umans-Websearch-Provider。exa/native/none 强制覆盖客户端 header，auto 透传客户端设置。"},{key:"budgetPolicy",label:"输出预算策略",type:"select",section:"routing",options:[{value:"error",label:"error"},{value:"clamp-visible",label:"clamp-visible"}],description:"max_tokens 超过目录安全上限时，error 拒绝请求，clamp-visible 压到可见上限并返回提示 header。"},{key:"upstreamRetryMax",label:"上游最大重试",type:"number",section:"reliability",description:"首次失败后最多再重试次数。重试期间持续占用当前 key 并发槽，避免把瞬断放大成更多并发。"},{key:"retry429",label:"重试 429",type:"checkbox",section:"reliability",description:"默认关闭，避免上游限流时继续放大压力。仅在明确知道 429 是短暂队列抖动时才建议开启。"},{key:"upstreamRetryBaseDelay",label:"重试初始延迟",type:"text",section:"reliability",description:"第一次重试前等待的时间，Go duration 格式，例如 500ms、2s、1m。"},{key:"upstreamRetryMaxDelay",label:"重试最大延迟",type:"text",section:"reliability",description:"指数退避的上限。实际等待时间不会超过此值。"},{key:"schemaCompat",label:"JSON Schema 兼容",type:"checkbox",section:"reliability",description:"把旧 tuple 写法 items: [...] 转为 prefixItems，减少严格上游校验器拒绝工具 schema 的概率。"},{key:"catalogTTL",label:"模型目录缓存",type:"text",section:"reliability",description:"每个上游 key 的 /v1/models/info 缓存时间。预算保护依赖此目录，缓存过短会增加上游请求。"},{key:"adminPassword",label:"管理页面密码",type:"password",section:"security",description:"用于登录 /admin/ 管理页面和调用管理 API。留空表示保持当前密码不变。"},{key:"proxyAccessToken",label:"代理访问令牌",type:"password",section:"security",description:"托管 key 池启用时必须配置。客户端 Authorization 或 x-api-key 需与此值一致，网关才使用 key 池转发。"},{key:"errorEventDir",label:"匿名错误目录",type:"text",section:"logs",description:"匿名错误事件 JSONL 保存目录。仅记录事件类型、状态段、延迟段和错误分类，不写请求体、模型输入或 API key。"},{key:"errorEventMaxAge",label:"错误事件保留时间",type:"text",section:"logs",description:"超过该时间的错误事件文件会在下一次记录或清理时删除。"},{key:"errorEventMaxSize",label:"错误事件最大总大小",type:"number",section:"logs",description:"错误事件目录允许保留的最大字节数，超过后优先删除最旧的 JSONL 文件。"}],he={server:"服务",models:"模型映射",routing:"路由与并发",reliability:"稳定性",security:"访问控制",logs:"匿名错误"},fe=["server","models","routing","reliability","security","logs"],q=document.querySelector("#app");if(!q)throw new Error("missing app root");let i=null,M=null,h={text:"",kind:"info"},C=!1,A,w="keys",v=localStorage.getItem("umans-theme")||"system",L=null,d={kind:"none"};function E(e){const t=window.matchMedia("(prefers-color-scheme: dark)").matches,n=e==="dark"||e==="system"&&t;document.documentElement.setAttribute("data-theme",n?"dark":"light")}function ke(e){v=e,localStorage.setItem("umans-theme",e),E(e),e==="system"&&(L||(L=window.matchMedia("(prefers-color-scheme: dark)"),L.addEventListener("change",()=>{v==="system"&&E("system")}))),document.querySelectorAll(".theme-switch button").forEach(t=>{t.classList.toggle("active",t.dataset.theme===e)})}function r(e){return`<i data-lucide="${e}" aria-hidden="true"></i>`}async function b(e,t={}){const n=new Headers(t.headers);t.body&&!n.has("content-type")&&n.set("content-type","application/json");const s=await fetch(e,{...t,headers:n,credentials:"include"});if(s.status===401)throw new Error("AUTH_REQUIRED");if(!s.ok){const a=await s.text();throw new Error(a||`HTTP ${s.status}`)}return await s.json()}async function ve(){E(v),v==="system"&&(L=window.matchMedia("(prefers-color-scheme: dark)"),L.addEventListener("change",()=>{v==="system"&&E("system")}));try{await g(),y(),j()}catch(e){if(String(e.message)==="AUTH_REQUIRED"){T();return}h={text:S(e),kind:"error"},T()}}function j(){A&&window.clearInterval(A),A=window.setInterval(()=>{g().then(Te).catch(()=>{})},2e3)}async function g(){i=await b("/admin/api/status")}function m(e,t="info"){h={text:e,kind:t}}function T(){var e;q.innerHTML=`
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
        ${h.text?`<p class="form-error">${f(h.text)}</p>`:""}
      </form>
    </main>
  `,F(),(e=document.querySelector("#login-form"))==null||e.addEventListener("submit",async t=>{t.preventDefault();const n=new FormData(t.currentTarget);try{await b("/admin/api/login",{method:"POST",body:JSON.stringify({password:String(n.get("password")||"")})}),h={text:"",kind:"info"},await g(),y(),j()}catch(s){h={text:S(s),kind:"error"},T()}})}function y(){i&&(q.innerHTML=`
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
          <button class="nav-item ${w==="keys"?"active":""}" data-page="keys">
            ${r("key-round")} Key 管理
            <span class="nav-count">${i.keys.length}</span>
          </button>
          <button class="nav-item ${w==="settings"?"active":""}" data-page="settings">
            ${r("layout-grid")} 系统设置
          </button>
        </nav>
        ${_()}
        <div class="rail-foot">
          <div class="theme-switch">
            <button data-theme="light" title="浅色" class="${v==="light"?"active":""}">${r("sun")}</button>
            <button data-theme="system" title="跟随系统" class="${v==="system"?"active":""}">${r("monitor")}</button>
            <button data-theme="dark" title="深色" class="${v==="dark"?"active":""}">${r("moon")}</button>
          </div>
          <button class="logout" id="logout">${r("log-out")} 退出登录</button>
          <span class="build">Version: 1.1</span>
        </div>
      </aside>
      <section class="main">
        <header class="topbar">
          <div class="page-title">
            <p class="eyebrow">${w==="keys"?"KEY POOL":"SYSTEM CONFIG"}</p>
            <h2>${w==="keys"?"Key 管理":"系统设置"}</h2>
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
          ${h.text?be():""}
          ${w==="keys"?ge():$e()}
        </div>
      </section>
    </main>
    ${d.kind!=="none"?Se():""}
  `,Ce(),F())}function _(){const e=(i==null?void 0:i.keys.reduce((a,o)=>a+o.active,0))||0,t=(i==null?void 0:i.keys.filter(a=>a.enabled).length)||0,n=(i==null?void 0:i.keys.reduce((a,o)=>a+(o.enabled?o.concurrencyLimit:0),0))||0,s=(i==null?void 0:i.keys.filter(a=>a.backoffUntil&&new Date(a.backoffUntil).getTime()>Date.now()).length)||0;return`
    <div class="rail-section">
      <h3>Live Telemetry</h3>
      <div class="rail-stat"><span class="k">活跃请求</span><span class="v ${e>0?"accent":""}">${e}</span></div>
      <div class="rail-stat"><span class="k">启用 key</span><span class="v">${t}</span></div>
      <div class="rail-stat"><span class="k">总并发上限</span><span class="v">${n}</span></div>
      <div class="rail-stat"><span class="k">退避中</span><span class="v ${s>0?"warn":""}">${s}</span></div>
    </div>
  `}function be(){const e=h.kind==="success"?"check-circle-2":h.kind==="error"?"alert-triangle":"activity";return`<div class="notice ${h.kind}">${r(e)}<span>${f(h.text)}</span></div>`}function ge(){return`
    <section class="telemetry">${B()}</section>
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
      ${Le(i.keys)}
    </section>
  `}function $e(){return`
    <form class="panel" id="config-form">
      <div class="panel-head">
        <div>
          <h3>全局配置</h3>
          <p class="ph-sub">写入 config.json 并热重载到运行时</p>
        </div>
      </div>
      <div class="config-sections">
        ${we(i.config)}
      </div>
      <div class="save-bar">
        <span class="sb-note">保存后立即热重载，无需重启进程</span>
        <button class="primary" type="submit" ${C?"disabled":""}>${r("save")}保存配置</button>
      </div>
    </form>
  `}function B(){const e=(i==null?void 0:i.keys.reduce((o,p)=>o+p.active,0))||0,t=(i==null?void 0:i.keys.filter(o=>o.enabled).length)||0,n=(i==null?void 0:i.keys.reduce((o,p)=>o+(p.enabled?p.concurrencyLimit:0),0))||0,s=(i==null?void 0:i.keys.filter(o=>o.backoffUntil&&new Date(o.backoffUntil).getTime()>Date.now()).length)||0,a=n>0?Math.round(e/n*100):0;return`
    <article class="tel">
      <span class="k">Active Requests</span>
      <span class="v ${e>0?"accent":""}">${e}</span>
      <span class="desc">所有托管 key 当前占用</span>
      <span class="spark">${a}% LOAD</span>
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
      <span class="v ${s>0?"warn":""}">${s}</span>
      <span class="desc">错误退避中，暂不路由</span>
    </article>
  `}function we(e){return fe.map((t,n)=>{const s=R.filter(a=>a.section===t);return`
      <div class="config-card">
        <div class="config-card-head">
          <span class="ch-num">0${n+1}</span>
          <h3>${he[t]}</h3>
        </div>
        <div class="config-card-body">
          ${s.map(a=>xe(a,e)).join("")}
        </div>
      </div>
    `}).join("")}function xe(e,t){const n=t[e.key],s=`name="${e.key}" id="cfg-${e.key}"`;let a="";if(e.type==="checkbox")a=`<label class="switch"><input ${s} type="checkbox" ${n?"checked":""} /><span></span></label>`;else if(e.type==="select")a=`
      <select ${s}>
        ${(e.options||[]).map(o=>`<option value="${o.value}" ${n===o.value?"selected":""}>${o.label}</option>`).join("")}
      </select>
    `;else{const o=e.key==="adminPassword"?"":String(n??"");a=`<input ${s} type="${e.type}" value="${x(o)}" ${e.type==="number"?'min="0"':""} />`}return`
    <label class="config-field" for="cfg-${e.key}">
      <span class="field-title">${e.label}</span>
      ${a}
      <span class="field-help">${e.description}</span>
    </label>
  `}function Se(){if(d.kind==="key"){const e=d.draft,t=!!e.id;return`
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
              <label><span>名称</span><input name="name" value="${x(e.name)}" placeholder="例如 GLM 主 key" /></label>
            </div>
            <div class="modal-field">
              <label><span>API key</span><input name="key" type="password" value="${x(e.key)}" placeholder="${t?"留空保持不变":"sk-..."}" /></label>
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
    `}if(d.kind==="delete"){const e=d.key;return`
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
            <p class="confirm-msg">确定要删除 <strong>${f(e.name)}</strong> 吗？删除后该 key 立即从负载均衡池移除。</p>
            <div class="confirm-detail">
              <strong>${f(e.name)}</strong>
              ${f(e.id)} · ${f(e.keyPreview)}
            </div>
          </div>
          <div class="modal-foot">
            <button class="ghost" type="button" id="modal-cancel">${r("x")}取消</button>
            <button class="danger" type="button" id="modal-confirm-delete">${r("trash-2")}确认删除</button>
          </div>
        </div>
      </div>
    `}return""}function H(e){d={kind:"key",draft:e},y(),setTimeout(()=>{var t;return(t=document.querySelector('#key-form input[name="name"]'))==null?void 0:t.focus()},30)}function Me(e){d={kind:"delete",key:e},y()}function P(){d={kind:"none"},y()}function Le(e){return e.length?`
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
            <tr data-key-id="${x(t.id)}">
              <td><strong>${f(t.name)}</strong><span class="key-id">${f(t.id)}</span></td>
              <td><span class="key-prev">${f(t.keyPreview)}</span></td>
              <td><span class="pill ${t.enabled?"enabled":""}"><span class="dot"></span>${t.enabled?"启用":"停用"}</span></td>
              <td class="key-load-cell">${J(t)}</td>
              <td class="key-sticky-cell">${t.stickySessions}</td>
              <td class="key-backoff-cell">${V(t)}</td>
              <td>
                <div class="row-actions">
                  <button class="ghost edit-key" data-id="${x(t.id)}">编辑</button>
                  <button class="danger delete-key" data-id="${x(t.id)}">${r("trash-2")}</button>
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
    `}function V(e){if(!e.backoffUntil)return'<span class="pill"><span class="dot"></span>正常</span>';const t=new Date(e.backoffUntil),n=Math.max(0,t.getTime()-Date.now());return n<=0?'<span class="pill"><span class="dot"></span>正常</span>':`<span class="pill warn"><span class="dot"></span>退避 ${Math.ceil(n/1e3)}s</span><button class="ghost reset-backoff" data-id="${x(e.id)}" title="结束退避">${r("check-circle-2")}恢复</button>`}function J(e){const t=Ee(e);return`
    <div class="meter ${t>=100?"full":t>=80?"high":""}"><span style="width:${t}%"></span></div>
    <small>${e.active} / ${e.concurrencyLimit}</small>
  `}function Ee(e){return Math.min(100,Math.round(e.active/Math.max(1,e.concurrencyLimit)*100))}function Te(){if(!i||!document.querySelector(".app-shell"))return;const e=document.querySelector(".mode-pill");e&&(e.classList.toggle("on",i.managedKeyMode),e.innerHTML=`<span class="dot"></span> ${i.managedKeyMode?"托管 key 模式":"客户端 key 透传"}`);const t=document.querySelector(".telemetry");t&&(t.innerHTML=B());const n=document.querySelector(".rail-section");n&&(n.outerHTML=_());const s=document.querySelector(".nav-count");s&&(s.textContent=String(i.keys.length)),Ae(i.keys)}function Ae(e){const t=new Map(e.map(n=>[n.id,n]));document.querySelectorAll("tr[data-key-id]").forEach(n=>{const s=n.dataset.keyId||"",a=t.get(s);if(!a)return;const o=n.querySelector(".key-load-cell");o&&(o.innerHTML=J(a));const p=n.querySelector(".key-sticky-cell");p&&(p.textContent=String(a.stickySessions));const k=n.querySelector(".key-backoff-cell");k&&(k.innerHTML=V(a));const c=n.querySelector(".pill");c&&(c.className=`pill ${a.enabled?"enabled":""}`,c.innerHTML=`<span class="dot"></span>${a.enabled?"启用":"停用"}`)})}function Ce(){var e,t,n,s,a,o,p,k;(e=document.querySelector("#refresh"))==null||e.addEventListener("click",async()=>{await g(),m(""),y()}),(t=document.querySelector("#logout"))==null||t.addEventListener("click",async()=>{await b("/admin/api/logout",{method:"POST"}).catch(()=>{}),i=null,m(""),T()}),(n=document.querySelector("#new-key"))==null||n.addEventListener("click",()=>{H({id:"",name:"",key:"",enabled:!0,concurrencyLimit:(i==null?void 0:i.config.keyConcurrencyLimit)||4})}),(s=document.querySelector("#config-form"))==null||s.addEventListener("submit",Pe),(a=document.querySelector("#key-form"))==null||a.addEventListener("submit",qe),document.querySelectorAll(".nav-item").forEach(c=>{c.addEventListener("click",()=>{const l=c.dataset.page;l&&l!==w&&(w=l,m(""),M=null,d={kind:"none"},y())})}),document.querySelectorAll(".theme-switch button").forEach(c=>{c.addEventListener("click",()=>{const l=c.dataset.theme;l&&ke(l)})}),document.querySelectorAll(".edit-key").forEach(c=>{c.addEventListener("click",()=>{const l=i==null?void 0:i.keys.find($=>$.id===c.dataset.id);l&&(M={id:l.id,name:l.name,key:"",enabled:l.enabled,concurrencyLimit:l.concurrencyLimit},H(M))})}),document.querySelectorAll(".delete-key").forEach(c=>{c.addEventListener("click",()=>{const l=i==null?void 0:i.keys.find($=>$.id===c.dataset.id);l&&Me(l)})}),document.querySelectorAll(".reset-backoff").forEach(c=>{c.addEventListener("click",async()=>{const l=c.dataset.id||"";if(l)try{await b(`/admin/api/keys/${encodeURIComponent(l)}/reset_backoff`,{method:"POST"}),await g(),m("已手动结束退避","success"),y()}catch($){m(S($),"error"),y()}})}),(o=document.querySelector("#modal-cancel"))==null||o.addEventListener("click",P),(p=document.querySelector("#overlay"))==null||p.addEventListener("click",c=>{c.target===c.currentTarget&&P()}),(k=document.querySelector("#modal-confirm-delete"))==null||k.addEventListener("click",Oe),d.kind!=="none"?document.addEventListener("keydown",U):document.removeEventListener("keydown",U)}function U(e){e.key==="Escape"&&d.kind!=="none"&&P()}async function Pe(e){if(e.preventDefault(),!i)return;const t=new FormData(e.currentTarget),n={...i.config};for(const s of R)s.type==="checkbox"?n[s.key]=t.has(s.key):s.type==="number"?n[s.key]=Number(t.get(s.key)||0):n[s.key]=String(t.get(s.key)||"");C=!0,y();try{await b("/admin/api/config",{method:"PUT",body:JSON.stringify(n)}),await g(),m("配置已保存，运行时设置已热重载","success")}catch(s){m(S(s),"error")}finally{C=!1,y()}}async function qe(e){if(e.preventDefault(),d.kind!=="key")return;const t=new FormData(e.currentTarget),n={id:d.draft.id,name:String(t.get("name")||""),key:String(t.get("key")||""),enabled:t.has("enabled"),concurrencyLimit:Number(t.get("concurrencyLimit")||0)};try{n.id?await b(`/admin/api/keys/${encodeURIComponent(n.id)}`,{method:"PUT",body:JSON.stringify(n)}):await b("/admin/api/keys",{method:"POST",body:JSON.stringify(n)}),M=null,d={kind:"none"},await g(),m(n.id?"key 已更新":"key 已添加","success"),y()}catch(s){m(S(s),"error"),d={kind:"none"},y()}}async function Oe(){if(d.kind!=="delete")return;const e=d.key.id;try{await b(`/admin/api/keys/${encodeURIComponent(e)}`,{method:"DELETE"}),M=null,d={kind:"none"},await g(),m("key 已删除","success"),y()}catch(t){m(S(t),"error"),d={kind:"none"},y()}}function F(){me({icons:{Activity:Z,AlertTriangle:ye,CheckCircle2:ee,KeyRound:te,LayoutGrid:ne,LogOut:ae,Monitor:se,Moon:ie,Plus:oe,RefreshCw:ce,Save:re,ShieldCheck:le,Sun:de,Trash2:pe,X:ue}})}function S(e){var n;const t=e instanceof Error?e.message:String(e);if(t==="AUTH_REQUIRED")return"请先登录管理页面";try{return((n=JSON.parse(t).error)==null?void 0:n.message)||t}catch{return t}}function f(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]||t)}function x(e){return f(e).replace(/`/g,"&#96;")}ve();
