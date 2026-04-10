const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class SubtitleGenerator {
    constructor() {
        this.tempPath = './temp/subtitles';
        fs.ensureDirSync(this.tempPath);
    }

    /**
     * Tạo file .srt từ nội dung TIMED_SCRIPT của Gemini
     * @param {string} timedScript - Nội dung có chứa mốc thời gian
     * @returns {string} - Đường dẫn file .srt
     */
    async createSrt(timedScript) {
        try {
            logger.info('Đang tạo file phụ đề .srt...');
            
            const lines = timedScript.split('\n');
            let srtContent = '';
            let counter = 1;

            for (const line of lines) {
                // Regex tìm cấu trúc [00:00:00,000 --> 00:00:00,000]: nội dung
                const match = line.match(/\[(.*?) --> (.*?)\]: (.*)/);
                if (match) {
                    const startTime = match[1].trim();
                    const endTime = match[2].trim();
                    const text = match[3].trim();

                    srtContent += `${counter}\n${startTime} --> ${endTime}\n${text}\n\n`;
                    counter++;
                }
            }

            if (!srtContent) {
                logger.warn('Không thể trích xuất TIMED_SCRIPT từ Gemini. Sẽ không có phụ đề.');
                return null;
            }

            const fileName = `sub_${Date.now()}.srt`;
            const filePath = path.join(this.tempPath, fileName);
            
            await fs.writeFile(filePath, srtContent, 'utf8');
            logger.success(`Đã tạo file .srt: ${filePath}`);
            
            return filePath;
        } catch (error) {
            logger.error(`Lỗi tạo Subtitle: ${error.message}`);
            return null;
        }
    }
}

module.exports = new SubtitleGenerator();
