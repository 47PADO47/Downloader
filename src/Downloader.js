const fs = require('fs');

class Downloader {
    /**
     * Downloader class ⬇️
     * @param {object} options
     * @param {string} options.path - The path where the files will be downloaded
     * @param {boolean} options.debug - If true, will print some debug messages 
     */
    constructor(options) {
        this.base_path = options?.path ? (options.path.endsWith('/') ? options.path : options.path.concat('/')) : `${process.cwd()}/downloads/`;
        this.debug = options?.debug ? options.debug : true;
    };

    /**
     * Downloads a file from the provided url
     * @param {string} url The url of the file to download
     * @param {string} [filename] OPTIONAL - The name of the file to be downloaded
     * @param {object} [options] OPTIONAL - The options to be used for the download (http/https .request())
     * @param {string} [path] OPTIONAL - The path where the file will be downloaded
     * @returns {Promise}
     */

    Download(url, filename, options = {}, path) {
        let get;

        if (!this.IsUrl(url)) {
            if (this.debug) console.log(`[\x1b[31mERROR\x1b[0m]`, 'The url provided is not valid');
            return new Error('The url provided is not valid');
        };

        let dl_path = path ? (path.endsWith('/') ? path : path.concat('/')) : this.base_path;
        let file_name = filename ? filename : url.split("/").pop();
        const exist_path = this.#CheckDir(dl_path);

        if (exist_path && file_name) {

            url.startsWith("https") ? get = require('https') : get = require('http');
            return get.get(url, options, (res) => {

                const filePath = fs.createWriteStream(dl_path.concat(file_name));
                res.pipe(filePath);
                filePath.on('finish', () => {
                    filePath.close();
                    if (this.debug) console.log(`[\x1b[32mSUCCESS\x1b[0m]`, `Downloaded "${file_name}" in "${dl_path}" !`);
                });
            });
        };
    }

    /**
     * @private Check if the dir exist, and if not tries to create it
     * @param {string} path The path to the dir
     * @returns {Promise}
     */

    async #CheckDir(path) {
        if (fs.existsSync(path)) {
            return true;
        } else {
            try {
                await fs.mkdirSync(path, {
                    recursive: true
                });
                return true;
            } catch (e) {
                if (this.debug) console.log(`[\x1b[31mERROR\x1b[0m]`, `Couldn't create "${path}" dir\n`, e.message);
                return false;
            }
        }
    }

    /**
     * @private Check if a string is an url
     * @param {string} string The string to check
     * @returns {Boolean}
     */

    IsUrl(string) {
        const regex = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        return regex.test(string);
    };
}

module.exports = Downloader;