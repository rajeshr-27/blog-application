const express = require('express');
const app = express();
require('dotenv').config();
require('./config/dbConnection')();
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/errorHandler');
const cors =require('cors');
const PORT = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
app.use('/api',express.static('uploads'));

app.use('/api/user', require('./route/userRoute'));
app.use('/api/blog', require('./route/blogRoute'));
app.use('/api/comment', require('./route/commentRoute'));

app.use(errorHandler);
//connect node server
app.listen(PORT, ()=> {
    console.log("Node server connected",PORT)
})