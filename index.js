const logger = require('./src/utils/logger');
const tiktokScraper = require('./src/core/tiktokScraper');
require('dotenv').config();

async function main() {
    logger.divider();
    logger.success('Hệ thống YouTube Re-Up Agent khởi động!');
    logger.info('Module: Content Intelligence - TikTok Downloader');
    logger.divider();

    // Demo với một video thực tế (Bạn có thể đổi link ở đây)
    const testUrl = 'https://www.tiktok.com/@tiktok/video/7123456789012345678'; 
    
    try {
        logger.info('Tiến hành chạy thử nghiệm tải video (giả lập)...');
        // const filePath = await tiktokScraper.downloadVideo(testUrl);
        // logger.success(`Đã tải thành công: ${filePath}`);
        
        logger.warn('Lưu ý: Bạn cần cấu hình API Key hoặc Scraper chuyên dụng để tải video không watermark.');
        logger.info('Playwright đã sẵn sàng để thực hiện scraping giao diện nếu cần.');
    } catch (err) {
        logger.error('Chương trình gặp lỗi.');
    }
    
    logger.divider();
}

main();
