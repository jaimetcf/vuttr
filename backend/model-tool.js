const mongoose = require('mongoose');


const Schema = mongoose.Schema;


const toolSchema = new Schema ({
    user_id:     { type: String, required: true},  // Reference to the user that added this tool
    title:       { type: String, required: true},
    link:        { type: String, required: true},
    description: { type: String, required: true},
    tags:        [String]
});


module.exports = mongoose.model('Tool', toolSchema);
