import { put, del, list } from '@vercel/blob';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for memory storage (Vercel Blob handles the upload)
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  }
});

// Helper function to upload image to Vercel Blob
export const uploadImage = async (file: Express.Multer.File, filename?: string) => {
  try {
    const blobName = filename || `products/${uuidv4()}-${file.originalname}`;
    
    const blob = await put(blobName, file.buffer as any, {
      access: 'public',
      contentType: file.mimetype,
    });
    
    return blob;
  } catch (error) {
    console.error('Error uploading image to Vercel Blob:', error);
    throw error;
  }
};

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
} = {}) => {
  const { width, height, quality = 80, format = 'auto' } = options;
  
  // Vercel Blob URLs can be used directly
  // For image optimization, you can use Vercel's Image Optimization API
  if (width || height || quality !== 80 || format !== 'auto') {
    // If you have Vercel Image Optimization enabled, you can use:
    // return `https://your-domain.com/_next/image?url=${encodeURIComponent(url)}&w=${width}&h=${height}&q=${quality}`;
    
    // For now, return the direct blob URL
    return url;
  }
  
  return url;
};

// Helper function to delete image
export const deleteImage = async (url: string) => {
  try {
    // Extract the blob URL from the full URL
    const urlParts = url.split('/');
    const blobName = urlParts[urlParts.length - 1];
    
    await del(url);
    return { success: true };
  } catch (error) {
    console.error('Error deleting image from Vercel Blob:', error);
    throw error;
  }
};

// Helper function to list images (useful for management)
export const listImages = async (prefix?: string) => {
  try {
    const { blobs } = await list({
      prefix: prefix || 'products/',
      limit: 1000,
    });
    
    return blobs;
  } catch (error) {
    console.error('Error listing images from Vercel Blob:', error);
    throw error;
  }
};

export default { uploadImage, getOptimizedImageUrl, deleteImage, listImages };
