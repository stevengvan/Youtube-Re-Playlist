var total = localStorage.getItem("total");
var currentIndex = 0;
var videosList = JSON.parse(localStorage.getItem("videosList")); // array of Youtube videos
var playlistOrder = Array.from({ length: total }, (_, i) => i); // array of video indices from videosList
var currentVideo = 0;
var draggables = null;
var oldSpot = null;
var onMobile = isMobile();
var looping = false;

function isMobile() {
  const regex =
    /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(navigator.userAgent);
}

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
}

// Autoplay video
function onPlayerReady(event) {
  event.target.unMute();
  event.target.playVideo();
}

// When video ends
function onPlayerStateChange(event) {
  if (event.data == 0) {
    // goto next video queued in playlist
    if (currentIndex + 1 < total) changeVideo(playlistOrder[currentIndex + 1]);
    // loop back to first song if looping is on
    else if (looping) changeVideo(playlistOrder[0]);
  }
}

// When video is unavailable
function onErrorState(event) {
  // goto next video queued in playlist
  if (currentIndex + 1 < total) changeVideo(playlistOrder[currentIndex + 1]);
  // loop back to first song if looping is on
  else if (looping) changeVideo(playlistOrder[0]);
}

// Creates playlist display based on playlist order
function displayList() {
  // wipe old playlist display
  const list = document.getElementById("list");
  list.innerHTML = "";

  // add each video from playlist into playlist display as playlist items
  for (let index = 0; index < playlistOrder.length; ++index) {
    // create new playlist item
    let listItem = document.createElement("button");
    listItem.classList.add("listItem");
    if (localStorage.getItem("isDarkMode") === "true") {
      listItem.classList.add("dark-mode");
    }
    listItem.tabIndex = 0;
    if (!onMobile) {
      listItem.draggable = true;
    }

    // grab Youtube video ID
    let video = videosList[playlistOrder[index]];
    listItem.id = playlistOrder[index];

    // add clickable and keyboard interactive elements to change videos from display
    listItem.onclick = function () {
      changeVideo(playlistOrder[index]);
    };
    listItem.onkeydown = function (event) {
      if (event.key === "Enter") {
        changeVideo(playlistOrder[index]);
      }
    };

    // create video thumbnail
    let image = document.createElement("img");
    image.src = video.thumbnail.url;
    image.alt = `thumbnail of ${video.title}`;
    image.classList = "thumbnail";

    // create video title
    let title = document.createElement("p");
    title.innerText = video.title;

    // create drag button
    let dragBtn = document.createElement("div");
    dragBtn.classList = "dragBtn";
    let dragIcon = document.createElement("img");
    dragIcon.src = "../icons/drag.png";
    dragIcon.alt = `button drag for ${video.title}`;
    dragIcon.classList = "dragIcon";

    if (!onMobile) {
      dragIcon.draggable = false;
      image.draggable = false;
    }

    // add components to video list item
    listItem.appendChild(image);
    listItem.appendChild(title);
    dragBtn.appendChild(dragIcon);
    listItem.appendChild(dragBtn);

    // add draggable functionality
    addDrag(listItem, oldSpot);

    // add playlist item to playlist display
    list.appendChild(listItem);
  }

  document.getElementById(playlistOrder[0]).classList.add("selectedListItem");
  document.getElementById("video-title").textContent =
    videosList[playlistOrder[0]].title;
}

// Changes title of video being played
function changeTitle() {
  const title = document.getElementById("video-title");
  title.innerHTML = videosList[playlistOrder[currentIndex]].title;
}

// Play new video based on where the video in playlist is
function changeVideo(newVideo) {
  if (currentVideo == newVideo) {
    return;
  }

  // unselect video on playlist if being viewed
  const oldVideo = document.getElementById(currentVideo);
  oldVideo.classList.remove("selectedListItem");

  // select new video on playlist
  const listItem = document.getElementById(newVideo);
  listItem.classList.add("selectedListItem");
  currentVideo = newVideo;

  // update where the player is in playlistOrder
  for (var i = 0; i < playlistOrder.length; ++i) {
    if (playlistOrder[i] === newVideo) {
      currentIndex = i;
      break;
    }
  }

  changeTitle();
  player.loadVideoById(videosList[currentVideo].id);
}

// Play video before or after currently playing video
function gotoPrevNext(option) {
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

  currentVideo = playlistOrder[currentIndex];

  // scroll to new video on playlist
  const list = document.getElementById("list");
  if (list.scrollHeight > list.clientHeight) {
    document.getElementById(currentVideo).scrollIntoView();
  }

  // select new video on playlist
  const listItem = document.getElementById(currentVideo);
  listItem.classList.add("selectedListItem");
  changeTitle();
  player.loadVideoById(videosList[currentVideo].id);
}

