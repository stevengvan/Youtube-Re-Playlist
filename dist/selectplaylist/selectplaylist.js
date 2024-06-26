var playlists = [];
var access_token = localStorage.getItem("accessToken");
if (!access_token) {
  var queryStrings = window.location.hash
    .substring(1)
    .split("&")
    .reduce(function (obj, str, index) {
      let parts = str.split("=");
      if (parts[0] && parts[1]) {
        obj[parts[0].replace(/\s+/g, "")] = parts[1].trim();
      }
      return obj;
    }, {});
  access_token = queryStrings["access_token"];
  localStorage.setItem("accessToken", access_token);
  const milliseconds = Number(queryStrings["expires_in"]) * 1000;
  const expiration = new Date(new Date().getTime() + milliseconds);
  localStorage.setItem("expiresIn", JSON.stringify(expiration));
}

const fetchPlaylists = async () => {
  const response = await fetch(
    `../../.netlify/functions/fetchPlaylists?access_token=${access_token}`
  );
  const data = await response.json();
  playlists = [...data.playlists];
};

function displayPlaylists() {
  const list = document.getElementById("playlists-list");

  for (let i in playlists) {
    let container = document.createElement("button");
    container.classList.add("playlist-container");
    if (localStorage.getItem("isDarkMode") === "true") {
      container.classList.add("dark-mode");
    }
    container.tabIndex = 0;
    container.onclick = function () {
      searchPlaylist(null, String(playlists[i].id), playlists[i].title);
    };
    container.onkeydown = function (event) {
      searchPlaylist(event, String(playlists[i].id), playlists[i].title);
    };
    let thumbnail = document.createElement("img");
    thumbnail.src = playlists[i].thumbnail.url;
    thumbnail.alt = `thumbnail of ${playlists[i].title}`;
    let title = document.createElement("p");
    title.textContent = playlists[i].title;

    container.appendChild(thumbnail);
    container.appendChild(title);
    list.appendChild(container);
  }
}
