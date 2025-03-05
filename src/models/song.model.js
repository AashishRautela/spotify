const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    duration: {
      String: Number
    },
    audioUrl: {
      type: String,
      required: true
    },
    coverImage: {
      type: String
    },
    genre: {
      type: String
    },
    plays: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Song = new mongoose.model('Song', songSchema);
module.exports = Song;
