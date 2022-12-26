// window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//
// const recognition = new SpeechRecognition();
// recognition.interimResults = true;
// recognition.lang = 'en-US';
//
// let p = document.createElement('p');
// const words = document.querySelector('.words');
// words.appendChild(p);
//
// recognition.addEventListener('result', e => {
//     const transcript = Array.from(e.results)
//         .map(result => result[0])
//         .map(result => result.transcript)
//         .join('');
//
//     const poopScript = transcript.replace(/poop|poo|shit|dump/gi, '💩');
//     p.textContent = poopScript;
//     console.log(p.textContent)
//     if (e.results[0].isFinal) {
//         p = document.createElement('p');
//         words.appendChild(p);
//     }
// });
//
// recognition.addEventListener('end', recognition.start);
//
// recognition.start();

// grab our canvas
//canvasContext = document.getElementById( 'meter' ).getContext('2d');

// monkeypatch Web Audio
window.AudioContext = window.AudioContext || window.webkitAudioContext;

// grab an audio context
audioContext = new AudioContext();

document.querySelector('.words').addEventListener('click', function () {
    document.querySelector('.words').textContent = '';
    audioContext.resume().then(() => {
        console.log('User interacted with the page. Playback resumed successfully')
    })

})
// Attempt to get audio input
try {
    // monkeypatch getUserMedia
    if (!navigator.webkitGetUserMedia && !navigator.mozGetUserMedia && !navigator.mediaDevices.getUserMedia) {
        alert('WebRTC is not available in your browser.');
    }
    // navigator.getUserMedia =
    //     navigator.mediaDevices.getUserMedia ||
    //     navigator.webkitGetUserMedia ||
    //     navigator.mozGetUserMedia;

    // ask for an audio input
    navigator.mediaDevices.getUserMedia(
        {
            'audio': {
                'mandatory': {
                    'googEchoCancellation': 'true',
                    'googAutoGainControl': 'true',
                    'googNoiseSuppression': 'true',
                    'googHighpassFilter': 'true'
                },
                'optional': []
            },
        }).then(audioStream)
        .catch(didntGetStream);
} catch (e) {
    alert('getUserMedia threw exception :' + e);
}

function didntGetStream() {
    alert('Stream generation failed.');
}