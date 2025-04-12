const jwt=require('jsonwebtoken');
const User = require('../model/User');

const requireAuth=(req,res,next)=>{
    //grab the token from cookie-parser
    const token=req.cookies.jwt;
    //check if we have the token and is verified
    if(token){
        //verify the token
        jwt.verify(token,'Secret_message',(err,decodedToken)=>{
            if(err){
                res.redirect('/login')
            }
            else{
                console.log(decodedToken)
                //now u can carry on what u are doing
                req.user = decodedToken;
                next();
            }
        })
    }
    //if u don't have token redirect to login
    else{
        res.redirect('/login')
    }
}
const checkUser=(req,res,next) =>{
    const token=req.cookies.jwt;

    if(token){
        //verify the token
        jwt.verify(token,'Secret_message',async(err,decodedToken)=>{
            if(err){
                console.log(err.message)
                res.locals.user = null; //setting user property to null so it doesnt give error before login/signup
            }
            else{
                console.log(decodedToken)
                //now get the user info so we can add it to frontend
                let user=await User.findById(decodedToken.id);
                //inside the views if we have the valid user and we found that user in the database then what we are doing 
                // is passing that user into the view so we can access the properties on it like email and we could that maybe in the header(navbar)
                res.locals.user = user; 
                next();
            }
        })
    }
    else{
        res.locals.user = null;
        next();
    }

}
const requireRole = (role) => {
    return (req, res, next) => {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized, no token' });
        }

        try {
            const decodedToken = jwt.verify(token, 'Secret_message');
            if (decodedToken.role !== role) {
                return res.status(403).json({ message: 'Forbidden: Access denied' });
            }
            req.user = decodedToken; 
            next();
        } catch (err) {
            res.status(401).json({ message: 'Unauthorized' });
        }
    };
};

module.exports={requireAuth,checkUser,requireRole};