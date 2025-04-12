const {Router}=require('express')
const {requireRole}=require('../middlewares/authmiddleware')
const userController=require('../Controllers/userController')
const router=Router()

router.get('/admin', requireRole('admin'),userController.admin);

router.get('/user', requireRole('user'),userController.user);

module.exports=router;