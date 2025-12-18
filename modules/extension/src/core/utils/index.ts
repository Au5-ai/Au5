export async function getCurrentUrl(): Promise<string> {
  if (typeof chrome !== "undefined" && chrome.tabs) {
    return new Promise(resolve => {
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        resolve(tabs[0]?.url || window.location.href);
      });
    });
  }

  return window.location.href;
}

export function showToast(message: string, duration: number = 4500): void {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  container.insertBefore(toast, container.firstChild);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
