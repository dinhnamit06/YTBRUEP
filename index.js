const fs = require('fs-extra');
const path = require('path');
const logger = require('./src/utils/logger');
const tiktokScraper = require('./src/core/tiktokScraper');
const youtubeDownloader = require('./src/core/youtubeDownloader');
const transcriber = require('./src/core/transcriber');
const contentAnalyzer = require('./src/core/contentAnalyzer');
const voiceGenerator = require('./src/core/voiceGenerator');
const subtitleGenerator = require('./src/core/subtitleGenerator');
const videoEditor = require('./src/core/videoEditor');
require('dotenv').config();

/**
 * Xử lý toàn bộ pipeline cho một link duy nhất
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
        
        // BƯỚC 3: Phân tích và Viết kịch bản + Timestamps
        logger.info('--- BƯỚC 3: PHÂN TÍCH & KỊCH BẢN ---');
        const analysis = await contentAnalyzer.analyze(rawText);
        
        const timedScriptMatch = analysis.split('TIMED_SCRIPT');
        const cleanScriptMatch = analysis.split('CLEAN_SCRIPT');
        
        const timedScript = timedScriptMatch.length > 1 ? timedScriptMatch[1].split('CLEAN_SCRIPT')[0].trim() : '';
        const cleanScript = cleanScriptMatch.length > 1 ? cleanScriptMatch[1].trim() : rawText;

        // BƯỚC 4: Sản xuất Video Final
        logger.info('--- BƯỚC 4: PHÁT HÀNH NỘI DUNG ---');
        const ttsAudioPath = await voiceGenerator.generateVoice(cleanScript);
        const srtPath = await subtitleGenerator.createSrt(timedScript);
        const finalVideoPath = await videoEditor.mergeAudio(videoPath, ttsAudioPath, srtPath);

        logger.success(`HOÀN TẤT VIDEO ${index + 1}: ${path.basename(finalVideoPath)}`);
        return { success: true, url, path: finalVideoPath };

    } catch (err) {
        logger.error(`THẤT BẠI Video ${index + 1}: ${err.message}`);
        return { success: false, url, error: err.message };
    }
}

async function main() {
    logger.divider();
    logger.success('HỆ THỐNG YOUTUBE RE-UP AGENT - CHẾ ĐỘ CHẠY HÀNG LOẠT (V7.0)');
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
        logger.warn('Không tìm thấy link nào trong links.txt. Vui lòng thêm link để bắt đầu.');
        process.exit(0);
    }

    logger.info(`Tìm thấy ${links.length} video trong danh sách chờ.`);
    
    const results = [];
    for (let i = 0; i < links.length; i++) {
        const result = await processVideo(links[i], i, links.length);
        results.push(result);
        
        // Nghỉ một chút giữa các video để tránh bị rate limit
        if (i < links.length - 1) {
            logger.info('Nghỉ 5 giây trước khi sang video tiếp theo...');
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    // Báo cáo tổng kết
    logger.divider();
    logger.success('CHIẾN DỊCH HOÀN TẤT!');
    const successCount = results.filter(r => r.success).length;
    logger.info(`Tổng cộng: ${links.length} | Thành công: ${successCount} | Thất bại: ${links.length - successCount}`);
    logger.divider();
}

main();
