const ffmpeg = require('fluent-ffmpeg');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');
require('dotenv').config();

class Transcriber {
    constructor() {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }, { apiVersion: "v1beta" });
        this.tempPath = './temp';
        fs.ensureDirSync(this.tempPath);
    }

    /**
     * Trích xuất âm thanh từ video
     * @param {string} videoPath 
     */
    async extractAudio(videoPath) {
        return new Promise((resolve, reject) => {
            const audioPath = path.join(this.tempPath, `${path.basename(videoPath, path.extname(videoPath))}.mp3`);
            
            logger.info(`Đang trích xuất âm thanh: ${path.basename(videoPath)}`);
            
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
     * Transcribe âm thanh sang văn bản dùng Gemini 1.5
     * @param {string} audioPath 
     */
    async transcribeAudio(audioPath) {
        try {
            logger.info('Đang sử dụng Gemini 1.5 Flash để Transcribe...');
            
            const audioBuffer = await fs.readFile(audioPath);
            const base64Audio = audioBuffer.toString('base64');

            const prompt = "Hãy transcribe nội dung âm thanh của video này một cách chính xác nhất. Chỉ trả về phần văn bản đã nói.";
            
            const result = await this.model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Audio,
                        mimeType: "audio/mp3"
                    }
                }
            ]);

            const response = await result.response;
            const text = response.text();

            logger.success('Gemini Transcribe thành công!');
            return text;
        } catch (error) {
            logger.error(`Lỗi Gemini Transcribe: ${error.message}`);
            throw error;
        } finally {
            if (await fs.exists(audioPath)) {
                await fs.remove(audioPath);
            }
        }
    }
}

module.exports = new Transcriber();
