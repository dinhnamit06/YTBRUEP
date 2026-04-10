const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
require('dotenv').config();

class ContentAnalyzer {
    constructor() {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }, { apiVersion: "v1beta" });
    }

    /**
     * Phân tích nội dung và đề xuất chiến lược YouTube
     * @param {string} rawText - Văn bản đã transcribe
     */
    async analyze(rawText) {
        try {
            logger.info('Đang phân tích cấu trúc nội dung bằng Gemini...');
            
            const prompt = `
                Bạn là một chuyên gia tối ưu hóa nội dung YouTube.
                Dưới đây là văn bản gốc:
                ---
                ${rawText}
                ---
                Hãy thực hiện:
                1. Phân tích Hook, Body, CTA.
                2. Đề xuất tiêu đề SEO.
                3. Viết lại kịch bản hấp dẫn hơn.
                
                QUAN TRỌNG: Hãy cung cấp:
                1. "TIMED_SCRIPT": Kịch bản kèm mốc thời gian để làm sub.
                2. "CLEAN_SCRIPT": Kịch bản trơn để đọc voice.
                3. "SHORT_TITLE": Chỉ 2-3 từ cực mạnh, cực sốc (Ví dụ: "BÍ MẬT!", "CẢNH BÁO!", "QUÁ ĐỈNH!") để chèn vào Thumbnail.

                Trả về kết quả bằng tiếng Việt.
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const analysis = response.text();

            logger.success('Phân tích nội dung hoàn tất!');
            return analysis;
        } catch (error) {
            logger.error(`Lỗi phân tích nội dung: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new ContentAnalyzer();
