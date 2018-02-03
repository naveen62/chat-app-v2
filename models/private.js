var mongoose = require('mongoose');

var chatSechma = new mongoose.Schema({
    friends: [],
    chats: [{
        from: String,
        text: String,
        created: String
    }]
})

module.exports = mongoose.model('Chat', chatSechma);