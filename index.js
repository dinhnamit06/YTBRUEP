const fs = require('fs-extra');
const path = require('path');
const logger = require('./src/utils/logger');
const tiktokScraper = require('./src/core/tiktokScraper');
const youtubeDownloader = require('./src/core/youtubeDownloader');
const transcriber = require('./src/core/transcriber');
const contentAnalyzer = require('./src/core/contentAnalyzer');
const voiceGenerator = require('./src/core/voiceGenerator');
const subtitleGenerator = require('./src/core/subtitleGenerator');
const thumbnailGenerator = require('./src/core/thumbnailGenerator');
const videoEditor = require('./src/core/videoEditor');
require('dotenv').config();

/**
 * Xử lý toàn bộ pipeline cho một video
 */
async function processVideo(url, index, total) {
    logger.divider();
    logger.info(`Đang xử lý Video [${index + 1}/${total}]: ${url}`);
    
    try {
        // BƯỚC 1: Tải nội dung
        logger.info('--- BƯỚC 1: TẢI NỘI DUNG ---');
        let videoPath = '';
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            videoPath = await youtubeDownloader.download(url);
        } else {
            videoPath = await tiktokScraper.downloadVideo(url);
        }
        
        // BƯỚC 2: Xử lý âm thanh và Transcribe
        logger.info('--- BƯỚC 2: XỬ LÝ & TRANSCRIBE ---');
        const audioPath = await transcriber.extractAudio(videoPath);
        const rawText = await transcriber.transcribeAudio(audioPath);
        
        // BƯỚC 3: Phân tích và Viết kịch bản
        logger.info('--- BƯỚC 3: PHÂN TÍCH & KỊCH BẢN ---');
        const analysis = await contentAnalyzer.analyze(rawText);
        
        // Trích xuất dữ liệu từ Gemini
        const timedScript = analysis.split('TIMED_SCRIPT')[1]?.split('CLEAN_SCRIPT')[0]?.trim() || '';
        const cleanScript = analysis.split('CLEAN_SCRIPT')[1]?.split('SHORT_TITLE')[0]?.trim() || rawText;
        const shortTitle = analysis.split('SHORT_TITLE')[1]?.trim() || "XEM NGAY!";

        // BƯỚC 4: Sản xuất Video & Thumbnail
        logger.info('--- BƯỚC 4: SẢN XUẤT NỘI DUNG ---');
        
        // 4.1: Tạo giọng đọc AI
        const ttsAudioPath = await voiceGenerator.generateVoice(cleanScript);

        // 4.2: Tạo file phụ đề SRT
        const srtPath = await subtitleGenerator.createSrt(timedScript);

        // 4.3: Tạo Thumbnail bằng AI
        const thumbnailPath = await thumbnailGenerator.generate(videoPath, shortTitle);

        // 4.4: Render video final (Sub + Voice)
        const finalVideoPath = await videoEditor.mergeAudio(videoPath, ttsAudioPath, srtPath);

        logger.success(`HOÀN TẤT VIDEO ${index + 1}!`);
        logger.info(`Video: ${finalVideoPath}`);
        logger.info(`Thumbnail: ${thumbnailPath}`);
        
        return { success: true, url, video: finalVideoPath, thumbnail: thumbnailPath };

    } catch (err) {
        logger.error(`THẤT BẠI Video ${index + 1}: ${err.message}`);
        return { success: false, url, error: err.message };
    }
}

async function main() {
    logger.divider();
    logger.success('HỆ THỐNG YOUTUBE RE-UP AGENT - BẢN FULL OPTION (V8.0)');
    logger.divider();

    const linksFile = path.join(__dirname, 'links.txt');
    let links = [];

    if (fs.existsSync(linksFile)) {
        const content = fs.readFileSync(linksFile, 'utf8');
        links = content.split('\n')
                       .map(line => line.trim())
                       .filter(line => line && !line.startsWith('#'));
    }

    if (links.length === 0) {
        logger.warn('Vui lòng thêm link vào links.txt để bắt đầu.');
        process.exit(0);
    }

    logger.info(`Khởi động chiến dịch cho ${links.length} video.`);
    
    for (let i = 0; i < links.length; i++) {
        await processVideo(links[i], i, links.length);
        if (i < links.length - 1) await new Promise(r => setTimeout(r, 5000));
    }

    logger.divider();
    logger.success('CHIẾN DỊCH KÊNH ĐÃ SẴN SÀNG ĐỂ ĐĂNG TẢI!');
}

main();
