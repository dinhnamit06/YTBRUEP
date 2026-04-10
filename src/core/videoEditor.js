const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class VideoEditor {
    constructor() {
        this.outputPath = './output';
        fs.ensureDirSync(this.outputPath);
    }

    /**
     * Gộp âm thanh và phụ đề vào video gốc
     * @param {string} videoPath 
     * @param {string} audioPath 
     * @param {string} srtPath - (Tùy chọn) Đường dẫn file .srt
     */
    async mergeAudio(videoPath, audioPath, srtPath = null) {
        return new Promise((resolve, reject) => {
            const finalName = `final_${path.basename(videoPath)}`;
            const finalPath = path.join(this.outputPath, finalName);

            logger.info(`Đang xử lý render video final: ${finalName}`);

            let command = ffmpeg(videoPath)
                .input(audioPath)
                .outputOptions([
                    '-map 0:v:0',
                    '-map 1:a:0',
                    '-shortest'
                ]);

            // Nếu có phụ đề, chèn vào video (Hard-sub)
            if (srtPath) {
                // Ffmpeg yêu cầu path file srt phải escape đặc biệt trên Windows
                const escapedSrtPath = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');
                command = command.videoFilters(`subtitles='${escapedSrtPath}':force_style='FontSize=24,PrimaryColour=&H00FFFF,Alignment=2'`);
            } else {
                command = command.outputOptions('-c:v copy'); // Copy cho nhanh nếu ko có sub
            }

            command
                .on('end', () => {
                    logger.success(`Render hoàn tất! Video sẵn sàng tại: ${finalPath}`);
                    resolve(finalPath);
                })
                .on('error', (err) => {
                    logger.error(`Lỗi Render: ${err.message}`);
                    reject(err);
                })
                .save(finalPath);
        });
    }
}

module.exports = new VideoEditor();
