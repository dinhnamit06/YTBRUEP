const logger = require('./src/utils/logger');
const tiktokScraper = require('./src/core/tiktokScraper');
const youtubeDownloader = require('./src/core/youtubeDownloader');
const transcriber = require('./src/core/transcriber');
const contentAnalyzer = require('./src/core/contentAnalyzer');
const voiceGenerator = require('./src/core/voiceGenerator');
const subtitleGenerator = require('./src/core/subtitleGenerator');
const videoEditor = require('./src/core/videoEditor');
require('dotenv').config();

async function main() {
    logger.divider();
    logger.success('Hệ thống YouTube Re-Up Agent - TRẠM SẢN XUẤT PHIM (V6.0)');
    logger.divider();

    // LINK YOUTUBE ĐỂ CHẠY THỬ
    // Dùng link ngắn để render nhanh cho bản demo
    const testUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw'; 
    
    try {
        // BƯỚC 1: Tải nội dung
        logger.info('--- BƯỚC 1: TẢI NỘI DUNG ---');
        let videoPath = await youtubeDownloader.download(testUrl);
        
        // BƯỚC 2: Xử lý âm thanh và Transcribe
        logger.info('--- BƯỚC 2: XỬ LÝ & TRANSCRIBE ---');
        const audioPath = await transcriber.extractAudio(videoPath);
        const rawText = await transcriber.transcribeAudio(audioPath);
        
        // BƯỚC 3: Phân tích và Viết kịch bản + Timestamps
        logger.info('--- BƯỚC 3: PHÂN TÍCH & KỊCH BẢN ---');
        const analysis = await contentAnalyzer.analyze(rawText);
        
        // Trích xuất Script và Timed Script từ phân tích của Gemini
        const timedScriptMatch = analysis.split('TIMED_SCRIPT');
        const cleanScriptMatch = analysis.split('CLEAN_SCRIPT');
        
        const timedScript = timedScriptMatch.length > 1 ? timedScriptMatch[1].split('CLEAN_SCRIPT')[0].trim() : '';
        const cleanScript = cleanScriptMatch.length > 1 ? cleanScriptMatch[1].trim() : rawText;

        // BƯỚC 4: Sản xuất Video Final (Lồng tiếng + Phụ đề)
        logger.info('--- BƯỚC 4: SẢN XUẤT VIDEO FINAL ---');
        
        // 4.1: Tạo giọng đọc AI
        const ttsAudioPath = await voiceGenerator.generateVoice(cleanScript);

        // 4.2: Tạo file phụ đề SRT
        const srtPath = await subtitleGenerator.createSrt(timedScript);

        // 4.3: Render video với lồng tiếng và phụ đề mới
        const finalVideoPath = await videoEditor.mergeAudio(videoPath, ttsAudioPath, srtPath);

        logger.divider();
        logger.success('DỰ ÁN ĐÃ HOÀN THÀNH XUẤT SẮC!');
        logger.info(`Video Final (Có Sub + Voice): ${finalVideoPath}`);
        logger.divider();

    } catch (err) {
        logger.error(`Lỗi hệ thống: ${err.message}`);
    }
}

main();
