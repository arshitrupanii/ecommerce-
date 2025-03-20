import User from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { redis } from "../lib/redis.js";
import dotenv from "dotenv"
dotenv.config()

const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
    return { accessToken, refreshToken };
}


const storeRefreshToken = async (refreshToken, userId) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60);
}

const setCookies = (res, refreshToken, accessToken) => {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
    });
}


export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (!name || !email || !password) {
            console.log(name, email, password);
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        if (existingUser) {
            return res.status(400).json({ message: `User already exists` });
        }
        const user = new User({ name, email, password });

        // authinticate user
        const { accessToken, refreshToken } = generateToken(user._id);
        await storeRefreshToken(refreshToken, user._id);

        setCookies(res, accessToken, refreshToken);

        user.save();

        res.status(201).json({ user, message: "User created successfully" });

    } catch (error) {
        res.status(500).json(error, { message: "Something went wrong in signup" });
    }
};

export const login = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateToken(user._id);

            await storeRefreshToken(refreshToken, user._id)
            setCookies(res, accessToken, refreshToken);

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            })
        } 
        else{
            res.status(500).json({message : "Credential is unvalid!"})
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({message : "something wrong in login"})
    }


};

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            // jwt.verify use in video 
            const decoded = jwt.decode(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decoded.userId}`);
        }

        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        res.status(200).json({ message: "Logout successfully. " });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something wrong in logout " })
    }
};

export const refresh_token = async (req, res) => {
    try{
    const refresh_token = req.cookies.refreshToken
    console.log(refresh_token);

    console.log("-------------------------------------");
    
    if(!refresh_token){
        return res.status(401).json({message : "no refresh token found ..."})
    }
    
    const decoded = jwt.decode(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    console.log(decoded);
    console.log("-------------------------------------");
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    console.log(storedToken);

    // solve this issue later
    // if(storedToken !== refresh_token){
    //     return res.status(500).json({message : "Invalid Refresh token."})
    // }

    const accessToken = jwt.sign({userId : decoded.userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn : "15m"})

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
    })

    res.json({message : "Refresh token successfully.."})

} catch(error){
    res.status(500).json({message : "somthing wrong in refresh token controller... "})
    console.log(error);
}
}