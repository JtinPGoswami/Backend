import { apiError } from "../utils/apiError.js";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const LandLordSchema = new Schema(
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
      type: String,
      required: true,
      trim: true,
    },
    ProfilePic: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0hA1XQ-BQxpGvqm-JrDRXhWDLqczIfze_3Q&s",
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "landlord", "seeker"],
    },

    rooms: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Room",
        },
      ],
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

LandLordSchema.pre("save", async function (next) {
  const landlord = this;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(landlord.email)) {
    return next(new apiError(400, "Invalid email format"));
  }

  if (landlord.isModified("password") && landlord.password.length < 8) {
    return next(
      new apiError(400, "Password must be at least 8 characters long")
    );
  }

  if (landlord.username && landlord.username.length < 5) {
    return next(
      new apiError(400, "Username must be at least 5 characters long")
    );
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (landlord.phone && !phoneRegex.test(landlord.phone)) {
    return next(
      new apiError(
        400,
        "Phone number must start with 6-9 and be 10 digits long"
      )
    );
  }

  if (landlord.isModified("password")) {
    landlord.password = await bcrypt.hash(landlord.password, 10);
  }

  next();
});

LandLordSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
export const LandLord = mongoose.model("LandLord", LandLordSchema);
