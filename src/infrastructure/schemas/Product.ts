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
});

export default mongoose.model("Product", ProductSchema);

// Add this debug query to check your data
const debugProducts = async (categoryId: string) => {
  const products = await mongoose.model("Product").find({}).lean();
  console.log('All products:', products.map(p => ({
    id: p._id,
    categoryId: p.categoryId,
    name: p.name
  })));
};
