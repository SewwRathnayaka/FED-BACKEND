import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

// Add index for better query performance
CategorySchema.index({ name: 1 }); // For category name lookups

export default mongoose.model("Category", CategorySchema);
