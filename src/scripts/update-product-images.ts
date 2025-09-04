import mongoose from 'mongoose';
import Product from '../infrastructure/schemas/Product';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import the connectDB function
import { connectDB } from '../infrastructure/db';

// Mapping of local image paths to Vercel Blob URLs
const imageUrlMapping: { [key: string]: string } = {
  '/assets/products/airpods-max.png': 'https://rspe1x6h41aadylf.public.blob.vercel-storage.com/products/airpods-max-ZqKQbtF2HsHecgTIDwNSRpdwoXuwbE.png',
  '/assets/products/apple-watch.png': 'https://rspe1x6h41aadylf.public.blob.vercel-storage.com/products/apple-watch-PtPCL0G1KVsfwaLbnG4ErVchzNat8j.png',
  '/assets/products/echo-dot.png': 'https://rspe1x6h41aadylf.public.blob.vercel-storage.com/products/echo-dot-CXnqxhHSprhHV3zM3SLoxT4Rj2YEC3.png',
  '/assets/products/Fashion1.jpeg.jpg': 'https://rspe1x6h41aadylf.public.blob.vercel-storage.com/products/Fashion1.jpeg-M2bV4H2n1Kb3K3Jdi48XB2TYSBF8ws.jpg',
  '/assets/products/iphone-15.png': 'https://rspe1x6h41aadylf.public.blob.vercel-storage.com/products/iphone-15-4l8RNXnwh1vqUblbfzf5xhHXBrPXAH.png',
  '/assets/products/pixel-8.png': 'https://rspe1x6h41aadylf.public.blob.vercel-storage.com/products/pixel-8-01wKdhiqoTtWo4iqwcT6dqzQ2lpQIa.png',
  '/assets/products/pixel-buds.png': 'https://rspe1x6h41aadylf.public.blob.vercel-storage.com/products/pixel-buds-VtkXBYHUD9osHrJxVFqQewD1IHHJC9.png',
  '/assets/products/quietcomfort.png': 'https://rspe1x6h41aadylf.public.blob.vercel-storage.com/products/quietcomfort-nyANmhayRegRllC3HgmgaUI06qmJiy.png',
  '/assets/products/soundlink.png': 'https://rspe1x6h41aadylf.public.blob.vercel-storage.com/products/soundlink-6XchAcGZvurMy7YvL4jdbGL7N5IbSf.png'
};

async function updateProductImages() {
  try {
    console.log('Starting product image URL update...');
    
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const currentImagePath = product.image;
      
      // Check if this product has a local image path that needs updating
      if (imageUrlMapping[currentImagePath]) {
        const newImageUrl = imageUrlMapping[currentImagePath];
        
        // Update the product with the new Vercel Blob URL
        await Product.updateOne(
          { _id: product._id },
          { $set: { image: newImageUrl } }
        );
        
        console.log(`✅ Updated ${product.name}: ${currentImagePath} → ${newImageUrl}`);
        updatedCount++;
      } else {
        console.log(`⏭️ Skipped ${product.name}: ${currentImagePath} (already updated or not in mapping)`);
        skippedCount++;
      }
    }

    console.log('\n=== Update Summary ===');
    console.log(`Total products: ${products.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);

    console.log('\n✅ Product image URLs updated successfully!');
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error updating product images:', error);
    process.exit(1);
  }
}

// Run the update if this script is executed directly
if (require.main === module) {
  updateProductImages()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Update script failed:', error);
      process.exit(1);
    });
}

export { updateProductImages };
