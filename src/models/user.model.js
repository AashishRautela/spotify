const mongoose = require("mongoose");
const validator = require("validator");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
            maxLength: 20
        },
        email: {
            type: String,
            unique: true,
            trim: true,
            lowercase: true,
            maxLength: 50,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Please enter a valid email");
                }
            }
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
            maxLength: 50
        },
        password: {
            type: String,
            required: true,
            trim: true
        },
        role: {
            type: String,
            enum: ["user", "artist"],
            default: "user"
        },
        avatar: {
            type: String,
            default: ""
        },
        coverImage: {
            type: String,
            default: ""
        },
        bio: {
            type: String,
            trim: true,
            maxLength: 500
        },
        genres: [
            {
                type: String,
                trim: true,
                lowercase: true
            }
        ],
        popularity: {
            type: Number,
            default: 0
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        songsHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Song",
                index: true
            }
        ],
        profileColor:{
            type:String
        },
        refreshToken: {
            type: String
        }
    },
    { timestamps: true }
);

// 🔒 Pre-save Hook: Hash Password Before Saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// 🔑 Validate Password
userSchema.methods.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// 🎫 Generate Access Token
userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        { _id: this._id, role: this.role },
        process.env.JWT_KEY,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
    );
};

// 🔄 Generate Refresh Token
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        { _id: this._id, role: this.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
    );
};

userSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model("User", userSchema);
