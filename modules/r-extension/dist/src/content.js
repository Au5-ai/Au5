console.log("Au5 Extension content script loaded");function i(){if(document.getElementById("au5-extension-injected"))return;const e=document.createElement("div");e.id="au5-extension-injected",e.style.display="none",document.body.appendChild(e);const n=document.createElement("link");n.rel="stylesheet",n.href=chrome.runtime.getURL("src/content.css"),document.head.appendChild(n),console.log("Au5 Extension content script initialized")}chrome.runtime.onMessage.addListener((e,n,t)=>{switch(console.log("Content script received message:",e),e.type){case"GET_PAGE_INFO":t({success:!0,data:{url:window.location.href,title:document.title,domain:window.location.hostname}});break;case"INJECT_UI":c(),t({success:!0});break;case"REMOVE_UI":o(),t({success:!0});break;default:t({success:!1,error:"Unknown message type"})}});function c(){o();const e=document.createElement("div");e.id="au5-extension-ui",e.className="au5-extension-container",e.innerHTML=`
    <div class="au5-extension-panel">
      <div class="au5-extension-header">
        <span>Au5 Extension</span>
        <button id="au5-close-btn" class="au5-close-btn">×</button>
      </div>
      <div class="au5-extension-content">
        <p>Extension loaded successfully!</p>
        <p>Page: ${document.title}</p>
      </div>
    </div>
  `,document.body.appendChild(e);const n=document.getElementById("au5-close-btn");n&&n.addEventListener("click",o)}function o(){const e=document.getElementById("au5-extension-ui");e&&e.remove()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",i):i();
