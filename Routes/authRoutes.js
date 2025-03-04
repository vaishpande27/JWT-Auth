const {Router}=require('express')
const authController=require('../Controllers/authController')

const router=Router()

router.get('/',(req,res)=>{
    res.render('home')
})
router.get('/signUp',authController.signup_get)
// router.post('/signUp',authController.signup_post)

router.post("/signUp",authController.signup_post)
router.get('/login',authController.login_get)
router.post('/login',authController.login_post)
router.get('/logout', authController.logout_get);


module.exports=router;