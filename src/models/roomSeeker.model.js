import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { apiError } from "../utils/apiError.js";
const RoomSeekerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
      trim: true,
    },
    ProfilePic: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0hA1XQ-BQxpGvqm-JrDRXhWDLqczIfze_3Q&s",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
    },
    profession: {
      type: String,
      required: true,
      enum: ["student", "professional", "family", "other"],
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "landlord", "seeker"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpiry: String,
    passwordverificationToken: String,
    passwordverificationTokenExpiry: String,
    roleUpdateverificationToken: String,
    roleUpdateverificationTokenExpiry: String,
  },
  {
    timestamps: true,
  }
);

RoomSeekerSchema.pre("save", async function (next) {
  const seeker = this;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(seeker.email)) {
    throw new apiError(400, "Invalid email format");
  }

  if (seeker.isModified("password") && seeker.password.length < 8) {
    return next(
      new apiError(400, "Password must be at least 8 characters long")
    );
  }

  if (seeker.username && seeker.username.length < 5) {
    throw new apiError(400, "Username must be at least 5 characters long");
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (seeker.phone && !phoneRegex.test(seeker.phone)) {
    throw new apiError(
      400,
      "Phone number must start with 6-9 and be 10 digits long"
    );
  }

  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

RoomSeekerSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const RoomSeeker = mongoose.model("RoomSeeker", RoomSeekerSchema);
