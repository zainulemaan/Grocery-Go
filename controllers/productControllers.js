const multer = require('multer');
const AppError = require('../utils/appError');
const Product = require('./../models/productModels');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const Order = require('./../models/orderModel');
const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = 'my-ultra-secure-and-ultra-long-secret';

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/products');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `product-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('PLz Uplaod Only Images.\nThanks!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadProductPhotos = upload.single('photo');

exports.aliasTopProducts = (req, res, next) => {
  req.query.limit = 1;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,description';
  next();
};

exports.getAllProducts = catchAsync(async (req, res) => {
  const features = new APIFeatures(
    Product.find({ quantityAvailable: { $gt: 0 } }),
    req.query,
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const products = await features.query;

  res.status(200).json({
    status: 'success',
    result: products.length,
    data: {
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No Product Is Found With That Id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.photo = req.file.filename;
  }
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError('No Product Is Found With That Id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.createProduct = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.photo = req.file.filename;
  }
  console.log(req.file);
  console.log(req.body);
  const newProduct = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('No Product Is Found With That Id', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
// exports.getProductStats = catchAsync(async (req, res) => {
//   const stats = await Product.aggregate([
//     { $match: { ratingsAverage: { $gte: 4.5 } } },
//     {
//       $addFields: {
//         yearCreated: { $year: '$createdAt' },
//       },
//     },
//     {
//       $group: {
//         _id: { $toUpper: '$category' },
//         num: { $sum: 1 },
//         yearCreated: { $first: '$yearCreated' },
//         numRatings: { $sum: '$ratingsQuantity' },
//         avgRating: { $avg: '$ratingsAverage' },
//         avgPrice: { $avg: '$price' },
//         minPrice: { $min: '$price' },
//         maxPrice: { $max: '$price' },
//       },
//     },
//     { $sort: { avgPrice: 1 } },
//   ]);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       stats,
//     },
//   });
// });

exports.below500Products = catchAsync(async (req, res) => {
  const below500 = await Product.aggregate([
    {
      $match: {
        price: { $gte: 1, $lt: 1000 },
        quantityAvailable: { $gt: 0 },
      },
    },
    {
      $sort: { price: -1 }, // Sort by price in descending order
    },
    {
      $bucket: {
        groupBy: '$price',
        boundaries: [0, 1000],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              _id: '$_id',
              name: '$name',
              price: '$price',
              description: '$description',
              category: '$category',
              quantity: '$quantityAvailable',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      below500,
    },
  });
});

// Filter products by category "dairy" or "bakery"
exports.getDairyProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  // const selectedBrand = req.query.brand;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'dairy' }, { category: 'bakery' }],
        quantityAvailable: { $gt: 0 },
      },
    },
    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['bakery', 'dairy'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              _id: '$_id',
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quantityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];
  const brand = req.query.brand;
  const size = req.query.size;

  if (brand) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.brand': brand,
      },
    });
  }

  if (size) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.size': size,
      },
    });
  }
  // console.log(brand);
  const Dairy = await Product.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    data: {
      Dairy,
    },
  });
});

// Fruit & vegetables

exports.getFruitProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'fruits' }, { category: 'vegetables' }],
        quantityAvailable: { $gt: 0 },
      },
    },
    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['fruits', 'vegetables'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              _id: '$_id',
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quantityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];
  const brand = req.query.brand;
  const size = req.query.size;
  if (brand) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.brand': brand,
      },
    });
  }
  if (size) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.size': size,
      },
    });
  }
  const Fruits = await Product.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    data: {
      Fruits,
    },
  });
});

// BreakFast Essentials

exports.getMeatProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'meat' }, { category: 'seafood' }],
        quantityAvailable: { $gt: 0 },
      },
    },
    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['meat', 'seafood'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              _id: '$_id',
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quantityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];
  const brand = req.query.brand;
  const size = req.query.size;
  if (brand) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.brand': brand,
      },
    });
  }
  if (size) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.size': size,
      },
    });
  }
  const Meat = await Product.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    data: {
      Meat,
    },
  });
});

exports.getStationeryProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'stationery' }, { category: 'homecare' }],
        quantityAvailable: { $gt: 0 },
      },
    },

    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['homecare', 'stationery'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              _id: '$_id',
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quantityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];
  const brand = req.query.brand;
  const size = req.query.size;
  if (brand) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.brand': brand,
      },
    });
  }
  if (size) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.size': size,
      },
    });
  }
  const Stationery = await Product.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    data: {
      Stationery,
    },
  });
});

