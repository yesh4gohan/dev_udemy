const validations = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data){
    let errors = {};
    data.name = !isEmpty(data.name)?data.name:"";
    data.email = !isEmpty(data.email)?data.email:"";
    data.password = !isEmpty(data.password)?data.password:"";
    data.password2 = !isEmpty(data.password2)?data.password2:"";

    if(!validations.isLength(data.name,{min:2,max:30})){
        errors.name = "Name must be between 2 to 30 chars";
    }
    if(validations.isEmpty(data.name)){
        errors.name = "name field is required";
    }

    if(validations.isEmpty(data.email)){
        errors.email = "email field is required";
    }

    if(validations.isEmpty(data.password)){
        errors.password = "password field is required";
    }

    if(validations.isEmpty(data.password2)){
        errors.password2 = "confirm password field is required";
    }

    if(!validations.isEmail(data.email)){
        errors.email = "please enter valid email";
    }

    if(!validations.isLength(data.password,{min:6})){
        errors.password = "password must be atleast 6 chars";
    }

    if(!validations.equals(data.password,data.password2)){
        errors.password2 = "passwords must match";
    }

    return{
        errors,
        isValid:isEmpty(errors)
    }
}