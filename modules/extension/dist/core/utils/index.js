export async function getCurrentUrl() {
    if (typeof chrome !== "undefined" && chrome.tabs) {
        return new Promise(resolve => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                resolve(tabs[0]?.url || window.location.href);
            });
        });
    }
    return window.location.href;
}
