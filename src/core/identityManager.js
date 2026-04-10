const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class IdentityManager {
    constructor() {
        this.configPath = './config/identities.json';
        fs.ensureDirSync('./config');
        this.initDefault();
    }

    initDefault() {
        if (!fs.existsSync(this.configPath)) {
            const defaults = {
                "default": {
                    "name": "Kênh Tổng Hợp",
                    "engine": "google",
                    "lang": "vi",
                    "style": "Hào hứng",
                    "description": "Giọng đọc Google chuẩn bài."
                },
                "news_pro": {
                    "name": "Biên Tập Viên Tin Tức",
                    "engine": "elevenlabs",
                    "voiceId": "pNInz6obpgnuMvscL7PR", // Giọng mẫu chuyên nghiệp
                    "lang": "vi",
                    "description": "Giọng chuyên nghiệp cho kênh tin tức."
                },
                "story_teller": {
                    "name": "Người Kể Chuyện Đêm Khuya",
                    "engine": "google",
                    "lang": "vi",
                    "slow": true,
                    "description": "Giọng đọc chậm rãi, truyền cảm."
                }
            };
            fs.writeJsonSync(this.configPath, defaults, { spaces: 2 });
            logger.info('Đã khởi tạo danh sách Căn Tính (Identity) mặc định.');
        }
    }

    /**
     * Lấy thông tin căn tính theo ID
     */
    getIdentity(id = 'default') {
        const identities = fs.readJsonSync(this.configPath);
        return identities[id] || identities['default'];
    }

    /**
     * Thêm mới hoặc cập nhật căn tính
     */
    updateIdentity(id, data) {
        const identities = fs.readJsonSync(this.configPath);
        identities[id] = { ...identities[id], ...data };
        fs.writeJsonSync(this.configPath, identities, { spaces: 2 });
    }
}

module.exports = new IdentityManager();
