const mongoose = require('mongoose');

var OrderSchema = new mongoose.Schema({
    foods: [{type: mongoose.Schema.Types.ObjectId, ref: 'Food'}], // list of food_id
    order_user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, //  user_id
    total_price: {type: Number, required: true},  
    info: {type: String, required: true},
  }, {timestamps: true})
  
module.exports = mongoose.model("Order", OrderSchema);