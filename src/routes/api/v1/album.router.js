const express = require('express');
const router = express.Router();
const albumcontroller = require("../../../controllers/album.controller.js")
const {upload} = require("../../../middlelwares/multer.middleware.js")


router.get("/",albumcontroller.getFeaturedAlbums)
router.get("/top15",albumcontroller.getTop15)
router.post("/",upload.single('coverImage'),albumcontroller.addAlbums)
router.post("/comment",albumcontroller.addComment)

router.get("/:id",albumcontroller.getAlbumDetail)


module.exports=router