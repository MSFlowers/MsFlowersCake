const fs = require('fs');
const path = require('path');
const ImageKit = require('imagekit');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx > 0) env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
}

const imagekit = new ImageKit({
  publicKey: env['NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY'],
  privateKey: env['IMAGEKIT_PRIVATE_KEY'],
  urlEndpoint: env['NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT'],
});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_Secret_key']);

async function uploadRemaining() {
  const folders = [
    { dir: path.join(process.cwd(), 'public', 'categories'), ikFolder: '/categories', prefix: '/categories' },
    { dir: path.join(process.cwd(), 'public', 'trust'), ikFolder: '/trust', prefix: '/trust' }
  ];

  const mapping = {};

  for (const { dir, ikFolder, prefix } of folders) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    for (const file of files) {
      const localRelPath = `${prefix}/${file}`;
      const localFullPath = path.join(dir, file);
      const fileBuffer = fs.readFileSync(localFullPath);

      try {
        const res = await imagekit.upload({
          file: fileBuffer,
          fileName: file,
          folder: ikFolder,
          useUniqueFileName: false,
        });
        mapping[localRelPath] = res.url;
        console.log(`[OK] ${localRelPath} -> ${res.url}`);
      } catch (err) {
        console.error(`[ERR] ${localRelPath}:`, err.message);
        mapping[localRelPath] = `${env['NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT']}${prefix}/${file}`;
      }
    }
  }

  // Update Supabase
  const { data: prods } = await supabase.from('products').select('id, name, image, images');
  let updated = 0;
  for (const prod of prods) {
    let changed = false;
    let nextImage = prod.image;
    let nextImages = Array.isArray(prod.images) ? [...prod.images] : [];

    if (prod.image && mapping[prod.image]) {
      nextImage = mapping[prod.image];
      changed = true;
    }

    nextImages = nextImages.map(img => {
      if (mapping[img]) {
        changed = true;
        return mapping[img];
      }
      return img;
    });

    if (changed) {
      await supabase.from('products').update({ image: nextImage, images: nextImages }).eq('id', prod.id);
      updated++;
      console.log(`Updated product: ${prod.name}`);
    }
  }

  console.log(`\nSuccessfully updated ${updated} more products in Supabase.`);
}

uploadRemaining().catch(console.error);
