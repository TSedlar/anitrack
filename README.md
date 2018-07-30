# anitrack
![](https://img.shields.io/github/license/mashape/apistatus.svg)
![](https://travis-ci.org/TSedlar/anitrack.svg)
[![](https://img.shields.io/chrome-web-store/v/njndiiinbnllinmdoifoffmkfgkflffp.svg)](https://chrome.google.com/webstore/detail/anitrack/njndiiinbnllinmdoifoffmkfgkflffp)
[![](https://img.shields.io/amo/v/anitrack.svg)](https://addons.mozilla.org/en-US/firefox/addon/anitrack/)
[![](https://img.shields.io/chrome-web-store/d/njndiiinbnllinmdoifoffmkfgkflffp.svg?label=chrome-users)](https://chrome.google.com/webstore/detail/anitrack/njndiiinbnllinmdoifoffmkfgkflffp)
[![](https://img.shields.io/amo/users/anitrack.svg?label=firefox-users)](https://addons.mozilla.org/en-US/firefox/addon/anitrack/)
[![](https://img.shields.io/badge/donate-patreon-orange.svg)](https://www.patreon.com/bePatron?c=954360)
[![](https://img.shields.io/badge/donate-paypal-blue.svg)](https://paypal.me/TSedlar)

### A browser extension that tracks what you're watching/reading with MyAnimeList or Kitsu

## Installing
- Click either the above "chrome webstore" or "mozilla add-on" badge, it will redirect to the respective page.
- If using Opera, you can install [this extension](https://addons.opera.com/en/extensions/details/download-chrome-extension-9/) and then use the above "chrome webstore" link.

## Information

Tracking for anime happens 5 minutes into the video you are watching.

Tracking for manga happens when you are over half-way done with a chapter or 5 minutes on the same page.

Anime sites currently supported are:
- Amazon Prime
- Anime Series
- Anime Twist
- Chia-Anime
- Crunchyroll
- Funimation
- GoGoAnime
- Hulu
- KissAnime
- MasterAni
- Netflix
- 9Anime
- VRV

Manga sites currently supported are:
- KissManga
- JaiminisBox
- MangaDex
- MangaEden
- MangaFox (FanFox)
- MangaReader
- MangaRock
- MangaStream

## Contributing
- Must be in compliance with [eslint-config-standard](https://github.com/feross/eslint-config-standard)
- Must be on its own branch or fork for pull requests

## Signing in
Clicking the icon displayed will show the GUI for signing in:

![](https://i.imgur.com/rZEKNgp.png)

## Building from source

### Chrome
```shell
git clone https://github.com/TSedlar/anitrack.git
cd anitrack
npm install
npm run build-chrome
```

```
Chrome Menu > More Tools > Extensions > Enable Developer Mode
                                      > Load unpacked extension...
                                      > Select anitrack/build/chrome/ directory
```
![](https://i.imgur.com/dL60W9x.png)

### Firefox
```shell
git clone https://github.com/TSedlar/anitrack.git
cd anitrack
npm install
npm run build-firefox
```

```
Firefox Menu > Add-ons > Setting Cog > Debug Add-ons
                                     > Load Temporary Add-ons
                                     > Select anitrack/build/firefox/manifest.json
```
![](https://i.imgur.com/yQkBETn.png)
