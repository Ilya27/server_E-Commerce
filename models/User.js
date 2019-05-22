const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    gender: {
        type: String  
    },
    lastName: {
        type: String
    },
    dateofbirth:{
        type:String
    },

});

const User = mongoose.model('users', UserSchema);
module.exports = User;
