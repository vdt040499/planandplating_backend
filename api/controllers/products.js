const mongoose = require("mongoose");

const Product = require("../models/product");
const Comment = require("../models/comments");
const User = require("../models/user");
const Rate = require("../models/rate");

exports.products_get_all = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.products_create_product = (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    descrpt: req.body.descrpt,
    productImage: req.file.path,
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        success: true,
        message: "Create product successfully!",
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.products_get_product = (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select("name type price _id")
    .exec()
    .then((doc) => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          product: doc,
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provide ID" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.products_update_product = async (req, res, next) => {
  try {
    const product = await Product.findById({ _id: req.params.productId });

    if (req.body.name == "") {
      product.descrpt = req.body.descrpt;
    } else if (req.body.descrpt == "") {
      product.name = req.body.name;
    } else {
      product.name = req.body.name;
      product.descrpt = req.body.descrpt;
    }
    product.save();
    return res.status(200).json({
      success: true,
      message: "Updated successfully",
    });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.products_delete_product = async (req, res, next) => {
  try {
    const delProduct = await Product.findById(req.params.productId);

    if (req.params.userId != delProduct.createdby) {
      return res.status(401).json({
        success: false,
        message: "Cant detele this product",
      });
    }

    if (req.params.userId == delProduct.createdby) {
      const user = await User.findById(req.params.userId);
      user.products.pop(delProduct);
      await user.save();
      await Product.remove(delProduct);

      return res.status(200).json({
        success: true,
        message: "Deleted successfully",
      });
    }
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.uploadComment = async (req, res, next) => {
  const commentProduct = await Product.findById(req.params.productId);
  const commentUser = await User.findById(req.params.userId);
  try {
    const newComment = new Comment({
      body: req.body.body,
    });
    newComment.inProduct = commentProduct;
    newComment.commentby = commentUser;
    await newComment.save();
    commentProduct.comments.push(newComment);
    commentUser.comments.push(newComment);
    await commentProduct.save();
    await commentUser.save();
    //console.log(commentUser.name +': ' + newComment.body );
    return res.status(201).json({
      message: "comment succeed",
      comment: commentUser.name + ": " + newComment.body,
    });
  } catch (err) {
    console.log(err);
    return res.status.json({
      error: err,
    });
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const getComments = await Comment.find({
      inProduct: req.params.productId,
    });
    if (getComments.length < 1) {
      return res.status(200).json({
        success: "fail",
        message: " no comment",
      });
    } else {
      return res.status(200).json(getComments);
    }
  } catch (err) {
    res.status(401).json({
      error: err,
    });
  }
};

exports.rating = async (req, res, next) => {
  const rateProduct = await Product.findById(req.params.productId);
  const rateUser = await User.findById(req.params.userId);

  try {
    const newRate = new Rate({
      userrate: req.body.userrate,
    });

    newRate.rateinProduct = rateProduct;
    newRate.rateby = rateUser;
    await newRate.save();
    rateProduct.ratecount = req.body.ratecount;
    rateProduct.rate = req.body.rate;
    rateProduct.rates.push(newRate);
    rateUser.rates.push(newRate);
    await rateProduct.save();
    await rateUser.save();
    return res.status(201).json({
      message: "rate succeed",
    });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.isProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  try {
    if (product.createdby == req.params.userId) {
      return res.status(200).json({
        message: true,
      });
    } else {
      return res.status(200).json({
        message: false,
      });
    }
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.isFavor = async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  try {
    if ((await product.userfavors) == req.params.userId) {
      return res.status(200).json({
        message: true,
      });
    } else {
      return res.status(200).json({
        message: false,
      });
    }
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.favor = async (req, res, next) => {
  const favorProduct = await Product.findByIdAndUpdate(
    { _id: req.params.productId },
    { $inc: { favor: 1 }, new: true }
  );
  const favorUser = await User.findById(req.params.userId);

  try {
    favorProduct.userfavors.push(favorUser);
    favorUser.favors.push(favorProduct);
    await favorProduct.save();
    await favorUser.save();

    return res.status(201).json({
      message: "favor succeed",
    });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.unfavor = async (req, res, next) => {
  const favorProduct = await Product.findByIdAndUpdate(
    { _id: req.params.productId },
    { $inc: { favor: -1 }, new: true }
  );
  const favorUser = await User.findById(req.params.userId);

  try {
    favorProduct.userfavors.pop(favorUser);
    favorUser.favors.pop(favorProduct);
    await favorProduct.save();
    await favorUser.save();

    return res.status(201).json({
      message: "unfavor succeed",
    });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.isSave = async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  try {
    if ((await product.usersaves) == req.params.userId) {
      return res.status(200).json({
        message: true,
      });
    } else {
      return res.status(200).json({
        message: false,
      });
    }
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.save = async (req, res, next) => {
  const saveProduct = await Product.findById(req.params.productId);
  const saveUser = await User.findById(req.params.userId);

  try {
    saveProduct.usersaves.push(saveUser);
    saveUser.saves.push(saveProduct);

    await saveProduct.save();
    await saveUser.save();

    return res.status(201).json({
      message: "save succeed",
    });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.unsave = async (req, res, next) => {
  const saveProduct = await Product.findByIdAndUpdate(req.params.productId);
  const saveUser = await User.findById(req.params.userId);

  try {
    saveProduct.usersaves.pop(saveUser);
    saveUser.saves.pop(saveProduct);
    await saveProduct.save();
    await saveUser.save();

    return res.status(201).json({
      message: "unsave succeed",
    });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.get_userproduct = async (req, res, next) => {
  try {
    const products = await Product.find({
      createdby: req.params.userId,
    });
    if (products.length < 1) {
      return res.status(200).json({
        success: "fail",
        message: " no product",
      });
    } else {
      return res.status(200).json(products);
    }
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.get_usersave = async (req, res, next) => {
  try {
    const products = await Product.find({
      usersaves: req.params.userId,
    });
    if (products.length < 1) {
      return res.status(200).json({
        success: "fail",
        message: " no product",
      });
    } else {
      return res.status(200).json(products);
    }
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.getuser_productId = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);

    const user = await User.findById(product.createdby);
    return res.status(200).json({
      success: true,
      message: "Success",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userImage: user.userImage,
      },
    });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.getnewpro = async (req, res, next) => {
  try {
    const products = await Product.find();

    products.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    let arrproduct = new Array(1);
    for (let i = 0; i < 1; i++) {
      const getProduct = await Product.findById(products[i]._id);
      arrproduct[i] = getProduct;
    }

    if (arrproduct.length < 1) {
      return res.status(200).json({
        success: "fail",
        message: " no product",
      });
    } else {
      return res.status(200).json(arrproduct);
    }
  } catch (err) {
    console.log(hello);
    res.json(err);
  }
};