// Goto currently playing video
function gotoCurrentVideo() {
  const list = document.getElementById("list");
  if (list.scrollHeight > list.clientHeight) {
    document.getElementById(currentVideo).scrollIntoView();
  }
  list.blur();
}

// Randomizes order of playlist
function shufflePlaylist() {
  var newList = [];

  // start randomizing duplicated playlist order
  while (playlistOrder.length > 0) {
    let videoIndex = Math.floor(Math.random() * playlistOrder.length);
    let video = playlistOrder.splice(videoIndex, 1)[0];
    newList.push(video);
  }

  // save and update playlist display
  playlistOrder = newList;
  currentIndex = -1;
  displayList();

  // queue the first video of new playlist order
  changeVideo(playlistOrder[0]);
  document.getElementById("list").scroll(0, 0);
  document.getElementById("shuffle-list").blur();
}

// Switches to original playlist order
function revertPlaylist() {
  playlistOrder = Array.from({ length: total }, (_, i) => i);
  currentIndex = 0;
  displayList();
  changeVideo(playlistOrder[0]);
  document.getElementById("list").scroll(0, 0);
  document.getElementById("revert-list").blur();
}

// Toggles playlist looping
function toggleLoop() {
  looping = !looping;

  const toggleBtn = document.getElementById("toggle-loop");
  if (looping) {
    toggleBtn.classList.add("toggle-btn-on");
    toggleBtn.textContent = "Now Looping";
  } else {
    toggleBtn.classList.remove("toggle-btn-on");
    toggleBtn.textContent = "Not Looping";
  }
}

///////////////////////////////////////
// ---------- Drag events ---------- //
///////////////////////////////////////

function addDrag(listItem, oldSpot) {
  // Drag events for mouse pointers
  if (!isMobile()) {
    listItem.addEventListener("dragstart", () => {
      listItem.classList.add("isDragging");
      draggables = [...document.querySelectorAll(".listItem")];
      oldSpot = draggables.findIndex((element) => element.id === listItem.id);
    });

    listItem.addEventListener("dragend", () => {
      listItem.classList.remove("isDragging");
      draggables = [...document.querySelectorAll(".listItem")];
      newSpot = draggables.findIndex((element) => element.id === listItem.id);

      if (oldSpot === currentIndex) {
        currentIndex = newSpot;
      }

      var element = playlistOrder.splice(oldSpot, 1);
      playlistOrder.splice(newSpot, 0, element[0]);
      oldSpot = null;
    });
  }

  // Touch events for mobile devices //
  else {
    listItem.childNodes[2].addEventListener("touchstart", (e) => {
      listItem.classList.add("isDragging");
      draggables = [...document.querySelectorAll(".listItem")];
      oldSpot = draggables.findIndex((element) => element.id === listItem.id);
    });
    listItem.childNodes[2].addEventListener("touchmove", (e) => {
      e.preventDefault();
    });
    listItem.childNodes[2].addEventListener("touchend", () => {
      listItem.classList.remove("isDragging");
      draggables = [...document.querySelectorAll(".listItem")];
      newSpot = draggables.findIndex((element) => element.id === listItem.id);
      if (oldSpot === currentIndex) {
        currentIndex = newSpot;
      }
      var element = playlistOrder.splice(oldSpot, 1);
      playlistOrder.splice(newSpot, 0, element[0]);
      oldSpot = null;
    });
  }
}

const list = document.getElementById("list");

if (onMobile) {
  list.addEventListener("touchmove", (e) => {
    var location = e.targetTouches[0];
    if (location.pageX <= screen.width - 33) {
      return false;
    }
    const bottomItem = insertAboveItem(list, location.pageY);
    const currItem = document.querySelector(".isDragging");
    if (!bottomItem) {
      list.appendChild(currItem);
    } else {
      list.insertBefore(currItem, bottomItem);
    }
    return true;
  });
} else {
  list.addEventListener("dragover", (e) => {
    e.preventDefault();
    const bottomItem = insertAboveItem(list, e.clientY);
    const currItem = document.querySelector(".isDragging");
    if (!bottomItem) {
      list.appendChild(currItem);
    } else {
      list.insertBefore(currItem, bottomItem);
    }
  });
}

const insertAboveItem = (list, mouseY) => {
  const others = [...list.querySelectorAll(".listItem:not(.isDragging)")];

  return others.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = mouseY - box.top - box.height / 2.6;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
};
