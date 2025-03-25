const jwt=require('jsonwebtoken')

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
                // console.log(decodedToken)
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
            next();
        } catch (err) {
            res.status(401).json({ message: 'Unauthorized' });
        }
    };
};

module.exports={requireAuth,requireRole};