let mediaRecorder;
let recordedChunks = [];
let stream;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startRecording") {
    startRecording();
  } else if (request.action === "stopRecording") {
    stopRecording();
  }
});

async function startRecording() {
  try {
    // Capture the user's screen (requires "desktopCapture" permission)
    stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    recordedChunks = [];

    mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    mediaRecorder.start();

    console.log("Recording started.");
  } catch (err) {
    console.error("Error starting screen capture:", err);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    stream.getTracks().forEach((track) => track.stop());

    console.log("Recording stopped.");

    // Send recorded chunks back to the extension for processing
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    chrome.runtime.sendMessage({ action: "saveRecording", blob });
  }
}
