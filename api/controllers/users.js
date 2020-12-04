const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/user');
const Chat = require('../models/chats');

exports.users_signup = async(req, res, next) => {
  User.find({email: req.body.mail})
    .exec()
    .then(user => {
        if(user.length >= 1){
            return res.status(409).json({
                message: 'Mail exists'
            });
        }else{
          bcrypt.hash(req.body.password, 10, (err, hash) => {
              if(err){
                  return res.status(500).json({
                      error: err
                });
              }else{
                const user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: hash,
                    userImage: req.file.path,
                    _id: new mongoose.Types.ObjectId()
                });
                user
                .save()
                .then(result => {
                    console.log(result);
                    res.status(201).json({
                        success: true,
                        message: 'User created'
                    });
                })
                .catch(err => {
                  console.log(err);
                  res.status(500).json({
                      error: err
                  });
                });
              }
          });
        }
    })
    .catch();
  // try{
  //     const userexist = await User.find({
  //       email: req.body.email
  //     });
  //     if(userexist.length >= 1){
  //         return res.status(409).json({
  //             message: 'Mail exists'
  //           });
  //     }else{
  //         const hash = await bcrypt.hashsync(req.body.newpass, 10);
  //
  //         const user = new User();
  //         user.name = req.body.name;
  //         user.email = req.body.email;
  //         user.password = hash;
  //         user.userImage = req.file.path;
  //         _id: new mongoose.Types.ObjectId();
  //
  //         user.save();
  //
  //         res.status(201).json({
  //             success: true,
  //             message: 'User created'
  //         });
  //     }
  // }catch(err){
  //   res.status(500).json({
  //       error: err
  //     });
  // }
}

exports.users_uploadImage = async(req, res, next) => {
  try{
      const user = await User.findById(req.params.userId);

      user.userImage = req.file.path;

      user.save();

      return res.status(200).json({
        message: 'Uploaded image successfully'
      });
    }catch(err){
      res.status(500).json({
          error: err
        });
      }
}

exports.users_login = (req, res, next) => {
    User.findOne({ email: req.body.email })
    .exec()
    .then(user => {
        if(user.length < 1){
            return res.status(401).json({
                message: 'Login failed'
            });
        }
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({
                  message: 'Login failed'
                });
            }
            if (result) {
                const token = jwt.sign({
                    email: user.email,
                    userId: user._id
                },
                process.env.JWT_KEY,
                {
                    expiresIn: "1h"
                }
                );
                return res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    user:{
                      _id: user._id,
                      name: user.name,
                      email: user.email,
                      notichat: user.notichat,
                      userImage: user.userImage,
                      token: token
                    }
                });
            }
            res.status(402).json({
                message: 'Password not correct'
            });
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.users_update = async(req, res, next) => {
  try{
      const user = await User.findById(req.params.userId);

      const userexist = await User.find({
          email: req.body.email
      });

      if(req.body.email == ""){
          user.name = req.body.name;
          user.save();
          return res.status(200).json({
            message: 'Updates Successfully'
          });
      }else if(req.body.name == ""){
      if(userexist.length >= 1){
        return res.status(409).json({
          message: 'Mail exists'
        })
      } else {
        user.email = req.body.email;
        user.save();
        return res.status(200).json({
          message: 'Updates Successfully'
        });
      }
    }else{
      if(userexist.length >= 1){
        return res.status(409).json({
          message: 'Mail exists'
        })
      } else {
        user.name = req.body.name;
        user.email = req.body.email;
        user.save();

        return res.status(200).json({
          message: 'Updates Successfully'
        });
      }
    }
  }catch(err){
    console.log(err);
    res.status(500).json({
      error: err
    });
  }
}

exports.users_delete_user = (req, res, next) => {
    User.remove({_id: req.params.userId})
    .exec()
    .then(result => {
        res.json({
            message: 'User deleted'
        });
    })
    .catch(err => {
        console.log(err);
        res.json({
            error: err
        });
    });
}

exports.users_changepass = async(req, res, next) => {
  try{
      const user = await User.findOne({email:req.body.email});
      if(req.body.oldpass === req.body.newpass){
        return res.status(409).json({
          message: 'New password and Old password are the same'
        });
      }else if(await bcrypt.compareSync(req.body.oldpass, user.password)){
          user.password = await bcrypt.hashSync(req.body.newpass, 10);
          user.save();
          return res.status(200).json({
              message: 'Change password successfully'
          });
      }else{
          return res.status(401).json({
              error: 'Password do not match'
          });
      }
  }
  catch(err){
      console.log(err);
      res.status(500).json({
        error: err
      });
  }
}

exports.users_forgotpass = async (req, res, next) => {
  async.waterfall([
    function(done){
      crypto.randomBytes(3, (err, buf) => {
          if (err) throw err;
          const token = buf.toString('hex');
          done(err, token)
      });
    },

    function(token, done){
      User.findOne({email: req.body.email}, function(err, user){
          if(!user){
            return res.status(409).json({
                message: 'No account with that email address exists'
            });
          }

          user.resetToken = token;
          user.resetTokenExpires = Date.now() + 360000 //1 hour

          user.save(function (err){
            done(err, token, user)
          });
      });
    },

    function(token, user, done){
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD,
        }
      });

      const mailOptions = {
        from: 'vdt040499@gmail.com',
        to: user.email,
        subject: 'Renew your password',
        text: 'To reset your password with: ' + token
      };

      transporter.sendMail(mailOptions, function(err, data){
          if(err){
            console.log('Error occurs: %s', err);
            return res.status(401).json({
                error: err
            });
          }else{
            console.log('Email sent to ' + user.email + '. Please check your email please');
            return res.status(200).json({
                message: 'Email sent to ' + user.email + '. Please check your email please'
            });
          }
      });
    }
  ]);
}

