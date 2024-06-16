function initializePage() {
  createSignInOutBtn();
  loadSearchHistory();
}
function selectPlaylistRedirect() {
  checkToken();
  if (checkToken()) {
    window.location.href = "/selectplaylist/selectplaylist.html";
  } else {
    oauthSignIn("selectplaylist/selectplaylist.html");
  }
}

function checkToken() {
  if (!localStorage.getItem("accessToken")) return false;
  else if (!localStorage.getItem("expiresIn")) return false;
  else {
    const currentTimestamp = new Date();
    const expiration = new Date(localStorage.getItem("expiresIn"));
    if (currentTimestamp >= expiration) return false;
  }

  return true;
}

function loadSearchHistory() {
  var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  if (searchHistory === null) return;

  var historyList = document.getElementById("search-list");
  for (var playlist of searchHistory) {
    let playlistItem = document.createElement("li");

    playlistItem.addEventListener("click", function (event) {
      document.getElementById("search-bar").value = event.target.innerHTML;
      searchPlaylist(null, true);
    });

    playlistItem.innerText = playlist;
    historyList.append(playlistItem);
  }
}

function addToSearchHistory() {
  let searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  if (searchHistory === null) searchHistory = [];
  else if (searchHistory.length === 5) searchHistory.pop();
  searchHistory.unshift(document.getElementById("search-bar").value);
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

function deleteSearchHistory() {
  localStorage.clear("searchHistory");
  document.getElementById("search-list").innerHTML = "";
}
