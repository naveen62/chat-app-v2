var mongoose = require('mongoose');

var groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    membersNo: {
        type: Number
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    chats: [{
        user: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        }
    }],
    _createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})