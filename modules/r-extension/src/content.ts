// Content script for Au5 Chrome Extension

console.log("Au5 Extension content script loaded");

// Initialize content script
function initializeContentScript() {
  // Check if already initialized
  if (document.getElementById("au5-extension-injected")) {
    return;
  }

  // Mark as initialized
  const marker = document.createElement("div");
  marker.id = "au5-extension-injected";
  marker.style.display = "none";
  document.body.appendChild(marker);

  // Load extension styles
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("src/content.css");
  document.head.appendChild(link);

  console.log("Au5 Extension content script initialized");
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);

  switch (message.type) {
    case "GET_PAGE_INFO":
      sendResponse({
        success: true,
        data: {
          url: window.location.href,
          title: document.title,
          domain: window.location.hostname,
        },
      });
      break;

    case "INJECT_UI":
      injectExtensionUI();
      sendResponse({ success: true });
      break;

    case "REMOVE_UI":
      removeExtensionUI();
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ success: false, error: "Unknown message type" });
  }
});

// Inject extension UI
function injectExtensionUI() {
  // Remove existing UI first
  removeExtensionUI();

  // Create main container
  const container = document.createElement("div");
  container.id = "au5-extension-ui";
  container.className = "au5-extension-container";

  // Add basic UI
  container.innerHTML = `
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
  `;

  // Add to page
  document.body.appendChild(container);

  // Add close handler
  const closeBtn = document.getElementById("au5-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", removeExtensionUI);
  }
}

// Remove extension UI
function removeExtensionUI() {
  const existing = document.getElementById("au5-extension-ui");
  if (existing) {
    existing.remove();
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeContentScript);
} else {
  initializeContentScript();
}

export {};
