var socket = io('/private');
var Id = document.querySelector('#pri-id').textContent; 
var msg = $('#pri-msg')
var typing = $('#type');
var getUser = document.querySelector('#pri-user').textContent;
var user = JSON.parse(getUser);
var ul = $('#pri-messages')

scrollToButtom()
function emit() {
    if(msg.val().length == 0) {
        alert('Please enter message')
        return msg.focus();
    }
    socket.emit('pri-newMsg', {
        from: user.name,
        text: msg.val(),
        id: Id
    })
    msg.val('')
    msg.focus()
}
function scrollToButtom() {
    window.scrollTo(0, document.querySelector('#pri-messages').scrollHeight)
}
socket.on('connect', function() {
    socket.emit('pri-join', {
        joinId: Id
    })
})
$('#pri-but1').on('click', function() {
    emit()
})
msg.keydown(function(event) {
    if(event.which === 9) {
        return
    }
    if(event.which === 13) {
        emit()
    } else {
        socket.emit('type', {
            joinId: Id,
            unshow: false     
        })
    }
})
socket.on('type-show', (type) => {
    if(type.unshow) {
        typing.fadeOut(1600,'swing', function() {
            typing.css('display', 'none')
        })
    } else {
        typing.css('display', 'block')
    }
})
msg.keyup(function(event) {
    if(event.which === 13) {
        return
    } else {
        socket.emit('type', {
            joinId: Id,
            unshow: true
        })
    }
})
socket.on('pri-createMsg', function(msg) {
    var template = $('#message-template').html();
    var html = Mustache.render(template, {
        from: msg.from,
        text: msg.text,
        created: msg.created
    })
    ul.append(html)
    scrollToButtom()
})
socket.on('pri-newLocation', function(loc) {
    console.log(loc)
    var template = $('#message-location').html()
    var html = Mustache.render(template, {
        from: loc.from,
        latitude: loc.latitude,
        longitude: loc.longitude,
        created: loc.created
    })
    ul.append(html)
    scrollToButtom();
})
msg.on('click', function() {
    scrollToButtom()
})
var locationButton = document.querySelector('#pri-but2')
locationButton.addEventListener('click', function() {
    if(!navigator.geolocation) {
        return alert('geolocation not supported');
    }
    locationButton.setAttribute('disabled', 'disabled');
    locationButton.textContent = 'Sending...';

    navigator.geolocation.getCurrentPosition(function(position) {
        locationButton.removeAttribute('disabled')
        locationButton.textContent = 'Send location';
        socket.emit('pri-createLocation', {
            id: Id,
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