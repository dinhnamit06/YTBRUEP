const logger = require('./src/utils/logger');
const tiktokScraper = require('./src/core/tiktokScraper');
const transcriber = require('./src/core/transcriber');
const contentAnalyzer = require('./src/core/contentAnalyzer');
require('dotenv').config();

async function main() {
    logger.divider();
    logger.success('Hệ thống YouTube Re-Up Agent khởi động!');
    logger.info('Module: Content Intelligence - Full Pipeline (V3.0)');
    logger.divider();

    // Link demo
    const testUrl = 'https://www.tiktok.com/@vngaming_yt/video/7355203362671512849'; 
    
    try {
        // BƯỚC 1: Tải video không watermark
        logger.info('--- BƯỚC 1: TẢI VIDEO ---');
        // const videoPath = await tiktokScraper.downloadVideo(testUrl);
        const videoPath = './downloads/demo.mp4'; 
        
        // BƯỚC 2: Xử lý âm thanh và Transcribe
        logger.info('--- BƯỚC 2: XỬ LÝ & TRANSCRIBE ---');
        let rawText = '';
        if (require('fs').existsSync(videoPath)) {
            const audioPath = await transcriber.extractAudio(videoPath);
            rawText = await transcriber.transcribeAudio(audioPath);
            logger.info('Nội dung gốc: ' + rawText.substring(0, 50) + '...');
        } else {
            logger.warn(`Không tìm thấy video tại ${videoPath}. Dùng văn bản mẫu để test Bước 3.`);
            rawText = "Xin chào các bạn, hôm nay mình sẽ hướng dẫn các bạn cách để có thể chơi game mượt hơn trên điện thoại Android. Đầu tiên các bạn vào phần cài đặt, sau đó chọn tùy chọn nhà phát triển và tắt các hiệu ứng chuyển cảnh đi nhé. Chúc các bạn thành công và đừng quên đăng ký kênh mình nha.";
        }

        // BƯỚC 3: Phân tích và Đề xuất chiến lược
        logger.info('--- BƯỚC 3: PHÂN TÍCH & CHIẾN LƯỢC ---');
        const analysis = await contentAnalyzer.analyze(rawText);
        
        logger.divider();
        logger.success('KẾ HOẠCH NỘI DUNG YOUTUBE:');
        console.log(analysis.cyan);
        logger.divider();

    } catch (err) {
        logger.error('Chương trình tạm dừng do lỗi hệ thống.');
    }
    
    logger.divider();
}

main();