exports.users_forgotpasscheck = async (req, res, next) => {
  User.findOne({email: req.body.email})
      .then(user => {
        if(user.resetToken === undefined || user.resetTokenExpires === undefined){
            return res.status(409).json({
                message: 'You have\'t send any verification to renew your password'
            });
        }else{
            if (Date.now > user.resetTokenExpires){
                user.resetToken = undefined;
                user.resetTokenExpires = undefined;
                user.save();
                return res.status(401).json({
                  message: 'Sorry, your token expired date has been out of date'
                });
            }else{
              if(req.body.newpass === req.body.confirm){
                if(req.body.verify === user.resetToken){
                    user.password = bcrypt.hashSync(req.body.newpass, 10);
                    user.resetToken = undefined;
                    user.resetTokenExpires = undefined;
                    user.save();
                    return res.status(200).json({
                        message: 'Your password has been changed successfully'
                    });
                }else{
                  return res.status(402).json({
                      message: "Veryfy code not correct"
                  });
                }
              }else{
                return res.status(403).json({
                    message: "New password and Confirm password are not the same"
                });
              }

            }
        }
      });
}

exports.users_chat = async (req, res, next) => {

const userSend = await User.findById(req.params.userId1);
const userReceive = await User.findByIdAndUpdate({_id:req.params.userId2}, {$inc : {'notichat' : 1}, new: true});
  try {
    const newChat = new Chat ({
      body: req.body.body
    });
  newChat.send = userSend;
  newChat.receive = userReceive;
  await newChat.save();
  userSend.chats.push(newChat);
  userReceive.chats.push(newChat);
  if(await userReceive.userchats != req.params.userId1){
    userReceive.userchats.push(userSend);
  }
  if(await userReceive.newuserchats != req.params.userId1){
    userReceive.newuserchats.push(userSend);
  }
  await userSend.save();
  await userReceive.save();
  //console.log(commentUser.name +': ' + newComment.body );
  return res.status(201).json({
    message: 'chat succeed',
    chat: userSend.name + ': ' + newChat.body
  });

} catch(err)
{
    console.log(err);
    return res.status.json({
      error:err
    });
}
}

exports.users_delnoti = async(req, res, next) => {
  try{
    const user = await User.findByIdAndUpdate({_id:req.params.userId}, {$inc : {'notichat' : -1}, new: true});

    // while(user.newuserchats.length > 0) {
    //     user.newuserchats.pop();
    // }
    const deluser = await User.findById(req.params.deluserId);
    user.newuserchats.pop(deluser);
    user.save();

    return res.status(201).json({
      message: 'del user succeed',
    });
  }catch(err){
    console.log(err);
    return res.status.json({
      error:err
    });
  }
}

exports.users_getchat = async(req, res, next) => {
  try{
    const userSend = await User.findById(req.params.userId1);
    const userReceive = await User.findById(req.params.userId2);

    const getChats1 = await Chat.find({
      send: req.params.userId2,
      receive: req.params.userId1
    });

    const getChats2 = await Chat.find({
      send: req.params.userId1,
      receive: req.params.userId2
    });

    const getChats = getChats1.concat(getChats2);

    getChats.sort((a,b) => {
      return new Date(a.date) - new Date(b.date)
    });

    if(getChats.length <1){
      return res.status(200).json ({
        success:'fail',
        message:' no chat'
      });
    }

    return res.status(200).json(getChats);
  }catch(err){
    console.log(err);
    return res.status.json({
      error:err
    });
  }
}

exports.users_getuserchat = async(req, res, next) => {
  try{
    const user = await User.findById(req.params.userId);
    let arruser = new Array(user.userchats.length);
    for( let i=0; i<user.userchats.length; i++){
      const getUser = await User.findById(user.userchats[i]);
       arruser[i]= getUser;
    }

    if(arruser.length <1){
      return res.status(200).json ({
        success:'fail',
        message:' no user'
      });
    }

    return res.status(200).json(arruser);
  }catch(err){
    console.log(err);
    return res.status.json({
      error:err
    });
  }
}

exports.users_getnewuserchat = async(req, res, next) => {
  try{
    const user = await User.findById(req.params.userId);
    let arruser = new Array(user.newuserchats.length);
    for( let i=0; i<user.newuserchats.length; i++){
      const getUser = await User.findById(user.newuserchats[i]);
       arruser[i]= getUser;
    }

    if(arruser.length <1){
      return res.status(200).json ({
        success:'fail',
        message:' no user'
      });
    }

    return res.status(200).json(arruser);
  }catch(err){
    console.log(err);
    return res.status.json({
      error:err
    });
  }
}

exports.users_getuser_userId = async(req, res, next) => {
  try{
    const user = await User.findById(req.params.userId);
    return res.status(200).json({
      success: true,
      message: 'Success',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userImage: user.userImage
      }
    })
  }catch(err){
    console.log(err);
    res.json(err);
  }
}

exports.users_getmainuser = async(req, res, next) => {
  try{
    const user = await User.findById(req.params.userId);
    return res.status(200).json({
      success: true,
      message: 'Success',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: user.token
      }
    })
  }catch(err){
    console.log(err);
    res.json(err);
  }
}
