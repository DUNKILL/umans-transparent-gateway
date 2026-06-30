(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))o(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function n(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(a){if(a.ep)return;a.ep=!0;const i=n(a);fetch(a.href,i)}})();/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=(e,t,n=[])=>{const o=document.createElementNS("http://www.w3.org/2000/svg",e);return Object.keys(t).forEach(a=>{o.setAttribute(a,String(t[a]))}),n.length&&n.forEach(a=>{const i=T(...a);o.appendChild(i)}),o};var R=([e,t,n])=>T(e,t,n);/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=e=>Array.from(e.attributes).reduce((t,n)=>(t[n.name]=n.value,t),{}),D=e=>typeof e=="string"?e:!e||!e.class?"":e.class&&typeof e.class=="string"?e.class.split(" "):e.class&&Array.isArray(e.class)?e.class:"",_=e=>e.flatMap(D).map(n=>n.trim()).filter(Boolean).filter((n,o,a)=>a.indexOf(n)===o).join(" "),F=e=>e.replace(/(\w)(\w*)(_|-|\s*)/g,(t,n,o)=>n.toUpperCase()+o.toLowerCase()),M=(e,{nameAttr:t,icons:n,attrs:o})=>{var E;const a=e.getAttribute(t);if(a==null)return;const i=F(a),s=n[i];if(!s)return console.warn(`${e.outerHTML} icon name was not found in the provided icons object.`);const l=j(e),[k,H,K]=s,L={...H,"data-lucide":a,...o,...l},x=_(["lucide",`lucide-${a}`,l,o]);x&&Object.assign(L,{class:x});const U=R([k,L,K]);return(E=e.parentNode)==null?void 0:E.replaceChild(U,e)};/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=["svg",f,[["path",{d:"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=["svg",f,[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"}],["polyline",{points:"16 17 21 12 16 7"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=["svg",f,[["path",{d:"M5 12h14"}],["path",{d:"M12 5v14"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=["svg",f,[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"}],["path",{d:"M21 3v5h-5"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"}],["path",{d:"M8 16H3v5"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=["svg",f,[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=["svg",f,[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{d:"m9 12 2 2 4-4"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=["svg",f,[["path",{d:"M3 6h18"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=({icons:e={},nameAttr:t="data-lucide",attrs:n={}}={})=>{if(!Object.values(e).length)throw new Error(`Please provide an icons object.
If you want to use all the icons you can import it like:
 \`import { createIcons, icons } from 'lucide';
lucide.createIcons({icons});\``);if(typeof document>"u")throw new Error("`createIcons()` only works in a browser environment.");const o=document.querySelectorAll(`[${t}]`);if(Array.from(o).forEach(a=>M(a,{nameAttr:t,icons:e,attrs:n})),t==="data-lucide"){const a=document.querySelectorAll("[icon-name]");a.length>0&&(console.warn("[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide"),Array.from(a).forEach(i=>M(i,{nameAttr:"icon-name",icons:e,attrs:n})))}},C=[{key:"listen",label:"监听地址",type:"text",section:"server",description:"HTTP 服务绑定地址。该值写入 config.json 后会热重载到运行时配置，但已启动进程的端口绑定需要重启后才会变化。"},{key:"upstreamBaseURL",label:"上游 API 地址",type:"text",section:"server",description:"Umans-compatible 上游服务的 base URL。新的代理请求、模型目录读取和重试都会使用热重载后的地址。"},{key:"defaultModel",label:"默认模型",type:"text",section:"models",description:"请求体缺少 model 字段时用于预算校验的模型 ID，也是安全输出上限计算时的候选模型之一。"},{key:"opusModel",label:"Opus 映射模型",type:"text",section:"models",description:"Claude Code Opus 档位对应的上游模型。预算保护会把默认、Opus、Sonnet、Haiku 的上限取最保守值。"},{key:"sonnetModel",label:"Sonnet 映射模型",type:"text",section:"models",description:"Claude Code Sonnet 档位对应的上游模型，通常是主力编码模型。"},{key:"haikuModel",label:"Haiku 映射模型",type:"text",section:"models",description:"Claude Code Haiku 档位对应的上游模型。若某个 key 未配置独立并发，会使用全局并发限制。"},{key:"keyConcurrencyLimit",label:"全局默认并发",type:"number",section:"routing",description:"每个 key 默认允许同时处理的活跃请求数。key.json 中单个 key 的并发数大于 0 时会覆盖此值。"},{key:"keyQueueTimeout",label:"排队等待时间",type:"text",section:"routing",description:"当目标 key 并发已满时，请求会先等待这个时长而不是立刻返回 429。粘性会话命中的 key 满载时也使用同一个等待时间，超时后才尝试切换到其他 key。"},{key:"stickySession",label:"启用粘性会话",type:"checkbox",section:"routing",description:"开启后，同一会话在粘性窗口内会优先复用上一次选中的上游 key，减少上下文切换带来的不稳定。会话身份优先使用请求体的 session_id / metadata.user_id / prompt_cache_key，缺失时网关会生成并通过 X-Umans-Session-Id 头部下发。"},{key:"stickySessionTTL",label:"粘性会话窗口",type:"text",section:"routing",description:"同一客户端 token 记住上次 key 的有效时间，默认 10s。窗口过期后会重新按负载均衡选择当前并发数更小的 key。"},{key:"keyErrorThreshold",label:"Key 错误阈值",type:"number",section:"routing",description:"在 keyErrorWindow 时间窗口内，某个上游 key 出错达到此数量时会进入退避状态。设为 0 可禁用错误退避。"},{key:"keyErrorWindow",label:"Key 错误窗口",type:"text",section:"routing",description:"计算 key 错误次数的时间窗口，例如 60s。超过此窗口的旧错误会被清除。"},{key:"keyErrorBackoff",label:"Key 退避时间",type:"text",section:"routing",description:"key 触发错误阈值后，网关在多长时间内不再将请求路由到该 key，例如 30s。"},{key:"searchMode",label:"搜索模式",type:"select",section:"routing",options:[{value:"exa",label:"exa"},{value:"native",label:"native"},{value:"auto",label:"auto"},{value:"none",label:"none"}],description:"控制是否向上游注入 X-Umans-Websearch-Provider。exa/native/none 会强制覆盖客户端 header，auto 会透传客户端设置。"},{key:"budgetPolicy",label:"输出预算策略",type:"select",section:"routing",options:[{value:"error",label:"error"},{value:"clamp-visible",label:"clamp-visible"}],description:"请求的 max_tokens 超过模型目录安全上限时，error 会拒绝请求，clamp-visible 会把请求值压到可见上限并返回提示 header。"},{key:"upstreamRetryMax",label:"上游最大重试次数",type:"number",section:"reliability",description:"首次请求失败后最多再重试的次数。重试期间会持续占用当前 key 的并发槽，避免把瞬断放大成更多并发。"},{key:"retry429",label:"重试 429",type:"checkbox",section:"reliability",description:"默认关闭，避免上游限流时继续放大压力。只有明确知道 429 是短暂队列抖动时才建议开启。"},{key:"upstreamRetryBaseDelay",label:"重试初始延迟",type:"text",section:"reliability",description:"第一次重试前等待的时间，使用 Go duration 格式，例如 500ms、2s、1m。"},{key:"upstreamRetryMaxDelay",label:"重试最大延迟",type:"text",section:"reliability",description:"指数退避的上限。实际等待时间不会超过此值。"},{key:"schemaCompat",label:"JSON Schema 兼容",type:"checkbox",section:"reliability",description:"开启后会把旧 tuple 写法 items: [...] 转为 prefixItems，减少严格上游校验器拒绝工具 schema 的概率。"},{key:"catalogTTL",label:"模型目录缓存时间",type:"text",section:"reliability",description:"每个上游 key 的 /v1/models/info 缓存时间。预算保护依赖这个目录，缓存过短会增加上游请求。"},{key:"adminPassword",label:"管理页面访问密码",type:"password",section:"security",description:"用于登录 /admin/ 管理页面和调用管理 API。表单留空表示保持当前密码不变。"},{key:"proxyAccessToken",label:"代理访问令牌",type:"password",section:"security",description:"托管 key 池启用时必须配置。客户端请求的 Authorization 或 x-api-key 需要与此值一致，网关才会使用 key 池转发。"},{key:"errorEventDir",label:"匿名错误目录",type:"text",section:"logs",description:"匿名错误事件 JSONL 的保存目录。只记录事件类型、状态段、延迟段和错误分类，不写请求体、模型输入或 API key。"},{key:"errorEventMaxAge",label:"错误事件保留时间",type:"text",section:"logs",description:"超过该时间的错误事件文件会在下一次记录或清理时删除。"},{key:"errorEventMaxSize",label:"错误事件最大总大小",type:"number",section:"logs",description:"错误事件目录允许保留的最大字节数，超过后优先删除最旧的 JSONL 文件。"}],A={server:"服务",models:"模型映射",routing:"路由与并发",reliability:"稳定性",security:"访问控制",logs:"匿名错误"},S=document.querySelector("#app");if(!S)throw new Error("missing app root");let r=null,h=null,c="",$=!1,w;function u(e){return`<i data-lucide="${e}" aria-hidden="true"></i>`}async function p(e,t={}){const n=new Headers(t.headers);t.body&&!n.has("content-type")&&n.set("content-type","application/json");const o=await fetch(e,{...t,headers:n,credentials:"include"});if(o.status===401)throw new Error("AUTH_REQUIRED");if(!o.ok){const a=await o.text();throw new Error(a||`HTTP ${o.status}`)}return await o.json()}async function Y(){try{await m(),d(),N()}catch(e){if(String(e.message)==="AUTH_REQUIRED"){v();return}c=g(e),v()}}function N(){w&&window.clearInterval(w),w=window.setInterval(()=>{m().then(Z).catch(()=>{})},2e3)}async function m(){r=await p("/admin/api/status")}function v(){var e;S.innerHTML=`
    <main class="login-shell">
      <form class="login-panel" id="login-form">
        <div class="brand-mark">${u("shield-check")}</div>
        <h1>Umans Gateway</h1>
        <label>
          <span>管理密码</span>
          <input name="password" type="password" autocomplete="current-password" autofocus />
        </label>
        <button class="primary" type="submit">${u("key-round")}登录</button>
        ${c?`<p class="form-error">${b(c)}</p>`:""}
      </form>
    </main>
  `,q(),(e=document.querySelector("#login-form"))==null||e.addEventListener("submit",async t=>{t.preventDefault();const n=new FormData(t.currentTarget);try{await p("/admin/api/login",{method:"POST",body:JSON.stringify({password:String(n.get("password")||"")})}),c="",await m(),d(),N()}catch(o){c=g(o),v()}})}function d(){r&&(S.innerHTML=`
    <main class="app-shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">UMANS TRANSPARENT GATEWAY</p>
          <h1>运行配置与 Key 池</h1>
        </div>
        <div class="topbar-actions">
          <span class="mode ${r.managedKeyMode?"on":""}">${r.managedKeyMode?"托管 key 模式":"客户端 key 透传"}</span>
          <button class="ghost" id="refresh">${u("refresh-cw")}刷新</button>
          <button class="ghost" id="logout">${u("log-out")}退出</button>
        </div>
      </header>
      ${c?`<div class="notice">${b(c)}</div>`:""}
      <section class="metrics">
        ${P()}
      </section>
      <section class="workspace">
        <form class="panel config-panel" id="config-form">
          <div class="panel-head">
            <h2>全局配置</h2>
            <button class="primary" type="submit" ${$?"disabled":""}>${u("save")}保存配置</button>
          </div>
          ${ee(r.config)}
        </form>
        <section class="panel keys-panel">
          <div class="panel-head">
            <h2>Key 管理</h2>
            <button class="ghost" id="new-key">${u("plus")}新增 key</button>
          </div>
          ${ne()}
          ${oe(r.keys)}
        </section>
      </section>
    </main>
  `,ie(),q())}function Z(){if(!r||!document.querySelector(".app-shell"))return;const e=document.querySelector(".mode");e&&(e.classList.toggle("on",r.managedKeyMode),e.textContent=r.managedKeyMode?"托管 key 模式":"客户端 key 透传");const t=document.querySelector(".metrics");t&&(t.innerHTML=P()),re(r.keys)}function P(){const e=(r==null?void 0:r.keys.reduce((o,a)=>o+a.active,0))||0,t=(r==null?void 0:r.keys.filter(o=>o.enabled).length)||0,n=(r==null?void 0:r.keys.reduce((o,a)=>o+(a.enabled?a.concurrencyLimit:0),0))||0;return`
    <article>
      <span>活跃请求</span>
      <strong>${e}</strong>
      <small>所有托管 key 当前占用</small>
    </article>
    <article>
      <span>启用 key</span>
      <strong>${t}</strong>
      <small>${r!=null&&r.managedKeyMode?"用于负载均衡选择":"未启用托管池"}</small>
    </article>
    <article>
      <span>总并发上限</span>
      <strong>${n}</strong>
      <small>已启用 key 的并发上限合计</small>
    </article>
  `}function ee(e){return Object.keys(A).map(t=>{const n=C.filter(o=>o.section===t);return`
      <fieldset>
        <legend>${A[t]}</legend>
        <div class="field-grid">
          ${n.map(o=>te(o,e)).join("")}
        </div>
      </fieldset>
    `}).join("")}function te(e,t){const n=t[e.key],o=`name="${e.key}" id="cfg-${e.key}"`;let a="";if(e.type==="checkbox")a=`<label class="switch"><input ${o} type="checkbox" ${n?"checked":""} /><span></span></label>`;else if(e.type==="select")a=`
      <select ${o}>
        ${(e.options||[]).map(i=>`<option value="${i.value}" ${n===i.value?"selected":""}>${i.label}</option>`).join("")}
      </select>
    `;else{const i=e.key==="adminPassword"?"":String(n??"");a=`<input ${o} type="${e.type}" value="${y(i)}" ${e.type==="number"?'min="0"':""} />`}return`
    <label class="config-field" for="cfg-${e.key}">
      <span class="field-title">${e.label}</span>
      ${a}
      <span class="field-help">${e.description}</span>
    </label>
  `}function ne(){const e=h||{id:"",name:"",key:"",enabled:!0,concurrencyLimit:(r==null?void 0:r.config.keyConcurrencyLimit)||4};return`
    <form class="key-form" id="key-form">
      <input type="hidden" name="id" value="${y(e.id)}" />
      <label>
        <span>名称</span>
        <input name="name" value="${y(e.name)}" placeholder="例如 GLM 主 key" />
      </label>
      <label>
        <span>API key</span>
        <input name="key" type="password" value="${y(e.key)}" placeholder="${e.id?"留空保持不变":"sk-..."}" />
      </label>
      <label>
        <span>并发上限</span>
        <input name="concurrencyLimit" type="number" min="0" value="${e.concurrencyLimit}" />
      </label>
      <label class="inline-check">
        <input name="enabled" type="checkbox" ${e.enabled?"checked":""} />
        <span>启用</span>
      </label>
      <button class="primary" type="submit">${u("save")}${e.id?"更新":"添加"}</button>
      ${e.id?'<button class="ghost" type="button" id="cancel-edit">取消</button>':""}
    </form>
    <p class="key-help">并发上限填 0 表示使用全局默认值；实时活跃数来自当前运行时内存状态，不写入 key.json。</p>
  `}function oe(e){return e.length?`
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>名称</th>
            <th>Key</th>
            <th>状态</th>
            <th>活跃/上限</th>
            <th>粘性会话</th>
            <th>退避</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${e.map(t=>`
            <tr data-key-id="${y(t.id)}">
              <td><strong>${b(t.name)}</strong><small>${b(t.id)}</small></td>
              <td>${b(t.keyPreview)}</td>
              <td><span class="pill ${t.enabled?"enabled":""}">${t.enabled?"启用":"停用"}</span></td>
              <td class="key-load-cell">${I(t)}</td>
              <td class="key-sticky-cell">${t.stickySessions}</td>
              <td class="key-backoff-cell">${O(t)}</td>
              <td class="row-actions">
                <button class="ghost edit-key" data-id="${y(t.id)}">编辑</button>
                <button class="danger delete-key" data-id="${y(t.id)}">${u("trash-2")}</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `:'<div class="empty-state">未添加托管 key，代理接口仍按客户端传入的 API key 透传。</div>'}function O(e){if(!e.backoffUntil)return'<span class="pill">无</span>';const t=new Date(e.backoffUntil),n=Math.max(0,t.getTime()-Date.now());return`<span class="pill danger">退避 ${Math.ceil(n/1e3)}s</span>`}function I(e){return`
    <div class="meter"><span style="width:${ae(e)}%"></span></div>
    <small>${e.active} / ${e.concurrencyLimit}</small>
  `}function ae(e){return Math.min(100,Math.round(e.active/Math.max(1,e.concurrencyLimit)*100))}function re(e){const t=new Map(e.map(n=>[n.id,n]));document.querySelectorAll("tr[data-key-id]").forEach(n=>{const o=n.dataset.keyId||"",a=t.get(o);if(!a)return;const i=n.querySelector(".key-load-cell");i&&(i.innerHTML=I(a));const s=n.querySelector(".key-sticky-cell");s&&(s.textContent=String(a.stickySessions));const l=n.querySelector(".key-backoff-cell");l&&(l.innerHTML=O(a))})}function ie(){var e,t,n,o,a,i;(e=document.querySelector("#refresh"))==null||e.addEventListener("click",async()=>{await m(),c="",d()}),(t=document.querySelector("#logout"))==null||t.addEventListener("click",async()=>{await p("/admin/api/logout",{method:"POST"}).catch(()=>{}),r=null,c="",v()}),(n=document.querySelector("#new-key"))==null||n.addEventListener("click",()=>{h=null,d()}),(o=document.querySelector("#cancel-edit"))==null||o.addEventListener("click",()=>{h=null,d()}),(a=document.querySelector("#config-form"))==null||a.addEventListener("submit",se),(i=document.querySelector("#key-form"))==null||i.addEventListener("submit",ce),document.querySelectorAll(".edit-key").forEach(s=>{s.addEventListener("click",()=>{const l=r==null?void 0:r.keys.find(k=>k.id===s.dataset.id);l&&(h={id:l.id,name:l.name,key:"",enabled:l.enabled,concurrencyLimit:l.concurrencyLimit},d())})}),document.querySelectorAll(".delete-key").forEach(s=>{s.addEventListener("click",async()=>{const l=s.dataset.id||"";if(!(!l||!window.confirm("确定删除这个 key？")))try{await p(`/admin/api/keys/${encodeURIComponent(l)}`,{method:"DELETE"}),h=null,await m(),c="key 已删除",d()}catch(k){c=g(k),d()}})})}async function se(e){if(e.preventDefault(),!r)return;const t=new FormData(e.currentTarget),n={...r.config};for(const o of C)o.type==="checkbox"?n[o.key]=t.has(o.key):o.type==="number"?n[o.key]=Number(t.get(o.key)||0):n[o.key]=String(t.get(o.key)||"");$=!0,d();try{await p("/admin/api/config",{method:"PUT",body:JSON.stringify(n)}),await m(),c="配置已保存，运行时设置已热重载"}catch(o){c=g(o)}finally{$=!1,d()}}async function ce(e){e.preventDefault();const t=new FormData(e.currentTarget),n={id:String(t.get("id")||""),name:String(t.get("name")||""),key:String(t.get("key")||""),enabled:t.has("enabled"),concurrencyLimit:Number(t.get("concurrencyLimit")||0)};try{n.id?await p(`/admin/api/keys/${encodeURIComponent(n.id)}`,{method:"PUT",body:JSON.stringify(n)}):await p("/admin/api/keys",{method:"POST",body:JSON.stringify(n)}),h=null,await m(),c=n.id?"key 已更新":"key 已添加",d()}catch(o){c=g(o),d()}}function q(){X({icons:{KeyRound:J,LogOut:V,Plus:B,RefreshCw:z,Save:G,ShieldCheck:Q,Trash2:W}})}function g(e){var n;const t=e instanceof Error?e.message:String(e);if(t==="AUTH_REQUIRED")return"请先登录管理页面";try{return((n=JSON.parse(t).error)==null?void 0:n.message)||t}catch{return t}}function b(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]||t)}function y(e){return b(e).replace(/`/g,"&#96;")}Y();
