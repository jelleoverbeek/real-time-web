const express = require('express');
const app = express();
const http = require('http').Server(app);
const nunjucks = require('nunjucks');

nunjucks.configure('src/views', {
    autoescape: true,
    express: app,
    watch: true
});

app.use(express.static(__dirname + '/src/assets'));

app.get('/', function(req, res) {
    res.render('index.html', {

    })
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});