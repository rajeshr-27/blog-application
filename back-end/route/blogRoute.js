const  express = require('express');
const validateToken = require('../middleware/validateToken');
const {getBlogs,getBlog,addBlog, updateBlog,deleteBlog, upload, getBlogsAll } = require('../controller/blogController');
const Router = express.Router();

Router.post('/add',upload.single('image'),validateToken,addBlog);
Router.put('/edit/:id',upload.single('image'),validateToken,updateBlog);
Router.get('/list',validateToken,getBlogs);
Router.get('/all',getBlogsAll);
Router.get('/details/:id',getBlog);
Router.delete('/delete/:id',validateToken,deleteBlog);
module.exports = Router;