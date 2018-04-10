const express = require('express');
const app = express();
const http = require('http').Server(app);
const nunjucks = require('nunjucks');
const io = require('socket.io')(http);

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

const polls = [];


function getOptions(msg) {
    let options = msg.split(" ");
    options.shift();

    return options;
}

function makePoll(message) {
    const poll = {
        index: polls.length + 1,
        options: getOptions(message)
    };

    polls.push(poll);

    let html;

    poll.options.forEach(function (option) {
        html += `<li><input type="radio" name="poll-${poll.index}"> ${option} </li>`
    });

    return `<ol>${html}</ol>`
}

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });

    socket.on('chat poll', function(msg){
        html = makePoll(msg);

        console.log(polls);

        io.emit('chat poll', html);
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});