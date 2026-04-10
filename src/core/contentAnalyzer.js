const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
require('dotenv').config();

class ContentAnalyzer {
    constructor() {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: "v1" });
    }

    /**
     * Phân tích nội dung và đề xuất chiến lược YouTube
     * @param {string} rawText - Văn bản đã transcribe
     */
    async analyze(rawText) {
        try {
            logger.info('Đang phân tích cấu trúc nội dung bằng Gemini...');
            
            const prompt = `
                Bạn là một chuyên gia tối ưu hóa nội dung YouTube (YouTube Growth Expert).
                Dưới đây là văn bản thô được trích xuất từ một video TikTok:
                ---
                ${rawText}
                ---
                Hãy thực hiện các nhiệm vụ sau:
                1. Phân tích cấu trúc video: Cụ thể đâu là Hook (mở đầu), Body (nội dung chính), và CTA (kêu gọi hành động).
                2. Đánh giá tiềm năng: Nội dung này phù hợp làm YouTube Shorts hay Long-form hơn? Tại sao?
                3. Đề xuất tiêu đề (Title): Viết 3 tiêu đề chuẩn SEO YouTube và có tính clickbait cao.
                4. Đề xuất mô tả (Description): Viết một đoạn mô tả ngắn gọn kèm hashtag phù hợp.
                5. Viết lại kịch bản (Script Rewriting): Viết lại nội dung trên sao cho hấp dẫn hơn để re-up lên YouTube mà không bị đánh gậy nội dung trùng lặp.

                Trả về kết quả bằng tiếng Việt, định dạng rõ ràng.
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
