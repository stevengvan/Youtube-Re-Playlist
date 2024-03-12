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
