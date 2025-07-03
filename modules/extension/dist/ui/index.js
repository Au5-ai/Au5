import { ConfigurationManager } from "../core/configurationManager";
import { MeetingPlatformFactory } from "../core/platforms/meetingPlatformFactory";
import { ChatPanel } from "./chatPanel";
import { UIHandlers } from "./uiHandlers";
const configurationManager = new ConfigurationManager();
const chatPanel = new ChatPanel();
let platform = null;
let config;
/**
 * Gets the current URL from the browser tab or window.
 */
async function getCurrentUrl() {
    if (typeof chrome !== "undefined" && chrome.tabs) {
        return new Promise(resolve => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                resolve(tabs[0]?.url || window.location.href);
            });
        });
    }
    return window.location.href;
}
/**
 * Initializes platform and config, and shows relevant panel.
 */
async function initializeChatPanel() {
    const url = await getCurrentUrl();
    platform = new MeetingPlatformFactory(url).getPlatform();
    try {
        const local_config = await configurationManager.getConfig();
        if (local_config == null || local_config == undefined) {
            chatPanel.showUserUnAuthorizedContainer();
            return;
        }
        config = local_config;
    }
    catch (error) {
        chatPanel.showUserUnAuthorizedContainer();
        return;
    }
    chatPanel.setDirection(config.service.direction);
    if (!platform) {
        chatPanel.showNoActiveMeetingContainer(url);
    }
    else {
        chatPanel.showJoinMeetingContainer(url);
    }
}
/**
 * Initialize everything on DOM ready.
 */
document.addEventListener("DOMContentLoaded", async () => {
    await initializeChatPanel();
    // Initialize UI handlers with the configuration, platform, and chat panel
    if (config && chatPanel) {
        new UIHandlers(config, chatPanel).init();
    }
});
