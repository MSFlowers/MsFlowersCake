const fs = require('fs');
const path = require('path');
const ImageKit = require('imagekit');

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_ZxVApJt7DbRrZc9ofbuMgBRoSFY=",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_6PjWeNe6CXGyhetxYjCOKKrPFFI=",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/2zqgtm5bv",
});

const BANNERS = [
  'anniversary-desktop.jpg',
  'anniversary-mobile.jpg',
  'cakes-desktop.jpg',
  'cakes-mobile.jpg',
  'birthday-desktop.jpg',
  'birthday-mobile.jpg',
];

async function run() {
  console.log('Uploading existing banners to ImageKit (/hero-slides)...');
  const results = {};
  for (const filename of BANNERS) {
    const localPath = path.join(process.cwd(), 'public', 'banners', filename);
    if (!fs.existsSync(localPath)) {
      console.warn('File not found:', localPath);
      continue;
    }
    const fileBuffer = fs.readFileSync(localPath);
    try {
      const res = await imagekit.upload({
        file: fileBuffer,
        fileName: filename,
        folder: '/hero-slides',
        useUniqueFileName: false,
      });
      console.log(`Uploaded ${filename} -> ${res.url}`);
      results[filename] = res.url;
    } catch (err) {
      console.error(`Failed ${filename}:`, err.message);
    }
  }
  fs.writeFileSync('public/banners/imagekit-urls.json', JSON.stringify(results, null, 2));
  console.log('Done! Saved to public/banners/imagekit-urls.json');
}

run();
