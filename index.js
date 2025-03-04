const express=require('express')
const authRoutes=require('./Routes/authRoutes')
const connectDB=require('./config/db')
const cookieParser=require('cookie-parser')

const app=express();
app.use(express.static('public'))

app.use(cookieParser());

app.set('view engine','ejs')

connectDB(); //database connection

// Middleware to parse JSON and URL-encoded data
app.use(express.json());  // ✅ Allows JSON request bodies
app.use(express.urlencoded({ extended: true }));  // ✅ Allows form data

app.use("/",authRoutes)

app.listen(2700,()=>{
    console.log("server connected to port 2700")
})