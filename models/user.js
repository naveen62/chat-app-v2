var mongoose = require('mongoose');
var valid = require('validator')
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');

var userSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, 'No email proviede'],
        unique: true,
        validate: {
            validator: function (mail) {
                return valid.isEmail(mail)
            },
            message: '{mail} is a incorrect email'
        }
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: [true, 'No Password provided'],
    },
    tokens: [{
        token: {
            type: String,
            required: true
        },
        access: {
            type: String,
            required: true
        }
    }],
    joinedGroups: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }],
    chats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }]
})  
userSchema.pre('save', function (next) {
    var user = this;
    if(user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next()
            })
        })
    }
    
})
userSchema.methods.genAuthToken = function () {
    var user = this;
    var token = jwt.sign({
        _id: user._id.toHexString(),
        access: 'auth'
    }, 'abc123')

    return user.update({
        $push: {
            tokens: {token, access: 'auth'}
        }
    }).then(() => {
        return token
    }).catch((err) => {
        return new Error('error')
    })
}
module.exports = mongoose.model('User', userSchema)