const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'assets', 'images');

const files = fs.readdirSync(imagesDir);

files.forEach(file => {
  const filePath = path.join(imagesDir, file);
  const ext = path.extname(file).toLowerCase();
  
  if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
    console.log(`Файл ${file} нужно конвертировать в WebP вручную используя онлайн конвертер или ImageMagick`);
  }
});

console.log('\nДля конвертирования используйте одну из команд:');
console.log('1. Online: https://cloudconvert.com/');
console.log('2. ImageMagick: magick convert input.png output.webp');
console.log('3. FFmpeg: ffmpeg -i input.png output.webp');
