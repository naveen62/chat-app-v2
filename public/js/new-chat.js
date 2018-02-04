var socket = io('/group')

var send = document.querySelector('#but1')
var msg = $('#msg')
var geTdata = document.querySelector('#data').textContent;
var data = JSON.parse(geTdata);
var geTuser = document.querySelector('#user').textContent;
var user = JSON.parse(geTuser)
scrollToButtom();

function scrollToButtom() {
    window.scrollTo(0, document.querySelector('#messages').scrollHeight)
}


socket.on('connect', function() {
    socket.emit('join', {
        group: data.name,
        currentUser: user.name,
    })
})
send.addEventListener('click', function() {
    if(msg.val().length == 0) {
        return alert('Please enter message to send')
    }
    socket.emit('createMsg', {
        from: user.name,
        text: msg.val(),
        groupName: data.name
    })
    msg.val('')
    msg.focus();
})
$("input[type='text']").keypress(function(event) {
    if(event.which === 13) {
        if(msg.val().length == 0) {
            return alert('Please enter message to send')
        }
        socket.emit('createMsg', {
            from: user.name,
            text: msg.val(),
            groupName: data.name
        })
        msg.val('')
    } else {
        return 
    }
})
socket.on('newMsg', function(msg) {
    var ul = $('#messages')
    var template = $('#message-template').html()
    var html = Mustache.render(template, {
        from: msg.from,
        text: msg.text,
        created: msg.created
    })
    ul.append(html)
    scrollToButtom()
})
socket.on('newLocation', function(loc) {
    var ul = $('#messages')
    var template = $('#message-location').html()
    var html = Mustache.render(template, {
        from: loc.from,
        latitude: loc.latitude,
        longitude: loc.longitude,
        created: loc.created
    })
    ul.append(html)
    scrollToButtom()
})
socket.on('updateList', function(users) {
    var menu = $('#main');
    var label = $('<p class="menu-label">Online</p>');
    var list = $('<ul class="menu-list"></ul>')

    users.forEach(function(user) {
        list.append('<li><a>' +user+ '</a></li>')
    })
    menu.html(list)
    menu.prepend(label)
})
var locationButton = document.querySelector('#but2');
locationButton.addEventListener('click', function() {
    if(!navigator.geolocation) {
        return alert('geolocation not supported');
    }
    locationButton.setAttribute('disabled', 'disabled');
    locationButton.textContent = 'Sending...';

    navigator.geolocation.getCurrentPosition(function(position) {
        locationButton.removeAttribute('disabled')
        locationButton.textContent = 'Send location';
        socket.emit('createLocation', {
            user: user.name,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
    }, function() {
        locationButton.removeAttribute('disabled')
        locationButton.textContent = 'Send location';
        alert('Unable to fetch location');
    })
})