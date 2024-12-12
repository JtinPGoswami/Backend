import dotenv from "dotenv";
import db_connect from "./db/db.js";
import express from "express";
import { app } from "./App.js";

dotenv.config({
  path: "./.env",
});

db_connect()
  .then(() => {
    app.on("error", (error) => {
      console.error(error);
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at  PORT ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("DATA Base connection failed !!!", err);
  });
