const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    type: {type: String, required: false},
    descrpt: {type: String, required:true},
    productImage: { type: String, required: false},
    rate: {type: Number, default: 0.1},
    ratecount: {type: Number, default: 0},
    favor: {type: Number, default: 0},
    date: {type: Date, default: Date.now},
    // createdby: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required},
    // comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comments'}],
    // rates: [{type: mongoose.Schema.Types.ObjectId, ref: 'Rate'}],
    // userfavors: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    // usersaves: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Product', productSchema);