exports.getSnacksProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'snacks' }, { category: 'colddrinks' }],
        quantityAvailable: { $gt: 0 },
      },
    },
    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['colddrinks', 'snacks'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              _id: '$_id',
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quantityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];
  const brand = req.query.brand;
  const size = req.query.size;
  if (brand) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.brand': brand,
      },
    });
  }
  if (size) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.size': size,
      },
    });
  }
  const Snacks = await Product.aggregate(pipeline);
  res.status(200).json({
    status: 'success',
    data: {
      Snacks,
    },
  });
});

exports.getBabyCareProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'health' }, { category: 'babycarehealt' }],
        quantityAvailable: { $gt: 0 },
      },
    },
    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['babycarehealt', 'health'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              _id: '$_id',
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quantityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];

  const brand = req.query.brand;
  const size = req.query.size;
  if (brand) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.brand': brand,
      },
    });
  }
  if (size) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.size': size,
      },
    });
  }

  const Babycare = await Product.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    data: {
      Babycare,
    },
  });
});

exports.getPetcareProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'petcare' }, { category: 'vet' }],
        quantityAvailable: { $gt: 0 },
      },
    },
    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['petcare', 'vet'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              _id: '$_id',
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quantityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];
  const brand = req.query.brand;
  const size = req.query.size;
  if (brand) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.brand': brand,
      },
    });
  }
  if (size) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.size': size,
      },
    });
  }
  const Petcare = await Product.aggregate(pipeline);
  res.status(200).json({
    status: 'success',
    data: {
      Petcare,
    },
  });
});

exports.getBreakFastProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'breakfast' }, { category: 'dinner' }],
        quantityAvailable: { $gt: 0 },
      },
    },
    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['breakfast', 'dinner'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              _id: '$_id', // Include the _id field here
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quantityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];

  const brand = req.query.brand;
  const size = req.query.size;

  if (brand) {
    pipeline.push(
      {
        $unwind: '$products',
      },
      {
        $match: {
          'products.brand': brand,
        },
      },
    );
  }

  if (size) {
    pipeline.push(
      {
        $unwind: '$products',
      },
      {
        $match: {
          'products.size': size,
        },
      },
    );
  }

  const BreakFast = await Product.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    data: {
      BreakFast,
    },
  });
});

// exports.getBreakFastProducts = catchAsync(async (req, res) => {
//   const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
//   const pipeline = [
//     {
//       $match: {
//         $or: [{ category: 'breakfast' }, { category: 'dinner' }],
//       },
//     },
//     {
//       $sort: { price: sortOrder },
//     },
//     {
//       $bucket: {
//         groupBy: '$category',
//         boundaries: ['breakfast', 'dinner'],
//         default: 'Other',
//         output: {
//           count: { $sum: 1 },
//           products: {
//             $push: {
//               _id: '$_id',
//               name: '$name',
//               price: '$price',
//               description: '$description',
//               quantity: '$quatityAvailable',
//               discountPercentage: '$discountPercentage',
//               brand: '$brand',
//               size: '$size',
//               photo: '$photo',
//             },
//           },
//         },
//       },
//     },
//   ];
//   const brand = req.query.brand;
//   const size = req.query.size;
//   if (brand) {
//     pipeline.push({
//       $unwind: '$products',
//     });
//     pipeline.push({
//       $match: {
//         'products.brand': brand,
//       },
//     });
//   }
//   if (size) {
//     pipeline.push({
//       $unwind: '$products',
//     });
//     pipeline.push({
//       $match: {
//         'products.size': size,
//       },
//     });
//   }
//   const BreakFast = await Product.aggregate(pipeline);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       BreakFast,
//     },
//   });
// });

