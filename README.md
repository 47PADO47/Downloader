# Downloader
Just a simple NPM package to download things off the internet

## Table Of Contents
  - [Installation](#installation)
  - [Example](#example)

## Installation

```sh
    npm install node-downloader.js
```

## Example

```javascript
    const { Downloader } = require('node-downloader.js');

    (() => {
        const options = {
            path: './downloads/',
            debug: true
        };
        const dl = new Downloader(options);

        
        const url = 'https://github.githubassets.com/images/icons/emoji/trollface.png';
        const file_name = 'photo.png';
        const path = './data/';
        const opts = {};

        dl.Download(url, file_name, opts, path);
    })();
```