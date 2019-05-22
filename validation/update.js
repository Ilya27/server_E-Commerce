const Validator = require('validator');
const isEmpty = require('./is-empty');
module.exports = function validateUpdateInput(data) {
    console.log(data);
    let errors = {};
    data.password_old = !isEmpty(data.password_old) ? data.password_old : '';
    data.login = !isEmpty(data.login) ? data.login : '';
    if(data.password_old==='' && data.password_new==='' && data.password_confirm===''){
    }else{
        if(Validator.isEmpty(data.password_old)) {
            errors.password_old = 'Old Password is required';
        }
    
        if(!Validator.isLength(data.password_new, {min: 6, max: 30})) {
            errors.password_new = 'Password must have 6 chars';
        }
    
        if(!Validator.equals(data.password_new, data.password_confirm)) {
            errors.password_new = 'Password and Confirm Password must match';
            errors.password_confirm = 'Password and Confirm Password must match';
        }
    
        if(Validator.isEmpty(data.password_confirm)) {
            errors.password_confirm = 'Password is required';
        }
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}