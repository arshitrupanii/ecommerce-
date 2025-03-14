import User from "../models/user.model.js";

export const signup = async(req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if(!name || !email || !password){
            console.log(name, email, password);
            return res.status(400).json({ message: "Please fill in all fields" });
        }
    
        if (existingUser) {
            return res.status(400).json({ message: `User already exists` });
        }
    
        const user = new User({name,email,password});
        user.save();
    
        res.status(201).json({ message: "User created successfully" });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong in signup" });
    }
};

export const login = async(req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await existingUser.comparePassword(password);


};

export const logout = (req, res) => {   
    res.send("Logout route");
};