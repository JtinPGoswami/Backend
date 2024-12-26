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
      type: String,
      require: true,
      trim: true,
      unique: true,
    },
    ProfilePic: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0hA1XQ-BQxpGvqm-JrDRXhWDLqczIfze_3Q&s",
    },
    role: {
      type: String,
      require: true,
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

  if (landlord.password && landlord.password.length < 8) {
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
