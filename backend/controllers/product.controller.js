import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js"
import Product from "../models/product.model.js"

export const getallProduct = async (req, res) => {
    try {
        const products = await Product.find({}); // if you fill empty list then it give all product 
        res.json(products) 

    } catch (error) {
        return res.status(200).json({message : "something missing in Get all product controller.."})
    }
}

export const getfeaturedProducts = async (req,res) => {
    try {
        let featuredProduct = await redis.get("featured_product");
        if(featuredProduct){
            return res.json(JSON.stringify(featuredProduct))
        }

        // if in not redis then featch from mongo
        featuredProduct = await Product.find({isFeatured : true}).lean();

        if(!featuredProduct){
            return res.status(401).json({message : "No featured product found!"})
        }

        await redis.set("featured_product", JSON.stringify(featuredProduct))

        res.json(featuredProduct)

    } catch (error) {
        console.log("error in get featured product : " + error.message)
        return res.status(200).json({message : "something wrong in get featured product "})
        
    }
}

export const createProduct = async (req,res) => {
    try {
        const {name, description, price, image, category} = req.body;
        
        let cloudinaryResponse = null;
        
        if(image){
            cloudinaryResponse = await cloudinary.uploader.upload(image, {folder: "products"})
        }
        
        const product = await Product.create({
            name,
            description,
            price,
            image : cloudinaryResponse?.secure_url ? cloudinaryResponse?.secure_url : "",
            category
        })
        
        res.status(201).json(product)
    } catch (error) {
        console.log("error in create product : " + error.message)
        return res.status(200).json({message : "something wrong in create product "})
        
    }
}

export const deleteProduct = async (req,res) => {
    try {
        const product = await Product.findById(req.params.id);

        if(!product){
            return res.status(404).json({message : "Product not found."})
        }

        if(product.image){
            const publicId = product.image.split("/").pop().split(".")[0];

            try {
                await cloudinary.uploader.destroy(`products/${publicId}`)
                console.log("cloudinary image is deleted..")
            } catch (error) {
                console.log("error in cloudinary image deletation. " + error)
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message : "Product deleted successfully. "})

    } catch (error) {
        console.log("error in delete product : " + error.message)
        return res.status(200).json({message : "something wrong in delete product "})
        
    }
}

export const getRecommendation = async (req,res) => {
    try {
        const products = await Product.aggregate([
            {
                $sample: {size:3}
            },
            {
                $product : {
                    _id : 1,
                    name : 1,
                    description : 1,
                    image : 1,
                    price : 1
                }
            }
        ])

        res.json(products)
        
    } catch (error) {
        console.log("error in get recommendation product : " + error.message)
        return res.status(200).json({message : "something wrong in get recommendation product "})
    }
}


export const getProductByCategory = async (req, res) => {
    try {
        const {category} = req.params;

        const products = await Product.find({category});

        res.json(products)

        
    } catch (error) {
        console.log("error in get product By category : " + error.message)
        return res.status(200).json({message : "something wrong in get product By category "})
    }
}


export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if(product){
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();

            res.json(updatedProduct);
        }
        else{
            res.status(404).json({ message : "Product not found !"})
        }
        
    } catch (error) {
        console.log("error in toggleFeaturedProduct : " + error.message)
        return res.status(200).json({message : "something wrong in toggleFeaturedProduct "})
        
    }
}


async function updateFeaturedProductsCache() {
    try {
        const featuredProduct = await Product.find({isFeatured: true}).lean();
        await redis.set(`featured_products`, JSON.stringify(featuredProduct))
    } catch (error) {
        console.log("error in updateFeaturedProductsCache...")
    }
}