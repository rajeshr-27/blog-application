const asyncHandler = require('express-async-handler');
const multer = require('multer');
const Blog = require('../model/blogModel');
const mongoose = require('mongoose');
const Redis = require('redis');
//Redis
const redisClient = Redis.createClient();
redisClient.on('errr', (err) => console.log(`Redis client errror`,err));

async function connectRedis(){
    try{
        await redisClient.connect();
        console.log('Connected to Redis....')
    }catch(err){
        console.log('Could not connected to Redis', err)

    }
}
connectRedis();

const DEFAULT_EXPIRATION = 3600;

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, 'uploads/blogs/');
    },
    filename: (req,file,cb) => {
        cb(null, file.originalname)
    }
})
const upload = multer({storage});

//desc Get Blogs API
//Method GET /api/blog/list
//Access private

const getBlogs = asyncHandler(async(req,res)=>{

    const page = parseInt(req.query.page)-1 || 0;   
    const limit = parseInt(req.query.limit) || 10  
    const title = req.query.title || '';
    const author = req.query.author || '';
    const date = req.query.date || '';
    const user_id = req.user.id;
  
    const filter = {};
    if(title){
        filter.title = new RegExp(title, 'i');
    }
    if(author) {
        filter.author = new RegExp(author, 'i');
    }

    if(date){
        filter.createdAt = {};
        filter.createdAt.$gte = new Date(date)
    }
    if(user_id){
        filter.user_id = new mongoose.Types.ObjectId(user_id)
    }
    console.log(filter);

    let pipline = [
        {$match:filter}
        ];

    if(page){       
        pipline.push({$skip: page * limit})
    }
    if(limit){
        pipline.push({$limit:limit})
    }
    //Redis check cache
    const blogs = await redisClient.get(`blogs:list?page=${page}&limit=${limit}&title=${title}&author=${author}&date=${date}&user_id=${user_id}`);
    if(blogs){
        console.log('fetch from cache...')
        const totalBlogsCount= await  redisClient.get(`totalBlogsCount:${user_id}`);
        res.status(200).json({
            status:1,
            message:'fetch success',
            blogs:JSON.parse(blogs),
            total:JSON.parse(totalBlogsCount)
        })
    }else {
        console.log('fetch from db...')
        const blogs = await Blog.aggregate(pipline);
        if(!blogs){
            res.status(404);
            throw new Error('Blogs not found');
        }
        //total blogs
        const total = await Blog.countDocuments(filter);
        //set Redis cache
        await redisClient.setEx(`blogs:list?page=${page}&limit=${limit}&title=${title}&author=${author}&date=${date}&user_id=${user_id}`,DEFAULT_EXPIRATION,JSON.stringify(blogs));
        await redisClient.setEx(`totalBlogsCount:${user_id}`,DEFAULT_EXPIRATION,JSON.stringify(total));
        res.status(200).json({
            status:1,
            message:'fetch success',
            blogs,
            total
        })
    }    
})

//Desc Get All Blogs API
//Method GET /api/blog/all
//Access public

const getBlogsAll  = asyncHandler(async(req,res)=> {
    const page = parseInt(req.query.page) -1 || 0;
    const limit = parseInt(req.query.limit) || 10;   
    let pipline = [
        {$lookup:{from:'users',localField:'user_id', foreignField:'_id',as:'user_data'}},
        {$lookup:{from:'comments',localField:'_id', foreignField:'blog_id',as:'comment_data'}},
        { $sort: { createdAt: -1 } }
    ]; 
    if(page){
        pipline.push({$skip: page * limit});
    }
    if(limit){
        pipline.push({$limit:limit})
    } 
    const blogs = await redisClient.get(`blogs:all?page=${page}&limit=${limit}`);
   
    if(blogs){        
        console.log('fetch data from cache...');
        const totalBlogsCount = await redisClient.get(`totalBlogsCount:`);
        res.status(200).json({
            status:1,
            message:'fetch success',
            blogs: JSON.parse(blogs),
            total:JSON.parse(totalBlogsCount)
        })
    }else {
        console.log('fetch data from db....');
        const blogs = await Blog.aggregate(pipline).sort({createdAt:-1});
        if(!blogs){
            res.status(404);
            throw new Error('Blogs not found');
        }
        const total = await Blog.countDocuments();
        //set  redis cache
        await redisClient.setEx(`blogs:all?page=${page}&limit=${limit}`,DEFAULT_EXPIRATION,JSON.stringify(blogs));
        await redisClient.setEx(`totalBlogsCount:`,DEFAULT_EXPIRATION,JSON.stringify(total));
        res.status(200).json({
            status:1,
            message:'fetch success',
            blogs,
            total
        })
    }
    
})

