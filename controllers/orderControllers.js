const Order = require('./../models/orderModel');
const Cart = require('./../models/cartModel');
const AppError = require('./../utils/appError');
const Product = require('./../models/productModels');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/Usermodels');
const Squareclient = require('./../utils/squareClient');
const jwt = require('jsonwebtoken');
const WhatsAppclient = require('./../utils/client');
const stripe = require('stripe')(
  'sk_test_51PlCr6RwmcWoHdE6NI2J9HjTXfrAsWLYHBvjfVHO0FUkO6mSpvs2Zgrd5KhI4iYleMfBY9Pzv328GVUhuua7bZlP008jh4wPVm',
);
const JWT_SECRET_KEY = 'my-ultra-secure-and-ultra-long-secret';

const sanitizePhoneNumber = (phoneNumber) => {
  // Remove any non-numeric characters except the leading '+'
  return phoneNumber.replace(/[^\d]/g, '');
};
const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    const sanitizedPhoneNumber = sanitizePhoneNumber(phoneNumber);
    // Remove leading '+' and append '@c.us'
    const formattedPhoneNumber = sanitizedPhoneNumber.startsWith('+')
      ? sanitizedPhoneNumber.slice(1)
      : sanitizedPhoneNumber;

    await WhatsAppclient.sendMessage(`${formattedPhoneNumber}@c.us`, message);
    console.log('Message sent successfully!');
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};

exports.viewOrder = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Find orders for the given userId and status
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });

  if (!orders.length) {
    return next(
      new AppError(
        'You currently have no orders. Please make a new order to view it here.',
        404,
      ),
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      orders: orders,
    },
  });
});

exports.confirmOrderCashOnDel = catchAsync(async (req, res, next) => {
  if (!req.cookies.jwt) {
    return res.status(401).json({
      status: 'fail',
      message: 'JWT token missing',
    });
  }

  // Extract userId from the token payload
  const token = req.cookies.jwt;
  const decoded = jwt.verify(token, JWT_SECRET_KEY);
  const userId = decoded.id;

  const { address, phoneNumber } = req.body;

  const paymentMethod = 'Cash on Delivery';

  // Find the cart for the given userId
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(
      new AppError('Please First Add Items To Cart To Proceed. Thanks!', 404),
    );
  }

  // Add shipping charges to the subtotal
  const shippingCharges = 130;
  const totalAmount = cart.subTotal + shippingCharges;

  // Create a new order with the items and totalAmount (including shipping charges)
  const newOrder = new Order({
    userId: userId,
    items: cart.items,
    subTotal: totalAmount, // Updated subtotal including shipping charges
    address: address,
    phoneNumber: phoneNumber,
    paymentMethod: paymentMethod,
  });

  // Save the new order
  await newOrder.save();

  // Clear the cart after placing the order
  await Cart.findByIdAndDelete(cart._id);

  for (const item of cart.items) {
    await Product.findByIdAndUpdate(
      item.productId,
      {
        $inc: { quantityAvailable: -item.productQuantity },
      },
      { new: true },
    );
  }

  const itemsDetails = cart.items
    .map(
      (item) =>
        `${item.productName}: ${item.productQuantity} x ${item.productPrice} PKR`,
    )
    .join('\n');
  const message = `
Your order has been placed successfully!

Order ID: ${newOrder._id}
Address: ${address}
Payment Method: ${paymentMethod}
Subtotal: ${totalAmount} PKR (including shipping charges)

Items:
${itemsDetails}

Be ready with money; the order will be at your door in 45 minutes.
  `;
  sendWhatsAppMessage(phoneNumber, message);

  res.status(201).json({
    status: 'success',
    data: {
      order: newOrder,
    },
  });
});

