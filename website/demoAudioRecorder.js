/* eslint-env browser */
var recorder = null

let audioPlay = true

// This example uses MediaRecorder to record from a live audio stream,
// and uses the resulting blob as a source for an audio element.
//
// The relevant functions in use are:
//
// navigator.mediaDevices.getUserMedia -> to get audio stream from microphone
// MediaRecorder (constructor) -> create MediaRecorder instance for a stream
// MediaRecorder.ondataavailable -> event to listen to when the recording is ready
// MediaRecorder.start -> start recording
// MediaRecorder.stop -> stop recording (this will generate a blob of data)
// URL.createObjectURL -> to create a URL from a blob, which we can use as audio src


function audioRecorder(stream) {

    recorder = new MediaRecorder(stream)

    // listen to dataavailable,
    // which gets triggered whenever we have
    // an audio blob available
    recorder.addEventListener('dataavailable', onRecordingReady)

}


function onRecordingReady(e) {

    //
    // listen recording (audio play)
    // just if speech is not aborted
    //
    console.log("onRecordingReady")
    if (audioPlay) {
        suspendRecording()
        let input = document.querySelector('#status')
        input.textContent = "Server is processing your request..."
        fetch(window.location.origin + "/asr", {method: 'POST', body: e.data}).then(response => {
            response.json().then(parsedJson => {
                let input = document.querySelector('.words')
                input.innerHTML += parsedJson['result'] + "<br>";
                resumeRecording();
                let status = document.querySelector('#status')
                status.textContent = "Finish, resume recording..."
            })
        });

    }

}


function startRecording() {
    recorder.start()
    console.log("start")
}


function stopRecording() {
    // Stopping the recorder will eventually trigger the `dataavailable` event and we can complete the recording process
    recorder.stop()
    audioPlay = true
    console.log("stop")
}


/**
 * restartRecording
 *
 * abort and start
 */
function restartRecording() {

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/state
    //console.log('recorder ' +  recorder.state )

    // need otherwise I get on Chrome the error:
    // Failed to execute 'stop' on 'MediaRecorder': The MediaRecorder's state is 'inactive'.
    if (recorder.state != 'inactive')
        recorder.stop()

    audioPlay = false
    recorder.start()

}

function abortRecording() {
    // Stopping the recorder will eventually trigger the `dataavailable` event and we can complete the recording process
    recorder.stop()
    audioPlay = false
}


// to suspend recording when the system play audio with a loudspeaker, avoiding feedback
function suspendRecording() {
    DEFAULT_PARAMETERS_CONFIGURATION.recordingEnabled = false
}


function resumeRecording() {
    DEFAULT_PARAMETERS_CONFIGURATION.recordingEnabled = true
}


