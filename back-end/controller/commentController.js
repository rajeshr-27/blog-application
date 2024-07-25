const asyncHandler = require('express-async-handler');
const Comment = require('../model/commentModel');
const { default: mongoose } = require('mongoose');
const Redis = require('redis');

const redisClient = Redis.createClient();
//error 
redisClient.on('error', (err)=> console.log(err));

async function connectRedis(){
    try{
        await redisClient.connect();
        console.log('redis client connected....');
    }catch(err){
        console.log(err);
    }
}
connectRedis();
const DEFAULT_EXPIRATION = 3600;
//Desc Get Comments API
//Method GET /api/comment/list/:blog_id
//Access public

const getComments = asyncHandler(async(req,res) => {
    const {blog_id} = req.params;
    //redis cache
    const comments = await redisClient.get(`comments:${blog_id}`);

    if(comments){
        console.log('fetch from cache...');
        res.status(200).json({
            status:1,
            message:'success',
            comments:JSON.parse(comments)
        })

    }else {
        console.log('fetch from db...');
        const comments =  await Comment.aggregate([
            {$match:{blog_id:new mongoose.Types.ObjectId(blog_id)}},
            {$lookup:{from:'users',localField:'user_id',foreignField:'_id',as:'user_data'}},
            {$project: {_id:1,comment:1,createdAt:1,'user_data.name':1,'user_data.photo':1}}
            ]).sort({ createdAt: -1 });;
        
        //set redis cache
        await redisClient.setEx(`comments:${blog_id}`, DEFAULT_EXPIRATION, JSON.stringify(comments));
        res.status(200).json({
            status:1,
            message:'success',
            comments
        })
    }

    

})
//Desc Add Comment API
//Method POST /api/comment/add
//Access private

const addComment = asyncHandler(async(req,res) => {
    const {comment,blog_id} = req.body;

    if(!comment || !blog_id){
        res.status(400);
        throw new Error('Please enter required fields');
    }


    //create comment
    await Comment.create({
        comment,
        blog_id,
        user_id:req.user.id
    });

    //invalidate redis cache
    await redisClient.del(`comments:${blog_id}`);
    res.status(200).json({
        status:1,
        message:'comment created'
    })
})

module.exports  = {addComment, getComments}