const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');
require('dotenv').config();

class YoutubeDownloader {
    constructor() {
        this.downloadPath = process.env.TIKTOK_DOWNLOAD_PATH || './downloads';
        fs.ensureDirSync(this.downloadPath);
    }

    /**
     * Tải nội dung từ YouTube dùng yt-dlp
     * @param {string} url - YouTube URL
     */
    async download(url) {
        try {
            logger.info(`Đang dùng yt-dlp xử lý link: ${url}`);
            
            const fileName = `yt_${Date.now()}.mp4`;
            const filePath = path.join(this.downloadPath, fileName);

            const command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4" "${url}" -o "${filePath}"`;

            logger.info(`Bắt đầu tải video...`);

            return new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        logger.error(`Lỗi yt-dlp: ${error.message}`);
                        return reject(error);
                    }
                    if (stderr && stderr.includes('ERROR')) {
                        logger.error(`Lỗi yt-dlp (stderr): ${stderr}`);
                        return reject(new Error(stderr));
                    }
                    logger.success(`Đã tải xong YouTube: ${filePath}`);
                    resolve(filePath);
                });
            });
        } catch (error) {
            logger.error(`Lỗi YouTube Downloader: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new YoutubeDownloader();
