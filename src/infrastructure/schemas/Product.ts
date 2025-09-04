import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  stripePriceId: {
    type: String,
    required: true,
    // Validation to ensure it starts with 'price_'
    validate: {
      validator: function(v: string) {
        return v.startsWith('price_');
      },
      message: 'stripePriceId must be a valid Stripe price ID'
    }
  },
  stripeProductId: {
    type: String
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
});

// Add indexes for better query performance
ProductSchema.index({ categoryId: 1 }); // For filtering by category
ProductSchema.index({ name: 1 }); // For text search
ProductSchema.index({ price: 1 }); // For price sorting
ProductSchema.index({ stock: 1 }); // For stock queries
ProductSchema.index({ createdAt: -1 }); // For recent products

export default mongoose.model("Product", ProductSchema);
