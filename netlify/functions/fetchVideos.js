const apiPlaylistItems = "https://www.googleapis.com/youtube/v3/playlistItems?";
const axios = require("axios");

exports.handler = async function (event, context) {
  let prevNext = "";
  let next;
  let videosList = [];
  let newPlaylist = event.queryStringParameters.id;

  // goes through paginations, as Youtube paginates number of videos that can be retrieved per request
  while (!next || next !== prevNext) {
    try {
      const response = await axios.get(
        apiPlaylistItems +
          new URLSearchParams({
            part: "contentDetails,snippet",
            playlistId: newPlaylist,
            maxResults: 50,
            key: process.env.KEY,
            ...(next && { pageToken: next }),
          })
      );
      const data = response.data;

      // save tokens to go to next pagination
      prevNext = next;
      if ("nextPageToken" in data) {
        next = data.nextPageToken;
      }

      // save all videos of current pagination to the videos list
      for (const video of data.items) {
        if (
          video.snippet.title.toLowerCase() !== "deleted video" &&
          video.snippet.title.toLowerCase() !== "private video"
        ) {
          videosList.push({
            id: video.contentDetails.videoId,
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails.default,
          });
        }
      }

      // there's no more videos to save
      if (!("nextPageToken" in data)) {
        return {
          statusCode: 200,
          body: JSON.stringify({ videosList: videosList }),
        };
      }
    } catch (error) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: error,
          playlists: [],
        }),
      };
    }
  }
};
