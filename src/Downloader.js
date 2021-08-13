const fs = require('fs');
const https = require('https');

class Downloader {
    constructor(options) {
        this.base_path = options?.path ? (options.path.endsWith('/') ? options.path : options.path.concat('/')) : `${process.cwd()}/downloads/`;
        this.debug = options?.debug ? options.debug : true;
    }

    /**
     * Downloads a file from the provided url
     * @param {String} url
     * @param {String} filename
     * @param {Object} options
     * @param {String} path
     * @returns {Promise}
     */

    Download (url, filename, options, path) {
        
        if (this.IsUrl(url) && url.startsWith('http')) {

            let dl_path = path ? (path.endsWith('/') ? path : path.concat('/')) : this.base_path;
            let file_name = filename ? filename : url.split("/").pop();
            const exist_path = this.CheckDir(dl_path);
            
            if (exist_path && file_name) {

                return https.get(url, (res) => {

                    const filePath = fs.createWriteStream(dl_path.concat(file_name));
                    res.pipe(filePath);
                    filePath.on('finish',() => {
                        filePath.close();
                        this.debug ? console.log(`[\x1b[32mSUCCESS\x1b[0m]`, `Downloaded "${file_name}" in "${dl_path}" !`) : "";
                    })
                })
            }
        } else {
            return this.debug ? console.log(`[\x1b[31mERROR\x1b[0m]`, 'The url provided is not valid') : "";
        }
    }

    /**
    * @private Check if the dir exist, and if not tries to create it
    * @param {String} path 
    * @returns {Promise}
    */

    async CheckDir (path) {
        if (fs.existsSync(path)) {
            return true;
        } else {
            try {
                await fs.mkdirSync(path, { recursive: true});
                return true;
            } catch (e) {
                this.debug ? console.log(`[\x1b[31mERROR\x1b[0m]`, `Couldn't create "${path}" dir\n`, e.message) : "";
                return false;
            }
        }
    }

    /**
     * @private Check if a string is an url
     * @param {String} string The string to check
     * @returns {Boolean}
     */
    
     IsUrl (string) {
        const regex = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
         return regex.test(string);
     };
}

module.exports = Downloader;