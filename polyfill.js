var polyfills = {
  speechUtteranceChunker: function (utt, settings, callback) {

    settings = settings || {};
    var newUtt;
    var voices;
    var utt_i;
    var txt = (settings && settings.offset !== undefined ? utt.text.substring(settings.offset) : utt.text);
    if (utt.voice && utt.voice.voiceURI === 'native') { // Not part of the spec
      newUtt = utt;

      newUtt.text = txt;
      newUtt.addEventListener('end', function () {
        if (polyfills.speechUtteranceChunker.cancel) {
          polyfills.speechUtteranceChunker.cancel = false;
        }
        if (callback !== undefined) {
          callback();
        }
      });
    }
    else {
      var chunkLength = (settings && settings.chunkLength) || 160;
      var pattRegex = new RegExp('^[\\s\\S]{' + Math.floor(chunkLength / 2) + ',' + chunkLength + '}[.!?,]{1}|^[\\s\\S]{1,' + chunkLength + '}$|^[\\s\\S]{1,' + chunkLength + '} ');
      var chunkArr = txt.match(pattRegex);

      if (chunkArr[0] === undefined || chunkArr[0].length <= 2) {
        //call once all text has been spoken...
        if (callback !== undefined) {
          callback();
        }
        return;
      }
      var chunk = chunkArr[0];
      newUtt = new SpeechSynthesisUtterance(chunk);
      voices = window.speechSynthesis.getVoices();
      newUtt.voice = voices.filter(function(voice) { return voice.name == 'Google US English Male'; })[0];
      newUtt.voiceURI = 'Google US English';
      newUtt.lang = 'en-US';

      for (utt_i in utt) {
        if (utt.hasOwnProperty(utt_i) && utt_i !== 'text') {
          newUtt[utt_i] = utt[utt_i];
        }
      }
      newUtt.addEventListener('end', function () {
        if (polyfills.speechUtteranceChunker.cancel) {
          polyfills.speechUtteranceChunker.cancel = false;
          return;
        }
        settings.offset = settings.offset || 0;
        settings.offset += chunk.length - 1;
        polyfills.speechUtteranceChunker(utt, settings, callback);
      });
    }

    if (settings.modifier) {
      settings.modifier(newUtt);
    }
	
    console.log(newUtt); // leave this
	setTimeout(function () {
      //force US english. Otherwise, speech quality would suffer for English webpages.
      //newUtt.voice = speechSynthesis.getVoices().filter(function(val) {
      //  return val.
      //});
      speechSynthesis.speak(newUtt);
    }, 0);

  }

};