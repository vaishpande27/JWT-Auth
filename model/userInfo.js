const mongoose = require('mongoose');

const userInfoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    resume: {
        data: { type: Buffer, required: true },
        contentType: { type: String, required: true },
        fileName: { type: String, required: true },
    },
    linkedin: { type: String },
    portfolio: { type: String },
    github: { type: String }
})

module.exports = mongoose.model('userInfo',userInfoSchema)