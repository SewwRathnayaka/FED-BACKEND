import express from "express";
import { upload, uploadImage, getOptimizedImageUrl, deleteImage } from "../infrastructure/vercel-blob";
import { isAuthenticated } from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";

export const uploadRouter = express.Router();

// Upload single image
uploadRouter.post(
  "/image",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  async (req, res): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file provided" });
        return;
      }

      // Upload to Vercel Blob
      const blob = await uploadImage(req.file);
      
      // Get optimized URL
      const imageUrl = getOptimizedImageUrl(blob.url, {
        width: 800,
        height: 800,
        quality: 80,
        format: 'auto'
      });

      res.status(200).json({
        success: true,
        imageUrl,
        key: blob.pathname,
        url: blob.url,
        message: "Image uploaded successfully"
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  }
);

// Upload multiple images
uploadRouter.post(
  "/images",
  isAuthenticated,
  isAdmin,
  upload.array("images", 10), // Max 10 images
  async (req, res): Promise<void> => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        res.status(400).json({ error: "No image files provided" });
        return;
      }

      const files = req.files as Express.Multer.File[];
      const uploadedImages = [];

      for (const file of files) {
        const blob = await uploadImage(file);
        const imageUrl = getOptimizedImageUrl(blob.url, {
          width: 800,
          height: 800,
          quality: 80,
          format: 'auto'
        });

        uploadedImages.push({
          imageUrl,
          key: blob.pathname,
          url: blob.url
        });
      }

      res.status(200).json({
        success: true,
        images: uploadedImages,
        message: `${files.length} images uploaded successfully`
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload images" });
    }
  }
);

// Delete image
uploadRouter.delete("/image", isAuthenticated, isAdmin, async (req, res): Promise<void> => {
  try {
    const { url } = req.body;
    
    if (!url) {
      res.status(400).json({ error: "Image URL is required" });
      return;
    }
    
    await deleteImage(url);
    
    res.status(200).json({
      success: true,
      message: "Image deleted successfully"
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});