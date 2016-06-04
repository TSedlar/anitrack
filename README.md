# mal-scrobble
![](https://img.shields.io/github/license/mashape/apistatus.svg)
![](https://travis-ci.org/TSedlar/mal-scrobble.svg)

### A Chrome plugin that scrobbles what you're watching with MyAnimeList

Scrobbling happens as you watch videos, no other action is required besides signing in.

Sites currently supported are:
* Crunchyroll
* HTVAnime

Future sites planned:
* MoeTube
* Daisuki
* Chia-Anime
* KissAnime
* GoGoAnime
 
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
npm install && npm run-script build
```
You can test out chrome plugins by enabling developer mode and loading the 'lib' dir into it.
```
More Tools > Extensions > Toggle Developer Mode
                        > Load unpacked extension...
```
![](https://i.imgur.com/5359TNf.png)
