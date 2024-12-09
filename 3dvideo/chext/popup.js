document.getElementById("exportVideo").addEventListener("click", async () => {
    chrome.runtime.sendMessage({ action: "exportVideo" });
  });
  
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "downloadVideo") {
      const url = URL.createObjectURL(request.blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "volumetric-video.mp4";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      console.log("Video downloaded successfully.");
    }
  });
  