var express = require('express');
var router = express.Router();

//middleware
var {isAuth} = require('../middleware/isAuth'); 

router.get('/',isAuth, (req, res) => {
    console.log(req.user)
    res.render('chat/home')
})

module.exports = router