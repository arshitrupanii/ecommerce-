import Product from "../models/product.model";

export const addToCart = async (req, res) => {

    try {
        const { productId } = req.body;
        const user = req.user;

        const existingProduct = user.cartItems.find(item => item.id === productId);

        if (existingProduct) {
            existingProduct.quantity += 1;
        }
        else {
            user.cartItems.push(productId);
        }

        await user.save();
        res.json(user.cartItems)

    } catch (error) {
        console.log("error in add to cart : " + error.message)
        return res.status(200).json({ message: "something wrong in add to cart " })

    }

};

export const getCartProduct = async (req, res) => {
    try {
        const products = await Product.find({ _id: { $in: req.user.cartItems } });

        const cartItems = products.map (product => {
            const item = req.user.cartItems. find(cartItem => cartItem.id === product.id);
            return {...product.toJSON(), quantity:item. quantity}
        });

        res.json(cartItems);

    } catch (error) {
        console.log("error in get cart product : " + error.message)
        return res.status(200).json({ message: "something wrong in get cart product"});

    }

};

export const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        if (!productId) {
            user.cartItems = [];
        }
        else {
            user.cartItems = user.cartItems.filter(item => item.id !== productId);
        }

        await user.save();
        res.json(user.cartItems);

    } catch (error) {
        console.log("error in remove all from cart : " + error.message)
        return res.status(200).json({ message: "something wrong in remove all from cart " })

    }

}

export const updateQuantity = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { quantity } = req.body;
        const user = req.user;

        const existingProduct = user.cartItems.find(item => item.id === productId);
        if (existingProduct) {
            if (quantity === 0) {
                user.cartItems = user.cartItems.filter(item => item.id !== productId);
                await user.save();
                return res.json(user.cartItems);
            }

            existingProduct.quantity = quantity;
            await user.save();
            return res.json(user.cartItems);
        }
        else {
            return res.status(404).json({ message: "Product not found in cart" })
        }
    } catch (error) {
        console.log("error in update quantity : " + error.message)
        return res.status(200).json({ message: "something wrong in update quantity " })
    }
}
