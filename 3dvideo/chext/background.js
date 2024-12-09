chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "saveRecording") {
      processRecording(request.blob);
    }
  });
  
  async function processRecording(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
  
    // Pass recorded data to FFmpeg for processing
    const ffmpeg = new FFmpeg(); // Assumes FFmpeg.js is loaded
    ffmpeg.FS("writeFile", "video.webm", uint8Array);
    await ffmpeg.run("-i", "video.webm", "-c:v", "libx264", "output.mp4");
  
    const data = ffmpeg.FS("readFile", "output.mp4");
    const videoBlob = new Blob([data.buffer], { type: "video/mp4" });
  
    chrome.runtime.sendMessage({ action: "downloadVideo", blob: videoBlob });
  }
  