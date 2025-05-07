chrome.runtime.onMessage.addListener((e,s,c)=>{console.log("Received message:",e,s),c({success:!0})});
