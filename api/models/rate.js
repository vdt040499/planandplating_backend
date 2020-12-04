const mongoose = require('mongoose');

const Schema =mongoose.Schema;

const RateSchema = new Schema({
    userrate: {type: Number, required: true},
    rateby: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
    rateinProduct: { type: mongoose.Schema.Types.ObjectId, ref:'Product' }
})

const Rate = mongoose.model('Rate', RateSchema);

module.exports = Rate;
