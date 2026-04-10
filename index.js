const logger = require('./src/utils/logger');
const tiktokScraper = require('./src/core/tiktokScraper');
const transcriber = require('./src/core/transcriber');
require('dotenv').config();

async function main() {
    logger.divider();
    logger.success('Hệ thống YouTube Re-Up Agent khởi động!');
    logger.info('Module: Content Intelligence - Full Pipeline');
    logger.divider();

    // Link demo (Có thể thay bằng link thật để test)
    const testUrl = 'https://www.tiktok.com/@tiktok/video/7123456789012345678'; 
    
    try {
        // BƯỚC 1: Tải video không watermark
        logger.info('--- BƯỚC 1: TẢI VIDEO ---');
        // const videoPath = await tiktokScraper.downloadVideo(testUrl);
        const videoPath = './downloads/demo.mp4'; // Giả lập video có sẵn để test Bước 2
        
        // BƯỚC 2: Xử lý âm thanh và Transcribe
        logger.info('--- BƯỚC 2: XỬ LÝ & TRANSCRIBE ---');
        if (require('fs').existsSync(videoPath)) {
            const audioPath = await transcriber.extractAudio(videoPath);
            const text = await transcriber.transcribeAudio(audioPath);
            
            logger.divider();
            logger.info('NỘI DUNG TRANSCRIBE:');
            console.log(text.italic.gray);
            logger.divider();
        } else {
            logger.warn(`Không tìm thấy file video tại: ${videoPath}. Bỏ qua bước 2.`);
        }

    } catch (err) {
        logger.error('Chương trình tạm dừng do lỗi hoặc thiếu cấu hình.');
    }
    
    logger.divider();
}

main();
