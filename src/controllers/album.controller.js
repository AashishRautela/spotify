const Album = require('../models/album.model.js');
const { asyncHandler } = require('../utils/asyncHandler.js');
const { uploadFile } = require('../services/cloudinary.js');
const mongoose = require('mongoose');

module.exports.featuredAlbums = asyncHandler(async (req, res) => {
  try {
    const featuredAlbums =await Album.find()
      .populate('artist', 'fullName')
      .populate('genre', 'name')
      .populate('songs');
    return res.status(200).json(featuredAlbums);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error while fetching the albums', error });
  }
});

module.exports.addAlbums = asyncHandler(async (req, res) => {
  const { title, artist, genre, releaseDate, songs } = req.body;
  const file = req.file;
  

  let coverImageUrl = ''; 
 
  if (file) {
    const coverImagePath = file.path; // Get the cover image path from Multer
    try {
      const coverImageFile = await uploadFile(coverImagePath); // Upload to Cloudinary
      coverImageUrl = coverImageFile ? coverImageFile.secure_url : ''; // Get Cloudinary URL
    } catch (error) {
      console.error('Error uploading cover image:', error);
      return res
        .status(500)
        .json({ message: 'Error uploading cover image', error });
    }
  }

  try {
    // Create a new album
    const coverImage = coverImageUrl;
    const validSongs = Array.isArray(songs)
      ? songs.map((id) => new mongoose.Types.ObjectId(id.trim()))
      : songs
        ? songs.split(',').map((id) => new mongoose.Types.ObjectId(id.trim()))
        : [];

    const album = new Album({
      title,
      artist,
      coverImage,
      genre,
      releaseDate: releaseDate || Date.now(), // Use provided date or default to now
      songs: validSongs
    });

    // Save the album to the database
    const savedAlbum = await album.save();

    res.status(201).json(savedAlbum); 
  } catch (error) {
    res.status(500).json({ message: 'Error creating album', error });
  }
});
