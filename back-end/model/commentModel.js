const mongoose = require('mongoose');
const commentSchema = mongoose.Schema({
    comment:{type:String, required:true},
    blog_id:{type:mongoose.Schema.Types.ObjectId, required:true, ref:'blogs'},
    user_id:{type:mongoose.Schema.Types.ObjectId, required:true, ref:'users'}
},{
    timestamps:true
});

const Comment = mongoose.model('comments',commentSchema);

module.exports = Comment;