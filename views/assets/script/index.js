var socket = io();
var progress = document.querySelector('.progress');
var button = document.querySelector('.download');
var input = document.querySelector('input');
var cancel = document.querySelector('.cancel');
var stop = document.querySelector('.stop');
var resume = document.querySelector('.resume');


socket.on('list', function (data) {
    console.log(data);
});
socket.on('downloading', function (data) {
    progress.innerHTML = '';
    data.forEach(function (item) {
        progress.innerHTML = progress.innerHTML + 'downloading file ' + item.url.split('/').pop() 
                            + ', ' + (item.recieved*100/+item.size).toFixed(2) + '%</br>';
    });
    // progress.innerHTML = (data.recieved * 100/+data.total).toFixed(2) + '%';
});
socket.on('abort', function (url) {
    progress.innerHTML = 'abort';
});
socket.on('pause', function () {
    progress.innerHTML = 'stop';
});
socket.on('resume', function () {
    progress.innerHTML = 'resume';
});



button.addEventListener('click', function () {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function () {
    });
    xhr.addEventListener('end', function () {
    });
    xhr.addEventListener('progress', function () {
    });
    xhr.addEventListener('error', function () {
    });
    xhr.onreadystatchange = function () {
        console.log('aaaa');
    };
    xhr.open('post', '/download', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send('url=' + input.value);
});
cancel.addEventListener('click', function () {
    socket.emit('abort', input.value);
});
stop.addEventListener('click', function() {
    socket.emit('pause', input.value);
});
resume.addEventListener('click', function () {
    socket.emit('resume', input.value);
});