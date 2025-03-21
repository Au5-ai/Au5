const fs = require('fs');
const path = require('path');

const extensionDir = path.join(__dirname, 'src', 'extension');
const iconsDir = path.join(extensionDir, 'icons');

// Create directories if they don't exist
if (!fs.existsSync(extensionDir)) {
    fs.mkdirSync(extensionDir, { recursive: true });
}
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Create placeholder icons (1x1 transparent PNG)
const transparentPixel = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA63FAFFFFFF3F0005FE02FEC1B64CFB0000000049454E44AE426082', 'hex');

const iconSizes = [16, 48, 128];
iconSizes.forEach(size => {
    fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), transparentPixel);
}); 