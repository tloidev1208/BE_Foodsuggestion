const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  savedRecipes: [{type: mongoose.Schema.Types.ObjectId, ref: "Recipe"}],
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
