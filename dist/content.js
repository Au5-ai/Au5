var D=Object.defineProperty;var U=(t,e,n)=>e in t?D(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var M=(t,e,n)=>U(t,typeof e!="symbol"?e+"":e,n);class N{reload(){chrome.runtime.reload()}sendMessage(e,n=()=>{}){chrome.runtime.sendMessage(e,n)}}class B{async remove(e){return new Promise((n,r)=>{chrome.storage.local.remove(e,()=>{if(chrome.runtime.lastError)return r(chrome.runtime.lastError);n()})})}async set(e,n){return new Promise((r,s)=>{chrome.storage.local.set({[e]:n},()=>{if(chrome.runtime.lastError)return s(chrome.runtime.lastError);r(n)})})}async get(e){const n=Array.isArray(e)?e:[e];return new Promise((r,s)=>{chrome.storage.local.get(n,f=>{if(chrome.runtime.lastError)return s(chrome.runtime.lastError);r(f)})})}async getSync(e){return new Promise((n,r)=>{chrome.storage.sync.get([e],s=>{if(chrome.runtime.lastError)return r(chrome.runtime.lastError);n(s)})})}}async function L(t,...e){let n=t;for(const r of e)n=await r(n);return n}const b="configuration";class q{constructor(e){this.storageService=e}async getConfig(){try{return F}catch(e){throw console.error("Failed to load configuration:",e),new Error("Configuration not found.")}}async setConfig(e){try{await this.storageService.set(b,e)}catch(n){console.error("Failed to save configuration:",n)}}async getValue(e){const n=await this.getConfig();return n?n[e]:null}async setValue(e,n){const r=await this.getConfig()||{};r[e]=n,await this.setConfig(r)}async clearConfig(){try{await this.storageService.remove(b)}catch(e){console.error("Failed to clear configuration:",e)}}}const z={meetingEndIcon:{selector:".google-symbols",text:"call_end"},captionsIcon:{selector:".google-symbols",text:"closed_caption_off"},transcriptSelectors:{aria:'div[role="region"][tabindex="0"]',fallback:".a4cQT"},transcriptStyles:{opacity:"0.2"},maxTranscriptLength:250,transcriptTrimThreshold:125},F={Service:{webhookUrl:"https://au5.ai/api/v1/",token:"",userId:"23f45e89-8b5a-5c55-9df7-240d78a3ce15",fullName:"Mohammad Karimi",direction:"rtl"},Extension:z};var A=(t=>(t.MEETING_STARTED="meetingStarted",t.MEETING_ENDED="meetingEnded",t))(A||{});function O(t){const e=new Date(t),n=e.getUTCHours().toString().padStart(2,"0"),r=e.getUTCMinutes().toString().padStart(2,"0");return`${n}:${r}`}const E=class E{static addPanel(e){if(this.chatPanel){console.warn("ChatPanel already exists.");return}const n=document.createElement("style");n.textContent=R,document.head.appendChild(n),!document.getElementById("au5-chat-panel")&&(this.chatPanel=document.createElement("div"),this.chatPanel.id="au5-chat-panel",this.chatPanel.className="au5-chat-panel",this.chatPanel.setAttribute("data-direction",e),document.body.appendChild(this.chatPanel))}static addMessage(e){if(!this.chatPanel)return;const n=this.chatPanel.getAttribute("data-direction")||"ltr",r=document.createElement("div");r.className="au5-message",r.setAttribute("data-id",e.id),r.innerHTML=`
    <div class="au5-message-header">
      <span class="au5-message-sender">${e.speaker}</span>
      <span class="au5-message-time">${O(e.timestamp)}</span>
    </div>
    <div class="au5-message-text" style="direction: ${n};">${e.transcript}</div>
  `,this.chatPanel.appendChild(r)}static addLiveMessage(e){if(!this.chatPanel)return;const n=this.chatPanel.querySelector(`[data-id="${e.id}"]`);if(console.log("existingMessage",n),console.log("item",e),n){const r=n.querySelector(".au5-message-text");r&&(r.innerText=e.transcript)}else E.addMessage(e)}static destroy(){this.chatPanel?(document.body.removeChild(this.chatPanel),this.chatPanel=null):console.warn("ChatPanel does not exist.")}};M(E,"chatPanel",null);let u=E;const R=`
  .au5-chat-panel {
    border: 1px solid transparent;
    align-items: center;
    background-color: #fff;
    border-radius: 16px;
    bottom: 80px;
    box-sizing: border-box;
    max-width: 100%;
    position: absolute;
    right: 16px;
    top: 16px;
    transform: none;
    z-index: 9999;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), bottom 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    width: 360px;
    padding: 16px;
    overflow-x: auto;
    font-family: system-ui;
  }

  .au5-message {
    background-color: #f1f2f3;
    padding: 16px;
    border-radius: 16px;
    max-width: 500px;
    margin-bottom: 8px;
    font-size: 13px;
    line-height: 1.6;
    color: #000;
  }

  .au5-message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .au5-message-sender {
    font-weight: bold;
    font-size: 13px;
  }

  .au5-message-time {
    color: #333;
    font-size: 13px;
  }

  .au5-message-text {
    margin-bottom: 8px;
  }

`;async function $(t,e){const n=r=>{var s;return e?((s=r.textContent)==null?void 0:s.trim())===e:!0};for(;;){const s=Array.from(document.querySelectorAll(t)).find(n);if(s instanceof HTMLElement)return s;await new Promise(requestAnimationFrame)}}function k(t){return document.querySelector(t)}function P(t,e){const n=Array.from(document.querySelectorAll(t));if(!e)return n;const r=new RegExp(e);return n.filter(s=>r.test(s.textContent??""))}function _(t,e,n){if(e)t.style.opacity=n;else{const r=t.children[1];r==null||r.setAttribute("style",`opacity: ${n};`)}}function H(t,e){let n=document.querySelector(t);const r=!!n;return n||(n=document.querySelector(e)),{container:n,useAria:r}}function G(){const e=new URL(window.location.href).pathname.split("/").filter(Boolean);return e.length>0?e[e.length-1]:"N/A"}let i;const J=new N,K=new q(new B);let I=!1,T=[],d="",o="",a="",c="",v=!1,g;const V=async t=>{var n;const e=i.Extension.captionsIcon;return t.captionsButton=P(e.selector,e.text)[0],(n=t.captionsButton)==null||n.click(),t},Y=async t=>{const e=H(i.Extension.transcriptSelectors.aria,i.Extension.transcriptSelectors.fallback);if(!e)throw new Error("Transcript container not found in DOM");return t.transcriptContainer=e.container,t.canUseAriaBasedTranscriptSelector=e.useAria,t},j=async t=>(t.transcriptContainer&&_(t.transcriptContainer,t.canUseAriaBasedTranscriptSelector,i.Extension.transcriptStyles.opacity),t),Q=async t=>(t.transcriptContainer&&(g=new MutationObserver(ee(t)),g.observe(t.transcriptContainer,{childList:!0,attributes:!0,subtree:!0,characterData:!0})),t),W=async t=>(u.addPanel(i.Service.direction),t),X=async t=>(ne(),t);async function Z(t){try{i=await K.getConfig();const e=G();await $(i.Extension.meetingEndIcon.selector,i.Extension.meetingEndIcon.text),t.sendMessage({type:A.MEETING_STARTED,value:{meetingTitle:e}})}catch(e){console.error("Failed to detect meeting start:",e)}}Z(J).then(async()=>L({hasMeetingStarted:!0},V,Y,j,Q,W,X)).catch(t=>{console.error("Meeting routine execution failed:",t),v=!0});function ee(t){return function(e,n){te(e,t)}}function te(t,e){var n,r,s,f,C;for(const re of t)try{const l=e.canUseAriaBasedTranscriptSelector?k(i.Extension.transcriptSelectors.aria):k(i.Extension.transcriptSelectors.fallback),m=e.canUseAriaBasedTranscriptSelector?l==null?void 0:l.children:(r=(n=l==null?void 0:l.childNodes[1])==null?void 0:n.firstChild)==null?void 0:r.childNodes;if(!m)return;if(!(e.canUseAriaBasedTranscriptSelector?m.length>1:m.length>0)){o&&a&&y({speaker:o,transcript:a,timestamp:c}),d="",o="",a="",console.log("No speakers found in transcript container.");continue}const S=e.canUseAriaBasedTranscriptSelector?m[m.length-2]:m[m.length-1],x=S.childNodes[0],w=(s=S.childNodes[1])==null?void 0:s.lastChild,h=((f=x==null?void 0:x.textContent)==null?void 0:f.trim())??"",p=((C=w==null?void 0:w.textContent)==null?void 0:C.trim())??"";if(!h||!p){u.addLiveMessage({id:d,speaker:o,transcript:a,timestamp:c});continue}a===""?(d=crypto.randomUUID(),o=h,c=new Date().toISOString(),a=p,u.addLiveMessage({id:d,speaker:o,transcript:a,timestamp:c})):o!==h?(y({id:d,speaker:o,transcript:a,timestamp:c}),d=crypto.randomUUID(),o=h,c=new Date().toISOString(),a=p,u.addLiveMessage({id:d,speaker:o,transcript:a,timestamp:c})):(e.canUseAriaBasedTranscriptSelector&&p.length-a.length<-i.Extension.maxTranscriptLength&&(y({id:d,speaker:o,transcript:a,timestamp:c}),u.addLiveMessage({id:d,speaker:o,transcript:a,timestamp:c})),a=p,!e.canUseAriaBasedTranscriptSelector&&p.length>i.Extension.maxTranscriptLength&&S.remove())}catch(l){console.error(l),!v&&!I&&console.log("Error in transcript mutation observer:",l),v=!0}}function y(t){if(!a||!c)return;const e=t.speaker==="You"?i.Service.fullName:t.speaker;T.push({id:t.id,speaker:e,timestamp:t.timestamp,transcript:t.transcript}),console.log("Transcript block:",JSON.stringify(T))}function ne(){var t,e;try{const n=P(i.Extension.meetingEndIcon.selector,i.Extension.meetingEndIcon.text),r=((e=(t=n==null?void 0:n[0])==null?void 0:t.parentElement)==null?void 0:e.parentElement)??null;if(!r)throw new Error("Meeting end button not found in DOM.");r.addEventListener("click",()=>{I=!0,g==null||g.disconnect(),o&&a&&y({speaker:o,transcript:a,timestamp:c}),u.destroy(),console.log("Meeting ended. Transcript data:",JSON.stringify(T))})}catch(n){console.error("Error setting up meeting end listener:",n)}}
