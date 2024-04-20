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

//routes
import userRouter from "./routes/user.routes.js";

/* Routes declaration
   Can't use app.get() bcoz we have routes in seperate file and to bring routes here we need to use
   middleware. So check this syntax.
*/
app.use(
    "/api/v1/users",
    userRouter
); /* this will pass access to userRouter and things will be handled there. */

export default app;
