const logger = require('./src/utils/logger');
const tiktokScraper = require('./src/core/tiktokScraper');
const youtubeDownloader = require('./src/core/youtubeDownloader');
const transcriber = require('./src/core/transcriber');
const contentAnalyzer = require('./src/core/contentAnalyzer');
require('dotenv').config();

async function main() {
    logger.divider();
    logger.success('Hệ thống YouTube Re-Up Agent khởi động!');
    logger.info('Module: YouTube Content Pipeline (V4.0)');
    logger.divider();

    // LINK YOUTUBE ĐỂ CHẠY THỬ
    const testUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw'; 
    
    try {
        // BƯỚC 1: Tải nội dung
        logger.info('--- BƯỚC 1: TẢI NỘI DUNG ---');
        let videoPath = '';
        if (testUrl.includes('youtube.com') || testUrl.includes('youtu.be')) {
            videoPath = await youtubeDownloader.download(testUrl);
        } else {
            videoPath = await tiktokScraper.downloadVideo(testUrl);
        }
        
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
