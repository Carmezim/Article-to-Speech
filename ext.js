//Copyright © 2016 Adriano Carmezim Filho. All rights reserved.
// Proprietary License.
// email: carmezim.filho@gmail.com

var articleToSpeech = {
  data: {
    Article: "",
    speechInProgress: false,
    fallbackAudio: null
  },


  initialize: function() {
    if (!articleToSpeech.hasArticle()) {
      return;
    }
    if (!articleToSpeech.speechSynth()) {
      articleToSpeech.speechApi();
    }
  },


  hasArticle: function() {
    // Parse article content to array
    this.data.Article = window.document.getElementsByClassName("story-body-text");

    var textArr = this.data.Article;
    var articleContentArray = [];
    var articleText;

      // Apparently javascript does not consider textArr a real array hence
      // the need for pushing the content to a valid array to further concatenate it with join()
      for ( var i = 0; i < textArr.length; i++ ) {
        articleContentArray.push(textArr[i].textContent);
      }
      articleText = articleContentArray.join(' ');
      this.data.Article = articleText.toString();

    return this.data.Article;
  },


  speechSynth: function() {
    // if chrome speechSynthesis supported
    if (window.speechSynthesis) {
      // check for ongoing speech
      if (this.data.speechInProgress) {
        polyfills.speechUtteranceChunker.cancel = true;
      }

      this.data.speechInProgress = true;
        var msg = new SpeechSynthesisUtterance(this.data.Article);
        //speechSynthesis.speak(msg);

        // Chrome speechSynthesis API has a character limit bug
        // where it will abruptly stop the speech after 300 characters
        // This polyfill will divide the content in chunks of 160 chars maximum.

        polyfills.speechUtteranceChunker(msg, {
          chunkLength: 140
        },function() {
          //speech has finished
          articleToSpeech.data.speechInProgress = false;
        });
      return true;
    }
    return false;
  },

  // configuring keyboard keys set to "Shift + T", that will fire the speech once in the article page.
  shortcutKeys: function() {
    var activeKeys = [];
    onkeydown = onkeyup = function(evt) {
      var e = evt || event;
      activeKeys[e.keyCode] = e.type == 'keydown';
      if (activeKeys[16] && activeKeys[84]) {
        articleToSpeech.initialize();
      }
    };
  }
};


chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {

  if (msg.action == 'articleToSpeech') {
    articleToSpeech.initialize();
  }
});

articleToSpeech.shortcutKeys();
