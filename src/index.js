import connectDb from "./db/index.js";
import dotenv from "dotenv";

connectDb();
dotenv.config({
    path: "./env",
});
