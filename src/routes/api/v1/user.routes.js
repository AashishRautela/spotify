const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/user.controller.js');
const { upload } = require('../../../middlelwares/multer.middleware.js');

router.post(
  '/',
//   upload.fields([
//     {
//       name: 'avatar',
//       maxCount: 1
//     },
//     {
//       name: 'coverImage',
//       maxCount: 1
//     }
//   ]),
  userController.registerUser
);

module.exports=router;
