import mongoose from "mongoose";

export interface IOrder extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      image: string;
      description: string;
      stripePriceId: string;
    };
    quantity: number;
  }>;
  orderStatus: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
}

const OrderProductSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  stripePriceId: { type: String, required: true },
});

const ItemSchema = new mongoose.Schema({
  product: { type: OrderProductSchema, required: true },
  quantity: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  addressId: { type: String, required: true },
  items: {
    type: [ItemSchema],
    required: true,
  },
  orderStatus: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
    default: "PENDING",
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID"],
    default: "PENDING",
    required: true,
  },
});

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;