var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');
var dl = express();
var server = require('http').createServer(dl);
var io = require('socket.io')(server);


dl.set('view engine', 'jade');
dl.set('views', path.join(__dirname, 'views'));
dl.use(bodyParser.urlencoded());
dl.use(bodyParser.json());



var downloadList = {};

function getDownloadList () {
    var arr = [];
    _.forEach(downloadList, function (item, url) {
        arr.push({
            status: item.status,
            url: url,
            size: item.size,
            recieved: item.recieved
        });
    });
    return arr;
}

io.on('connection', function (socket) {
    socket.emit('list', getDownloadList());

    socket.on('abort', function (url) {
        if (downloadList[url]) {
            downloadList[url].request.abort();
            fs.unlinkSync(downloadList[url].dir);
            delete downloadList[url];
            socket.emit('abort', url);
        }
    });
    socket.on('pause', function (url) {
        if (downloadList[url]) {
            downloadList[url].request.pause();
            socket.emit('pause', url);
        }
    });
    socket.on('resume', function (url) {
        if (downloadList[url]) {
            downloadList[url].request.resume();
            socket.emit('resume', url);
        }
    });
});

dl.get('/', function (req, res) {
    res.render('index');
});

dl.post('/download', function (req, res) {
    var url = req.body.url;
    var file = url.split('/').pop();
    var handler;

    if (!url) {
        res.send({ code: -1, msg: 'url is empty'});
        return;
    }

    if (downloadList[url]) {
        res.send({code: -1, msg: 'already in progress', url: url});
        return;
    }

    fs.ensureFile(path.resolve('data', file), function (err) {
        if (err) {
            console.log(err);
            return;
        }
        var size = 0;
        var recieved = 0;
        var item = downloadList[url] = {};
        var r = request(url);
        item.request = r;
        item.dir = path.resolve('data', file);
        item.status = 'pending';
        r
        // request event
        .on('response', function (rs) {
            size = rs.headers['content-length'] || 'unknow';
            item.size = size;
            res.send({ code: 0 });
            handler = setInterval(function () {
                io.emit('downloading', getDownloadList());
            }, 1000);
        })
        .on('data', function (chunk) {
            recieved = recieved + chunk.length;
            item.status = 'downloading';
            item.recieved = recieved;
        })
        .on('abort', function () {
            console.log('request abort');
            clearInterval(handler);
            item.status = 'abort';
        })
        .on('pause', function () {
            console.log('request pause');
            item.status = 'pause';
        })
        .on('resume', function () {
            console.log('request resume');
            item.status = 'resume';
        })
        .pipe(fs.createWriteStream(path.resolve('data', file)))
        // stream event
        .on('finish', function () {
            console.log('stream finish');
        })
        .on('error', function (err) {
            console.log('stream error');
            console.error(err);
        });
    });
});

dl.use(express.static(path.join(__dirname, 'views/assets')));

server.listen(8001);