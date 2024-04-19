import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// cors
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

//configuring middleware for accepting json data
app.use(
    express.json({
        limit: "16kb",
    })
);

/* configuring middleware for accpting data from url bcoz url's comes in different form eg:http//www.example.com/?raveen+soni or 
  http//www.example.com/?raveen%20soni  */

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// configuring for storing files, images on my machine
app.use(express.static("public"));

app.use(cookieParser());

export default app;
