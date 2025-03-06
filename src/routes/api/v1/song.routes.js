const express = require('express');
const router = express.Router();
const songController = require("../../../controllers/song.controller.js")
const {upload} = require("../../../middlelwares/multer.middleware.js")

// router.get("/",songController.getSong);
router.post("/",upload.fields([
    {
        name: "high",
        maxCount: 1
    },
    {
        name: "low",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]),songController.uploadSong)



module.exports= router