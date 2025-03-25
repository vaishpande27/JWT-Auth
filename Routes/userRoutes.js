const {Router}=require('express')
const {requireRole}=require('../middlewares/authmiddleware')
const router=Router()
router.get('/admin', requireRole('admin'), (req, res) => {
    res.json({ message: 'Welcome, Admin!' });
});

router.get('/user', requireRole('user'), (req, res) => {
    res.json({ message: 'Welcome, User!' });
});

module.exports=router;