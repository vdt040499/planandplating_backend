const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const checkAuth = require('../middleware/check-auth');

const User = require('../models/user');
const UsersController = require('../controllers/users');
//const CommentController = require('../controllers/comments');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + '.jpg');
        //cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.post('/signup', multer({
    storage: storage
  }).single('userImage'),UsersController.users_signup);

router.post('/:userId/uploadimage', upload.single('userImage'), UsersController.users_uploadImage);

router.post('/login', UsersController.users_login);

router.post('/:userId/updateuser', checkAuth, UsersController.users_update);

router.delete('/:userId', checkAuth, UsersController.users_delete_user);

router.post('/changepass', checkAuth, UsersController.users_changepass);

router.post('/forgotpassword', UsersController.users_forgotpass);

router.post('/forgotpasswordcheck', UsersController.users_forgotpasscheck);

router.post('/:userId1/:userId2/chat', UsersController.users_chat);

router.post('/:userId/:deluserId/delnoti', UsersController.users_delnoti);

router.get('/:userId/getuserchat', UsersController.users_getuserchat);

router.get('/:userId/getnewuserchat', UsersController.users_getnewuserchat);

router.get('/:userId1/:userId2/getchat', UsersController.users_getchat);

router.get('/:userId/getuser_userId', UsersController.users_getuser_userId);

router.get('/:userId/getmainuser', UsersController.users_getmainuser);
//router.post('/comment', CommentController.uploadComment);

module.exports = router;
