const jwt = require('jsonwebtoken');

const validateRefreshToken = (req,res,next) =>{
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
            const token = jwt.sign({user},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'10m'});
            const refreshToken = jwt.sign({user},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'20m'});
            req.user = user;
            req.token = token;
            req.refreshToken = refreshToken;
            next();
        })
    }

    if(!token){
        res.status(400);
        throw new Error('Token not exist');
    }

}

module.exports = validateRefreshToken;