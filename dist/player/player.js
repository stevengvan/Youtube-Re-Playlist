var total = JSON.parse(localStorage.getItem("total")); // total number of videos in playlist
var videosList = JSON.parse(localStorage.getItem("videosList")); // array of Youtube videos
var wakeLock = null;
localStorage.setItem("currentIndex", 0);
localStorage.setItem("currentVideo", 0);
localStorage.setItem("looping", String(false));
localStorage.setItem(
  "playlistOrder",
  JSON.stringify(Array.from({ length: total }, (_, i) => i))
); // array of video indices from videosList

async function activateWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
  } catch (err) {
    // the wake lock request fails - usually system related, such being low on battery
    console.log(`${err.name}, ${err.message}`);
  }
}
activateWakeLock();

document.onvisibilitychange = () => {
  if (wakeLock !== null) wakeLock.release();
};

// Create Youtube player
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    videoId: videosList[0].id,
    playerVars: {
      autoplay: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onErrorState,
    },
  });
  displayList();
  initDragging();
}

// Autoplay video
function onPlayerReady(event) {
  event.target.unMute();
  event.target.playVideo();
}

// When video ends
function onPlayerStateChange(event) {
  let playlistOrder = JSON.parse(localStorage.getItem("playlistOrder"));
  let currentIndex = JSON.parse(localStorage.getItem("currentIndex"));
  let looping = JSON.parse(localStorage.getItem("looping"));
  let currentlyPlaying = JSON.parse(localStorage.getItem("playing"));

  if (event.data == 0) {
    // goto next video queued in playlist
    if (currentIndex + 1 < total) changeVideo(playlistOrder[currentIndex + 1]);
    // loop back to first video if looping is on
    else if (looping) changeVideo(playlistOrder[0]);
    // jump video list to currently playing video
    if (currentlyPlaying) btnPlaying();
  }
}

// When video is unavailable
function onErrorState(event) {
  let playlistOrder = JSON.parse(localStorage.getItem("playlistOrder"));
  let currentIndex = JSON.parse(localStorage.getItem("currentIndex"));
  let looping = JSON.parse(localStorage.getItem("looping"));

  // goto next video queued in playlist
  if (currentIndex + 1 < total) changeVideo(playlistOrder[currentIndex + 1]);
  // loop back to first video if looping is on
  else if (looping) changeVideo(playlistOrder[0]);
  // jump video list to currently playing video
  if (currentlyPlaying) btnPlaying();
}

// Changes title of video being played
function changeTitle() {
  let currentIndex = JSON.parse(localStorage.getItem("currentIndex"));

  const title = document.getElementById("video-title");
  let playlistOrder = JSON.parse(localStorage.getItem("playlistOrder"));
  title.innerHTML = videosList[playlistOrder[currentIndex]].title;
}
