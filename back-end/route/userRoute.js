const express = require('express');
const {addUser, upload, getUsers, updateUser, deleteUser, loginUser} = require('../controller/userController');
const validateToken = require('../middleware/validateToken');
const validateRefreshToken = require('../middleware/validateRefreshToken');
const Router = express.Router();

Router.post('/add',upload.single('photo'),addUser);
Router.get('/list',getUsers);
Router.put('/edit/:id',upload.single('photo'),updateUser);
Router.delete('/delete/:id',deleteUser);
Router.post('/login',loginUser);
Router.get('/auth-user', validateToken,(req,res) => {
    res.status(200).json({
        status:1,
        message:"success",
        authUser:req.user
    })
});
Router.get('/refresh-token', validateRefreshToken,(req,res) => {
    res.status(200).json({
        status:1,
        message:"success",
        authUser:req.user,
        token:req.token,
        refreshToken:req.refreshToken
    })
});
module.exports = Router;