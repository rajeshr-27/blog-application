const express = require('express');
const Router =  express.Router();
const { addComment, getComments } = require('../controller/commentController');
const validateToken = require('../middleware/validateToken');
Router.post('/add', validateToken ,addComment);
Router.get('/list/:blog_id' ,getComments);
module.exports = Router;