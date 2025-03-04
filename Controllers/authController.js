const User=require('../model/User')
const jwt=require('jsonwebtoken')

const handleErrors = (err) => {
    let errors = { email: '', password: '' };

    // console.log("Full Error Object:", err); // Debugging
    // console.log("Validation Errors:", err.errors); // Debugging

    // Duplicate email error (MongoDB unique constraint)
    if (err.code === 11000) {
        errors.email = 'Email already registered!';
        return errors;
    }

    // Mongoose validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    // Custom login errors
    if (err.message === 'incorrect email') {
        errors.email = 'Email not found!';
    }
    if (err.message === 'incorrect password') {
        errors.password = 'Incorrect password!';
    }

    // console.log("Processed Errors:", errors); // Debugging
    return errors;
};



const maxAge=3*24*60*60 //expects time in seconds
//this function returns token with signature
const createToken=(id)=>{
    return jwt.sign({id},'Secret_message',{
        expiresIn:maxAge
    });
}

module.exports.signup_get=(req,res)=>{
    res.render('signUp')    // This will render signUp.ejs
}
module.exports.signup_post=async(req,res)=>{
    const { email, password } = req.body;
    // res.json({ message: "User signed up successfully", email, password });
    //we have to create a user using the post data
    try{
        const user=await User.create({email,password})
        //right after we created a user we have to create a jwt
        const token=createToken(user._id);
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000})
        res.status(201).json({user})
    }
    catch(err){
        const errors=handleErrors(err)
        console.log("signUp erros",errors)
        res.status(400).json({errors});  // Send error messages to the frontend
        // console.log(err)
    }
}


module.exports.login_get=(req,res)=>{
    res.render('login')
}
module.exports.login_post=async(req,res)=>{
    const { email, password } = req.body;
    
    try {
        const user = await User.login(email, password);
        //if this is success we need to then create json web token to put in cookie and send to 
        // browser to say hey yes they are logged in and as long as they have this jwt they are logged in
        const token=createToken(user._id);
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000});
        res.status(200).json({ user });
    } catch (err) {
        const errors=handleErrors(err)
        res.status(400).json({ errors });  // Send a meaningful error message
    }
}
// Create a logout route that clears the JWT cookie.
module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 }); // Clear the cookie by setting an empty value and a very short expiry time
    res.status(200).json({ message: 'User logged out successfully' });
};
