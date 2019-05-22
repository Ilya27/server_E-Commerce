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
    console.log(req);
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
                                id: user.id,
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
    console.log(req.body.infoAbout);
    
    const { errors,isValid} = validateUpdateInput(req.body);
    if(!isValid) {
        return res.status(400).json(errors);
    }
    User.findById({
        _id: req.body._id,
    },function(err, user){
        if(err) return console.log(err);
        if(req.body.infoAbout){
            user.infoAbout=req.body.infoAbout;
        }
        User.findOne({name:req.body.name 
        },function(err, user_find){
            if(user_find){
                if(user_find._id==req.body._id){
                    user
                    .save()
                    .then(user=>{
                        res.json(user);})
                }else{
                    errors.login = 'Login already exists';
                    return res.status(400).json(errors);
                }
            }else{
                user.name=req.body.name;
                if(req.body.password_old===''){
                    user
                    .save()
                    .then(user=>{
                            res.json(user);
                        })}else{
                            bcrypt.compare(req.body.password_old,user.password)
                            .then(isMatch => 
                                {if(isMatch){
                                    if(req.body.password_new===req.body.password_confirm){
                                        bcrypt.genSalt(10, (err, salt) => {
                                            if(err) console.error('There was an error', err);
                                            else {
                                                bcrypt.hash(req.body.password_new, salt, (err, hash) => {
                                                    if(err) console.error('There was an error', err);
                                                    else {
                                                        user.password = hash;
                                                        user
                                                        .save()
                                                        .then(user=>{
                                                                res.json(user);
                                                            })
                                                    }
                                                });
                                            }
                                        });
                                    }
                            }else{
                                    errors.password_old = 'Incorrect Password';
                                    return res.status(400).json(errors);
                            }})
                        }
                    }
                })
            })
        })


router.get("/getUserInfo", function(req, res){
    User.find({
        _id: req.query._id,
    }, function(err, user){
        if(err) return console.log(err);
        res.send(user);
        
    });
});

router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        infoAbout:req.user.infoAbout,
    });
});


module.exports = router;
    