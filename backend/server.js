import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routers/auth.routes.js";
import connectDB from "./lib/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// this is a middleware that allows us to parse the request body
app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
});  