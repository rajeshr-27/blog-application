const mongoose = require('mongoose');

const userSchema =mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    mobile_number:{type:String,required:true},
    gender:{type:String},
    country:{type:String},
    state:{type:String},
    city:{type:String},
    address:{type:String},
    photo:{type:String},
},
{
    timestamps:true
}
);

const User = mongoose.model('users', userSchema);

module.exports = User;