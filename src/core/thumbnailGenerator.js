const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

class ThumbnailGenerator {
    constructor() {
        this.outputPath = './output/thumbnails';
        this.tempPath = './temp/frames';
        fs.ensureDirSync(this.outputPath);
        fs.ensureDirSync(this.tempPath);
    }

    /**
     * Chụp một khung hình từ video (mặc định giây thứ 2)
     */
    async extractFrame(videoPath) {
        return new Promise((resolve, reject) => {
            const frameName = `frame_${Date.now()}.jpg`;
            const framePath = path.join(this.tempPath, frameName);

            ffmpeg(videoPath)
                .screenshots({
                    timestamps: ['20%'], // Chụp ở 20% thời lượng video
                    filename: frameName,
                    folder: this.tempPath,
                })
                .on('end', () => {
                    logger.info(`Đã chụp ảnh gốc cho thumbnail: ${framePath}`);
                    resolve(framePath);
                })
                .on('error', reject);
        });
    }

    /**
     * Tạo Thumbnail chuyên nghiệp bằng cách chèn text
     * @param {string} videoPath - Đường dẫn video
     * @param {string} title - Tiêu đề thu hút (từ Gemini)
     */
    async generate(videoPath, title) {
        try {
            const baseFrame = await this.extractFrame(videoPath);
            const thumbPath = path.join(this.outputPath, `thumb_${path.basename(videoPath, '.mp4')}.jpg`);

            logger.info('Đang thiết kế Thumbnail bằng Sharp...');

            // Tạo một lớp overlay text (SVG đơn giản)
            const width = 1280;
            const height = 720;
            
            // Chia nhỏ tiêu đề nếu quá dài
            const displayTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;

            const svgText = `
                <svg width="${width}" height="${height}">
                    <style>
                        .title { fill: yellow; font-size: 80px; font-weight: bold; font-family: sans-serif; stroke: black; stroke-width: 4px; }
                        .bg { fill: rgba(0,0,0,0.5); }
                    </style>
                    <rect x="0" y="500" width="${width}" height="200" class="bg" />
                    <text x="50%" y="620" text-anchor="middle" class="title">${displayTitle.toUpperCase()}</text>
                </svg>
            `;

            await sharp(baseFrame)
                .resize(width, height)
                .composite([{
                    input: Buffer.from(svgText),
                    top: 0,
                    left: 0,
                }])
                .toFile(thumbPath);

            logger.success(`Đã tạo thành công Thumbnail: ${thumbPath}`);
            
            // Xóa ảnh tạm
            await fs.remove(baseFrame);
            
            return thumbPath;
        } catch (error) {
            logger.error(`Lỗi Thumbnail Generator: ${error.message}`);
            return null;
        }
    }
}

module.exports = new ThumbnailGenerator();