exports.getProductStats = catchAsync(async (req, res) => {
  const salesStats = await Order.aggregate([
    {
      $match: { status: 'completed' },
    },
    {
      $unwind: '$items', // Deconstruct items array
    },
    {
      $group: {
        _id: null, // Group all documents together
        totalProductsSold: { $sum: '$items.productQuantity' },
        totalRevenue: {
          $sum: {
            $multiply: ['$items.productQuantity', '$items.productPrice'],
          },
        },
      },
    },
  ]);

  const categorySales = await Order.aggregate([
    {
      $match: { status: 'completed' },
    },
    {
      $unwind: '$items', // Deconstruct items array
    },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    {
      $unwind: '$productDetails', // Deconstruct productDetails array
    },
    {
      $group: {
        _id: '$productDetails.category',
        totalProductsSold: { $sum: '$items.productQuantity' },
        totalRevenue: {
          $sum: {
            $multiply: ['$items.productQuantity', '$items.productPrice'],
          },
        },
      },
    },
  ]);

  const monthlyRevenue = await Order.aggregate([
    {
      $match: { status: 'completed' },
    },
    {
      $unwind: '$items', // Deconstruct items array
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, // Group by month and year
        totalRevenue: {
          $sum: {
            $multiply: ['$items.productQuantity', '$items.productPrice'],
          },
        },
      },
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1 }, // Sort by year and month descending
    },
  ]);

  const yearlyRevenue = await Order.aggregate([
    {
      $match: { status: 'completed' },
    },
    {
      $unwind: '$items', // Deconstruct items array
    },
    {
      $group: {
        _id: { year: { $year: '$createdAt' } }, // Group by year
        totalRevenue: {
          $sum: {
            $multiply: ['$items.productQuantity', '$items.productPrice'],
          },
        },
      },
    },
    {
      $sort: { '_id.year': -1 }, // Sort by year descending
    },
  ]);

  const mostSoldProducts = await Order.aggregate([
    {
      $match: { status: 'completed' },
    },
    {
      $unwind: '$items', // Deconstruct items array
    },
    {
      $group: {
        _id: '$items.productId',
        totalQuantity: { $sum: '$items.productQuantity' },
      },
    },
    {
      $sort: { totalQuantity: -1 }, // Sort by quantity descending
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    {
      $unwind: '$productDetails', // Deconstruct productDetails array
    },
    {
      $project: {
        name: '$productDetails.name',
        sales: '$totalQuantity',
        price: '$productDetails.price',
        category: '$productDetails.category',
      },
    },
  ]);

  const leastSoldProducts = await Order.aggregate([
    {
      $match: { status: 'completed' },
    },
    {
      $unwind: '$items', // Deconstruct items array
    },
    {
      $group: {
        _id: '$items.productId',
        totalQuantity: { $sum: '$items.productQuantity' },
      },
    },
    {
      $sort: { totalQuantity: 1 }, // Sort by quantity ascending
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    {
      $unwind: '$productDetails',
    },
    {
      $project: {
        name: '$productDetails.name',
        sales: '$totalQuantity',
        price: '$productDetails.price',
        category: '$productDetails.category',
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overallStats: salesStats[0],
      categoryStats: categorySales,
      monthlyRevenue,
      yearlyRevenue,
      mostSoldProducts,
      leastSoldProducts,
    },
  });
});

exports.searchProducts = catchAsync(async (req, res) => {
  const query = req.query.query || ''; // Get search query from request.query.query
  console.log('query:', query);

  if (typeof query !== 'string') {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid query format',
    });
  }

  const keywords = query.split(' ').filter((word) => word.length > 0); // Split query into individual keywords

  if (keywords.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'No search query provided',
    });
  }

  // Create regex queries for each keyword
  const regexQueries = keywords.map((keyword) => ({
    $or: [
      { name: new RegExp(keyword, 'i') },
      { brand: new RegExp(keyword, 'i') },
    ],
  }));

  // Combine all regex queries with $and
  const products = await Product.find({
    $and: [
      { $or: regexQueries },
      { quantityAvailable: { $gt: 0 } }, // Exclude products with quantityAvailable 0
    ],
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

// exports.searchProducts = catchAsync(async (req, res) => {
//   const { query } = req.params;

//   if (!query) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'No search query provided',
//     });
//   }

//   // Adjust query to search by name or brand
//   const products = await Product.find({
//     $or: [
//       { name: new RegExp(query, 'i') }, // Search by product name
//       { brand: new RegExp(query, 'i') }, // Search by product brand
//     ],
//   });

//   res.status(200).json({
//     status: 'success',
//     results: products.length,
//     data: {
//       products,
//     },
//   });
// });

exports.getPersonalizedRecommendations = catchAsync(async (req, res, next) => {
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

  // Fetch completed orders for the user
  const completedOrders = await Order.find({
    userId: userId,
    status: 'completed',
  }).populate('items.productId');

  if (!completedOrders.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'No completed orders found for this user.',
    });
  }

  // Extract brands and categories from completed orders
  const purchasedProducts = completedOrders.flatMap((order) => order.items);
  const brands = [
    ...new Set(purchasedProducts.map((item) => item.productId.brand)),
  ];
  const categories = [
    ...new Set(purchasedProducts.map((item) => item.productId.category)),
  ];

  // Fetch products that match the brands and categories
  const recommendations = await Product.find({
    brand: { $in: brands },
    category: { $in: categories },
    quantityAvailable: { $gt: 0 },
  }).limit(10); // Limit results as needed

  res.status(200).json({
    status: 'success',
    results: recommendations.length,
    data: {
      products: recommendations,
    },
  });
});
