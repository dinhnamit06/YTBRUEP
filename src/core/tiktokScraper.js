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
            logger.info(`Đang khởi tạo trình duyệt để xử lý: ${url}`);
            browser = await chromium.launch({ headless: true });
            const page = await browser.newPage();

            // Sử dụng một service phổ biến: Snaptik
            logger.info('Đang truy cập Snaptik...');
            await page.goto('https://snaptik.app/vn');
            
            // Nhập URL TikTok
            await page.fill('#url', url);
            await page.click('button.button-go');

            logger.info('Đang chờ link tải không watermark...');
            
            // Chờ link tải xuất hiện
            await page.waitForSelector('a.download-any', { timeout: 30000 });
            
            // Lấy link tải đầu tiên (thường là Server 1 - No Watermark)
            const downloadUrl = await page.getAttribute('a.download-any', 'href');
            
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
