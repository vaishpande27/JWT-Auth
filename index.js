const express=require('express')
const authRoutes=require('./Routes/authRoutes')
const connectDB=require('./config/db')
const cookieParser=require('cookie-parser')
const requireAuth=require('./middlewares/authmiddleware')
const userRoutes=require('./Routes/userRoutes')

const app=express();
app.use(express.static('public'))

app.use(cookieParser());

app.set('view engine','ejs')

connectDB(); //database connection

// Middleware to parse JSON and URL-encoded data
app.use(express.json());  // ✅ Allows JSON request bodies
app.use(express.urlencoded({ extended: true }));  // ✅ Allows form data

app.use("/",authRoutes)
app.use("/",userRoutes)

// the main-page is accessible only to the logged in users
// app.get('/main-page',requireAuth,(req,res)=>{
//     res.render('main-page');
// })

app.listen(2700,()=>{
    console.log("server connected to port 2700")
})