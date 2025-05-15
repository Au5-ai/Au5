var D=Object.defineProperty;var N=(t,e,n)=>e in t?D(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var w=(t,e,n)=>N(t,typeof e!="symbol"?e+"":e,n);class U{reload(){chrome.runtime.reload()}sendMessage(e,n=()=>{}){chrome.runtime.sendMessage(e,n)}}class B{async remove(e){return new Promise((n,r)=>{chrome.storage.local.remove(e,()=>{if(chrome.runtime.lastError)return r(chrome.runtime.lastError);n()})})}async set(e,n){return new Promise((r,a)=>{chrome.storage.local.set({[e]:n},()=>{if(chrome.runtime.lastError)return a(chrome.runtime.lastError);r(n)})})}async get(e){const n=Array.isArray(e)?e:[e];return new Promise((r,a)=>{chrome.storage.local.get(n,f=>{if(chrome.runtime.lastError)return a(chrome.runtime.lastError);r(f)})})}async getSync(e){return new Promise((n,r)=>{chrome.storage.sync.get([e],a=>{if(chrome.runtime.lastError)return r(chrome.runtime.lastError);n(a)})})}}async function L(t,...e){let n=t;for(const r of e)n=await r(n);return n}const T="configuration";class R{constructor(e){this.storageService=e}async getConfig(){try{return q}catch(e){throw console.error("Failed to load configuration:",e),new Error("Configuration not found.")}}async setConfig(e){try{await this.storageService.set(T,e)}catch(n){console.error("Failed to save configuration:",n)}}async getValue(e){const n=await this.getConfig();return n?n[e]:null}async setValue(e,n){const r=await this.getConfig()||{};r[e]=n,await this.setConfig(r)}async clearConfig(){try{await this.storageService.remove(T)}catch(e){console.error("Failed to clear configuration:",e)}}}const $={meetingEndIcon:{selector:".google-symbols",text:"call_end"},captionsIcon:{selector:".google-symbols",text:"closed_caption_off"},transcriptSelectors:{aria:'div[role="region"][tabindex="0"]',fallback:".a4cQT"},transcriptStyles:{opacity:"0.2"},maxTranscriptLength:250,transcriptTrimThreshold:125},q={Service:{webhookUrl:"https://au5.ai/api/v1/",token:"",userId:"23f45e89-8b5a-5c55-9df7-240d78a3ce15",fullName:"Mohammad Karimi",direction:"rtl"},Extension:$};var A=(t=>(t.MEETING_STARTED="meetingStarted",t.MEETING_ENDED="meetingEnded",t))(A||{});function z(t){const e=new Date(t),n=e.getUTCHours().toString().padStart(2,"0"),r=e.getUTCMinutes().toString().padStart(2,"0");return`${n}:${r}`}const g=class g{static addPanel(e){if(this.chatPanel){console.warn("ChatPanel already exists.");return}const n=document.createElement("style");n.textContent=F,document.head.appendChild(n),!document.getElementById("au5-chat-panel")&&(this.chatPanel=document.createElement("div"),this.chatPanel.id="au5-chat-panel",this.chatPanel.className="au5-chat-panel",this.chatPanel.setAttribute("data-direction",e),document.body.appendChild(this.chatPanel))}static addYou(e){if(!this.chatPanel){console.warn("ChatPanel does not exist.");return}this.participants=document.createElement("div"),this.participants.className="au5-participant",this.participants.innerHTML=`
        <ul class="au5-participant-list">
          <li>${{name:e}}</li>
        </ul>

      <button id="au5-start-button">Start Transcription</button>
`,this.chatPanel.appendChild(this.participants)}static addOthers(e){var r;if(!this.chatPanel){console.warn("ChatPanel does not exist.");return}const n=(r=this.participants)==null?void 0:r.getElementsByClassName('au5-participant-list"')[0];if(n){const a=document.createElement("li");a.innerText=e,n.appendChild(a)}}static addMessage(e){if(!this.chatPanel)return;const n=this.chatPanel.getAttribute("data-direction")||"ltr",r=document.createElement("div");r.className="au5-message",r.setAttribute("data-id",e.id),r.innerHTML=`
    <div class="au5-message-header">
      <span class="au5-message-sender">${e.speaker}</span>
      <span class="au5-message-time">${z(e.timestamp)}</span>
    </div>
    <div class="au5-message-text" style="direction: ${n};">${e.transcript}</div>
  `,this.chatPanel.appendChild(r)}static addLiveMessage(e){if(!this.chatPanel){console.warn("ChatPanel does not exist.");return}const n=this.chatPanel.querySelector(`[data-id="${e.id}"]`);if(n){const r=n.querySelector(".au5-message-text");r&&(r.innerText=e.transcript)}else g.addMessage(e)}static destroy(){this.chatPanel?(document.body.removeChild(this.chatPanel),this.chatPanel=null):console.warn("ChatPanel does not exist.")}};w(g,"chatPanel",null),w(g,"participants",null);let m=g;const F=`
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

  #au5-start-button {
    background-color: rgb(0, 0, 0);
    color: white; 
    border-radius: 8px; 
    padding: 8px; 
    border: none; 
    cursor: pointer;
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
`;async function O(t,e){const n=r=>{var a;return e?((a=r.textContent)==null?void 0:a.trim())===e:!0};for(;;){const a=Array.from(document.querySelectorAll(t)).find(n);if(a instanceof HTMLElement)return a;await new Promise(requestAnimationFrame)}}function C(t){return document.querySelector(t)}function P(t,e){const n=Array.from(document.querySelectorAll(t));if(!e)return n;const r=new RegExp(e);return n.filter(a=>r.test(a.textContent??""))}function j(t,e,n){if(e)t.style.opacity=n;else{const r=t.children[1];r==null||r.setAttribute("style",`opacity: ${n};`)}}function H(t,e){let n=document.querySelector(t);const r=!!n;return n||(n=document.querySelector(e)),{container:n,useAria:r}}function _(){const e=new URL(window.location.href).pathname.split("/").filter(Boolean);return e.length>0?e[e.length-1]:"N/A"}let i;const G=new U,Y=new R(new B);let k=!1,I=[],p="",o="",s="",l="",v=!1,h;const K=async t=>{var n;const e=i.Extension.captionsIcon;return t.captionsButton=P(e.selector,e.text)[0],(n=t.captionsButton)==null||n.click(),t},V=async t=>{const e=H(i.Extension.transcriptSelectors.aria,i.Extension.transcriptSelectors.fallback);if(!e)throw new Error("Transcript container not found in DOM");return t.transcriptContainer=e.container,t.canUseAriaBasedTranscriptSelector=e.useAria,t},J=async t=>(t.transcriptContainer&&j(t.transcriptContainer,t.canUseAriaBasedTranscriptSelector,i.Extension.transcriptStyles.opacity),t),Q=async t=>(t.transcriptContainer&&(h=new MutationObserver(ee(t)),h.observe(t.transcriptContainer,{childList:!0,attributes:!0,subtree:!0,characterData:!0})),t),W=async t=>(ne(),t);async function X(t){try{i=await Y.getConfig();const e=_();await O(i.Extension.meetingEndIcon.selector,i.Extension.meetingEndIcon.text),t.sendMessage({type:A.MEETING_STARTED,value:{meetingTitle:e}})}catch(e){console.error("Failed to detect meeting start:",e)}}function Z(){return L({hasMeetingStarted:!0},K,V,J,Q,W)}X(G).then(async()=>{var t;m.addPanel(i.Service.direction),m.addYou(i.Service.fullName),(t=document.getElementById("au5-start-button"))==null||t.addEventListener("click",()=>{Z()}),M("signalr.min.js"),M("injected.js")}).catch(t=>{console.error("Meeting routine execution failed:",t),v=!0});function M(t){const e=document.createElement("script");e.src=chrome.runtime.getURL(t),e.type="text/javascript",(document.head||document.documentElement).appendChild(e)}function ee(t){return function(e,n){te(e,t)}}function te(t,e){var n,r,a,f;for(const re of t)try{const c=e.canUseAriaBasedTranscriptSelector?C(i.Extension.transcriptSelectors.aria):C(i.Extension.transcriptSelectors.fallback),u=e.canUseAriaBasedTranscriptSelector?c==null?void 0:c.children:(r=(n=c==null?void 0:c.childNodes[1])==null?void 0:n.firstChild)==null?void 0:r.childNodes;if(!u)return;if(!(e.canUseAriaBasedTranscriptSelector?u.length>1:u.length>0)){o&&s&&E({speaker:o,transcript:s,timestamp:l}),p="",o="",s="";continue}const S=e.canUseAriaBasedTranscriptSelector?u[u.length-2]:u[u.length-1],x=S.childNodes[0],b=S.childNodes[1],y=((a=x==null?void 0:x.textContent)==null?void 0:a.trim())??"",d=((f=b==null?void 0:b.textContent)==null?void 0:f.trim())??"";if(!y||!d)continue;s===""?(p=crypto.randomUUID(),o=y,l=new Date().toISOString(),s=d):o!==y?(E({id:p,speaker:o,transcript:s,timestamp:l}),p=crypto.randomUUID(),o=y,l=new Date().toISOString(),s=d):(e.canUseAriaBasedTranscriptSelector&&d.length-s.length<-i.Extension.maxTranscriptLength&&E({id:p,speaker:o,transcript:s,timestamp:l}),s=d,!e.canUseAriaBasedTranscriptSelector&&d.length>i.Extension.maxTranscriptLength&&S.remove()),m.addLiveMessage({id:p,speaker:o,transcript:s,timestamp:l})}catch(c){console.error(c),!v&&!k&&console.log("Error in transcript mutation observer:",c),v=!0}}function E(t){if(!s||!l)return;const e=t.speaker==="You"?i.Service.fullName:t.speaker;I.push({id:t.id,speaker:e,timestamp:t.timestamp,transcript:t.transcript})}function ne(){var t,e;try{const n=P(i.Extension.meetingEndIcon.selector,i.Extension.meetingEndIcon.text),r=((e=(t=n==null?void 0:n[0])==null?void 0:t.parentElement)==null?void 0:e.parentElement)??null;if(!r)throw new Error("Meeting end button not found in DOM.");r.addEventListener("click",()=>{k=!0,h==null||h.disconnect(),o&&s&&E({speaker:o,transcript:s,timestamp:l}),m.destroy(),console.log("Meeting ended. Transcript data:",JSON.stringify(I))})}catch(n){console.error("Error setting up meeting end listener:",n)}}
