const jwt = require('jsonwebtoken');

const validateToken = (req,res,next) =>{
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(authHeader){
        token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoder) => {
            if(error){
                res.status(401);
                throw new Error('Token expired');
            }
            const user = decoder.user;
            req.user = user;
            next();
        })
    }

    if(!token){
        res.status(400);
        throw new Error('Token not exist');
    }

}

module.exports = validateToken;