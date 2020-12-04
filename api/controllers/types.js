const mongoose = require('mongoose');

const Type  = require('../models/type');

exports.types_get_all = async(req, res, next) => {
  try {
  const types = await Type.find()
  res.json(types)
  } catch (err) {
  res.status(500).json({ message: err.message })
  }
}

exports.types_create_type = (req, res, next) => {
    const type = new Type({
        _id: new mongoose.Types.ObjectId(),
        type: req.body.type,
        name: req.body.name,
        subname: req.body.subname,
        typeImage: req.file.path
    });
    type.save().then(result => {
        console.log(result);
        res.status(201).json({
            createdType: {
                name: result.name,
                subname: result.subname,
                typeImage: result.typeImage
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}
