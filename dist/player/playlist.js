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
    let dragBtn = document.createElement("button");
    dragBtn.classList = "dragBtn";
    let dragIcon = document.createElement("img");
    dragIcon.src = "../icons/drag-svgrepo-com.svg";
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

  // select first video in playlist
  document.getElementById(playlistOrder[0]).classList.add("selectedListItem");
  document.getElementById("video-title").textContent =
    videosList[playlistOrder[0]].title;
}

// Drag functionality for videos in playlist
function addDrag(listItem) {
  if (!isMobile()) {
    // video first being dragged
    listItem.addEventListener("dragstart", () => {
      listItem.classList.add("isDragging");
      draggables = [...document.querySelectorAll(".listItem")];
      oldSpot = draggables.findIndex((element) => element.id === listItem.id);
    });

    // video dragging ended
    listItem.addEventListener("dragend", () => {
      let currentIndex = JSON.parse(localStorage.getItem("currentIndex"));
      listItem.classList.remove("isDragging");
      draggables = [...document.querySelectorAll(".listItem")];

      // find where the video dragged landed
      let newSpot = draggables.findIndex(
        (element) => element.id === listItem.id
      );

      // dragged video is the current video being played
      if (oldSpot === currentIndex) {
        localStorage.setItem("currentIndex", newSpot);
      }

      // set the dragged video to the new location in the playlist
      let playlistOrder = JSON.parse(localStorage.getItem("playlistOrder"));
      var element = playlistOrder.splice(oldSpot, 1);
      playlistOrder.splice(newSpot, 0, element[0]);
      localStorage.setItem("playlistOrder", JSON.stringify(playlistOrder));
      oldSpot = null;
    });
  } else {
    let ghostElement = null;
    let listRect;

    // video is being held by touch
    listItem.childNodes[2].addEventListener("touchstart", (e) => {
      // prevent long-press popup only on the drag button
      e.preventDefault();

      listRect = document.getElementById("list").getBoundingClientRect();

      // create ghost element
      ghostElement = listItem.cloneNode(true);
      ghostElement.style.width = `${listRect.width}px`;
      ghostElement.classList.add("ghost-item");

      // position ghost element at initial touch position
      ghostElement.style.top = `${
        e.touches[0].clientY - listItem.offsetHeight / 2
      }px`;
      ghostElement.style.left = `${listRect.left}px`;
      document.body.appendChild(ghostElement);

      // make original semi-transparent
      listItem.classList.add("isDragging");
      draggables = [...document.querySelectorAll(".listItem")];
      oldSpot = draggables.findIndex((element) => element.id === listItem.id);
    });

    // prevent context menu on the drag button
    listItem.childNodes[2].addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    // video is being dragged
    listItem.childNodes[2].addEventListener("touchmove", (e) => {
      e.preventDefault();

      // track the creatd ghost element to finger
      if (ghostElement) {
        ghostElement.style.top = `${
          e.touches[0].clientY - ghostElement.offsetHeight / 2
        }px`;
        ghostElement.style.left = `${listRect.left}px`;
      }
    });

    // dragged video is let go
    listItem.childNodes[2].addEventListener("touchend", () => {
      if (ghostElement) {
        ghostElement.remove();
        ghostElement = null;
      }

      listItem.style.transform = "";
      listItem.style.zIndex = "";
      listItem.style.opacity = "1";
      listItem.classList.remove("isDragging");

      // update playlist order
      let currentIndex = JSON.parse(localStorage.getItem("currentIndex"));
      draggables = [...document.querySelectorAll(".listItem")];
      let newSpot = draggables.findIndex(
        (element) => element.id === listItem.id
      );

      // dragged video is the video currently being played
      if (oldSpot === currentIndex) {
        localStorage.setItem("currentIndex", newSpot);
      }

      // update playlist order
      let playlistOrder = JSON.parse(localStorage.getItem("playlistOrder"));
      var element = playlistOrder.splice(oldSpot, 1);
      playlistOrder.splice(newSpot, 0, element[0]);
      localStorage.setItem("playlistOrder", JSON.stringify(playlistOrder));
      oldSpot = null;
    });
  }
}

// Initialize dragging functionality within the playlist container (used in player.js)
function initDragging() {
  const list = document.getElementById("list");

  if (onMobile) {
    // a video is being dragged in playlist
    list.addEventListener("touchmove", (e) => {
      const touch = e.touches[0];
      const currItem = document.querySelector(".isDragging");
      if (!currItem) return;

      const bottomItem = insertAboveItem(list, touch.clientY);

      // makes sure to not move down the playlist any further
      if (!bottomItem) {
        list.appendChild(currItem);
      } else {
        list.insertBefore(currItem, bottomItem);
      }

      // render the video moving
      requestAnimationFrame(() => {
        if (currItem.classList.contains("isDragging")) {
          currItem.style.transform = `translateY(${dragOffset}px)`;
          currItem.style.zIndex = "1000";
        }
      });
    });
  } else {
    // a video is being dragged in playlist
    list.addEventListener("dragover", (e) => {
      e.preventDefault();
      const currItem = document.querySelector(".isDragging");
      const bottomItem = insertAboveItem(list, e.clientY);

      // makes sure to not move down the playlist any further
      if (!bottomItem) {
        list.appendChild(currItem);
      } else {
        list.insertBefore(currItem, bottomItem);
      }
    });
  }
}

// Helper function to render moving a video over another video
function insertAboveItem(list, mouseY) {
  const others = [...list.querySelectorAll(".listItem:not(.isDragging)")];

  // add transition around video being passed through
  others.forEach((item) => {
    if (!item.style.transition) {
      item.style.transition = "transform 0.2s ease";
    }
  });

  // range of how far a dragging video must pass through another to rearrange order
  return others.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = mouseY - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}
