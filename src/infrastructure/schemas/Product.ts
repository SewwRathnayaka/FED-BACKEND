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
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
});

export default mongoose.model("Product", ProductSchema);
