const mongoose = require('mongoose');

var FoodSchema = new mongoose.Schema({
    food_name: {type: String, required: true},
    price: {type: Number, required: true},
    description: {type: String, required: true},
    imagePath: {type: String, required: true},
    creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    rate_stars: {type: Number},
    rate_times: {type: Number},
    likeBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    orders:[{type: mongoose.Schema.Types.ObjectId, ref: 'Order'}]
  }, {timestamps: true})

  module.exports =  mongoose.model("Food", FoodSchema); // turn blueprint into model