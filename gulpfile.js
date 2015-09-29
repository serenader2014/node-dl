var gulp = require('gulp');
var browserSync = require('browser-sync');
var Promise = require('bluebird');
var childProcess = require('child_process').fork;
var $ = require('gulp-load-plugins')();

var server = {
    instance: {},
    start: function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.instance = childProcess('index.js');
            setTimeout(function () {
                console.log('start');
                resolve();
            }, 2000);
        });
    },
    stop: function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.instance.connected) {
                _this.instance.on('exit', function () {
                    resolve();
                });
                _this.instance.kill('SIGHUP');
            } else {
                reject();
            }
        });
    },
    restart: function () {
        var _this = this;
        return _this.stop().then(function () {
            return _this.start();
        });
    }
};

gulp.task('runServer', function () {
    return server.start();
});

gulp.task('watch', function () {
    gulp.watch(['views/assets/*.jade', 'views/assets/script/*.js'])
    .on('change', browserSync.reload);

    gulp.watch(['index.js'])
    .on('change', function () {
        server.restart().then(function () {
            console.log('restart end');
            browserSync.reload();
        }).catch(function (err) {
            console.error(err);
        });
    });
});

gulp.task('serve', ['runServer', 'watch'], function () {
    browserSync.init({
        proxy: {
            target: 'http://localhost:8001',
            agent: false
        }
    });
});