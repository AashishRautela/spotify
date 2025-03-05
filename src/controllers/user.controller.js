const User = require("../models/user.model.js");
const { asyncHandler } = require("../utils/asyncHandler");
const { validateUser } = require("../utils/validateUser.js");
const { uploadFile } = require("../services/cloudinary");
const { upload } = require("../middlewares/multer.middleware.js");
const validator = require("validator");
const { default: mongoose } = require("mongoose");


const generateTokens = async (user, res) => {
    try {
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken }

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Something went wrong"
        })
    }
}


module.exports.registerUser = asyncHandler(async (req, res, next) => {
    validateUser(req, res);
    const { userName, email, fullName, password } = req.body;

    const files = req.files
    const userAvatar = files?.avatar || "";
    const userCoverImage = files?.coverImage || "";
    // if (!userAvatar) {
    //     const error = new Error("Request data missing");
    //     error.statusCode = 400;
    //     throw error;
    // }

    const avatar = await uploadFile(userAvatar[0]?.path);
    const coverImage = await uploadFile(userCoverImage[0]?.path || "");
    const user = new User({
        userName,
        email,
        fullName,
        password,
        avatar: avatar?.url,
        coverImage: coverImage?.url || ""
    }
    )
    await user.save()

    const message = `User registered: ${userName} with email: ${email}`;
    await sendMessageToQueue(message);

    return res.status(200).json({
        success: true,
        message: "User Registered Successfully"
    })
})

module.exports.logIn = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(404).json({
            success: false,
            message: "Request data missing"
        })
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid email"
        })
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            success: false,
            message: "Email or password is incorrect"
        })
    }

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
        const { accessToken, refreshToken } = await generateTokens(user, res);
        res
            .cookie("token", accessToken)
            .cookie("refreshToken", refreshToken)
            .status(200)
            .json({
                success: true,
                message: "User logged in successfully",
            });
    }
    else {
        return res.status(401).json({
            success: false,
            message: "Email or password is incorrect"
        })
    }
})

module.exports.logOut = asyncHandler(async (req, res, next) => {
    const user = req.user;
    await User.findByIdAndUpdate(user?._id, { refreshToken: "" });
    res
        .clearCookie("token")
        .clearCookie("refreshToken")
        .status(200)
        .json({
            success: true,
            message: "User logged out"
        })
})

module.exports.changePassword = asyncHandler(async (req, res, next) => {
    const { newPassword, oldPassword } = req.body;
    const user = req.user;

    const validatedUser = await User.findById(user._id);

    const isPasswordValid = await validatedUser.validatePassword(oldPassword);

    if (!isPasswordValid) {
        return res.status(400).send({
            success: false,
            message: "Password is not correct"
        })
    }
    user.password = newPassword;
    const data = await user.save({ validateBeforeSave: false });
    if (data) {
        return res.status(200).send({
            success: false,
            message: "Password changed succefully"
        })
    }
    else {
        return res.status(500).send({
            success: false,
            message: "Error while updating password"
        })
    }
})

module.exports.getCurrUser = asyncHandler(async (req, res, next) => {
    return res.status(200).send({
        success: true,
        data: req.user,
        message: "user fetched"
    })
})

//this is i written for avatar and cover image..remaining fileds will will similar like this
module.exports.updateUser = asyncHandler(async (req, res, next) => {
    const files = req.files;
    const userAvatar = files?.avatar || "";
    const userCoverImage = files?.coverImage || "";

    let avatar = null;
    let cover = null;

    if (userAvatar) {
        const uploadedAvatar = await uploadFile(userAvatar[0]?.path);
        avatar = uploadedAvatar?.url;
    }

    if (userCoverImage) {
        const uploadedCover = await uploadFile(userCoverImage[0]?.path);
        cover = uploadedCover?.url;
    }

    const userId = req.user?._id;

    const update = {};
    if (avatar) update.avatar = avatar;
    if (cover) update.coverImage = cover;

    const user = await User.findByIdAndUpdate(
        userId,
        update,
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (user) {
        return res.status(200).send({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    } else {
        return res.status(404).send({
            success: false,
            message: "User not found",
            data: null,
        });
    }
});


module.exports.watchHistory=asyncHandler(async (req,res,next)=>{
    const watchHistory=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                    fullName:1,
                                    userName:1,
                                    avatar:1
                                }
                            }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).send({
        success:true,
        data:watchHistory[0]?.watchHistory,
        message:"Watch History fetched"
    })
})



