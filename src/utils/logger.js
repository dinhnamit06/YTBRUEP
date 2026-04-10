const colors = require('colors');

const logger = {
    info: (msg) => console.log(`[INFO] `.cyan + msg),
    success: (msg) => console.log(`[SUCCESS] `.green + msg),
    error: (msg) => console.error(`[ERROR] `.red + msg),
    warn: (msg) => console.log(`[WARN] `.yellow + msg),
    divider: () => console.log('--------------------------------------------------'.gray)
};

module.exports = logger;
