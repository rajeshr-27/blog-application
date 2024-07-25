const asyncHandler = require('express-async-handler');
const multer = require('multer');
const crypto = require('crypto');
const util =require('util');
const User = require('../model/userModel');
const jwt = require('jsonwebtoken');

const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null, 'uploads/')
    },
    filename:(req,file,cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({storage});

//Desc Get Users
//Method Get /api/user/list
//Access public

const getUsers = asyncHandler(async(req,res) => {

    const users = await User.find({});

    res.status(200).json({
        status:1,
        message:'User fetch success',
        users
    })
}) 

//Desc Add User
//Method POST /api/user/add
//Access public

const addUser = asyncHandler(async(req,res)=>{

   // const postData = req.body;
   const postData = JSON.parse(req.body.data);

    const {name, email, password,confirm_password, mobile_number} = postData;
    //set validation
    if(!name || !email || !password || !confirm_password || !mobile_number){
        res.status(400);
        throw new Error('Please enter required fields')
    }
    //check password
    if(password !== confirm_password){
        res.status(400);
        throw new Error("Passwor and confirm password doesn't match")
    }
    //check email already exist or not
    const userInfo = await  User.findOne({email});
    if(userInfo){
        res.status(400);
        throw new Error('Email already exist')
    }

    //Password Encrypt
    const pbkdf2 = util.promisify(crypto.pbkdf2);
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await pbkdf2(password,salt,10000,64,'sha512');
    const hashPassword = `${salt}:${hash.toString('hex')}`;
    postData.password =hashPassword;

    //set file name
    if(req.file){
        postData.photo = req.file.filename;
    } 
    //Create user
    await User.create(postData);

    //response send to client
    res.status(200).json({
        status:1,
        message:'Regsister success'
    })
})

//Desc Update User
//Method PUT /api/user/edit/:id
//Access public

const updateUser = asyncHandler(async(req,res) => {
    const {id} = req.params;
    const postData = req.body;

    const {name, email, mobile_number} = postData;

    if(!name || !email || !mobile_number){
        res.status(400);
        throw new Error('Please enter the required fields');
    }

    //check email already exis or not
    const userInfo = await User.findOne({email});

    if(userInfo && userInfo._id != id){
        res.status(400);
        throw new Error('Email already exist');
    }
    //set file name
    if(req.file){
        postData.photo = req.file.filename;
    }

    //update user 
    await User.findByIdAndUpdate(id,postData);
    //response
    res.status(200).json({
        status:1,
        message:"User updated success",
    })
})

//Desc Delete User
//Method DELETE /api/user/delete/:id
//Access public

const deleteUser = asyncHandler(async(req,res) => {
    const {id} = req.params;

    const userInfo = await User.findByIdAndDelete(id);
    if(!userInfo) {
        res.status(404);
        throw new Error('User not found');
    }
    res.status(200).json({
        status:1,
        message:'User deleted success'
    })
})

//desc user login
//Method POSR /api/user/login
//Access public

const loginUser = asyncHandler(async(req,res) => {
    const {email,password} = req.body;

    if(!email || !password) {
        res.status(400);
        throw new Error('Please enter required fields');
    }

    //check user
    const userInfo = await User.findOne({email});

    if(!userInfo){
        res.status(400);
        throw new Error('User not exist');
    }
    //Password validation
    const stordHash = userInfo.password;
    const [salt,key]= stordHash.split(':');
    const pbkdf2 = util.promisify(crypto.pbkdf2);
    const hash = await pbkdf2(password,salt,10000,64, 'sha512');

    if(key === hash.toString('hex')) {
        const user = {
            id:userInfo._id,
            name:userInfo.name,
        }
        //generate token
        const token = jwt.sign({user},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'10m'});   
        //generate refresh token        
        const refreshToken = jwt.sign({user},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'20m'});   

        //response
        res.status(200).json({
            status:1,
            message:'login success',
            authUser:user,
            token,
            refreshToken
        })
    }else {
        res.status(400);
        throw new Error('Invalid email or password');
    }
})
module.exports = {addUser, upload, getUsers, updateUser,deleteUser, loginUser};