import fs from 'fs';
import { ClassOptions, LogType } from './structs';
import http from 'http';
import https from 'https';

class Downloader {
    public base_path: string;
    public debug: boolean;
    /**
     * Downloader class ⬇️
     * @param {object} options
     * @param {string} [options.path] - The path where the files will be downloaded
     * @param {boolean} [options.debug] - If true, will print some debug messages 
     */
    constructor(options: ClassOptions = {}) {
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
    public async Download(url: string, filename?: string, options: http.RequestOptions | https.RequestOptions = {}, path?: string): Promise<unknown> {
        let get;

        if (!this.IsUrl(url)) {
            if (this.debug) this.log('The url provided is not valid', 'error');
            return new Error('The url provided is not valid');
        };

        if (this.debug) this.log(`The url provided is valid`, 'info');
        
        const _path = path ? (path.endsWith('/') ? path : path.concat('/')) : this.base_path;
        const _filename = filename ? filename : url.split('/').pop();
        const exist = await this.CheckDir(_path);

        if (!exist || !_filename) {
            if (this.debug) this.log('Couldn\'t create the dir or the filename is empty', 'error');
            return new Error('Couldn\'t create the dir or the filename is empty');
        };

        if (this.debug) this.log(`Downloading "${url}" to "${_path}${_filename}"`, 'info');
        
        return new Promise((resolve, reject) => {
            get = url.startsWith('https') ? https : http;
            const file = fs.createWriteStream(`${_path}${_filename}`);

            get.get(url, options, (response: http.IncomingMessage) => {
                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    if (this.debug) this.log(`Downloaded "${_filename}" in "${_path}" !`, 'success');
                    resolve({ success: true, filename: _filename, path: _path, url: response.url, status: response.statusCode });
                });

                file.on('error', (err: Error) => {
                    if (this.debug) this.log(`Couldn't download "${url}"\n${err?.message || ""}`, 'error');
                    fs.unlink(`${_path}${_filename}`, (fs_err) => {
                        if (!fs_err) return;
                        if (this.debug) this.log(`Couldn't delete "${_filename}" in "${_path}"\n${fs_err?.message || ""}`, 'error');
                        reject({err, fs_err});
                    });
                    reject(err);
                });
            });
        });
    };

    /**
     * Checks if a string is an url
     * @param {string} string The string to check
     * @returns {boolean}
     */
    private IsUrl(url: string): boolean {
        const regex: RegExp = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        return regex.test(url);
    };

    /**
     * Checks if the dir exist, and if not tries to create it
     * @param {string} path The path to the dir
     * @returns {Promise}
     */
    private async CheckDir(path: string): Promise<boolean> {
        if (await fs.existsSync(path)) return true;

        try {
            await fs.mkdirSync(path, {
                recursive: true
            });
            return true;
        } catch (e: unknown) {
            if (this.debug) this.log(`Couldn't create "${path}" dir\n`, 'error');
            return false;
        };
    };

    /**
     * Logs a message to the console with a color depending on the type
     * @param {string} msg The message to log
     * @param {string} type The type of the message (info, success, error)
     * @returns {void}
     */
    private log(msg: string, type: LogType): void {
        if (!this.debug) return;
        switch (type) {
            case 'info':
                console.log(`[\x1b[35mINFO\x1b[0m]`, msg);
                break;
            case 'error':
                console.log(`[\x1b[31mERROR\x1b[0m]`, msg);
                break;
            case 'success':
                console.log(`[\x1b[32mSUCCESS\x1b[0m]`, msg);
                break;
            default:
                console.log(msg);
                break;
        };
    };
};

export default Downloader;