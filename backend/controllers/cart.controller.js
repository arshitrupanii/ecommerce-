import Product from "../models/product.model";

export const addToCart = async (req, res) => {

    try {
        const {productId} = req.body;
        const user = req.user;

        const existingProduct = user.cartItems.find(item => item.id === productId);

        if(existingProduct){
            existingProduct.quantity += 1;
        }
        else{
            user.cartItems.push(productId);
        }

        await user.save();
        res.json(user.cartItems)

    } catch (error) {
        console.log("error in add to cart : " + error.message)
        return res.status(200).json({message : "something wrong in add to cart "})
        
    }

};

export const getCartProduct = async (req, res) => {
    
    
};

export const removeAllFromCart = async (req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user;

        if(!productId){
            user.cartItems = [];
        }
        else{
            user.cartItems = user.cartItems.filter(item => item.id !== productId);
        }

        await user.save();
        res.json(user.cartItems);

    } catch (error) {
        console.log("error in remove all from cart : " + error.message)
        return res.status(200).json({message : "something wrong in remove all from cart "})
        
    }
    
}

export const updateQuantity = async (req, res) => {
    const {id:productId} = req.params;
    const {quantity} = req.body;
    const user = req.user;
    
    const existingProduct = user.cartItems.find(item => item.id === productId);
    if(existingProduct){
        if(quantity <= 0){
            return res.status(400).json({message : "Quantity should be greater than 0"})
        }

        existingProduct.quantity = quantity;
    }
    else{
        return res.status(404).json({message : "Product not found in cart"})
    }

    await user.save();
    res.json(user.cartItems);


}
