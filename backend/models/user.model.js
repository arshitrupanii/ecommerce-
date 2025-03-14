import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide your name"],
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Please provide your password"],
        minlength: [6, "Password must be at least 6 characters long"],
    },
    cartItem: [
        {
            quantity: {
                type: Number,
                default: 1,
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            }            
        },
    ],
    role: {
        type: String,
        enum: {
            values: ["user", "admin"],
            message: "Please select a valid role",
        },
        default: "user",
    }
}, { timestamp: true });


// Hashing the password before saving the user
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.method.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

const User = mongoose.model("User", userSchema);

export default User;