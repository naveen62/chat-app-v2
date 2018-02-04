require('./config/config');
const express = require('express');
const app = express();
const http = require('http')
const port = process.env.PORT
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const session = require('express-session');
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
var {genLocation} = require('./middleware/genLocation');
const chat = require('./routes/chat');

// config
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.set('view engine', 'ejs')
mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URL);
var db = mongoose.connection;
db.once('open', () => {
    console.log('connected')
})
app.use(session({
    secret: 'sessions sec',
    resave: false,
    saveUninitialized: true,
}))
// 
// locals 

// config routes
app.use(chat)
app.use('/user', auth)
// 
var user = new User()
op.on('connection', (socket) => {
    
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
    socket.on('createLocation', (loc) => {
        socket.emit('newLocation', genLocation(loc.user, loc.latitude, loc.longitude))
    })
    socket.on('disconnect', () => {
        var removeUser = user.removeUser(socket.id);
        socket.broadcast.to(removeUser.group).emit('newMsg', genMsg(`${removeUser.group} group`, `${removeUser.name} has disconnected from group`))
        op.to(removeUser.group).emit('updateList', user.getUserList(removeUser.group));
    })
})
pri.on('connection', (socket) => {
    
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
    socket.on('pri-createLocation', (coords) => {
        pri.to(coords.id).emit('pri-newLocation', genLocation(coords.user, coords.latitude, coords.longitude))
    })
    socket.on('disconnect', () => {
        console.log('disconnected from private')
    })
})
// listen
server.listen(port, ()=> {
    console.log('started')
})
