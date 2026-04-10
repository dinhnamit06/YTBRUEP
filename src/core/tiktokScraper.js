const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');
require('dotenv').config();

const { chromium } = require('playwright');

class TikTokScraper {
    constructor() {
        this.downloadPath = process.env.TIKTOK_DOWNLOAD_PATH || './downloads';
        fs.ensureDirSync(this.downloadPath);
    }

    /**
     * Download a TikTok video without watermark using a downloader service
     * @param {string} url - TikTok video URL
     */
    async downloadVideo(url) {
        let browser;
        try {
            logger.info(`Đang xử lý: ${url}`);
            browser = await chromium.launch({ headless: false });
            const page = await browser.newPage();

            // Sử dụng một service phổ biến: TikMate
            logger.info('Đang truy cập TikMate...');
            await page.goto('https://tikmate.app/', { waitUntil: 'networkidle', timeout: 60000 });
            
            // Nhập URL TikTok
            logger.info('Đang nhập link vào TikMate...');
            await page.fill('#url', url);
            await page.click('#send'); // ID cho nút Download của TikMate

            logger.info('Đang chờ link tải không watermark (có thể mất 10-20s)...');
            
            // Chờ link tải xuất hiện
            await page.waitForSelector('.abutton.download', { timeout: 60000 });
            
            // Lấy link tải đầu tiên
            const downloadUrl = await page.getAttribute('.abutton.download', 'href');
            
            if (!downloadUrl) throw new Error('Không tìm thấy link tải.');

            const videoId = this.extractVideoId(url) || Date.now();
            const filePath = path.join(this.downloadPath, `tiktok_${videoId}.mp4`);

            logger.info('Bắt đầu tải tệp về máy...');
            await this.performDownload(downloadUrl, filePath);

            logger.success(`Đã tải thành công: ${filePath}`);
            return filePath;
        } catch (error) {
            logger.error(`Lỗi khi xử lý video: ${error.message}`);
            throw error;
        } finally {
            if (browser) await browser.close();
        }
    }

    extractVideoId(url) {
        const match = url.match(/\/video\/(\d+)/);
        return match ? match[1] : null;
    }

    async performDownload(sourceUrl, savePath) {
        const writer = fs.createWriteStream(savePath);
        const response = await axios({
            url: sourceUrl,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }
}

module.exports = new TikTokScraper();
