const User = require('../models/user.model.js');
const { asyncHandler } = require('../utils/asyncHandler.js');
const { validateUser } = require('../utils/validateUser.js');
const { uploadFile } = require('../services/cloudinary.js');

module.exports.registerUser = asyncHandler(async (req, res, next) => {
  validateUser(req, res);
  const { userName, email = '', fullName, password, role } = req.body;

  //   const files = req.files;
  //   const userAvatar = files?.avatar || '';
  //   const userCoverImage = files?.coverImage || '';

  //   const avatar = await uploadFile(userAvatar[0]?.path);
  //   const coverImage = await uploadFile(userCoverImage[0]?.path || '');
  const user = new User({
    userName,
    email,
    fullName,
    password,
    role
    // avatar: avatar?.url,
    // coverImage: coverImage?.url || ''
  });

  await user.save();
  return res.status(200).json({
    success: true,
    message: 'User Registered Successfully'
  });
});

module.exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  return res.status(200).json({
    success: true,
    message: 'User Profile fetched',
    user: {
      id: user._id,
      name: user.fullName,
      email: user.email,
      userName:user.userName
    }
  });
});

module.exports.changePassword = asyncHandler(async (req, res, next) => {
  const { newPassword, oldPassword } = req.body;
  const user = req.user;

  const validatedUser = await User.findById(user._id);

  const isPasswordValid = await validatedUser.validatePassword(oldPassword);

  if (!isPasswordValid) {
    return res.status(400).send({
      success: false,
      message: 'Password is not correct'
    });
  }
  user.password = newPassword;
  const data = await user.save({ validateBeforeSave: false });
  if (data) {
    return res.status(200).send({
      success: false,
      message: 'Password changed succefully'
    });
  } else {
    return res.status(500).send({
      success: false,
      message: 'Error while updating password'
    });
  }
});

module.exports.featuredArtists = asyncHandler(async (req, res) => {
  try {
    const artists = await User.find({ 
      role: 'artist', 
      popularity: { $gt: 90 } 
    });
    
    res.status(200).json(artists);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});


module.exports.updateUser=asyncHandler(async(req,res)=>{

  // const allowedFields = [
  //   'type',

  // ];

  
  // const filteredUpdates = Object.keys(fields).reduce((acc, key) => {
  //   if (allowedFields.includes(key)) {
  //     acc[key] = fields[key];
  //   }
  //   return acc;
  // }, {});
})