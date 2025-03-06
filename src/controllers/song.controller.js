const { asyncHandler } = require('../utils/asyncHandler.js');
const Song = require('../models/song.model.js');
const { uploadFile } = require('../services/cloudinary.js');

module.exports.uploadSong = asyncHandler(async (req, res) => {
  const { body, files } = req;

  // Ensure 'low' exists
  if (!files.low || files.low.length === 0) {
    return res.status(400).json({
      success: false,
      message: "'low' audio file is required."
    });
  }

  // Upload the 'low' audio file
  const lowAudioPath = files.low[0].path;
  const lowAudioUrl = await uploadFile(lowAudioPath); // Cloudinary upload for 'low'
  const lowUrl = lowAudioUrl ? lowAudioUrl.secure_url : '';

  // Upload the 'high' audio file if it exists
  let highUrl = '';
  if (files.high && files.high.length > 0) {
    const highAudioPath = files.high[0].path;
    const highAudioUrl = await uploadFile(highAudioPath); // Cloudinary upload for 'high'
    highUrl = highAudioUrl ? highAudioUrl.secure_url : '';
  }

  // Upload the 'coverImage' file if it exists
  let coverImageUrl = '';
  if (files.coverImage && files.coverImage.length > 0) {
    const coverImagePath = files.coverImage[0].path;
    const coverImageFile = await uploadFile(coverImagePath); // Cloudinary upload for 'coverImage'
    coverImageUrl = coverImageFile ? coverImageFile.secure_url : '';
  }

  // Prepare the data to be saved in the Song model
  const newSong = new Song({
    title: body.title,
    artist: body.artist, // Assuming 'artist' is provided as an ObjectId (from a form or frontend)
    duration: highUrl.duration,
    audioUrls: {
      low: lowUrl,
      high: highUrl
    },
    coverImage: coverImageUrl,
    genre: body.genre,
    plays: 0, // Optional: Can be dynamically set or start from 0
    isPublished: body.isPublished || true // Default to true
  });

  // Save the song in the database
  await newSong.save();

  // Send the response back
  res.status(201).json({
    success: true,
    message: 'Song uploaded successfully!',
    song: newSong
  });
});

module.exports.getWeeklyTop15 = asyncHandler(async (req, res) => {
  try {
    // Fetch the top 15 songs sorted by the 'plays' field in descending order
    const top15 = await Song.find().sort({ plays: -1 }).limit(15);

    if (!top15 || top15.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No songs found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Top 15 songs retrieved successfully.',
      data: top15
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while retrieving songs.'
    });
  }
});

module.exports.getAllSongs = asyncHandler(async (req, res) => {
  try {
    // Fetch all songs from the database
    const allSongs = await Song.find()
      .populate('artist', 'fullName') 
      .populate('genre', 'name'); // Optionally populate genre details

    if (!allSongs || allSongs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No songs found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'All songs retrieved successfully.',
      data: allSongs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while retrieving songs.'
    });
  }
});
