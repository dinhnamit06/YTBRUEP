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
     * Chuyển đổi văn bản thành giọng nói (TTS) dựa trên căn tính
     * @param {string} text - Văn bản cần đọc
     * @param {Object} identity - Object chứa thông tin engine và config
     */
    async generateVoice(text, identity = { engine: 'google', lang: 'vi' }) {
        try {
            logger.info(`Đang tạo giọng nói bằng Engine: ${identity.engine}...`);
            
            const fileName = `voice_${identity.engine}_${Date.now()}.mp3`;
            const filePath = path.join(this.tempPath, fileName);

            if (identity.engine === 'elevenlabs') {
                return await this.generateElevenLabs(text, identity.voiceId, filePath);
            } else {
                return await this.generateGoogle(text, identity.lang || 'vi', filePath);
            }
        } catch (error) {
            logger.error(`Lỗi Voice Generator: ${error.message}`);
            throw error;
        }
    }

    /**
     * Tạo voice bằng Google TTS (Miễn phí)
     */
    async generateGoogle(text, lang, filePath) {
        const url = googleTTS.getAudioUrl(text.substring(0, 200), {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        const response = await axios({ method: 'get', url: url, responseType: 'stream' });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                logger.success(`Đã tạo âm thanh Google: ${filePath}`);
                resolve(filePath);
            });
            writer.on('error', reject);
        });
    }

    /**
     * Tạo voice bằng ElevenLabs (Chất lượng cao - Yêu cầu API Key)
     */
    async generateElevenLabs(text, voiceId, filePath) {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey || apiKey === 'your_key_here') {
            logger.warn('Chưa có ElevenLabs API Key. Tự động chuyển về Google TTS...');
            return await this.generateGoogle(text, 'vi', filePath);
        }

        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        const response = await axios({
            method: 'post',
            url: url,
            headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
                'accept': 'audio/mpeg'
            },
            data: {
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            },
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                logger.success(`Đã tạo âm thanh ElevenLabs: ${filePath}`);
                resolve(filePath);
            });
            writer.on('error', reject);
        });
    }
}

module.exports = new VoiceGenerator();
