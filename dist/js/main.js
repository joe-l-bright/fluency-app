var dmp = new diff_match_patch();
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;

var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

recognition.onstart = function () {
    recognizing = true;
};

recognition.onerror = function (event) {
    if (event.error == 'no-speech') {
        ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
        ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
        ignore_onend = true;
    }
};

recognition.onend = function () {
    recognizing = false;
    if (ignore_onend) {
        return;
    }
    if (!final_transcript) {
        return;
    }

    if (window.getSelection) {
        window.getSelection().removeAllRanges();
        var range = document.createRange();
        range.selectNode(document.getElementById('final_span'));
        window.getSelection().addRange(range);
    }
};

recognition.onresult = function (event) {
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
        } else {
            interim_transcript += event.results[i][0].transcript;
        }
    }
    final_span.innerHTML = linebreak(final_transcript);
    interim_span.innerHTML = linebreak(interim_transcript);
};

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

function startButton(event) {
    if (recognizing) {
        recognition.stop();
        return;
    }
    final_transcript = '';
    recognition.lang = 'en';
    recognition.start();
    ignore_onend = false;
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
    start_timestamp = event.timeStamp;
}

function launch() {
    recognition.stop();
    var text1 = document.getElementById('text1').value;
    var text2 = document.getElementById('final_span').value;
    console.log(text1);
    console.log(text2);
    dmp.Diff_Timeout = 0;
    dmp.Diff_EditCost = 4;

    var ms_start = (new Date()).getTime();
    var d = dmp.diff_main(text1.toLowerCase(), text2.toLowerCase());
    var ms_end = (new Date()).getTime();

    dmp.diff_cleanupEfficiency(d);
    var ds = dmp.diff_prettyHtml(d);
    document.getElementById('outputdiv').innerHTML = ds + '<BR>Time: ' + (ms_end - ms_start) / 1000 + 's';
}
