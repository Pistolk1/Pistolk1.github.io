let currentVideoIndex = 0; // Track the current video index
let videoData = [];
let ratedVideos = new Set(); // Store rated videos to avoid repetition

const videoPlayer = document.getElementById("videoPlayer");
const starRating = document.getElementById("starRating");
const videoList = document.getElementById("videoList");

// Fetch video data from config.json
fetch('data/config.json')
  .then(response => response.json())
  .then(data => {
    videoData = data.videos; // Assign fetched video data
    loadVideo(currentVideoIndex); // Load the first video
  })
  .catch(error => console.error('Error fetching video data:', error));

// Load the video based on the current index
function loadVideo(index) {
  if (index < videoData.length) {
    videoPlayer.src = videoData[index].src;
    videoPlayer.load();
    videoPlayer.play();
    videoPlayer.requestFullscreen(); // Request fullscreen on video play
  } else {
    // If all videos have been rated, reset to start
    currentVideoIndex = 0;
    loadVideo(currentVideoIndex);
  }
}

// Handle video ended event
videoPlayer.addEventListener("ended", () => {
  showRecommendations();
});

// Handle star rating click
starRating.addEventListener("click", (event) => {
  const star = event.target;
  if (star.classList.contains('star')) {
    const rating = parseInt(star.getAttribute('data-value'));
    ratedVideos.add(currentVideoIndex); // Mark video as rated

    // Update UI with selected star rating
    updateStarRating(rating);

    // Load the next video
    currentVideoIndex++;
    loadVideo(currentVideoIndex);
  }
});

// Function to update star rating UI
function updateStarRating(rating) {
  const stars = starRating.querySelectorAll('.star');
  stars.forEach((star) => {
    if (parseInt(star.getAttribute('data-value')) <= rating) {
      star.classList.add('selected');
    } else {
      star.classList.remove('selected');
    }
  });
}

// Show recommendations based on current ratings (placeholder logic)
function showRecommendations() {
  videoList.innerHTML = ""; // Clear the current list
  const recommendedVideos = videoData.filter((_, index) => !ratedVideos.has(index));
  
  recommendedVideos.forEach((video, index) => {
    const li = document.createElement("li");
    li.textContent = video.title;
    li.onclick = () => {
      currentVideoIndex = videoData.indexOf(video);
      ratedVideos.add(currentVideoIndex); // Mark as rated
      loadVideo(currentVideoIndex);
      videoList.innerHTML = ""; // Clear recommendations
    };
    videoList.appendChild(li);
  });

  // If no recommendations left
  if (recommendedVideos.length === 0) {
    videoList.innerHTML = "<li>No more videos available.</li>";
  }
}
