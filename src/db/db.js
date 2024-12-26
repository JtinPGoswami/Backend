import mongoose from "mongoose";
import { DB_NAME } from "../Constants.js";

const db_connect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n Connected to the database!! Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("Failed while connecting to database", error);
    process.exit(1);
  }
};

export default db_connect;