exports.confirmOrder = catchAsync(async (req, res, next) => {
  if (!req.cookies.jwt) {
    return res.status(401).json({
      status: 'fail',
      message: 'JWT token missing',
    });
  }

  // Extract userId from the token payload
  const token = req.cookies.jwt;
  const decoded = jwt.verify(token, JWT_SECRET_KEY);
  const userId = decoded.id;

  const { address, phoneNumber, paymentMethod, paymentToken } = req.body; // Add paymentToken for Stripe

  // Find the cart for the given userId
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(
      new AppError('Please First Add Items To Cart To Proceed. Thanks!', 404),
    );
  }

  // Add shipping charges to the subtotal
  const shippingCharges = 130;
  let totalAmount = cart.subTotal + shippingCharges;

  const totalAmountInCents = Math.round(totalAmount * 100);

  // Handle Stripe payment if paymentMethod is 'Stripe'
  if (paymentMethod === 'Stripe') {
    try {
      // Create a PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmountInCents, // Amount should be in cents
        currency: 'usd', // Replace with your currency
        payment_method: paymentToken, // The payment method token from the client
        confirm: true, // Confirm the payment
        return_url: 'https://127.0.0.1:8000/api/v1/orders',
      });

      if (paymentIntent.status !== 'succeeded') {
        return next(new AppError('Payment failed. Please try again.', 400));
      }
    } catch (error) {
      return next(new AppError(`Payment error: ${error.message}`, 500));
    }
  } else if (paymentMethod === 'Cash on Delivery') {
    // Proceed without Stripe payment
  } else {
    return next(new AppError('Invalid payment method.', 400));
  }

  // Create a new order with the items and totalAmount (including shipping charges)
  const newOrder = new Order({
    userId: userId,
    items: cart.items,
    subTotal: totalAmount.toFixed(2), // Updated subtotal including shipping charges
    address: address,
    phoneNumber: phoneNumber,
    paymentMethod: paymentMethod,
  });

  // Save the new order
  await newOrder.save();

  // Clear the cart after placing the order
  await Cart.findByIdAndDelete(cart._id);

  for (const item of cart.items) {
    await Product.findByIdAndUpdate(
      item.productId,
      {
        $inc: { quantityAvailable: -item.productQuantity },
      },
      { new: true },
    );
  }

  const itemsDetails = cart.items
    .map(
      (item) =>
        `${item.productName}: ${item.productQuantity} x ${item.productPrice} PKR`,
    )
    .join('\n');
  const message = `
Your order has been placed successfully!

Order ID: ${newOrder._id}
Address: ${address}
Payment Method: ${paymentMethod}
Subtotal: ${totalAmount} PKR (including shipping charges)

Items:
${itemsDetails}

Be ready with money; the order will be at your door in 45 minutes.
  `;
  sendWhatsAppMessage(phoneNumber, message);

  res.status(201).json({
    status: 'success',
    data: {
      order: newOrder,
    },
  });
});

// exports.confirmOrder = catchAsync(async (req, res, next) => {
//   if (!req.cookies.jwt) {
//     return res.status(401).json({
//       status: 'fail',
//       message: 'JWT token missing',
//     });
//   }

//   // Extract userId from the token payload
//   const token = req.cookies.jwt;
//   const decoded = jwt.verify(token, JWT_SECRET_KEY);
//   const userId = decoded.id;

//   // const { address, phoneNumber } = req.body;

//   // const paymentMethod = 'Cash on Delivery';

//   // // Find the cart for the given userId
//   // const cart = await Cart.findOne({ userId });
//   // if (!cart) {
//   //   return next(
//   //     new AppError('Please First Add Items To Cart To Proceed.Thanks!', 404),
//   //   );
//   // }
//   const { address, phoneNumber, paymentMethod, paymentToken } = req.body; // Add paymentToken for Stripe

//   // Find the cart for the given userId
//   const cart = await Cart.findOne({ userId });
//   if (!cart) {
//     return next(
//       new AppError('Please First Add Items To Cart To Proceed. Thanks!', 404),
//     );
//   }

//   // Handle Stripe payment if paymentMethod is 'Stripe'
//   if (paymentMethod === 'Stripe') {
//     try {
//       // Create a PaymentIntent
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: cart.subTotal * 100, // Amount should be in cents
//         currency: 'usd', // Replace with your currency
//         payment_method: paymentToken, // The payment method token from the client
//         confirm: true, // Confirm the payment
//         return_url: 'https://127.0.0.1:8000/api/v1/orders',
//       });

//       if (paymentIntent.status !== 'succeeded') {
//         return next(new AppError('Payment failed. Please try again.', 400));
//       }
//     } catch (error) {
//       return next(new AppError(`Payment error: ${error.message}`, 500));
//     }
//   } else if (paymentMethod === 'Cash on Delivery') {
//     // Proceed without Stripe payment
//   } else {
//     return next(new AppError('Invalid payment method.', 400));
//   }

//   // Create a new order with the items and subTotal from the cart
//   const newOrder = new Order({
//     userId: userId,
//     items: cart.items,
//     subTotal: cart.subTotal,
//     address: address,
//     phoneNumber: phoneNumber,
//     paymentMethod: paymentMethod,
//   });

//   // Save the new order
//   await newOrder.save();

//   // Clear the cart after placing the order
//   await Cart.findByIdAndDelete(cart._id);

