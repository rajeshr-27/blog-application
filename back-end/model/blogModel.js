const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    title:{type:String,required:true},
    describtion:{type:String,required:true},
    author:{type:String,required:true},
    image:{type:String,required:true},
    user_id:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'users'}
},
{
    timestamps:true
})

const Blog = mongoose.model('blogs',blogSchema);

module.exports = Blog;