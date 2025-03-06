const {asyncHandler} = require('../utils/asyncHandler.js');
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
