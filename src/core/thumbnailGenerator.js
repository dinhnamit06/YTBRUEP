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

    async extractFrame(videoPath) {
        return new Promise((resolve, reject) => {
            const frameName = `frame_${Date.now()}.jpg`;
            const framePath = path.join(this.tempPath, frameName);

            ffmpeg(videoPath)
                .screenshots({
                    timestamps: ['30%'], 
                    filename: frameName,
                    folder: this.tempPath,
                })
                .on('end', () => resolve(framePath))
                .on('error', reject);
        });
    }

    async generate(videoPath, title) {
        try {
            const baseFrame = await this.extractFrame(videoPath);
            const thumbPath = path.join(this.outputPath, `premium_thumb_${path.basename(videoPath, '.mp4')}.jpg`);

            const width = 1280;
            const height = 720;
            const displayTitle = title.toUpperCase();

            // SVG Thiết kế "Professional Clickbait"
            // Sử dụng màu Đỏ/Vàng, đổ bóng cực mạnh, và font đậm
            const svgText = `
                <svg width="${width}" height="${height}">
                    <defs>
                        <linearGradient id="textGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
                        </linearGradient>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="15" />
                            <feOffset dx="0" dy="10" result="offsetblur" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.8"/>
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    
                    <!-- Lớp phủ tối phía dưới để text nổi bật -->
                    <rect x="0" y="450" width="1280" height="270" fill="url(#bottomGradient)" opacity="0.8" />
                    <linearGradient id="bottomGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="transparent" />
                        <stop offset="100%" stop-color="black" />
                    </linearGradient>

                    <!-- Text chính style YouTube Pro -->
                    <text x="50%" y="620" 
                        text-anchor="middle" 
                        filter="url(#shadow)"
                        style="fill:url(#textGradient); font-family: ArialBlack, sans-serif; font-size: 150px; font-weight: 900; letter-spacing: -5px; stroke: #000; stroke-width: 15px; paint-order: stroke;">
                        ${displayTitle}
                    </text>
                </svg>
            `;

            await sharp(baseFrame)
                .resize(width, height)
                .modulate({
                    brightness: 1.1,
                    saturation: 1.3 // Làm màu sắc video rực rỡ hơn (YouTube style)
                })
                .composite([{
                    input: Buffer.from(svgText),
                    top: 0,
                    left: 0,
                }])
                .toFile(thumbPath);

            logger.success(`Đã nâng cấp Thumbnail Premium: ${thumbPath}`);
            await fs.remove(baseFrame);
            return thumbPath;
        } catch (error) {
            logger.error(`Lỗi Nâng cấp Thumbnail: ${error.message}`);
            return null;
        }
    }
}

module.exports = new ThumbnailGenerator();
