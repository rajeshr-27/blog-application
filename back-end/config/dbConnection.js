const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        const connect = await mongoose.connect(process.env.DBSTRING);
        console.log('MongoDB connected', connect.connection.name);
    }catch(error){
        console.log(error);
    }
}

module.exports = connectDB;