const catchAsync = require('../utils/catchAsync');
const Admin = require('../models/Usermodels');

exports.getallAdmins = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    console.log(queryObj);

    let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));

//     let admin = await Admin.find(JSON.parse(queryStr));
// if(req.query.sort){
//   const sortBy = req.query.sort.split(',').join(' ');
//   query = query.sort(sortBy);
// }else{
//   query.sort('--createdAt');
// }





    const admins = await query;

    res.status(200).json({
      status: 'success',
      result: products.length,
      data: {
        products,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAdmin = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet',
  });
};

exports.updateAdmin = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.createAdmin = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not defined yet',
  });
};

exports.deleteAdmin = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route Is Not Yet Defined',
  });
};
