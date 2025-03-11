import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import * as sharp from 'sharp';

import { FirestoreCollections } from '../src/app/core/interfaces/firestore/firestore-collections.enum';
import { ProductFirestore } from '../src/app/core/interfaces/product/product.firestore';
import { FirestoreService } from './firestore.service';

dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = require(
  path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS as string)
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const bucket = admin.storage().bucket();

/**
 * Add images property to the products
 */
(async () => {
  console.time('done');

  try {
    const productsService = new FirestoreService<ProductFirestore>(
      FirestoreCollections.products
    );

    console.log('Reading all products...');
    const products = await productsService.getList();
    console.log('Products count:', products.length);

    if (!products.length) {
      console.log('No products to update.');
      return;
    }

    console.log('Resizing all images-...');
    for (const product of products) {
      console.log(`Resizing product- ${product.id}`);
      const images = [];
      for (const fullSizeUrl of product.imageUrls) {
        console.log('Уменьшение изображения...');
        const tempFilePath = path.join(tmpdir(), `original-${Date.now()}.webp`);
        const tempThumbPath = path.join(tmpdir(), `thumb-${Date.now()}.webp`);
        const destinationPath = `products/thumbnails/thumb-${Date.now()}.webp`;

        console.log('Скачивание изображения:', fullSizeUrl);
        const response = await fetch(fullSizeUrl);
        if (!response.ok)
          throw new Error(`Ошибка загрузки: ${response.status}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(tempFilePath, buffer);
        await sharp(tempFilePath)
          .resize(500, 750, { fit: 'inside' })
          .toFile(tempThumbPath);
        // 3. Загружаем уменьшенное изображение в Firebase Storage
        console.log('Загрузка в Firebase Storage...');
        const thumbnailUrl = await uploadImage(tempThumbPath, destinationPath);

        images.push({
          fullSizeUrl: fullSizeUrl,
          previewUrl: thumbnailUrl!
        });
      }
      product.images = images;
    }

    const data = products.map(({ id, images }) => ({
      id,
      images
    }));

    console.log('Saving images to the products with slow batch...');
    await productsService.slowBatchUpdate(data as Partial<ProductFirestore>[]);
  } catch (e) {
    console.log(e);
  }

  console.timeEnd('done');
})();

async function uploadImage(localFilePath: string, destinationPath: string) {
  try {
    await bucket.upload(localFilePath, {
      destination: destinationPath,
      metadata: {
        contentType: 'image/webp' // Set correct MIME type
      }
    });

    console.log(`File uploaded to ${destinationPath}`);

    // Get the public URL
    const file = bucket.file(destinationPath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2260' // Set expiration date
    });

    console.log(`Public URL: ${url}`);
    return url;
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}
