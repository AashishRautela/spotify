const express=require("express");
const router=express.Router();

const userRouter=require("./user.routes.js")
const authRouter=require("./auth.routes.js")

router.use("/user",userRouter)
router.use("/auth",authRouter)

module.exports=router;