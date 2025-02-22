import mongoose, { disconnect, Schema } from "mongoose";

const RoomSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    photos: {
      type: [String],
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    suitableFor: {
      type: String,
      enum: ["student", "girls", "boys", "family", "all", "professional"],
      required: true,
    },
    rent: {
      type: Number,
      required: true,
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
      required: true,
    },
    people: {
      type: String,
      required: true,
      default: 1,
    },
    ownerID: {
      type: Schema.Types.ObjectId,
      ref: "Landlord",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
export const Room = mongoose.model("Room", RoomSchema);
