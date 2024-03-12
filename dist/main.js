/*
 * Create form to request access token from Google's OAuth 2.0 server.
 */
function oauthSignIn(path) {
  // Google's OAuth 2.0 endpoint for requesting an access token
  var oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";

  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  var form = document.createElement("form");
  form.setAttribute("method", "GET"); // Send as a GET request.
  form.setAttribute("action", oauth2Endpoint);

  // Parameters to pass to OAuth 2.0 endpoint.
  var params = {
    client_id:
      "445368748159-a5duqn5mbv6m4mm6acpop8tu9f2kd9bi.apps.googleusercontent.com", // Make sure to restrict authorization via adding Javascript origins and redirect URIs
    redirect_uri: "https://yt-re-playlist.netlify.app/" + path,
    response_type: "token",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    include_granted_scopes: "true",
    state: "pass-through value",
    prompt: "select_account",
  };

  // Add form parameters as hidden input values.
  for (var p in params) {
    var input = document.createElement("input");
    input.setAttribute("type", "hidden");
    input.setAttribute("name", p);
    input.setAttribute("value", params[p]);
    form.appendChild(input);
  }

  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  document.body.appendChild(form);
  form.submit();
}

function createSignInOutBtn() {
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

  var currentTime = new Date();
  if (queryStrings["access_token"]) {
    localStorage.setItem("accessToken", queryStrings["access_token"]);
    const milliseconds = Number(queryStrings["expires_in"]) * 1000;
    const expiration = new Date(currentTime.getTime() + milliseconds);
    localStorage.setItem("expiresIn", JSON.stringify(expiration));
  }

  var access_token = localStorage.getItem("accessToken");
  var expirationString = localStorage.getItem("expiresIn");
  var expiration = new Date(JSON.parse(expirationString));
  var signInOutBtn = document.getElementById("sign-in-out");
  if (access_token && currentTime < expiration) {
    signInOutBtn.textContent = "Sign Out";
    signInOutBtn.ariaLabel = "sign out of account";
    signInOutBtn.onclick = function () {
      signOut(window.location.pathname);
    };
  } else {
    console.log("missed");
  }
}

function signOut(redirect) {
  document.getElementById("sign-in-out").blur();
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
  localStorage.removeItem("accessToken");
  localStorage.removeItem("expiresIn");

  location.href = redirect;
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

// Goes back to home page
function gotoMenu() {
  location.href = "index/index.html";
}

function goBack() {
  var access_token = localStorage.getItem("accessToken");
  if (access_token && access_token.length > 0) {
    if (window.location.href.includes("selectplaylist")) {
      location.href = "index/index.html";
    } else {
      history.back();
    }
  } else {
    location.href = "index/index.html";
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
