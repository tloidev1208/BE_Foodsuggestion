const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  foodId: {
    type: String,
    unique: true,
    index: true,
  },

  foodName: {
    type: String,
    required: true,
    trim: true,
  },

  content: {
    type: String,
    required: true,
    trim: true,
  },

  ingredient: {
    type: String,
    required: true,
    trim: true,
  },

  imageUrl: {
    type: String,
    default: "",
  },

  imageId: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model("Post", postSchema);