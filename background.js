chrome.browserAction.onCLicked.addListener(function (tab) {
  //fired when user clicks on extensions icon
  sendMessage();
});

function sendMessage() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, {action: "articleToSpeech"}, function(response) {});
  });
}

