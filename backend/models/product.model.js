import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type : String,
        required : true
    },
    description:{
        type: String,
        required : true
    },
    price:{
        type : Number,
        min : 0,
        required : true
    },
    image: {
        type : String,
        required : [true, "Image is required"]
    },
    category:{
        type : String,
        require : true
    },
    isFeatured : {
        type : Boolean,
        default : false
    }


},{ timestamp: true})


const Product = mongoose.model("Product", productSchema)

export default Product