//Desc Get Blog Detail API
//Method GET /api/blog/details/:id
//Access private

const getBlog = asyncHandler (async(req,res) => {
    const {id} = req.params;
    //get redis cache
    const blog = await redisClient.get(`blogs:${id}`);
    if(blog){
        console.log('fetch from cache....')
        res.status(200).json({
            status:1,
            message:'fetch success',
            blog:JSON.parse(blog)
        })
    }else {
        console.log('fetch from  db...')
        const blog = await Blog.findById(id);
        if(!blog){
            res.status(404);
            throw new Error('Blog not found');
        }    
        //set Redis cache
        await redisClient.setEx(`blogs:${id}`,DEFAULT_EXPIRATION,JSON.stringify(blog));
        res.status(200).json({
            status:1,
            message:'fetch success',
            blog
        })
    }  
})

//desc Add Blog API
//METHOD POST /api/blog/add
//Access private

const addBlog = asyncHandler(async (req,res) => {
    //const postData = req.body;
    const postData = JSON.parse(req.body.data);

    const {title, describtion, author} = postData;
    if(!title || !describtion || !author || !req.file){
        res.status(400);
        throw new Error('Please enter required fields')
    }
    if(req.file){
        postData.image = req.file.filename;
    }
    postData.user_id = req.user.id;

    //create
    await Blog.create(postData);

    //invalidate relevent cache keys
    const keys =  await redisClient.keys('blogs:*');
    if(keys.length >0){
        await redisClient.del(keys);
        await redisClient.del('totalBlogsCount:*');
    }

    res.status(200).json({
        status:1,
        message:"Blog created"
    })
})

//desc update Blog API
//METHOD PUT /api/blog/edit/:id
//Access private

const updateBlog = asyncHandler(async (req,res) => {
    const {id} = req.params;
    // const postData = req.body;
    const postData = JSON.parse(req.body.data);

    const {title, describtion, author} = postData;
    if(!title || !describtion || !author){
        res.status(400);
        throw new Error('Please enter required fields')
    }
    if(req.file){
        postData.image = req.file.filename;
    }
    //Update
    await Blog.findByIdAndUpdate(id,postData);

    //invalidated redis cache
    const keys = await redisClient.keys('blogs:*');
    if(keys.length >0){
        await redisClient.del(keys);
    }

    res.status(200).json({
        status:1,
        message:"Blog updated"
    })
})

//Desc Delete blog Api
//Method Delete /api/blog/delete/:id
//Access private
const deleteBlog = asyncHandler(async(req,res)=> {
    const {id} = req.params;
    const blogInfo = await Blog.findByIdAndDelete(id);
    if(!blogInfo){
        res.status(404);
        throw new Error('Blog not found');
    }

    //invalidated redis cache
    const keys = await redisClient.keys('blogs:*');
    if(keys.length >0){
        await redisClient.del(keys);
        await redisClient.del(`totalBlogsCount:*`)
    }

    res.status(200).json({
        status:1,
        message:"Blog Deleted",
    })
})

module.exports = {getBlogs,getBlogsAll,getBlog,addBlog, updateBlog,deleteBlog, upload}