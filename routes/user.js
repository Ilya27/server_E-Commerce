const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');
const  validateUpdateInput= require('../validation/update');
const mongoose = require('mongoose');
const User = require('../models/User');
let token='';
router.post('/register', function(req, res) {
    User.findOne({
        email: req.body.email,
    }).then(user => {
        if(user) {
            return res.status(400).json({
                email: 'Email already exists'
            });
        }
        else {
            const newUser = new User({
                firstName: req.body.firstName,
                email: req.body.email,
                password: req.body.password,
                lastName:req.body.lastName,
                gender:req.body.gender,
                dateofbirth:req.body.dateofbirth,
            });
            
            bcrypt.genSalt(10, (err, salt) => {
                if(err) console.error('There was an error', err);
                else {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) console.error('There was an error', err);
                        else {
                            newUser.password = hash;
                            newUser
                                .save()
                                .then(user => {
                                    res.json(user)
                                }); 
                        }
                    });
                }
            });
        }
    });
});

router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);
    if(!isValid) {
        return res.status(400).json(errors);
    }
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email})
        .then(user => {
            if(!user) {
                errors.email = 'User not found'
                return res.status(404).json(errors);
            }
            bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if(isMatch) {
                            const payload = {
                                _id: user.id,
                                firstName: user.firstName,
                                email: user.email,
                                lastName:user.lastName,
                                gender:user.gender,
                                dateofbirth:user.dateofbirth,
                            }
                            jwt.sign(payload, 'secret', {
                                expiresIn: 3600
                            }, (err, token) => {
                                token=token;
                                if(err) console.error('There is some error in token', err);
                                else {
                                    res.json({
                                        success: true,
                                        token: `Bearer ${token}`,
                                        payload:payload,
                                    });
                                }
                            });
                        }
                        else {
                            errors.password = 'Incorrect Password';
                            return res.status(400).json(errors);
                        }
                    });
        });
});

router.put("/update", function(req, res){
    User.findById({
        _id:req.body._id,
    },function(err, user){
        if(err) return console.log(err);
        if(user.firstName===req.body.firstName && user.lastName===req.body.lastName && user.gender===req.body.gender && user. dateofbirth===req.body.dateofbirth){
            res.json({user,
                update:false,
            }); 
        }else{
            user.firstName=req.body.firstName;
            user.lastName=req.body.lastName;
            user.gender=req.body.gender;
            user. dateofbirth=req.body.dateofbirth;
            user
            .save()
            .then(
                user=>{
                res.json({user,
                    update:true,
                });
            })
        }
    })
})

router.put("/changePassword", function(req, res){
    const password = req.body.oldPassword;
    User.findById({
        _id:req.body._id,
    },function(err, user){
            bcrypt.compare(password, user.password)
            .then(isMatch => {
                if(isMatch) {
                    bcrypt.genSalt(10, (err, salt) => {
                        if(password===req.body.newPassword)  
                            return res.status(400).json({newPassword: 'Новый пароль не отличается от старого пароля'
                        });
                        else {
                            bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
                                if(err) console.error('There was an error', err);
                                else {
                                    user.password = hash;
                                    user
                                    .save()
                                    .then(user => {
                                        res.json({user,status:true})
                                    });
                                    console.log(user);
                                }
                            }
                        );
                    }
                }
            );
        }else{
            return res.status(400).json({
                    oldPassword: 'Неправильный пароль'
                });
        }
    })
})
    // User.findById({
    //     _id:req.body._id,
    // },function(err, user){
    //     bcrypt.compare(password, user.password)
    //     .then(isMatch => {
    //         if(isMatch) {
    //             const payload = {
    //                 _id: user.id,
    //                 firstName: user.firstName,
    //                 email: user.email,
    //                 lastName:user.lastName,
    //                 gender:user.gender,
    //                 dateofbirth:user.dateofbirth,
    //             }
    //             jwt.sign(payload, 'secret', {
    //                 expiresIn: 3600
    //             }, (err, token) => {
    //                 token=token;
    //                 if(err) console.error('There is some error in token', err);
    //                 else {
    //                     res.json({
    //                         success: true,
    //                         token: `Bearer ${token}`,
    //                         payload:payload,
    //                     });
    //                 }
    //             });
    //         }
    //         else {
    //             errors.password = 'Incorrect Password';
    //             return res.status(400).json(errors);
    //         }
    //     });
    // })
})


router.get("/getUserInfo", function(req, res){
    User.findOne({
        _id: req.query.userId,
    }, function(err, user){
        if(err) return console.log(err);
        console.log(user);
        res.send(user);
        
    });
});

router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log(req);
    return res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
    });
});


module.exports = router;
    