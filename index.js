var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var fs = require('fs-extra');
var path = require('path');
var dl = express();
var server = require('http').createServer(dl);
var io = require('socket.io')(server);

dl.set('view engine', 'jade');
dl.set('views', path.join(__dirname, 'views'));
dl.use(bodyParser.urlencoded());
dl.use(bodyParser.json());

io.on('connection', function () {
    io.emit('login', 'lalalal');
});

dl.get('/', function (req, res) {
    res.render('index');
});

dl.post('/download', function (req, res , next) {
    var url = req.body.url;
    var file = url.split('/').pop();

    fs.ensureFile(file, function (err) {
        if (err) {
            console.log(err);
            return;
        }
        request(url)
        .on('response', function (rs) {
            console.log(rs.headers['content-length']);
        })
        .on('data', function () {
            console.log('on data');
            io.emit('dl');
        })
        .pipe(fs.createWriteStream(file)).on('pipe', function () {
            console.log('pipe');
        }).on('finish', function () {
            console.log('finish');
            res.send('ok');
        }).on('error', function (err) {
            console.error(err);
        });
    });
});

// function download(url, callback, encoding){
//         var request = http.get(url, function(response) {
//             if (encoding){
//                 response.setEncoding(encoding);
//             }
//             var len = parseInt(response.headers['content-length'], 10);
//             var body = "";
//             var cur = 0;
//             var obj = document.getElementById('js-progress');
//             var total = len / 1048576; //1048576 - bytes in  1Megabyte

//             response.on("data", function(chunk) {
//                 body += chunk;
//                 cur += chunk.length;
//                 obj.innerHTML = "Downloading " + (100.0 * cur / len).toFixed(2) + "% " + (cur / 1048576).toFixed(2) + " mb\r" + ".<br/> Total size: " + total.toFixed(2) + " mb";
//             });

//             response.on("end", function() {
//                 callback(body);
//                 obj.innerHTML = "Downloading complete";
//             });

//             request.on("error", function(e){
//                 console.log("Error: " + e.message);
//             });

//         });
//     };


dl.use(express.static(path.join(__dirname, 'views/assets')));

server.listen(8001);