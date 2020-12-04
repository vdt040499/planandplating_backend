const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    body: {type: String},
    date: { type: Date, default: Date.now},
    send: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
    receive: { type: mongoose.Schema.Types.ObjectId, ref:'User'}
})

const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;
