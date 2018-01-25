const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const session = require('express-session');

const {auth} = require('./routes/auth')
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
}))
// 
// locals 
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next()
})

// config routes
app.use(chat)
app.use('/user', auth)
// 
// listen
app.listen(3000, ()=> {
    console.log('started')
})
