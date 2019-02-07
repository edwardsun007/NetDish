// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;

// var UserSchema = new mongoose.Schema({
//   email: {type: String, required: true, index: {unique: true}},
//   first_name: {type: String, required: true},
//   last_name: {type: String, required: true},
//   password: {type: String, required: true},
//   user_level: {type: Number, required: true},
// }, {timestamps: true})
// var User = mongoose.model("User", UserSchema);


// var FoodSchema = new mongoose.Schema({
//   food_name: {type: String, required: true},
//   price: {type: Number, required: true},
//   description: {type: String, required: true},
//   rate_stars: {type: Number},
//   rate_times: {type: Number},
//   likeBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
//   image: {type: String, required: true},
//   orders:[{type: Schema.Types.ObjectId, ref: 'Order'}],
// }, {timestamps: true})
// var Food = mongoose.model("Food", FoodSchema);

// var OrderSchema = new mongoose.Schema({
//   foods: [{type: Schema.Types.ObjectId, ref: 'Food'}], // list of food_id
//   order_user: {type: Schema.Types.ObjectId, ref: 'User'}, //  user_id
//   total_price: {type: Number, required: true},  
//   quantity: {type: String, required: true},
// }, {timestamps: true})

// var Order = mongoose.model("Order", OrderSchema);
