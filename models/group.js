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
        from: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        created: {
            type: String,
            required: true
        }
    }],
    _createdBy: {
        type: String,
    }
})
module.exports = mongoose.model('Group', groupSchema)