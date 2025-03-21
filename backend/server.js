import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./lib/db.js";

import authRoutes from "./routers/auth.routes.js";
import productRoutes from "./routers/product.routes.js";
import cartRoutes from "./routers/cart.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// this is a middleware that allows us to parse the request body
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
});  