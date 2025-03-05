const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    coverImage: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true,
        trim: true
    },
    releaseDate: {
        type: Date,
        default: Date.now
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Album", albumSchema);
