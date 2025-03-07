const Album = require('../models/album.model.js');
const Song = require('../models/song.model.js');
const Comment = require('../models/comment.model.js');
const { asyncHandler } = require('../utils/asyncHandler.js');
const { uploadFile } = require('../services/cloudinary.js');

module.exports.getFeaturedAlbums = asyncHandler(async (req, res) => {
  try {
    const featuredAlbums = await Album.find()
      .populate('artist', 'fullName')
      .populate('genre', 'name');

    return res.status(200).json(featuredAlbums);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error while fetching the albums', error });
  }
});


module.exports.getAlbumDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const albumId = id.trim();

  try {
    const songs = await Song.find({ album: albumId });
    const detail = await Album.find({ _id: albumId })
      .populate('artist', 'fullName')
      .populate('genre', 'name');
    const totalSongs = songs.length;

    const totalDuration = songs.reduce((total, song) => {
      return total + song.duration;
    }, 0);

    const comments = await Comment.find({ album: albumId });

    if (!detail || detail.length === 0)
      return res.status(200).json({ message: 'No Album found' });

    return res
      .status(200)
      .json({ songs, detail, comments, totalSongs, totalDuration });
  } catch (error) {
    return res.status(500).json({ message: 'failed', error });
  }
});

module.exports.getTop15 = asyncHandler(async (req, res) => {
  try {
    const top15 = await Album.aggregate([
      // Step 1: Lookup to join with the songs collection
      {
        $lookup: {
          from: 'songs',
          localField: 'songs',
          foreignField: '_id',
          as: 'albumSongs'
        }
      },
      // Step 2: Unwind the albumSongs array
      { $unwind: "$albumSongs" },
      
      // Step 3: Group by album and sum the total plays for all its songs
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          artist: { $first: "$artist" },
          coverImage: { $first: "$coverImage" },
          totalPlays: { $sum: "$albumSongs.plays" } // Sum the plays for each song in the album
        }
      },
     
      { $sort: { totalPlays: -1 } },
      
      // Step 5: Limit the results to the top 15 albums
      { $limit: 15 }
    ]);

    // Send the top 15 albums as the response
    res.status(200).json({
      success: true,
      data: top15
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});



module.exports.addComment = asyncHandler(async (req, res) => {
  const { comment, userId, albumId } = req.body;

  if (!comment || !userId || !albumId)
    return res
      .status(400)
      .json({ message: 'Comment, userId, albumId required' });
  const commentInfo = await Comment.create({
    user: userId,
    comment,
    album: albumId
  });
  if (!commentInfo)
    return res.status(500).json({ message: 'comment creation failed ' });
  return res.status(200).json({ message: 'Commented.' });
});


module.exports.addAlbums = asyncHandler(async (req, res) => {
  const { title, artist, genre, releaseDate, company } = req.body;
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
    // const validSongs = Array.isArray(songs)
    //   ? songs.map((id) => new mongoose.Types.ObjectId(id.trim()))
    //   : songs
    //     ? songs.split(',').map((id) => new mongoose.Types.ObjectId(id.trim()))
    //     : [];

    const album = new Album({
      title,
      artist,
      coverImage,
      genre,
      company,
      releaseDate: releaseDate || Date.now()
    });

    // Save the album to the database
    const savedAlbum = await album.save();

    res.status(201).json(savedAlbum);
  } catch (error) {
    res.status(500).json({ message: 'Error creating album', error });
  }
});

