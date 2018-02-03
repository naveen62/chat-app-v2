var express = require('express');
var router = express.Router();
var Group = require('../models/group'); 
var User = require('../models/user'); 
var Chat = require('../models/private');

//middleware
var {isAuth} = require('../middleware/isAuth'); 

router.get('/',isAuth, (req, res) => {
    User.findOne({_id: req.user._id}).populate('chats', 'friends').populate('joinedGroups').exec((err, user) => {
        if(err) {
            return console.log(err)
        }
        Group.find({}, (err, groups) => {
            if(err) {
                return console.log(err)
            }
            User.find({} ,'name email', (err, users) => {
                if(err) {
                    return console.log(err)
                }
                res.render('chat/home', {currentUser: req.user, user: user, groups: groups, users: users})
            })
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
                joinedGroups:group
            }
        }, (err) => {
            if(err) {
                return console.log(err)
            }
            res.redirect('/')
        })
    })
})
router.get('/join/:id',isAuth, (req, res) => {
    var id = req.params.id;
    Group.findById(id, (err, group) => {
        if(err) {
            return console.log(err)
        }
        User.findByIdAndUpdate(req.user._id, {
            $push: {
                joinedGroups: group
            }
        }, (err) => {
            if(err) {
                return console.log(err)
            }
            res.redirect('/')
        })
    })
})
router.get('/chat/:id',isAuth, (req, res) => {
    Group.findById(req.params.id).then((group) => {
        res.render('chat/chat', {group: JSON.stringify({name:group.name}), currentUser: req.user, user: JSON.stringify({name: req.user.name, _id: req.user._id}), groupdata: group})
    }).catch((err) => {
        console.log(err)
    })
})
router.get('/add/:id',isAuth, (req, res) => {
    User.findById(req.params.id, (err, friend) => {
        if(err) {
            return console.log(err)
        }
        User.findById(req.user._id, (error, user) => {
            if(error) {
                return console.log(error);
            }
            Chat.create({friends: [friend.email, user.email]}, (err, chat) => {
                if(err) {
                    return console.log(err)
                }
                friend.update({
                    $push: {chats: chat}
                }, (err) => {
                    if(err) {
                        return console.log(err)
                    }
                })
                user.update({
                    $push: {chats: chat}
                }, (err) => {
                    if(err) {
                        return console.log(err)
                    }
                })
                res.redirect('/')
            })
        })
    })
})
router.get('/private/chat/:id',isAuth, (req, res) => {
    var allow = false
    Chat.findById(req.params.id, (err, chat) => {
        if(err) {
            return console.log(err)
        }
        for(var i=0; i<chat.friends.length; i++) {
            if(req.user.email == chat.friends[i]) {
                allow = true;
            }
        }
        if(allow) {
            res.render('chat/private', {chat:chat, chatId: req.params.id, currentUser: req.user, user: JSON.stringify({name: req.user.name, id: req.user._id})})
        } else {
            res.redirect('back')
        }
    })
})
module.exports = router;