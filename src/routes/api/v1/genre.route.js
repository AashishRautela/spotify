const express=require("express");
const router=express.Router();
const genreController = require('../../../controllers/genre.controller.js');
const { auth } = require("../../../middlelwares/auth.middleware.js");


router.post("/",genreController.bulkUploadGenres);
// router.post("/logout",auth,authController.logOut);


module.exports=router;