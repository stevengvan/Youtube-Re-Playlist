var total = JSON.parse(localStorage.getItem("total")); // total number of videos in playlist
var videosList = JSON.parse(localStorage.getItem("videosList")); // array of Youtube videos

document.onvisibilitychange = () => {
  if (document.visibilityState === "hidden") {
    localStorage.removeItem("looping");
    localStorage.removeItem("playing");
  }
};

// Play video before or after currently playing video
function btnPrevNext(option) {
  let playlistOrder = JSON.parse(localStorage.getItem("playlistOrder"));
  let currentIndex = JSON.parse(localStorage.getItem("currentIndex"));
  let currentVideo = JSON.parse(localStorage.getItem("currentVideo"));
  let looping = JSON.parse(localStorage.getItem("looping"));

  // Either viewing first video of playlist or not watching anything
  if (currentIndex === total - 1 && option === "next" && looping) {
    currentIndex = -1;
  } else if (
    (currentIndex === 0 && option === "previous") ||
    (currentIndex === total - 1 && option === "next")
  ) {
    return;
  }

  // unselect currently playing video on playlist
  const oldVideo = document.getElementById(currentVideo);
  oldVideo.classList.remove("selectedListItem");

  switch (option) {
    case "previous":
      document.getElementById("prev-video").blur();
      currentIndex -= 1;
      break;
    case "next":
      document.getElementById("next-video").blur();
      currentIndex += 1;
      break;
  }

  // scroll to new video on playlist
  const newVideo = playlistOrder[currentIndex];
  const list = document.getElementById("list");
  if (list.scrollHeight > list.clientHeight) {
    document.getElementById(newVideo).scrollIntoView();
  }

  // select new video on playlist
  const listItem = document.getElementById(newVideo);
  listItem.classList.add("selectedListItem");
  player.loadVideoById(videosList[newVideo].id);

  localStorage.setItem("currentVideo", newVideo);
  localStorage.setItem("currentIndex", currentIndex);
  changeTitle();
}

// Jumps playlist scroll to currently playing video
function btnPlaying(set_toggle = false) {
  if (set_toggle === true) {
    // store new toggle setting in local storage
    if (localStorage.getItem("playing") === null) {
      localStorage.setItem("playing", "true");
      document.getElementById("toggle-playing").classList.add("toggle-btn-on");
    }
    // toggle currently playing setting
    else {
      let toggle = JSON.parse(localStorage.getItem("playing"));
      localStorage.setItem("playing", JSON.stringify(!toggle));
    }
  }

  // add visual for toggle changes
  let toggle = JSON.parse(localStorage.getItem("playing"));
  if (toggle) {
    document.getElementById("toggle-playing").classList.add("toggle-btn-on");
    let currentVideo = JSON.parse(localStorage.getItem("currentVideo"));
    const list = document.getElementById("list");
    if (list.scrollHeight > list.clientHeight) {
      document.getElementById(currentVideo).scrollIntoView();
    }
    list.blur();
  } else
    document.getElementById("toggle-playing").classList.remove("toggle-btn-on");
}

// Randomizes order of playlist
function btnShuffle() {
  let playlistOrder = JSON.parse(localStorage.getItem("playlistOrder"));
  var newList = [];

  // start randomizing duplicated playlist order
  while (playlistOrder.length > 0) {
    let videoIndex = Math.floor(Math.random() * playlistOrder.length);
    let video = playlistOrder.splice(videoIndex, 1)[0];
    newList.push(video);
  }

  // queue the first video of new playlist order
  document.getElementById("list").scroll(0, 0);
  document.getElementById("shuffle-list").blur();

  localStorage.setItem("currentIndex", -1);
  localStorage.setItem("playlistOrder", JSON.stringify(newList));
  displayList();
  changeVideo(newList[0]);
}

// Reverts playlist order to original ordering
function btnRevert() {
  const newPlaylistOrder = Array.from({ length: total }, (_, i) => i);
  changeVideo(newPlaylistOrder[0]);
  document.getElementById("list").scroll(0, 0);
  document.getElementById("revert-list").blur();

  localStorage.setItem("currentIndex", 0);
  localStorage.setItem("playlistOrder", JSON.stringify(newPlaylistOrder));
  displayList();
}

// Toggles playlist looping
function btnLoop() {
  let looping = JSON.parse(localStorage.getItem("looping"));

  const toggleBtn = document.getElementById("toggle-loop");
  if (!looping) toggleBtn.classList.add("toggle-btn-on");
  else toggleBtn.classList.remove("toggle-btn-on");
  looping = !looping;
  localStorage.setItem("looping", String(looping));
}

// Goes back to home page
function btnMenu() {
  location.href = "index/index.html";
}
