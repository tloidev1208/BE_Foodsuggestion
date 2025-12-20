const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: {type: String, required: true},
  ingredients: [{type: String}],
  instructions: {type: String},
  image: {type: String},
  cook_time: {type: String},
  nutrition: {
    calories: {type: String},
    protein: {type: String},
    fat: {type: String},
    carbs: {type: String},
  },
});

module.exports =
  mongoose.models.Recipe || mongoose.model("Recipe", recipeSchema);
