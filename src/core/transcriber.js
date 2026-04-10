const ffmpeg = require('fluent-ffmpeg');
const { OpenAI } = require('openai');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');
require('dotenv').config();

class Transcriber {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.tempPath = './temp';
        fs.ensureDirSync(this.tempPath);
    }

    /**
     * Trích xuất âm thanh từ video
     * @param {string} videoPath 
     * @returns {Promise<string>} - Đường dẫn đến tệp audio .mp3
     */
    async extractAudio(videoPath) {
        return new Promise((resolve, reject) => {
            const audioPath = path.join(this.tempPath, `${path.basename(videoPath, path.extname(videoPath))}.mp3`);
            
            logger.info(`Đang trích xuất âm thanh từ: ${path.basename(videoPath)}`);
            
            ffmpeg(videoPath)
                .toFormat('mp3')
                .on('end', () => {
                    logger.success(`Trích xuất âm thanh thành công: ${audioPath}`);
                    resolve(audioPath);
                })
                .on('error', (err) => {
                    logger.error(`Lỗi ffmpeg: ${err.message}`);
                    reject(err);
                })
                .save(audioPath);
        });
    }

    /**
     * Transcribe âm thanh sang văn bản dùng OpenAI Whisper
     * @param {string} audioPath 
     * @returns {Promise<string>} - Nội dung văn bản
     */
    async transcribeAudio(audioPath) {
        try {
            logger.info('Đang gửi âm thanh đến OpenAI Whisper...');
            
            const transcription = await this.openai.audio.transcriptions.create({
                file: fs.createReadStream(audioPath),
                model: "whisper-1",
            });

            logger.success('Transcribe thành công!');
            return transcription.text;
        } catch (error) {
            logger.error(`Lỗi Transcribe: ${error.message}`);
            if (error.message.includes('apiKey')) {
                logger.warn('Vui lòng kiểm tra lại OPENAI_API_KEY trong tệp .env');
            }
            throw error;
        } finally {
            // Xóa file âm thanh tạm sau khi xong
            if (await fs.exists(audioPath)) {
                await fs.remove(audioPath);
            }
        }
    }
}

module.exports = new Transcriber();
