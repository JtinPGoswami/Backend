import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const AdminSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      match: /^[a-zA-Z0-9]+$/,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      match: /^[a-zA-Z\s]+$/,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpiry: String,
    passwordverificationToken: String,
    passwordverificationTokenExpiry: String,
  },
  {
    timestamps: true,
  }
);

AdminSchema.pre("save", async function (next) {
  const admin = this;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(admin.email)) {
    return next(new apiError(400, "Invalid email format"));
  }

  if (admin.isModified("password") && admin.password.length < 8) {
    return next(
      new apiError(400, "Password must be at least 8 characters long")
    );
  }

  if (admin.username && admin.username.length < 5) {
    return next(new apiError(400, "Username must be at least 5 characters"));
  }

  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

AdminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const Admin = mongoose.model("Admin", AdminSchema);
