const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const checkAuth = require('../middleware/check-auth');

const Product = require('../models/product');
const ProductsController = require('../controllers/products');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + '.jpg');
        //cb(null, new Date().toISOString() + file.originalname);
    }

    // destination: 'uploads/',
    // filename: function(req, file, cb) {
    //   return crypto.pseudoRandomBytes(16, function(err, raw) {
    //     if (err) {
    //       return cb(err);
    //     }
    //     return cb(null, "" + (raw.toString('hex')) + (path.extname(file.originalname)));
    //   });
    // }
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

//const upload = multer({storage: storage});

router.get('/', ProductsController.products_get_all);

router.get('/getnewpro', ProductsController.getnewpro);

// router.post('/', checkAuth,  multer({
//     storage: storage
//   }).single('productImage'), ProductsController.products_create_product);

router.post('/', multer({
    storage: storage
  }).single('productImage'), ProductsController.products_create_product);

// router.post('/', ProductsController.products_create_product);

router.get('/:productId', checkAuth, ProductsController.products_get_product);

router.post('/:productId/updateproduct', checkAuth, ProductsController.products_update_product);

router.delete('/:productId/:userId/delete', checkAuth, ProductsController.products_delete_product);

router.post('/:productId/:userId/comment', checkAuth, ProductsController.uploadComment);

router.get('/:productId/comment', checkAuth, ProductsController.getComments);

router.post('/:productId/:userId/rate', checkAuth, ProductsController.rating);

router.post('/:productId/:userId/isproduct', checkAuth, ProductsController.isProduct);

router.post('/:productId/:userId/isfavor', checkAuth, ProductsController.isFavor);

router.post('/:productId/:userId/favor', checkAuth, ProductsController.favor);

router.post('/:productId/:userId/unfavor', checkAuth, ProductsController.unfavor);

router.post('/:productId/:userId/issave', checkAuth, ProductsController.isSave);

router.post('/:productId/:userId/save', checkAuth, ProductsController.save);

router.post('/:productId/:userId/unsave', checkAuth, ProductsController.unsave);

router.get('/:userId/get_userproduct', checkAuth, ProductsController.get_userproduct);

router.get('/:userId/get_usersave', checkAuth, ProductsController.get_usersave);

router.get('/:productId/getuser_productId', ProductsController.getuser_productId);


module.exports = router;
