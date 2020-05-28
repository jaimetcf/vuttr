const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const Schema = mongoose.Schema;


const userSchema = new Schema({
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tools:    [{ type: mongoose.Types.ObjectId, ref: 'Tool' }]  // List of tools added by this user
});
userSchema.plugin(uniqueValidator);


module.exports = mongoose.model('User', userSchema);
