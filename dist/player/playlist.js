var draggables = null; //list of draggable elements in playlist section
var oldSpot = null; //previous index of video being dragged in playlist
var onMobile = isMobile(); //indicates whether user is on mobile device
var videosList = JSON.parse(localStorage.getItem("videosList")); // array of Youtube videos

function isMobile() {
  const regex =
    /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(navigator.userAgent);
}

// Play new video based on where the video in playlist is
function changeVideo(newVideo) {
  let currentVideo = JSON.parse(localStorage.getItem("currentVideo"));

  if (currentVideo == newVideo) {
    return;
  }

  // unselect video on playlist if being viewed
  const oldVideo = document.getElementById(currentVideo);
  oldVideo.classList.remove("selectedListItem");

  // select new video on playlist
  const listItem = document.getElementById(newVideo);
  listItem.classList.add("selectedListItem");

  // update where the player is in playlistOrder
  let playlistOrder = JSON.parse(localStorage.getItem("playlistOrder"));
  for (var i = 0; i < playlistOrder.length; ++i) {
    if (playlistOrder[i] === newVideo) {
      localStorage.setItem("currentIndex", i);
      break;
    }
  }

  localStorage.setItem("currentVideo", newVideo);
  changeTitle();
  player.loadVideoById(videosList[newVideo].id);
}

// Creates playlist display based on playlist order
function displayList() {
  let playlistOrder = JSON.parse(localStorage.getItem("playlistOrder"));

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
    addDrag(listItem);

    // add playlist item to playlist display
    list.appendChild(listItem);
  }

  document.getElementById(playlistOrder[0]).classList.add("selectedListItem");
  document.getElementById("video-title").textContent =
    videosList[playlistOrder[0]].title;
}

function addDrag(listItem) {
  // Drag events for mouse pointers
  if (!isMobile()) {
    listItem.addEventListener("dragstart", () => {
      listItem.classList.add("isDragging");
      draggables = [...document.querySelectorAll(".listItem")];
      oldSpot = draggables.findIndex((element) => element.id === listItem.id);
    });

    listItem.addEventListener("dragend", () => {
      let currentIndex = JSON.parse(localStorage.getItem("currentIndex"));
      listItem.classList.remove("isDragging");
      draggables = [...document.querySelectorAll(".listItem")];
      let newSpot = draggables.findIndex(
        (element) => element.id === listItem.id
      );

      if (oldSpot === currentIndex) {
        localStorage.setItem("currentIndex", newSpot);
      }

      let playlistOrder = JSON.parse(localStorage.getItem("playlistOrder"));
      var element = playlistOrder.splice(oldSpot, 1);
      playlistOrder.splice(newSpot, 0, element[0]);
      localStorage.setItem("playlistOrder", JSON.stringify(playlistOrder));
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
      let currentIndex = JSON.parse(localStorage.getItem("currentIndex"));
      listItem.classList.remove("isDragging");
      draggables = [...document.querySelectorAll(".listItem")];
      let newSpot = draggables.findIndex(
        (element) => element.id === listItem.id
      );

      if (oldSpot === currentIndex) {
        localStorage.setItem("currentIndex", newSpot);
      }

      let playlistOrder = JSON.parse(localStorage.getItem("playlistOrder"));
      var element = playlistOrder.splice(oldSpot, 1);
      playlistOrder.splice(newSpot, 0, element[0]);
      localStorage.setItem("playlistOrder", JSON.stringify(playlistOrder));
      oldSpot = null;
    });
  }
}

function initDragging() {
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
}

function insertAboveItem(list, mouseY) {
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
}
