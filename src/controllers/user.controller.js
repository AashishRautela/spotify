const User = require('../models/user.model.js');
const { asyncHandler } = require('../utils/asyncHandler.js');
const { validateUser } = require('../utils/validateUser.js');
const { uploadFile } = require('../services/cloudinary.js');

module.exports.registerUser = asyncHandler(async (req, res, next) => {
  validateUser(req, res);
  const { userName, email = '', fullName, password } = req.body;

  //   const files = req.files;
  //   const userAvatar = files?.avatar || '';
  //   const userCoverImage = files?.coverImage || '';

  //   const avatar = await uploadFile(userAvatar[0]?.path);
  //   const coverImage = await uploadFile(userCoverImage[0]?.path || '');
  const user = new User({
    userName,
    email,
    fullName,
    password
    // avatar: avatar?.url,
    // coverImage: coverImage?.url || ''
  });

  await user.save();
  return res.status(200).json({
    success: true,
    message: 'User Registered Successfully'
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
