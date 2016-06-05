# mal-scrobble
![](https://img.shields.io/github/license/mashape/apistatus.svg)
![](https://travis-ci.org/TSedlar/mal-scrobble.svg)

### A WebExtension that scrobbles what you're watching with MyAnimeList

# Installing
Chrome extension [here](https://chrome.google.com/webstore/detail/mal-scrobble/njndiiinbnllinmdoifoffmkfgkflffp)

# Information

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

# Contributing
* Must be in compliance with [eslint-config-standard](https://github.com/feross/eslint-config-standard)
* Must be on its own branch or fork for pull requests

# Signing in
Clicking the icon displayed will show the GUI for signing in

![](https://i.imgur.com/rZEKNgp.png)

# Building from source
### Chrome
```
git clone https://github.com/TSedlar/mal-scrobble.git
cd mal-scrobble
npm install && npm run-script build-chrome
```
```
Chrome Menu > More Tools > Extensions > Enable Developer Mode
                                      > Load unpacked extension...
                                      > Select mal-scrobble/chrome-extension/ directory
```
![](https://i.imgur.com/HnTf2Tv.png)
### Firefox
```
git clone https://github.com/TSedlar/mal-scrobble.git
cd mal-scrobble
npm install && npm run-script build-firefox
```
```
Firefox Menu > Add-ons > Setting Cog > Debug Add-ons
                                     > Load Temporary Add-ons
                                     > Select mal-scrobble/firefox-extension/manifest.json
```
![](https://i.imgur.com/yQkBETn.png)
