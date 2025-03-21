import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../models/user.model.js";
dotenv.config();

export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(500).json({ message: "User is unauthorized !!" })
        }

        try {
            const decoded = jwt.decode(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.userId).select("-password");

            if (!user) {
                return res.status(200).json({ message: "user is not found!!" })
            }

            req.user = user
            next()
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "token is expired ! " })
            }
            throw error;
        }

    } catch (error) {
        console.log(`error in protected middleware : ${error}`)
        return res.status(200).json({ message: "something wrong in protected middleware.." })
    }


}


export const adminRoute = async (req, res, next) => {
    if(req.user && req.user.role == "admin"){
        next()
    }
    else{
        return res.status(403).json({message : "Admin can only use this !! "})
    }
}