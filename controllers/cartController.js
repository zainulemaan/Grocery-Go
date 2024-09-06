const Cart = require('./../models/cartModel');
const AppError = require('./../utils/appError');
const Product = require('./../models/productModels');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/Usermodels');
const jwt = require('jsonwebtoken');

const calculateDiscountedPrice = (price, discountPercentage) => {
  if (isNaN(price) || isNaN(discountPercentage)) {
    throw new Error('Invalid price or discountPercentage');
  }

  const discountMultiplier = (100 - discountPercentage) / 100;
  console.log(
    `Price: ${price}, Discount Percentage: ${discountPercentage}, Discount Multiplier: ${discountMultiplier}`,
  );
  return price * discountMultiplier;
};





const JWT_SECRET_KEY = 'my-ultra-secure-and-ultra-long-secret';

exports.addItemToCart = catchAsync(async (req, res, next) => {
  try {
    // Check if JWT cookie exists
    if (!req.cookies.jwt) {
      return res.status(401).json({
        status: 'fail',
        message: 'JWT token missing',
      });
    }

    // Extract userId from the token payload
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    const userId = decoded.id; // Assuming your userId is stored in 'id' field of token payload

    const { productId, productQuantity } = req.body;

    if (!productId || !productQuantity) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product ID and quantity must be provided',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }

    if (product.quantityAvailable < productQuantity) {
      return next(new AppError('Not enough stock available.', 400));
    }

    // product.quantityAvailable -= productQuantity;
    await product.save();

    let cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
        subTotal: 0,
        TotalDiscount: 0,
      });
    }

    // Check if the product is already in the cart
    const cartItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (cartItemIndex !== -1) {
      // Product already exists in cart, update quantity
      cart.items[cartItemIndex].productQuantity += productQuantity;
    } else {
      // Product does not exist in cart, add new item
      cart.items.push({
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        productPhoto: product.photo,
        productQuantity,
        discountPercentage: product.discountPercentage || 0, // Default to 0 if discountPercentage is undefined
      });
    }

    // Calculate subtotal and total discount
    cart.subTotal = cart.items.reduce((total, item) => {
      const productPrice = calculateDiscountedPrice(
        item.productPrice,
        item.discountPercentage || 0, // Default to 0 if discountPercentage is undefined
      );
      console.log(
        `Item: ${item.productName}, Price: ${item.productPrice}, Discount: ${item.discountPercentage},  Quantity: ${item.productQuantity}`,
      );
      return total + productPrice * item.productQuantity;
    }, 0);

    cart.TotalDiscount = cart.items.reduce((totalDiscount, item) => {
      const originalPrice = item.productPrice * item.productQuantity;
      const discountedPrice =
        calculateDiscountedPrice(
          item.productPrice,
          item.discountPercentage || 0, // Default to 0 if discountPercentage is undefined
        ) * item.productQuantity;
      console.log(
        `Item: ${item.productName}, Original Price: ${originalPrice}, Discounted Price: ${discountedPrice}, Discount Amount: ${originalPrice - discountedPrice}`,
      );
      return totalDiscount + (originalPrice - discountedPrice);
    }, 0);

    console.log(`Calculated SubTotal: ${cart.subTotal}`);
    console.log(`Calculated TotalDiscount: ${cart.TotalDiscount}`);

    await cart.save();

    res.status(200).json({
      status: 'success',
      data: cart,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: err.message,
      });
    }
    next(err); // Pass any other caught errors to the error handling middleware
  }
});

// Removing Item From Cart

exports.emptyCart = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { productId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User Not Found', 404));
  }
  console.log(user);

  const cart = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart) {
    return next(new AppError('Cart Not Found', 404));
  }
  console.log(cart);
  cart.items = cart.items.filter(
    (item) => item.productId && item.productId.toString() !== productId,
  );

  cart.subTotal = cart.items.reduce((total, item) => {
    const productPrice = calculateDiscountedPrice(
      item.productPrice,
      item.discountPercentage,
    );
    return total + productPrice * item.productQuantity;
  }, 0);

  cart.TotalDiscount = cart.items.reduce((totalDiscount, item) => {
    const originalPrice = item.productPrice * item.productQuantity;
    const discountedPrice =
      calculateDiscountedPrice(item.productPrice, item.discountPercentage) *
      item.productQuantity;
    return totalDiscount + (originalPrice - discountedPrice);
  }, 0);

  if (cart.items.length === 0) {
    cart.subTotal = 0;
    cart.TotalDiscount = 0;
  }
  try {
    await cart.save();

    res.status(200).json({
      status: 'success',
      data: cart,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
});

exports.updateItemQuantity = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  let { productId, productQuantity } = req.body;

  productQuantity = Number(productQuantity);

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User Not Found', 404));
  }

  if (!productId || isNaN(productQuantity)) {
    return next(
      new AppError(
        'Please provide all details: userId, productId, productQuantity',
        400,
      ),
    );
  }
  if (productQuantity <= 0) {
    return next(
      new AppError('Product quantity must be greater than zero', 400),
    );
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (product.quantityAvailable < productQuantity) {
    return next(new AppError('Not enough stock available', 400));
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const cartItem = cart.items.find(
    (item) => item.productId.toString() === productId,
  );

  if (cartItem) {
    cartItem.productQuantity = productQuantity;
    cartItem.discountPercentage = product.discountPercentage;
  } else {
    return next(new AppError('Product not found in cart', 404));
  }

  cart.subTotal = cart.items.reduce((total, item) => {
    const discountPercentage = item.discountPercentage || 0;
    if (isNaN(item.productPrice) || isNaN(discountPercentage)) {
      throw new Error('Invalid product price or discount percentage');
    }
    const productPrice = calculateDiscountedPrice(
      item.productPrice,
      discountPercentage,
    );
    return total + productPrice * item.productQuantity;
  }, 0);

  cart.TotalDiscount = cart.items.reduce((totalDiscount, item) => {
    const discountPercentage = item.discountPercentage || 0;
    const originalPrice = item.productPrice * item.productQuantity;
    const discountedPrice =
      calculateDiscountedPrice(item.productPrice, discountPercentage) *
      item.productQuantity;
    return totalDiscount + (originalPrice - discountedPrice);
  }, 0);

  console.log('TotalDiscount:', cart.TotalDiscount);

  await cart.save();
  res.status(200).json({
    status: 'success',
    data: cart,
  });
});

exports.getCart = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(new AppError('Cart Not Found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: cart,
  });
});

exports.getCartCount = catchAsync(async (req, res, next) => {
  // Check if JWT cookie exists
  if (!req.cookies.jwt) {
    return res.status(401).json({
      status: 'fail',
      message: 'JWT token missing',
    });
  }

  // Extract userId from the token payload
  const token = req.cookies.jwt;
  const decoded = jwt.verify(token, JWT_SECRET_KEY);
  const userId = decoded.id; // Assuming userId is stored in 'id' field of token payload

  try {
    // Fetch the cart count for the user from the database
    const cart = await Cart.findOne({ userId });

    // Return 0 if cart doesn't exist
    const cartCount = cart ? cart.items.length : 0;

    res.json({
      status: 'success',
      data: {
        cartCount,
      },
    });
  } catch (error) {
    next(error); // Pass errors to the global error handler
  }
});
