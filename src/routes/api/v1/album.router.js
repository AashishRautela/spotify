const express = require('express');
const router = express.Router();
const albumcontroller = require("../../../controllers/album.controller.js")
const {upload} = require("../../../middlelwares/multer.middleware.js")

router.get("/",albumcontroller.featuredAlbums)
router.post("/",upload.single('coverImage'),albumcontroller.addAlbums)

module.exports=router