import mongoose, { disconnect, Schema } from "mongoose";

const RoomSchema = new Schema(
  {
    title: {
      type: String,
      require: true,
      trim: true,
    },
    description: {
      type: String,
      require: true,
      trim: true,
    },
    photos: {
      type: [String],
      require: true,
    },
    location: {
      type: String,
      require: true,
      trim: true,
    },
    city: {
      type: String,
      require: true,
      trim: true,
    },
    state: {
      type: String,
      require: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      require: true,
      trim: true,
    },
    suitableFor: {
      type: String,
      enum: ["students", "girls", "boys", "family", "all"],
      require: true,
    },
    rent: {
      type: Number,
      require: true,
      min: 0,
    },
    advance: {
      type: Number,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    features: {
      type: [String],
      trim: true,
    },
    availability: {
      type: Boolean,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Room = mongoose.model("Room", RoomSchema);
