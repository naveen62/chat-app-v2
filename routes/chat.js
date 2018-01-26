var express = require('express');
var router = express.Router();
var Group = require('../models/group'); 
var User = require('../models/user'); 

//middleware
var {isAuth} = require('../middleware/isAuth'); 

router.get('/',isAuth, (req, res) => {
    User.findOne({_id: req.user._id}).populate('createdGroups').populate('joinedGroups').exec((err, user) => {
        if(err) {
            return console.log(err)
        }
        Group.find({}, (err, groups) => {
            if(err) {
                return console.log(err)
            }
            res.render('chat/home', {currentUser: req.user, user: user, groups: groups})
        })
    })
})
router.post('/group/new',isAuth, (req, res) => {
    Group.create({name: req.body.name, _createdBy: req.user.email}, (err, group) => {
        if(err) {
            return  console.log(err);
        }
        User.findByIdAndUpdate(req.user._id, {
            $push: {
                createdGroups:group
            }
        }, (err) => {
            if(err) {
                return console.log(err)
            }
            res.redirect('/')
        })
    })
})

module.exports = router;