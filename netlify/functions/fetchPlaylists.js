const apiPlaylists = "https://youtube.googleapis.com/youtube/v3/playlists?";
const axios = require("axios");

exports.handler = async function (event, context) {
  let playlists = [];
  let access_token = event.queryStringParameters.access_token;

  try {
    const response = await axios.get(
      apiPlaylists +
        new URLSearchParams({
          part: "status,snippet",
          access_token: access_token,
          key: process.env.KEY,
          mine: "true",
          maxResults: 25,
        })
    );
    const data = response.data;

    Object.keys(data["items"]).forEach((index) => {
      let currentPlaylist = data["items"][index];
      if (
        data["items"][index].status.privacyStatus === "unlisted" ||
        data["items"][index].status.privacyStatus === "public"
      ) {
        let playlist = {
          id: currentPlaylist.id,
          title: currentPlaylist.snippet.title,
          thumbnail: currentPlaylist.snippet.thumbnails.default,
        };
        playlists.push(playlist);
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        playlists: playlists,
      }),
    };
  } catch (error) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: error,
        playlists: [],
      }),
    };
  }
};
