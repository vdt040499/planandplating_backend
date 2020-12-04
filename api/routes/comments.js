const express = require('express');

const CommentController = require('../controllers/comments');

const commentrouter = express.Router();

// commentrouter.route('/:_id/network/:_id/comment ')
//   //.get(CommentController.getComments)
//   .post(CommentController.uploadComment);
// //  router.post('/signup',/*upload.single('userImage'),*/ UsersController.users_signup);
commentrouter.post('/:userId/:productId/comment',CommentController.uploadComment);
  module.exports =commentrouter;
