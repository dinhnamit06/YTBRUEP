const googleTTS = require('google-tts-api');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class VoiceGenerator {
    constructor() {
        this.tempPath = './temp/voices';
        fs.ensureDirSync(this.tempPath);
    }

    /**
     * Chuyển đổi văn bản thành giọng nói (TTS)
     * @param {string} text - Văn bản cần đọc
     * @param {string} lang - Ngôn ngữ (mặc định 'vi')
     * @returns {Promise<string>} - Đường dẫn đến file audio
     */
    async generateVoice(text, lang = 'vi') {
        try {
            logger.info(`Đang tạo giọng nói cho nội dung (Lang: ${lang})...`);
            
            // Lấy URL từ Google TTS (Giới hạn 200 ký tự mỗi lần gọi)
            // Nếu text dài hơn, chúng ta cần chia nhỏ nhưng hiện tại làm bản demo ngắn
            const url = googleTTS.getAudioUrl(text.substring(0, 200), {
                lang: lang,
                slow: false,
                host: 'https://translate.google.com',
            });

            const fileName = `voice_${Date.now()}.mp3`;
            const filePath = path.join(this.tempPath, fileName);

            const response = await axios({
                method: 'get',
                url: url,
                responseType: 'stream',
            });

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    logger.success(`Đã tạo âm thanh TTS: ${filePath}`);
                    resolve(filePath);
                });
                writer.on('error', reject);
            });
        } catch (error) {
            logger.error(`Lỗi Voice Generator: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new VoiceGenerator();
