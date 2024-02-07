function selectPlaylistRedirect() {
  if (
    localStorage.getItem("accessToken") == null ||
    localStorage.getItem("accessToken").length == 0
  ) {
    oauthSignIn("selectplaylist/selectplaylist.html");
  } else {
    window.location.href = "/selectplaylist/selectplaylist.html";
  }
}
