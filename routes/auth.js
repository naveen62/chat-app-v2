var express = require('express');
var router = express.Router();
var _ = require('lodash')
const bcrypt = require('bcryptjs')

const {
    isAuth
} = require('../middleware/isAuth')

var User = require('../models/user');
// routes
router.get('/signin', (req, res) => {
    res.render('auth/signIn', {currentUser: req.user})
})
router.get('/signup', (req, res) => {
    res.render('auth/signUp', {currentUser: req.user});
})
router.post('/signup', (req, res) => {
    var body = _.pick(req.body, ['email', 'name', 'password'])
    var user = new User(body)

    user.save().then((cos) => {
        return user.genAuthToken().then((token) => {
            req.session.token = token;
            res.redirect('/')
        })
    }).catch((err) => {
        console.log(err)
        res.redirect('back')
    })
})
router.post('/signin', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var compare
    User.findOne({
        email: body.email
    }).then((user) => {
        if (!user) {
            return res.redirect('back');
        }
        compare = bcrypt.compareSync(body.password, user.password);
        if (!compare) {
            return res.redirect('back')
        }
        return user.genAuthToken().then((token) => {
            req.session.token = token;
            res.redirect('/')
        })
    }).catch((err) => {
        console.log(err)
        res.redirect('/signin')
    })
})
router.get('/logout', isAuth, (req, res) => {
    User.findByIdAndUpdate(req.user._id, {
        $pull: {
            tokens: {
                token: req.token
            }
        }
    }, {
        new: true
    }).then((user) => {
        req.session.token = null
        res.redirect('/user/signin')
    }).catch((err) => {
        console.log(err)
    })
})

// export
module.exports = {
    auth: router
}