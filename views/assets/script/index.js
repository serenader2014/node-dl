var app = io();
app.on('login', function (data) {
    console.log(data);
});

app.on('dl', function (data) {
    console.log('dling');
    console.log(data);
});

var button = document.querySelector('button');
var input = document.querySelector('input');
button.addEventListener('click', function () {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function () {
        console.log('load');
    });
    xhr.addEventListener('end', function () {

    });
    xhr.addEventListener('progress', function () {
        console.log('progress');
    });
    xhr.addEventListener('error', function () {
        console.log('error');
    });
    xhr.onreadystatchange = function () {

    };
    xhr.open('post', '/download', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send('url=' + input.value);
});