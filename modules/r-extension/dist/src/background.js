function n(e){chrome.sidePanel.setOptions({tabId:e,path:"src/sidePanel/sidepanel.html",enabled:!0}),chrome.sidePanel.open({tabId:e})}chrome.action.onClicked.addListener(e=>{e.id&&n(e.id)});
