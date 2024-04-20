# Youtube Playlist Rework

This is an app that allows users to stream any playlist they want. It is a Progressive web app project that utilizes Google's Youtube player API and OAuth 2.0 protocol. Features such as sign in/out, dark mode toggle, and additional player controls are included in this application. This project was made to speed up the process of shuffling a playlist on a larger playlist (similarly to how Youtube's mobile app shuffles a playlist).

## Demo

The website can be found here: [https://yt-re-playlist.netlify.app](https://yt-re-playlist.netlify.app)

## Required setup

To test locally, the following items must be completed beforehand:

- Create a Google Cloud account: [Sign up from here](https://cloud.google.com/?utm_source=google&utm_medium=cpc&utm_campaign=na-US-all-en-dr-bkws-all-all-trial-e-dr-1605212&utm_content=text-ad-none-any-DEV_c-CRE_665665924735-ADGP_Hybrid+%7C+BKWS+-+MIX+%7C+Txt_Google+Cloud+General-KWID_43700077212109166-kwd-173795742258&utm_term=KW_google+cloud+sign+up-ST_google+cloud+sign+up&gclid=Cj0KCQjwj5mpBhDJARIsAOVjBdrNW62_53Btpkt5A7iaclFu4Mo5H6-FK7RMfgm8LOh4my7TSW45Jk0aArcvEALw_wcB&gclsrc=aw.ds&hl=en)

- Create an API key to use Youtube player API: [How to setup API keys](https://support.google.com/googleapi/answer/6158862?hl=en)

- Get an OAuth 2.0 client ID: [Setting up OAuth 2.0](https://support.google.com/cloud/answer/6158849?hl=en)

- Create Netlify account: [Netlify signup](https://app.netlify.com/signup)

- Install Netlify CLI: [Netlify installation](https://docs.netlify.com/cli/get-started/)

When setting up the API key and OAuth 2.0, it is recommended to add restrictions on what API can be used or limit where the API can be used (this can be done while creating both items). Additionally a .env file should be created to store the API key.

Replace the client ID value on line 15-16 in `/dist/index.js` with your created OAuth client ID.

When a Netlify account is created as well Netlify CLI installed, login into your Netlify account in the CLI with

```
netlify login
```

Once logged in, add your Google API key using netlify CLI with

```
netlify env:set KEY someValue
```

Where `KEY` is the name of the environment variable and `someValue` is the API key. This will allow fetching for Youtube playlists and the videos in it. Further configuration for environment variables can be found here: [Manage environment variables](https://docs.netlify.com/cli/get-started/#manage-environment-variables)

## Running locally

Once the setup is complete and have successfully logged into Netlify with the CLI tool, run the following command to start a local server:

```
npm run dev
```
