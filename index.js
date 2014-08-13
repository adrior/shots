var express = require('express');
var webshot = require('webshot');
var md5 = require('MD5');
var fs = require('fs');
var easyimg = require('easyimage');

var app = express();

var OPTIONS = {
    screenSize: {
        width: 1280,
        height: 1024
    }
}

var ROOT = __dirname + '/shots/';


app.get('/', function(req, res){
    var w = req.query.w;
    var h = req.query.h;
    var url = req.query.url;
    if (!url) return false;
    var filename = md5(url) + '.png';
    renderSrc(url, filename, function(path) {
        resize(filename, w, h, res);
    });
});

function renderSrc(url, filename, callback) {
    //console.log('Render src');
    var path = ROOT + 'src/' + filename;
    if (fs.existsSync(path)) {
        //console.log('Src exist');
        callback(path);
    } else {
        //console.log('Generate src');
        webshot(url, path , OPTIONS, function(err) {
            //console.log('Src ready');
            callback(path);
        });
    }
}

function resize(filename, w, h, res) {
    //console.log('Start resizing');
    var src = ROOT + 'src/' + filename;
    if (!w||!h) {
        //console.log('Sending src');
        res.sendFile(src);
    } else {
        var dir = w + 'x' + h + '/';
        if (!fs.existsSync(ROOT + dir)) {
            fs.mkdir(ROOT + dir);
        }
        var path = ROOT + dir + filename;
        if (fs.existsSync(path)) {
            //console.log('Resized exist');
            res.sendFile(path);
        } else {
            var opt = {src: src, dst: path, width: w, heigth: h};
            //console.log('Generate resized', opt);
            easyimg.resize(opt).then(function(file){
                //console.log('Resized ready', file);
                res.sendFile(path)
            }, function(err){//console.log(err);})
        }
    }
}


var server = app.listen(3060, function() {
    //console.log('Listening on port %d', server.address().port);
});
