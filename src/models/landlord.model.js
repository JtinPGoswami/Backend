import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const LandLordSchema = new Schema(
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
    role: {
      type: String,
      require: true,
      enum: ["admin", "landlord", "seeker"],
    },
    refreshToken: {
      type: String,
      require: true,
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
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

LandLordSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const LandLord = mongoose.model("LandLord", LandLordSchema);
