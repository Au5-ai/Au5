export class ChromeStorage {
    name = "Chrome";
    get(keys, area = "local") {
        return new Promise((resolve, reject) => {
            chrome.storage[area].get(keys, result => {
                if (chrome.runtime.lastError)
                    return reject(chrome.runtime.lastError);
                resolve(result);
            });
        });
    }
    set(items, area = "local") {
        return new Promise((resolve, reject) => {
            chrome.storage[area].set(items, () => {
                if (chrome.runtime.lastError)
                    return reject(chrome.runtime.lastError);
                resolve();
            });
        });
    }
    remove(keys, area = "local") {
        return new Promise((resolve, reject) => {
            chrome.storage[area].remove(keys, () => {
                if (chrome.runtime.lastError)
                    return reject(chrome.runtime.lastError);
                resolve();
            });
        });
    }
    /**
     * Injects a local script from the extension into the DOM.
     *
     * @param fileName - The filename of the script in the extension
     * @param onLoad - Optional callback executed after the script is loaded
     */
    inject(fileName, onLoad = () => { }) {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL(fileName);
        script.type = "text/javascript";
        script.onload = onLoad;
        (document.head || document.documentElement).appendChild(script);
    }
}
