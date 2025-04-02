const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/book-icon.svg'));

  // Generate favicon.ico (16x16, 32x32, 48x48)
  const sizes = [16, 32, 48];
  const icoBuffers = await Promise.all(
    sizes.map(size => 
      sharp(svgBuffer)
        .resize(size, size)
        .toFormat('png')
        .toBuffer()
    )
  );
  
  // Write favicon.ico
  const ico = Buffer.concat(icoBuffers);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), ico);

  // Generate PNG icons
  const pngSizes = [192, 512];
  for (const size of pngSizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .toFormat('png')
      .toFile(path.join(__dirname, `../public/logo${size}.png`));
  }

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error); 