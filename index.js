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
const identityManager = require('./src/core/identityManager');
const videoEditor = require('./src/core/videoEditor');
require('dotenv').config();

// CHỌN CĂN TÍNH CHO CHIẾN DỊCH NÀY
// Các option: 'default', 'news_pro', 'story_teller'
const CURRENT_IDENTITY_ID = 'news_pro'; 

async function processVideo(url, index, total, identity) {
    logger.divider();
    logger.info(`Đang xử lý Video [${index + 1}/${total}] - Căn tính: ${identity.name}`);
    
    try {
        // BƯỚC 1: Tải nội dung
        logger.info('--- BƯỚC 1: TẢI NỘI DUNG ---');
        let videoPath = url.includes('youtube.com') || url.includes('youtu.be') 
            ? await youtubeDownloader.download(url) 
            : await tiktokScraper.downloadVideo(url);
        
        // BƯỚC 2: Transcribe
        logger.info('--- BƯỚC 2: XỬ LÝ & TRANSCRIBE ---');
        const audioPath = await transcriber.extractAudio(videoPath);
        const rawText = await transcriber.transcribeAudio(audioPath);
        
        // BƯỚC 3: Phân tích
        logger.info('--- BƯỚC 3: PHÂN TÍCH CHIẾN LƯỢC ---');
        const analysis = await contentAnalyzer.analyze(rawText);
        
        const timedScript = analysis.split('TIMED_SCRIPT')[1]?.split('CLEAN_SCRIPT')[0]?.trim() || '';
        const cleanScript = analysis.split('CLEAN_SCRIPT')[1]?.split('SHORT_TITLE')[0]?.trim() || rawText;
        const shortTitle = analysis.split('SHORT_TITLE')[1]?.trim() || "XEM NGAY!";

        // BƯỚC 4: Sản xuất
        logger.info('--- BƯỚC 4: SẢN XUẤT NỘI DUNG ---');
        const ttsAudioPath = await voiceGenerator.generateVoice(cleanScript, identity);
        const srtPath = await subtitleGenerator.createSrt(timedScript);
        const thumbnailPath = await thumbnailGenerator.generate(videoPath, shortTitle);
        const finalVideoPath = await videoEditor.mergeAudio(videoPath, ttsAudioPath, srtPath);

        logger.success(`HOÀN TẤT VIDEO ${index + 1}!`);
        return { success: true, video: finalVideoPath, thumbnail: thumbnailPath };
    } catch (err) {
        logger.error(`THẤT BẠI Video ${index + 1}: ${err.message}`);
        return { success: false, error: err.message };
    }
}

async function main() {
    logger.divider();
    logger.success('HỆ THỐNG YOUTUBE RE-UP AGENT - IDENTITY ENABLED (V9.0)');
    logger.divider();

    const identity = identityManager.getIdentity(CURRENT_IDENTITY_ID);
    logger.info(`Đang sử dụng Profile: ${identity.name} (${identity.engine})`);

    const linksFile = path.join(__dirname, 'links.txt');
    if (!fs.existsSync(linksFile)) {
        logger.warn('Vui lòng tạo links.txt.');
        process.exit(0);
    }

    const links = fs.readFileSync(linksFile, 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    if (links.length === 0) {
        logger.warn('Danh sách link trống.');
        process.exit(0);
    }

    for (let i = 0; i < links.length; i++) {
        await processVideo(links[i], i, links.length, identity);
        if (i < links.length - 1) await new Promise(r => setTimeout(r, 5000));
    }

    logger.divider();
    logger.success('CHIẾN DỊCH HOÀN TẤT VỚI IDENTITY NHẤT QUÁN!');
}

main();
