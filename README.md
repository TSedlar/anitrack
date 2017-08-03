# mal-scrobble
![](https://img.shields.io/github/license/mashape/apistatus.svg)
![](https://travis-ci.org/TSedlar/mal-scrobble.svg)

### A browser extension that scrobbles what you're watching with MyAnimeList

## Installing
- [Chrome extension](https://chrome.google.com/webstore/detail/mal-scrobble/njndiiinbnllinmdoifoffmkfgkflffp)
- [Firefox extension](https://addons.mozilla.org/en-US/firefox/addon/mal-scrobble/)

## Information

Scrobbling happens as you watch videos, no other action is required besides signing in.

Sites currently supported are:
- Amazon Prime
- AnimeHaven
- Anime Twist
- Chia-Anime
- Crunchyroll
- Daisuki
- Funimation
- GoGoAnime
- HTVAnime
- Hulu
- KissAnime
- MasterAni
- MoeTube
- Netflix

## Contributing
- Must be in compliance with [eslint-config-standard](https://github.com/feross/eslint-config-standard)
- Must be on its own branch or fork for pull requests

## Signing in
Clicking the icon displayed will show the GUI for signing in:

![](https://i.imgur.com/rZEKNgp.png)

## Building from source

### Chrome
```shell
git clone https://github.com/TSedlar/mal-scrobble.git
cd mal-scrobble
npm install
npm run build-chrome
```

```
Chrome Menu > More Tools > Extensions > Enable Developer Mode
                                      > Load unpacked extension...
                                      > Select mal-scrobble/build/chrome/ directory
```
![](https://i.imgur.com/dL60W9x.png)

### Firefox
```shell
git clone https://github.com/TSedlar/mal-scrobble.git
cd mal-scrobble
npm install
npm run build-firefox
```

```
Firefox Menu > Add-ons > Setting Cog > Debug Add-ons
                                     > Load Temporary Add-ons
                                     > Select mal-scrobble/build/firefox/manifest.json
```
![](https://i.imgur.com/yQkBETn.png)