//   for (const item of cart.items) {
//     await Product.findByIdAndUpdate(
//       item.productId,
//       {
//         $inc: { quantityAvailable: -item.productQuantity },
//       },
//       { new: true },
//     );
//   }

//   const itemsDetails = cart.items
//     .map(
//       (item) =>
//         `${item.productName}: ${item.productQuantity} x ${item.productPrice} PKR`,
//     )
//     .join('\n');
//   const message = `
// Your order has been placed successfully!

// Order ID: ${newOrder._id}
// Address: ${address}
// Payment Method: ${paymentMethod}
// Subtotal: ${cart.subTotal} PKR

// Items:
// ${itemsDetails}

// Be ready with money; the order will be at your door in 45 minutes.
//       `;
//   sendWhatsAppMessage(phoneNumber, message);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       order: newOrder,
//     },
//   });
// });

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body; // Get the cancellation reason from the request body

  // Find the order by ID
  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.status === 'canceled') {
    return next(new AppError('Order is already canceled', 400));
  }

  // Update the order status to canceled and add the cancellation reason
  order.status = 'canceled';

  // Update the order with the cancellation reason
  order.cancellationReason = reason || 'No reason provided';
  await order.save();

  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.productId,
      {
        $inc: { quantityAvailable: item.productQuantity }, // Increment quantityAvailable
      },
      { new: true },
    );
  }
  // Respond with a success message
  res.status(204).json({
    status: 'success',
    message: 'Order deleted successfully',
    data: order,
  });
});
exports.completeOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find the order by ID
  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Update the order status to 'completed'
  order.status = 'completed';
  await order.save();

  // Respond with the updated order
  res.status(200).json({
    status: 'success',
    data: {
      order: order,
    },
  });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const orders = await Order.find({ userId });
  console.log('Orders:', orders);

  const completedOrders = orders.filter(
    (order) => order.status === 'completed',
  );
  const canceledOrders = orders.filter((order) => order.status === 'canceled');

  res.status(200).json({
    status: 'success',
    data: {
      completedOrders,
      canceledOrders,
    },
  });
});

exports.getAllOrdersForAdmin = catchAsync(async (req, res, next) => {
  // Fetch all orders from the database
  const orders = await Order.find().populate({
    path: 'userId',
    select: 'name email', // Select only name and email from the User model
  });

  // Filter orders by status
  const pendingOrders = orders.filter((order) => order.status === 'pending');
  const completedOrders = orders.filter(
    (order) => order.status === 'completed',
  );
  const canceledOrders = orders.filter((order) => order.status === 'canceled');

  // Respond with filtered orders
  res.status(200).json({
    status: 'success',
    data: {
      pendingOrders,
      completedOrders,
      canceledOrders,
    },
  });
});
exports.adminDeleteOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find the order by ID
  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.status === 'canceled') {
    return next(new AppError('Order is already canceled', 400));
  }

  // Update the order status to canceled
  order.status = 'canceled';
  await order.save();

  // Restore product quantities
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.productId,
      {
        $inc: { quantityAvailable: item.productQuantity }, // Increment quantityAvailable
      },
      { new: true },
    );
  }

  // Respond with a success message
  res.status(204).json({
    status: 'success',
    message: 'Order canceled successfully',
  });
});

exports.generateReceipt = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate('userId'); // Populate userId to get user details

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Extract the required details
  const { subTotal, address, phoneNumber, paymentMethod, createdAt, items } =
    order;

  // Generate receipt data
  const receiptData = {
    storeName: 'GrocerGo',
    storeAddress: '123 Grocery Lane, Karachi, Pakistan',
    storeContact: '+92 300 1234567',
    receiptTitle: 'Receipt',
    orderId: id,
    userName: order.userId.name,
    userEmail: order.userId.email,
    subTotal,
    address,
    phoneNumber,
    paymentMethod,
    createdAt: new Date(createdAt).toLocaleString(),
    items: items.map((item) => ({
      productName: item.productName,
      productPrice: item.productPrice,
      productQuantity: item.productQuantity,
      discountPercentage: item.discountPercentage,
      itemTotal: `PKR ${(item.productPrice * item.productQuantity).toFixed(2)}`,
    })),
    terms:
      'Thank you for shopping with GrocerGo! All sales are final. Please keep this receipt for your records. If you have any questions, feel free to contact us at +92 300 1234567.',
  };

  // Send receipt data to the frontend
  res.status(200).json({ status: 'success', data: receiptData });
});
