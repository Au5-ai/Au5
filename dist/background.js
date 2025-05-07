chrome.runtime.onMessage.addListener((e,c,s)=>{console.log("Received message:",e),s({success:!0})});
