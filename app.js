const express = require('express');
const app = express();
const http = require('http')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const socketIO = require('socket.io');
const server = http.createServer(app)
var io = socketIO(server)
var pri = io.of('/private');
// op = open
var op = io.of('/group')

const Group = require('./models/group');
const Chat = require('./models/private');

const {auth} = require('./routes/auth')
var {User} = require('./utils/user');
var {genMsg} = require('./middleware/genMsg');
const chat = require('./routes/chat');

// config
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.set('view engine', 'ejs')
mongoose.Promise = global.Promise
mongoose.connect('mongodb://127.0.0.1/Chat-App');
var db = mongoose.connection;
db.once('open', () => {
    console.log('connected')
})
app.use(session({
    secret: 'sessions sec',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}))
// 
// locals 

// config routes
app.use(chat)
app.use('/user', auth)
// 
var user = new User()
op.on('connection', (socket) => {
    console.log('new user connected')

    socket.on('join', (params) => {
        socket.join(params.group);
        user.removeUser(socket.id);
        user.addUser(socket.id, params.group, params.currentUser);
        var userList = user.getUserList(params.group);
        
        op.to(params.group).emit('updateList', userList);
        socket.broadcast.to(params.group).emit('newMsg', genMsg(params.group + ' group', `${params.currentUser} is connected to group`))  
    })
    socket.on('createMsg', (msg) => {
        Group.findOneAndUpdate({name: msg.groupName}, {
            $push: {
                chats: genMsg(msg.from, msg.text)
            }
        }, (err) => {
            if(err) {
                return console.log(err)
            }
            op.to(msg.groupName).emit('newMsg', genMsg(msg.from, msg.text))
        })
    })
    socket.on('disconnect', () => {
        var removeUser = user.removeUser(socket.id);
        socket.broadcast.to(removeUser.group).emit('newMsg', genMsg(`${removeUser.group} group`, `${removeUser.name} has disconnected from group`))
        op.to(removeUser.group).emit('updateList', user.getUserList(removeUser.group));
    })
})
pri.on('connection', (socket) => {
    console.log('User connected to client private')

    socket.on('pri-join', (join) => {
        socket.join(join.joinId)
    })

    socket.on('pri-newMsg', (msg) => {
        Chat.findByIdAndUpdate(msg.id, {
            $push: {chats: genMsg(msg.from, msg.text)}
        }, (err) => {
            if(err) {
                console.log(err)
            } else {
                pri.to(msg.id).emit('pri-createMsg', genMsg(msg.from, msg.text))
            }
        })
    })
    socket.on('type', (typing) => {
        if(typing.unshow) {
            socket.broadcast.to(typing.joinId).emit('type-show', {unshow: true})
        } else {
            socket.broadcast.to(typing.joinId).emit('type-show', {unshow: false})
        }
    })
    socket.on('disconnect', () => {
        console.log('disconnected from private')
    })
})
// listen
server.listen(3000, ()=> {
    console.log('started')
})
