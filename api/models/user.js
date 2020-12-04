const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String,
            required: true,
            unique: true,
            match:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
           },
    userImage: {type: String},
    password: {type: String, required: true},
    _id: mongoose.Schema.Types.ObjectId,
    oldpass: {type: String, required: false},
    newpass: {type: String, required: false},
    resetToken: {type: String, required: false},
    resetTokenExpires: {type: Date, required: false},
    notichat: {type: Number, default: 0},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comments'}],
    rates: [{type: mongoose.Schema.Types.ObjectId, ref:'Rate'}],
    products: [{type: mongoose.Schema.Types.ObjectId, ref:'Product'}],
    favors: [{type: mongoose.Schema.Types.ObjectId, ref:'Product'}],
    saves: [{type: mongoose.Schema.Types.ObjectId, ref:'Product'}],
    newuserchats: [{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
    userchats: [{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
    chats: [{type: mongoose.Schema.Types.ObjectId, ref:'Chat'}]
});

module.exports = mongoose.model('User', userSchema);
