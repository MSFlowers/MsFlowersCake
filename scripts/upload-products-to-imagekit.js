const fs = require('fs');
const path = require('path');
const ImageKit = require('imagekit');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
try {
  const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch (e) {
  // ignore
}

// 1. Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_ZxVApJt7DbRrZc9ofbuMgBRoSFY=",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_6PjWeNe6CXGyhetxYjCOKKrPFFI=",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/2zqgtm5bv",
});

// 2. Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://iwbxuxrxqarcqsyryfbp.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_Secret_key || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const GROUPS = ['flowers', 'cakes', 'combos'];

async function uploadAll() {
  console.log('--- Step 1: Uploading local product images to ImageKit ---');
  const mapping = {};
  let totalUploaded = 0;
  let totalSkipped = 0;

  for (const group of GROUPS) {
    const dirPath = path.join(process.cwd(), 'public', 'products', group);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'));
    console.log(`\nProcessing ${group} (${files.length} images)...`);

    for (const file of files) {
      const localRelPath = `/products/${group}/${file}`;
      const localFullPath = path.join(dirPath, file);
      const fileBuffer = fs.readFileSync(localFullPath);

      try {
        const res = await imagekit.upload({
          file: fileBuffer,
          fileName: file,
          folder: `/products/${group}`,
          useUniqueFileName: false,
        });

        mapping[localRelPath] = res.url;
        console.log(`[OK] ${localRelPath} -> ${res.url}`);
        totalUploaded++;
      } catch (err) {
        console.error(`[ERR] ${localRelPath}:`, err.message);
        // Fallback standard predicted URL
        const fallbackUrl = `https://ik.imagekit.io/2zqgtm5bv/products/${group}/${file}`;
        mapping[localRelPath] = fallbackUrl;
      }
    }
  }

  // Save mapping to file
  const mappingPath = path.join(process.cwd(), 'public', 'products', 'imagekit-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`\nMapping written to: ${mappingPath} (Total ${Object.keys(mapping).length} images mapped)`);

  // 3. Generate SQL migration script
  console.log('\n--- Step 2: Generating SQL migration file ---');
  let sql = `-- Migration: Replace local /products/... paths with ImageKit URLs\n`;
  sql += `-- Generated on ${new Date().toISOString()}\n\n`;

  for (const [localPath, ikUrl] of Object.entries(mapping)) {
    sql += `UPDATE public.categories SET image_url = '${ikUrl}' WHERE image_url = '${localPath}';\n`;
    sql += `UPDATE public.products SET image = '${ikUrl}' WHERE image = '${localPath}';\n`;
    sql += `UPDATE public.products SET images = array_replace(images, '${localPath}', '${ikUrl}') WHERE '${localPath}' = ANY(images);\n`;
  }

  const sqlPath = path.join(process.cwd(), 'supabase', 'migrate_products_to_imagekit.sql');
  fs.writeFileSync(sqlPath, sql);
  console.log(`SQL script generated at: ${sqlPath}`);

  // 4. Update Supabase Database directly
  console.log('\n--- Step 3: Updating Supabase database tables ---');
  if (!supabaseServiceKey) {
    console.log('Skipping direct DB update: SUPABASE_Secret_key not provided in env.');
    return;
  }

  // Update categories
  const { data: categories, error: catErr } = await supabase.from('categories').select('id, name, slug, image_url');
  if (catErr) {
    console.error('Error fetching categories:', catErr);
  } else if (categories) {
    let catUpdates = 0;
    for (const cat of categories) {
      if (cat.image_url && mapping[cat.image_url]) {
        const nextUrl = mapping[cat.image_url];
        await supabase.from('categories').update({ image_url: nextUrl }).eq('id', cat.id);
        catUpdates++;
      }
    }
    console.log(`Updated ${catUpdates} categories with ImageKit URLs in Supabase.`);
  }

  // Update products
  const { data: products, error: prodErr } = await supabase.from('products').select('id, name, slug, image, images');
  if (prodErr) {
    console.error('Error fetching products:', prodErr);
  } else if (products) {
    let prodUpdates = 0;
    for (const prod of products) {
      let changed = false;
      let nextImage = prod.image;
      let nextImages = Array.isArray(prod.images) ? [...prod.images] : [];

      if (prod.image && mapping[prod.image]) {
        nextImage = mapping[prod.image];
        changed = true;
      }

      nextImages = nextImages.map((img) => {
        if (mapping[img]) {
          changed = true;
          return mapping[img];
        }
        return img;
      });

      if (changed) {
        await supabase.from('products').update({ image: nextImage, images: nextImages }).eq('id', prod.id);
        prodUpdates++;
      }
    }
    console.log(`Updated ${prodUpdates} products with ImageKit URLs in Supabase.`);
  }

  console.log('\nAll done successfully!');
}

uploadAll().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
