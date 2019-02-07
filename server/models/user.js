const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


var UserSchema = new mongoose.Schema({
    email: {type: String, required: true, index: {unique: true}},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    password: {type: String, required: true},
    user_level: {type: Number, required: true},
  }, {timestamps: true})

UserSchema.plugin(uniqueValidator, { message: '{PATH} Exists!' }); // add validator as plugin

module.exports = mongoose.model("User", UserSchema);