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
                
                QUAN TRỌNG: Hãy cung cấp một phần có tiêu đề "TIMED_SCRIPT" chứa kịch bản mới được chia thành các đoạn ngắn (mỗi đoạn 3-5 từ), kèm mốc thời gian giả định theo cấu trúc:
                [START_TIME --> END_TIME]: Nội dung câu
                (Ví dụ: [00:00:00,000 --> 00:00:02,500]: Xin chào các bạn!)

                Và phần "CLEAN_SCRIPT" chỉ chứa nội dung kịch bản để đọc voice.

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
