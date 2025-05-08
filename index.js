const express=require('express')
const path = require('path');
const authRoutes=require('./Routes/authRoutes')
const connectDB=require('./config/db')
const cookieParser=require('cookie-parser')
const {requireAuth,checkUser}=require('./middlewares/authmiddleware')
const userRoutes=require('./Routes/userRoutes')
const jobRoutes=require('./Routes/jobRoutes')
const userDashboard = require('./Routes/applicantRoutes')

const app=express();
// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'));

connectDB(); //database connection

// Middleware to parse JSON and URL-encoded data
app.use(express.json());  // ✅ Allows JSON request bodies
app.use(express.urlencoded({ extended: true }));  // ✅ Allows form data

app.get('*',checkUser)   //* means apply this to every single route
app.use("/",authRoutes)
app.use("/",userRoutes)
app.use("/jobs",jobRoutes)
app.use('/user',userDashboard)

// the main-page is accessible only to the logged in users
// app.get('/main-page',requireAuth,(req,res)=>{
//     res.render('main-page');
// })

app.listen(2700,()=>{
    console.log("server connected to port 2700")
})