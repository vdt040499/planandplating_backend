const mongoose = require('mongoose');

const typeSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    type: {type: String, required: true},
    name: {type: String, required: true},
    subname: {type: String, required: true},
    typeImage: { type: String, required: true}
});

module.exports = mongoose.model('Type', typeSchema);
