# mal-scrobble
![](https://img.shields.io/github/license/mashape/apistatus.svg)
![](https://travis-ci.org/TSedlar/mal-scrobble.svg)

### A Chrome plugin that scrobbles what you're watching with MyAnimeList

Scrobbling happens as you watch videos, no other action is required besides signing in.

Sites currently supported are:
* Crunchyroll
* HTVAnime
* MoeTube
* Daisuki
* Chia-Anime
* KissAnime
* GoGoAnime
* AnimeHaven
* Hulu
* Netflix
* Funimation

# Installing
This plugin can be installed by clicking [here](https://chrome.google.com/webstore/detail/mal-scrobble/njndiiinbnllinmdoifoffmkfgkflffp).

# Contributing
* Must be in compliance with [eslint-config-standard](https://github.com/feross/eslint-config-standard)
* Must be on its own branch or fork for pull requests

# Signing in
Clicking the icon displayed will show the GUI for signing in

![](https://i.imgur.com/rZEKNgp.png)

# Building from source
```
git clone https://github.com/TSedlar/mal-scrobble.git
cd mal-scrobble
npm install && npm run-script gulp
```
After running these commands one can enable the plugin inside of the lib directory of mal-scrobble.
```
Chrome Menu > More Tools > Extensions > Enable Developer Mode
                                      > Load unpacked extension...
```
![](https://i.imgur.com/HnTf2Tv.png)
