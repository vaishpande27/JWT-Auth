const mongoose = require('mongoose')
const bcrypt=require('bcrypt')
const { isEmail } = require('validator')

const userschema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter mail'],
        unique: [true, 'User already exist'],
        lowercase: true,
        validate: [isEmail, 'enter valid mail']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'minlength 6']
    }
})

//fire func before user save to db
userschema.pre('save',async function(next){
    const salt=await bcrypt.genSalt()
    this.password=await bcrypt.hash(this.password,salt)
    next();
});

//static method to login user
userschema.statics.login=async function(email,password){
    const user = await this.findOne({email});
    if(user){ //now if we have user compare the password 
        const auth=await bcrypt.compare(password,user.password);
        if(auth){
            return user;
        }
        throw Error('incorrect password')
    }
    throw Error('incorrect email')
}

const User = mongoose.model('user', userschema)    //'user' → Collection name (Mongoose will create a "users" collection).
module.exports = User;