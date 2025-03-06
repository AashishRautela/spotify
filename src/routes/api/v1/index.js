const express=require("express");
const router=express.Router();

const userRouter=require("./user.routes.js")
const authRouter=require("./auth.routes.js")
const songRouter = require("./song.routes.js")
const genreRouter = require("./genre.route.js")
const albumRouter=require("./album.router.js")


router.use("/user",userRouter)
router.use("/auth",authRouter)
router.use("/song",songRouter)
router.use("/genre",genreRouter)
router.use("/albums",albumRouter)

module.exports=router;