(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=(e,t,n=[])=>{const a=document.createElementNS("http://www.w3.org/2000/svg",e);return Object.keys(t).forEach(o=>{a.setAttribute(o,String(t[o]))}),n.length&&n.forEach(o=>{const i=C(...o);a.appendChild(i)}),a};var j=([e,t,n])=>C(e,t,n);/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=e=>Array.from(e.attributes).reduce((t,n)=>(t[n.name]=n.value,t),{}),V=e=>typeof e=="string"?e:!e||!e.class?"":e.class&&typeof e.class=="string"?e.class.split(" "):e.class&&Array.isArray(e.class)?e.class:"",_=e=>e.flatMap(V).map(n=>n.trim()).filter(Boolean).filter((n,a,o)=>o.indexOf(n)===a).join(" "),F=e=>e.replace(/(\w)(\w*)(_|-|\s*)/g,(t,n,a)=>n.toUpperCase()+a.toLowerCase()),A=(e,{nameAttr:t,icons:n,attrs:a})=>{var M;const o=e.getAttribute(t);if(o==null)return;const i=F(o),s=n[i];if(!s)return console.warn(`${e.outerHTML} icon name was not found in the provided icons object.`);const c=D(e),[g,H,U]=s,x={...H,"data-lucide":o,...a,...c},E=_(["lucide",`lucide-${o}`,c,a]);E&&Object.assign(x,{class:E});const R=j([g,x,U]);return(M=e.parentNode)==null?void 0:M.replaceChild(R,e)};/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=["svg",y,[["path",{d:"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=["svg",y,[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"}],["polyline",{points:"16 17 21 12 16 7"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=["svg",y,[["path",{d:"M5 12h14"}],["path",{d:"M12 5v14"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=["svg",y,[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"}],["path",{d:"M21 3v5h-5"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"}],["path",{d:"M8 16H3v5"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=["svg",y,[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=["svg",y,[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"}],["circle",{cx:"12",cy:"12",r:"3"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=["svg",y,[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{d:"m9 12 2 2 4-4"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y=["svg",y,[["path",{d:"M3 6h18"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17"}]]];/**
 * @license lucide v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=({icons:e={},nameAttr:t="data-lucide",attrs:n={}}={})=>{if(!Object.values(e).length)throw new Error(`Please provide an icons object.
If you want to use all the icons you can import it like:
 \`import { createIcons, icons } from 'lucide';
lucide.createIcons({icons});\``);if(typeof document>"u")throw new Error("`createIcons()` only works in a browser environment.");const a=document.querySelectorAll(`[${t}]`);if(Array.from(a).forEach(o=>A(o,{nameAttr:t,icons:e,attrs:n})),t==="data-lucide"){const o=document.querySelectorAll("[icon-name]");o.length>0&&(console.warn("[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide"),Array.from(o).forEach(i=>A(i,{nameAttr:"icon-name",icons:e,attrs:n})))}},P=[{key:"listen",label:"监听地址",type:"text",section:"server",description:"HTTP 服务绑定地址。该值写入 config.json 后会热重载到运行时配置，但已启动进程的端口绑定需要重启后才会变化。"},{key:"upstreamBaseURL",label:"上游 API 地址",type:"text",section:"server",description:"Umans-compatible 上游服务的 base URL。新的代理请求、模型目录读取和重试都会使用热重载后的地址。"},{key:"defaultModel",label:"默认模型",type:"text",section:"models",description:"请求体缺少 model 字段时用于预算校验的模型 ID，也是安全输出上限计算时的候选模型之一。"},{key:"opusModel",label:"Opus 映射模型",type:"text",section:"models",description:"Claude Code Opus 档位对应的上游模型。预算保护会把默认、Opus、Sonnet、Haiku 的上限取最保守值。"},{key:"sonnetModel",label:"Sonnet 映射模型",type:"text",section:"models",description:"Claude Code Sonnet 档位对应的上游模型，通常是主力编码模型。"},{key:"haikuModel",label:"Haiku 映射模型",type:"text",section:"models",description:"Claude Code Haiku 档位对应的上游模型。若某个 key 未配置独立并发，会使用全局并发限制。"},{key:"keyConcurrencyLimit",label:"全局默认并发",type:"number",section:"routing",description:"每个 key 默认允许同时处理的活跃请求数。key.json 中单个 key 的并发数大于 0 时会覆盖此值。"},{key:"keyQueueTimeout",label:"排队等待时间",type:"text",section:"routing",description:"当目标 key 并发已满时，请求会先等待这个时长而不是立刻返回 429。粘性会话命中的 key 满载时也使用同一个等待时间，超时后才尝试切换到其他 key。"},{key:"stickySession",label:"启用粘性会话",type:"checkbox",section:"routing",description:"开启后，同一会话在粘性窗口内会优先复用上一次选中的上游 key，减少上下文切换带来的不稳定。会话身份优先使用请求体的 session_id / metadata.user_id / prompt_cache_key，缺失时网关会生成并通过 X-Umans-Session-Id 头部下发。"},{key:"stickySessionTTL",label:"粘性会话窗口",type:"text",section:"routing",description:"同一客户端 token 记住上次 key 的有效时间，默认 10s。窗口过期后会重新按负载均衡选择当前并发数更小的 key。"},{key:"keyErrorThreshold",label:"Key 错误阈值",type:"number",section:"routing",description:"在 keyErrorWindow 时间窗口内，某个上游 key 出错达到此数量时会进入退避状态。设为 0 可禁用错误退避。"},{key:"keyErrorWindow",label:"Key 错误窗口",type:"text",section:"routing",description:"计算 key 错误次数的时间窗口，例如 60s。超过此窗口的旧错误会被清除。"},{key:"keyErrorBackoff",label:"Key 退避时间",type:"text",section:"routing",description:"key 触发错误阈值后，网关在多长时间内不再将请求路由到该 key，例如 30s。"},{key:"searchMode",label:"搜索模式",type:"select",section:"routing",options:[{value:"exa",label:"exa"},{value:"native",label:"native"},{value:"auto",label:"auto"},{value:"none",label:"none"}],description:"控制是否向上游注入 X-Umans-Websearch-Provider。exa/native/none 会强制覆盖客户端 header，auto 会透传客户端设置。"},{key:"budgetPolicy",label:"输出预算策略",type:"select",section:"routing",options:[{value:"error",label:"error"},{value:"clamp-visible",label:"clamp-visible"}],description:"请求的 max_tokens 超过模型目录安全上限时，error 会拒绝请求，clamp-visible 会把请求值压到可见上限并返回提示 header。"},{key:"upstreamRetryMax",label:"上游最大重试次数",type:"number",section:"reliability",description:"首次请求失败后最多再重试的次数。重试期间会持续占用当前 key 的并发槽，避免把瞬断放大成更多并发。"},{key:"retry429",label:"重试 429",type:"checkbox",section:"reliability",description:"默认关闭，避免上游限流时继续放大压力。只有明确知道 429 是短暂队列抖动时才建议开启。"},{key:"upstreamRetryBaseDelay",label:"重试初始延迟",type:"text",section:"reliability",description:"第一次重试前等待的时间，使用 Go duration 格式，例如 500ms、2s、1m。"},{key:"upstreamRetryMaxDelay",label:"重试最大延迟",type:"text",section:"reliability",description:"指数退避的上限。实际等待时间不会超过此值。"},{key:"schemaCompat",label:"JSON Schema 兼容",type:"checkbox",section:"reliability",description:"开启后会把旧 tuple 写法 items: [...] 转为 prefixItems，减少严格上游校验器拒绝工具 schema 的概率。"},{key:"catalogTTL",label:"模型目录缓存时间",type:"text",section:"reliability",description:"每个上游 key 的 /v1/models/info 缓存时间。预算保护依赖这个目录，缓存过短会增加上游请求。"},{key:"adminPassword",label:"管理页面访问密码",type:"password",section:"security",description:"用于登录 /admin/ 管理页面和调用管理 API。表单留空表示保持当前密码不变。"},{key:"proxyAccessToken",label:"代理访问令牌",type:"password",section:"security",description:"托管 key 池启用时必须配置。客户端请求的 Authorization 或 x-api-key 需要与此值一致，网关才会使用 key 池转发。"},{key:"errorEventDir",label:"匿名错误目录",type:"text",section:"logs",description:"匿名错误事件 JSONL 的保存目录。只记录事件类型、状态段、延迟段和错误分类，不写请求体、模型输入或 API key。"},{key:"errorEventMaxAge",label:"错误事件保留时间",type:"text",section:"logs",description:"超过该时间的错误事件文件会在下一次记录或清理时删除。"},{key:"errorEventMaxSize",label:"错误事件最大总大小",type:"number",section:"logs",description:"错误事件目录允许保留的最大字节数，超过后优先删除最旧的 JSONL 文件。"}],T={server:"服务",models:"模型映射",routing:"路由与并发",reliability:"稳定性",security:"访问控制",logs:"匿名错误"},L=document.querySelector("#app");if(!L)throw new Error("missing app root");let r=null,p=null,l="",S=!1,$,b="keys";function u(e){return`<i data-lucide="${e}" aria-hidden="true"></i>`}async function f(e,t={}){const n=new Headers(t.headers);t.body&&!n.has("content-type")&&n.set("content-type","application/json");const a=await fetch(e,{...t,headers:n,credentials:"include"});if(a.status===401)throw new Error("AUTH_REQUIRED");if(!a.ok){const o=await a.text();throw new Error(o||`HTTP ${a.status}`)}return await a.json()}async function ee(){try{await h(),d(),N()}catch(e){if(String(e.message)==="AUTH_REQUIRED"){w();return}l=v(e),w()}}function N(){$&&window.clearInterval($),$=window.setInterval(()=>{h().then(ae).catch(()=>{})},2e3)}async function h(){r=await f("/admin/api/status")}function w(){var e;L.innerHTML=`
    <main class="login-shell">
      <form class="login-panel" id="login-form">
        <div class="brand-mark">${u("shield-check")}</div>
        <h1>Umans Gateway</h1>
        <label>
          <span>管理密码</span>
          <input name="password" type="password" autocomplete="current-password" autofocus />
        </label>
        <button class="primary" type="submit">${u("key-round")}登录</button>
        ${l?`<p class="form-error">${k(l)}</p>`:""}
      </form>
    </main>
  `,K(),(e=document.querySelector("#login-form"))==null||e.addEventListener("submit",async t=>{t.preventDefault();const n=new FormData(t.currentTarget);try{await f("/admin/api/login",{method:"POST",body:JSON.stringify({password:String(n.get("password")||"")})}),l="",await h(),d(),N()}catch(a){l=v(a),w()}})}function d(){r&&(L.innerHTML=`
    <main class="app-shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">UMANS TRANSPARENT GATEWAY</p>
          <h1>${b==="keys"?"Key 管理":"系统设置"}</h1>
        </div>
        <div class="topbar-actions">
          <span class="mode ${r.managedKeyMode?"on":""}">${r.managedKeyMode?"托管 key 模式":"客户端 key 透传"}</span>
          <button class="ghost" id="refresh">${u("refresh-cw")}刷新</button>
          <button class="ghost" id="logout">${u("log-out")}退出</button>
        </div>
      </header>
      ${l?`<div class="notice">${k(l)}</div>`:""}
      <nav class="nav-tabs">
        <button class="tab ${b==="keys"?"active":""}" data-page="keys">${u("key-round")}Key 管理</button>
        <button class="tab ${b==="settings"?"active":""}" data-page="settings">${u("settings")}设置</button>
      </nav>
      ${b==="keys"?te():ne()}
    </main>
  `,de(),K())}function te(){return`
    <section class="panel keys-panel">
      <div class="panel-head">
        <h2>Key 池</h2>
        <button class="ghost" id="new-key">${u("plus")}新增 key</button>
      </div>
      ${ie()}
      ${se(r.keys)}
    </section>
  `}function ne(){return`
    <section class="metrics">
      ${O()}
    </section>
    <form class="panel config-panel" id="config-form">
      <div class="panel-head">
        <h2>全局配置</h2>
        <button class="primary" type="submit" ${S?"disabled":""}>${u("save")}保存配置</button>
      </div>
      ${oe(r.config)}
    </form>
  `}function ae(){if(!r||!document.querySelector(".app-shell"))return;const e=document.querySelector(".mode");e&&(e.classList.toggle("on",r.managedKeyMode),e.textContent=r.managedKeyMode?"托管 key 模式":"客户端 key 透传");const t=document.querySelector(".metrics");t&&(t.innerHTML=O()),le(r.keys)}function O(){const e=(r==null?void 0:r.keys.reduce((a,o)=>a+o.active,0))||0,t=(r==null?void 0:r.keys.filter(a=>a.enabled).length)||0,n=(r==null?void 0:r.keys.reduce((a,o)=>a+(o.enabled?o.concurrencyLimit:0),0))||0;return`
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
  `}function oe(e){return Object.keys(T).map(t=>{const n=P.filter(a=>a.section===t);return`
      <fieldset>
        <legend>${T[t]}</legend>
        <div class="field-grid">
          ${n.map(a=>re(a,e)).join("")}
        </div>
      </fieldset>
    `}).join("")}function re(e,t){const n=t[e.key],a=`name="${e.key}" id="cfg-${e.key}"`;let o="";if(e.type==="checkbox")o=`<label class="switch"><input ${a} type="checkbox" ${n?"checked":""} /><span></span></label>`;else if(e.type==="select")o=`
      <select ${a}>
        ${(e.options||[]).map(i=>`<option value="${i.value}" ${n===i.value?"selected":""}>${i.label}</option>`).join("")}
      </select>
    `;else{const i=e.key==="adminPassword"?"":String(n??"");o=`<input ${a} type="${e.type}" value="${m(i)}" ${e.type==="number"?'min="0"':""} />`}return`
    <label class="config-field" for="cfg-${e.key}">
      <span class="field-title">${e.label}</span>
      ${o}
      <span class="field-help">${e.description}</span>
    </label>
  `}function ie(){const e=p||{id:"",name:"",key:"",enabled:!0,concurrencyLimit:(r==null?void 0:r.config.keyConcurrencyLimit)||4};return`
    <form class="key-form" id="key-form">
      <input type="hidden" name="id" value="${m(e.id)}" />
      <label>
        <span>名称</span>
        <input name="name" value="${m(e.name)}" placeholder="例如 GLM 主 key" />
      </label>
      <label>
        <span>API key</span>
        <input name="key" type="password" value="${m(e.key)}" placeholder="${e.id?"留空保持不变":"sk-..."}" />
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
  `}function se(e){return e.length?`
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
            <tr data-key-id="${m(t.id)}">
              <td><strong>${k(t.name)}</strong><small>${k(t.id)}</small></td>
              <td>${k(t.keyPreview)}</td>
              <td><span class="pill ${t.enabled?"enabled":""}">${t.enabled?"启用":"停用"}</span></td>
              <td class="key-load-cell">${q(t)}</td>
              <td class="key-sticky-cell">${t.stickySessions}</td>
              <td class="key-backoff-cell">${I(t)}</td>
              <td class="row-actions">
                <button class="ghost edit-key" data-id="${m(t.id)}">编辑</button>
                <button class="danger delete-key" data-id="${m(t.id)}">${u("trash-2")}</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `:'<div class="empty-state">未添加托管 key，代理接口仍按客户端传入的 API key 透传。</div>'}function I(e){if(!e.backoffUntil)return'<span class="pill">无</span>';const t=new Date(e.backoffUntil),n=Math.max(0,t.getTime()-Date.now());return`<span class="pill danger">退避 ${Math.ceil(n/1e3)}s</span>`}function q(e){return`
    <div class="meter"><span style="width:${ce(e)}%"></span></div>
    <small>${e.active} / ${e.concurrencyLimit}</small>
  `}function ce(e){return Math.min(100,Math.round(e.active/Math.max(1,e.concurrencyLimit)*100))}function le(e){const t=new Map(e.map(n=>[n.id,n]));document.querySelectorAll("tr[data-key-id]").forEach(n=>{const a=n.dataset.keyId||"",o=t.get(a);if(!o)return;const i=n.querySelector(".key-load-cell");i&&(i.innerHTML=q(o));const s=n.querySelector(".key-sticky-cell");s&&(s.textContent=String(o.stickySessions));const c=n.querySelector(".key-backoff-cell");c&&(c.innerHTML=I(o))})}function de(){var e,t,n,a,o,i;(e=document.querySelector("#refresh"))==null||e.addEventListener("click",async()=>{await h(),l="",d()}),(t=document.querySelector("#logout"))==null||t.addEventListener("click",async()=>{await f("/admin/api/logout",{method:"POST"}).catch(()=>{}),r=null,l="",w()}),(n=document.querySelector("#new-key"))==null||n.addEventListener("click",()=>{p=null,d()}),(a=document.querySelector("#cancel-edit"))==null||a.addEventListener("click",()=>{p=null,d()}),(o=document.querySelector("#config-form"))==null||o.addEventListener("submit",ue),(i=document.querySelector("#key-form"))==null||i.addEventListener("submit",ye),document.querySelectorAll(".tab").forEach(s=>{s.addEventListener("click",()=>{const c=s.dataset.page;c&&c!==b&&(b=c,l="",p=null,d())})}),document.querySelectorAll(".edit-key").forEach(s=>{s.addEventListener("click",()=>{const c=r==null?void 0:r.keys.find(g=>g.id===s.dataset.id);c&&(p={id:c.id,name:c.name,key:"",enabled:c.enabled,concurrencyLimit:c.concurrencyLimit},d())})}),document.querySelectorAll(".delete-key").forEach(s=>{s.addEventListener("click",async()=>{const c=s.dataset.id||"";if(!(!c||!window.confirm("确定删除这个 key？")))try{await f(`/admin/api/keys/${encodeURIComponent(c)}`,{method:"DELETE"}),p=null,await h(),l="key 已删除",d()}catch(g){l=v(g),d()}})})}async function ue(e){if(e.preventDefault(),!r)return;const t=new FormData(e.currentTarget),n={...r.config};for(const a of P)a.type==="checkbox"?n[a.key]=t.has(a.key):a.type==="number"?n[a.key]=Number(t.get(a.key)||0):n[a.key]=String(t.get(a.key)||"");S=!0,d();try{await f("/admin/api/config",{method:"PUT",body:JSON.stringify(n)}),await h(),l="配置已保存，运行时设置已热重载"}catch(a){l=v(a)}finally{S=!1,d()}}async function ye(e){e.preventDefault();const t=new FormData(e.currentTarget),n={id:String(t.get("id")||""),name:String(t.get("name")||""),key:String(t.get("key")||""),enabled:t.has("enabled"),concurrencyLimit:Number(t.get("concurrencyLimit")||0)};try{n.id?await f(`/admin/api/keys/${encodeURIComponent(n.id)}`,{method:"PUT",body:JSON.stringify(n)}):await f("/admin/api/keys",{method:"POST",body:JSON.stringify(n)}),p=null,await h(),l=n.id?"key 已更新":"key 已添加",d()}catch(a){l=v(a),d()}}function K(){Z({icons:{KeyRound:J,LogOut:z,Plus:B,RefreshCw:G,Save:Q,Settings:W,ShieldCheck:X,Trash2:Y}})}function v(e){var n;const t=e instanceof Error?e.message:String(e);if(t==="AUTH_REQUIRED")return"请先登录管理页面";try{return((n=JSON.parse(t).error)==null?void 0:n.message)||t}catch{return t}}function k(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]||t)}function m(e){return k(e).replace(/`/g,"&#96;")}ee();
