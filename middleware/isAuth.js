var jwt = require('jsonwebtoken');
var User = require('../models/user');

var isAuth = (req, res, next) => {
    var decode
    var token = req.session.token;
    try {
        decode = jwt.verify(token, 'abc123')
    } catch(err) {
        return res.redirect('/user/signin')
    }
    User.findOne({_id: decode._id,'tokens.access': decode.access, 'tokens.token': token}).then((user) => {
        if(!user) {
            return res.redirect('/signin');
        }
        req.token = token
        req.user = user;
        next();
    })

}
module.exports = {
    isAuth
}