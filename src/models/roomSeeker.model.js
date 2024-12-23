import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const RoomSeekerSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    email: {
      type: String,
      require: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      trim: true,
    },
    username: {
      type: String,
      require: true,
      trim: true,
      unique: true,
    },
    phone: {
      type: Number,
      require: true,
      trim: true,
      unique: true,
    },
    ProfilePic: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0hA1XQ-BQxpGvqm-JrDRXhWDLqczIfze_3Q&s",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      require: true,
    },
    age: {
      type: Number,
      require: true,
      min: 18,
    },
    profession: {
      type: String,
      require: true,
      enum: ["student", "professional", "family", "other"],
    },
    refreshToken: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      require: true,
      enum: ["admin", "landlord", "seeker"],
    },
  },
  {
    timestamps: true,
  }
);

RoomSeekerSchema.pre("save", async function (next) {
  const seeker = this;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(seeker.email)) {
    return next(new apiError(400, "Invalid email format"));
  }

  if (seeker.password && seeker.password.length < 8) {
    return next(new apiError(400, "Password must be at least 8 characters"));
  }

  if (seeker.username && seeker.username.length < 5) {
    return next(new apiError(400, "Username must be at least 5 characters"));
  }

  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

RoomSeekerSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const RoomSeeker = mongoose.model("RoomSeeker", RoomSeekerSchema);
