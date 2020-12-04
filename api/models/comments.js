const mongoose = require('mongoose');

const Schema =mongoose.Schema;

const CommentSchema = new Schema({
    body: {type: String },
    date: { type: Date, default: Date.now},
    commentby: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
    inProduct: { type: mongoose.Schema.Types.ObjectId, ref:'Product'}
})

const Comment =mongoose.model('Comment', CommentSchema);

module.exports = Comment;
