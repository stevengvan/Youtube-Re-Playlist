function signOut() {
  document.getElementById("sign-out").blur();
  // Google's OAuth 2.0 endpoint for revoking access tokens.
  var revokeTokenEndpoint = "https://oauth2.googleapis.com/revoke";

  // Create <form> element to use to POST data to the OAuth 2.0 endpoint.
  var form = document.createElement("form");
  form.setAttribute("method", "post");
  form.setAttribute("action", revokeTokenEndpoint);

  // Add access token to the form so it is set as value of 'token' parameter.
  // This corresponds to the sample curl request, where the URL is:
  //      https://oauth2.googleapis.com/revoke?token={token}
  var tokenField = document.createElement("input");
  tokenField.setAttribute("type", "hidden");
  tokenField.setAttribute("name", "token");
  tokenField.setAttribute("value", localStorage.getItem("accessToken"));
  form.appendChild(tokenField);

  // Add form to page and submit it to actually revoke the token.
  document.body.appendChild(form);
  form.submit();
  localStorage.setItem("accessToken", "");
  location.href = "index/index.html";
}

function toggleDarkMode() {
  if (localStorage.getItem("isDarkMode") === null) {
    localStorage.setItem("isDarkMode", false);
  }

  if (localStorage.getItem("isDarkMode") == "false") {
    localStorage.setItem("isDarkMode", "true");
    document.getElementById("toggle-dark").classList.add("dark-mode");
    document.getElementById("toggle-dark").blur();
    document.body.classList.add("dark-mode");
  } else {
    localStorage.setItem("isDarkMode", "false");
    document.getElementById("toggle-dark").blur();
    var darkModeElems = document.getElementsByClassName("dark-mode");
    for (let i = darkModeElems.length - 1; i >= 0; --i) {
      darkModeElems[i].classList.remove("dark-mode");
    }
  }
}

function toggleLoading(toggle) {
  switch (toggle) {
    case 0: {
      document.getElementById("loading").remove();
      break;
    }
    case 1: {
      var loadScreen = document.createElement("div");
      loadScreen.id = "loading";
      var loadingBox = document.createElement("div");
      loadingBox.id = "loading-box";
      var header = document.createElement("h1");
      header.textContent = "Loading";
      loadingBox.append(header);
      var loader = document.createElement("div");
      loader.id = "loader-icon";
      loadingBox.append(loader);
      loadScreen.append(loadingBox);
      document.body.append(loadScreen);
      break;
    }
  }
}

// Goes back to options to either select playlist or search a playlist
function gotoMenu() {
  const currentURL = window.location.href;
  document.getElementById("go-back").blur();
  if (currentURL.includes("selectplaylist") || document.referrer.length === 0) {
    location.href = "index/index.html";
  } else {
    history.back();
  }
}

var newPlaylist = "";

// Retrieves all videos in playlist
const fetchVideos = async () => {
  const response = await fetch(
    `../.netlify/functions/fetchVideos?id=${newPlaylist}`
  );
  const data = await response.json();

  if ("error" in data) {
    return 404;
  }

  videosList = [...data.videosList];
  total = Object.keys(data.videosList).length;

  return 200;
};

// Uses given URL to search for existing playlist
const searchPlaylist = async (event, submit = false, id = "", title = "") => {
  if ((event && event.key == "Enter") || submit == true) {
    if (id.length == 0) {
      document.getElementById("search-bar").blur();
    }

    let input =
      id.length > 0 ? id : document.getElementById("search-bar").value;

    // check for any invalid inputs
    if (input.length < 11 && input.length > 0) {
      document.getElementById("error-message").innerHTML =
        "Must enter valid URL or playlist ID; check for mispelling.";
      return;
    } else if (input.length === 0) {
      document.getElementById("error-message").innerHTML =
        "No URL or ID was provided";
      return;
    }

    // grab playlist ID from URL retrieved
    let startPos = input.search("=") + 1;
    let endPos = input.search("&");
    if (endPos > 0) {
      newPlaylist = input.slice(startPos, endPos);
    } else {
      newPlaylist = input.slice(startPos);
    }

    toggleLoading(1);

    // create playlist display once playlist is retrieved
    fetchVideos().then((statusCode) => {
      if (statusCode == 200) {
        document.getElementById("error-message").innerText = "";
        if (id.length === 0) {
          document.getElementById("search-bar").value = "";
        }
        localStorage.setItem("videosList", JSON.stringify(videosList));
        localStorage.setItem("total", total);
        window.location.href = "/player/player.html";
      } else if (statusCode == 404) {
        document.getElementById("error-message").innerHTML =
          "Could not find playlist with the given URL/ID: Check if the playlist URL or ID is incorrect or if the playlist is private";
      }

      toggleLoading(0);
    });
  }
};
