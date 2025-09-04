import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { uploadImage } from '../infrastructure/vercel-blob';

// Load environment variables
dotenv.config();

// Configuration
const LOCAL_IMAGES_DIR = path.join(__dirname, '../../../FED-FRONTEND/public/assets/products');

interface ImageFile {
  name: string;
  path: string;
  size: number;
}

async function migrateImages() {
  try {
    console.log('Starting image migration to Vercel Blob...');
    
    // Check if environment variables are loaded
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN not found in environment variables');
      console.log('Make sure your .env file is in the FED-BACKEND directory and contains:');
      console.log('BLOB_READ_WRITE_TOKEN=vercel_blob_your_token_here');
      return;
    }
    
    console.log('✅ Vercel Blob token found in environment variables');
    
    // Check if local images directory exists
    if (!fs.existsSync(LOCAL_IMAGES_DIR)) {
      console.error(`Local images directory not found: ${LOCAL_IMAGES_DIR}`);
      return;
    }

    // Read all image files from local directory
    const imageFiles = await getImageFiles(LOCAL_IMAGES_DIR);
    console.log(`Found ${imageFiles.length} image files to migrate`);

    if (imageFiles.length === 0) {
      console.log('No image files found to migrate');
      return;
    }

    // Upload each image to Vercel Blob
    const results = [];
    for (const imageFile of imageFiles) {
      try {
        console.log(`Uploading ${imageFile.name}...`);
        
        const fileBuffer = fs.readFileSync(imageFile.path);
        
        // Create a mock file object for multer compatibility
        const mockFile: Express.Multer.File = {
          fieldname: 'image',
          originalname: imageFile.name,
          encoding: '7bit',
          mimetype: getMimeType(imageFile.name),
          size: imageFile.size,
          buffer: fileBuffer,
          destination: '',
          filename: imageFile.name,
          path: imageFile.path,
          stream: null as any,
        };

        const blob = await uploadImage(mockFile, `products/${imageFile.name}`);
        
        results.push({
          name: imageFile.name,
          key: blob.pathname,
          url: blob.url,
          status: 'success'
        });
        
        console.log(`✅ Successfully uploaded ${imageFile.name}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${imageFile.name}:`, error);
        results.push({
          name: imageFile.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Print summary
    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'failed');
    
    console.log('\n=== Migration Summary ===');
    console.log(`Total files: ${results.length}`);
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);
    
    if (successful.length > 0) {
      console.log('\n✅ Successfully migrated images:');
      successful.forEach(result => {
        console.log(`  - ${result.name} → ${result.url}`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed to migrate:');
      failed.forEach(result => {
        console.log(`  - ${result.name}: ${result.error}`);
      });
    }

    console.log('\nMigration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

async function getImageFiles(directory: string): Promise<ImageFile[]> {
  const files = fs.readdirSync(directory);
  const imageFiles: ImageFile[] = [];
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        imageFiles.push({
          name: file,
          path: filePath,
          size: stat.size
        });
      }
    }
  }
  
  return imageFiles;
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateImages()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateImages };