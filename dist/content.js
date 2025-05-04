var r=Object.defineProperty;var c=(i,t,e)=>t in i?r(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var n=(i,t,e)=>(c(i,typeof t!="symbol"?t+"":t,e),e);class a{constructor(){n(this,"recognition");n(this,"isActive",!1);n(this,"container");n(this,"transcriptEl");n(this,"toggleBtn");this.setupUI(),this.setupRecognition(),this.injectStyles()}setupUI(){this.container=document.createElement("div"),this.container.id="meet-speech-container",this.transcriptEl=document.createElement("div"),this.transcriptEl.className="transcript",this.transcriptEl.textContent="Click mic to start",this.toggleBtn=document.createElement("button"),this.toggleBtn.className="mic-btn",this.toggleBtn.innerHTML="🎤",this.toggleBtn.addEventListener("click",()=>this.toggleRecognition()),this.container.appendChild(this.transcriptEl),this.container.appendChild(this.toggleBtn),this.injectIntoMeet()}injectIntoMeet(){const t='div[aria-label="Meeting controls"]',e=new MutationObserver(s=>{const o=document.querySelector(t);o&&(o.appendChild(this.container),e.disconnect())});e.observe(document.body,{childList:!0,subtree:!0})}setupRecognition(){const t=window.SpeechRecognition||window.webkitSpeechRecognition;if(!t){this.transcriptEl.textContent="Speech API not supported",this.toggleBtn.disabled=!0;return}this.recognition=new t,this.recognition.continuous=!0,this.recognition.interimResults=!0,this.recognition.lang="en-US",this.recognition.onresult=e=>{const s=Array.from(e.results).map(o=>o[0].transcript).join("");this.transcriptEl.textContent=s},this.recognition.onerror=e=>{console.error("Recognition error:",e.error),this.transcriptEl.textContent=`Error: ${e.error}`,this.stopRecognition()},this.recognition.onend=()=>{this.isActive&&this.recognition.start()}}async startRecognition(){try{await navigator.mediaDevices.getUserMedia({audio:!0}),this.recognition.start(),this.isActive=!0,this.toggleBtn.classList.add("active"),this.transcriptEl.textContent="Listening..."}catch(t){console.error("Microphone access denied:",t),this.transcriptEl.textContent="Microphone access required"}}stopRecognition(){this.recognition.stop(),this.isActive=!1,this.toggleBtn.classList.remove("active"),this.transcriptEl.textContent="Click mic to start"}toggleRecognition(){this.isActive?this.stopRecognition():this.startRecognition()}injectStyles(){const t=document.createElement("style");t.textContent=`
      #meet-speech-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 8px;
        gap: 8px;
        background: rgba(255,255,255,0.9);
        border-radius: 8px;
        margin-left: 10px;
      }
      .transcript {
        max-width: 200px;
        max-height: 60px;
        overflow-y: auto;
        font-size: 12px;
        color: #333;
      }
      .mic-btn {
        background: #1a73e8;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        cursor: pointer;
        color: white;
        font-size: 16px;
      }
      .mic-btn.active {
        background: #d93025;
        animation: pulse 1.5s infinite;
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `,document.head.appendChild(t)}}const l=()=>{if(console.log("Meet Speech Assistant initializing..."),window.location.hostname==="meet.google.com"){const i=setInterval(()=>{document.querySelector('body[aria-label="Google Meet"]')&&(clearInterval(i),new a)},500)}};document.addEventListener("DOMContentLoaded",l);
