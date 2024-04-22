import connectDb from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";
dotenv.config({
    path: "./.env",
});

connectDb()
    .then(() => {
        const PORT = process.env.PORT || 8000;

        app.on("error", (error) => {
            console.log("Error in app: ", error);
        });
        app.listen(PORT, () => {
            console.log(`Server is starting at port : ${PORT}`);
        });
    })
    .catch((error) => console.log("Mongo DB connection failed !! ", error));
